# PriorityOps Deployment Guide

This guide covers deploying PriorityOps to AWS using serverless architecture with AWS SAM (Serverless Application Model).

## 🏗️ Architecture Overview

PriorityOps uses a serverless architecture with the following AWS services:
- **AWS Lambda**: Cognitive workflow agents
- **AWS Step Functions**: Workflow orchestration
- **Amazon EventBridge**: Event-driven triggers
- **Amazon Bedrock**: AI/ML services (Claude 3 Sonnet, Titan Embeddings)
- **OpenSearch Serverless**: Vector similarity search
- **MongoDB Atlas**: Primary database
- **AWS Secrets Manager**: Credential management
- **Amazon SNS**: Notifications
- **CloudWatch**: Logging and monitoring

## 📋 Prerequisites

### AWS Account Setup
1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
3. **AWS SAM CLI** installed
4. **Docker** installed (for local testing)

### External Services
1. **MongoDB Atlas** cluster
2. **OpenAI API key** (if using OpenAI instead of Bedrock)

### Installation Commands
```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Install SAM CLI
pip install aws-sam-cli

# Verify installations
aws --version
sam --version
docker --version
```

## 🔧 Configuration

### 1. AWS Credentials
```bash
aws configure
# Enter your AWS Access Key ID, Secret Access Key, Region, and Output format
```

### 2. MongoDB Atlas Setup
1. Create a MongoDB Atlas cluster
2. Create a database user with read/write permissions
3. Whitelist AWS IP ranges or use 0.0.0.0/0 for Lambda access
4. Note your connection string

### 3. AWS Secrets Manager
Store MongoDB credentials in AWS Secrets Manager:

```bash
aws secretsmanager create-secret \
    --name "priorityops/docdb" \
    --description "MongoDB Atlas credentials for PriorityOps" \
    --secret-string '{
        "username": "your_mongodb_username",
        "password": "your_mongodb_password",
        "connection_string": "mongodb+srv://username:<password>@cluster.mongodb.net/priorityops?retryWrites=true&w=majority"
    }'
```

### 4. Amazon Bedrock Model Access
Enable model access in the AWS Bedrock console:
1. Go to AWS Bedrock console
2. Navigate to "Model access"
3. Request access to:
   - `anthropic.claude-3-sonnet-20240229-v1:0`
   - `amazon.titan-embed-text-v1`

## 🚀 Deployment Steps

### 1. Clone and Prepare
```bash
git clone https://github.com/yourusername/PriorityOps.git
cd PriorityOps
```

### 2. Install Lambda Dependencies
```bash
cd backend/agents
pip install -r requirements.txt -t .
cd ../..
```

### 3. Build SAM Application
```bash
cd infra
sam build
```

### 4. Deploy to AWS
```bash
# Deploy with guided prompts (first time)
sam deploy --guided

# Or deploy with parameters
sam deploy \
    --parameter-overrides \
        Environment=dev \
        MongoDBSecretName=priorityops/docdb \
        OpenSearchDomainEndpoint=your-opensearch-endpoint \
        NotificationEmail=your-email@example.com \
    --capabilities CAPABILITY_IAM
```

### 5. Create OpenSearch Index
After deployment, create the vector index:

```python
import boto3
from opensearchpy import OpenSearch, RequestsHttpConnection
from requests_aws4auth import AWS4Auth

# Configure OpenSearch client
session = boto3.Session()
credentials = session.get_credentials()
region = session.region_name
service = 'aoss'

awsauth = AWS4Auth(
    credentials.access_key,
    credentials.secret_key,
    region,
    service,
    session_token=credentials.token
)

client = OpenSearch(
    hosts=[{'host': 'your-opensearch-endpoint', 'port': 443}],
    http_auth=awsauth,
    use_ssl=True,
    verify_certs=True,
    connection_class=RequestsHttpConnection
)

# Create index with vector mapping
index_body = {
    "mappings": {
        "properties": {
            "ticket_id": {"type": "keyword"},
            "title": {"type": "text"},
            "description": {"type": "text"},
            "ticket_vector": {
                "type": "knn_vector",
                "dimension": 1536,
                "method": {
                    "name": "hnsw",
                    "space_type": "cosinesimil",
                    "engine": "nmslib"
                }
            }
        }
    }
}

client.indices.create(index="tickets-index", body=index_body)
```

## 🌍 Environment-Specific Deployments

### Development Environment
```bash
sam deploy \
    --parameter-overrides Environment=dev \
    --stack-name priorityops-dev
```

### Staging Environment
```bash
sam deploy \
    --parameter-overrides Environment=staging \
    --stack-name priorityops-staging
```

### Production Environment
```bash
sam deploy \
    --parameter-overrides Environment=prod \
    --stack-name priorityops-prod \
    --capabilities CAPABILITY_IAM \
    --confirm-changeset
```

## 🔍 Verification

### 1. Test Lambda Functions
```bash
# Test individual Lambda functions
aws lambda invoke \
    --function-name priorityops-get-ticket-details-dev \
    --payload '{"ticket_id": "test123"}' \
    response.json

cat response.json
```

### 2. Test Step Functions Workflow
```bash
# Start workflow execution
aws stepfunctions start-execution \
    --state-machine-arn arn:aws:states:region:account:stateMachine:priorityops-cognitive-workflow-dev \
    --input '{"ticket_id": "test123"}'
```

### 3. Monitor CloudWatch Logs
```bash
# View Lambda logs
aws logs tail /aws/lambda/priorityops-get-ticket-details-dev --follow

# View Step Functions logs
aws logs tail /aws/stepfunctions/priorityops-cognitive-workflow-dev --follow
```

## 📊 Monitoring Setup

### CloudWatch Dashboards
Create a custom dashboard to monitor:
- Lambda function invocations and errors
- Step Functions execution success/failure rates
- OpenSearch query performance
- MongoDB connection metrics

### Alarms
Set up CloudWatch alarms for:
- Lambda function errors > 5%
- Step Functions execution failures
- High latency in cognitive workflow
- OpenSearch query failures

### X-Ray Tracing
Enable X-Ray tracing for end-to-end request tracking:
```bash
aws lambda put-function-configuration \
    --function-name priorityops-get-ticket-details-dev \
    --tracing-config Mode=Active
```

## 🔒 Security Considerations

### IAM Permissions
- Use least-privilege IAM roles
- Separate roles for each Lambda function
- Restrict Bedrock model access to required models only

### Network Security
- Consider VPC deployment for enhanced security
- Use VPC endpoints for AWS service communication
- Implement proper security groups

### Data Encryption
- Enable encryption at rest for all services
- Use AWS KMS for key management
- Ensure TLS 1.2+ for all communications

## 🚨 Troubleshooting

### Common Issues

#### Lambda Function Timeouts
```bash
# Increase timeout in template.yaml
Timeout: 300  # 5 minutes
MemorySize: 1024  # More memory = faster execution
```

#### Bedrock Access Denied
1. Check model access in Bedrock console
2. Verify IAM permissions for bedrock:InvokeModel
3. Ensure correct model ARN in policies

#### OpenSearch Connection Issues
1. Verify collection endpoint URL
2. Check IAM permissions for aoss:APIAccessAll
3. Ensure proper AWS authentication

#### MongoDB Connection Failures
1. Verify connection string in Secrets Manager
2. Check MongoDB Atlas IP whitelist
3. Validate database user permissions

### Debug Commands
```bash
# Check SAM template syntax
sam validate

# Local testing
sam local start-api
sam local invoke GetTicketDetailsFunction --event events/test-event.json

# View CloudFormation events
aws cloudformation describe-stack-events --stack-name priorityops-dev
```

## 🔄 Updates and Rollbacks

### Updating the Application
```bash
# Make changes to code or template
sam build
sam deploy

# Deploy specific function
sam deploy --parameter-overrides Environment=dev
```

### Rolling Back
```bash
# Rollback to previous version
aws cloudformation cancel-update-stack --stack-name priorityops-dev

# Or deploy previous template version
sam deploy --template-file previous-template.yaml
```

## 🧹 Cleanup

### Remove All Resources
```bash
# Delete CloudFormation stack
aws cloudformation delete-stack --stack-name priorityops-dev

# Clean up SAM artifacts
sam delete --stack-name priorityops-dev
```

### Selective Cleanup
```bash
# Remove specific resources while keeping others
aws lambda delete-function --function-name priorityops-escalation-agent-dev
```

## 📞 Support

For deployment issues:
1. Check CloudWatch logs for error details
2. Review CloudFormation events for stack issues
3. Consult AWS documentation for service-specific problems
4. Open GitHub issues for application-specific problems

## 📚 Additional Resources

- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
- [AWS Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [Amazon Bedrock User Guide](https://docs.aws.amazon.com/bedrock/)
- [OpenSearch Serverless Documentation](https://docs.aws.amazon.com/opensearch-service/latest/developerguide/serverless.html)