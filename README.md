# PriorityOps - AI-Powered Ticket Management System

An intelligent ticket management and prioritization system that uses AI agents to automatically detect duplicates, classify priorities, and manage escalations.

## 🏆 Hackathon Submission
This project was conceptualized and built for the **Super Hack Hackathon 2025**.

## 🏗️ Project Structure

```
PriorityOps/
├── backend/                    # FastAPI backend application
│   ├── agents/                # Lambda AI agents for cognitive workflow
│   │   ├── get_ticket_details.py    # Retrieves tickets from MongoDB
│   │   ├── duplicate_detector.py    # Semantic similarity detection
│   │   ├── ai_triage_agent.py      # Priority classification with Claude
│   │   ├── update_ticket_agent.py  # Persists AI analysis results
│   │   ├── escalation_agent.py     # SLA monitoring and escalation
│   │   ├── base_agent.py          # Abstract base class (legacy)
│   │   ├── requirements.txt        # Lambda dependencies
│   │   └── __init__.py
│   ├── config/               # Configuration management
│   │   ├── settings.py       # Application settings
│   │   └── __init__.py
│   ├── models/               # Pydantic data models
│   │   ├── agent.py         # Agent-related models
│   │   ├── analytics.py     # Analytics models
│   │   ├── ticket.py        # Ticket models
│   │   └── __init__.py
│   ├── routes/               # API route handlers
│   │   ├── analytics.py     # Analytics endpoints
│   │   ├── tickets.py       # Ticket CRUD endpoints
│   │   └── __init__.py
│   ├── services/             # Business logic layer
│   │   ├── analytics_service.py  # Analytics business logic
│   │   ├── ticket_service.py     # Ticket business logic
│   │   └── __init__.py
│   ├── utils/                # Utility modules
│   │   ├── database.py       # Async MongoDB utilities (Motor)
│   │   ├── db.py            # Sync MongoDB utilities (pymongo + AWS Secrets)
│   │   ├── events.py         # Event system for agent communication
│   │   ├── llm_client.py     # LLM client for AI operations
│   │   └── __init__.py
│   ├── .env.template         # Environment variables template
│   ├── requirements.txt      # Python dependencies
│   └── server.py            # FastAPI application entry point
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components (shadcn/ui)
│   │   ├── hooks/          # Custom React hooks for API integration
│   │   ├── pages/          # Page components and routing
│   │   ├── services/       # API service layer
│   │   ├── types/          # TypeScript type definitions
│   │   └── lib/            # Utility functions
│   ├── package.json        # Frontend dependencies
│   └── vite.config.ts      # Vite configuration
├── infra/                   # Infrastructure as code
│   ├── template.yaml        # AWS SAM template for serverless deployment
│   └── cognitive_workflow.json  # Step Functions workflow definition
├── tests/                   # Test files
│   ├── test_agents.py      # Lambda agent unit tests
│   └── __init__.py
├── docs/                    # Documentation
│   └── DEPLOYMENT.md       # AWS deployment guide
├── .kiro/                   # Kiro spec files
│   └── specs/
│       └── priority-ops-system/
│           ├── requirements.md  # System requirements (EARS format)
│           ├── design.md       # Serverless architecture design
│           └── tasks.md        # Implementation tasks
├── CONTRIBUTING.md         # Contribution guidelines
├── CHANGELOG.md           # Version history and changes
├── LICENSE                # MIT License
└── README.md             # This file
```

## 🚀 Features

### Core Functionality
- **Ticket Management**: Full CRUD operations for support tickets
- **Real-time Analytics**: Dashboard with priority distribution, trends, and performance metrics
- **AI-Powered Agents**:
  - **Duplicate Detector**: Automatically identifies similar tickets using embeddings
  - **Priority Classifier**: Assigns priority levels based on content analysis
  - **Escalation Agent**: Monitors and escalates tickets based on SLA thresholds

### Technical Features
- **Serverless Architecture**: AWS Lambda + Step Functions cognitive workflow
- **AI-Powered Processing**: Amazon Bedrock (Claude 3 Sonnet, Titan Embeddings)
- **Vector Similarity Search**: OpenSearch Serverless for duplicate detection
- **Event-Driven Design**: EventBridge triggers and Step Functions orchestration
- **FastAPI Backend**: High-performance async API with automatic documentation
- **MongoDB Atlas Integration**: Scalable document database with AWS Secrets Manager
- **Comprehensive Monitoring**: CloudWatch logs, X-Ray tracing, and custom metrics

## 🛠️ Development Setup

### Prerequisites
- Python 3.11+
- Node.js 16+
- MongoDB Atlas account
- AWS Account with Bedrock access
- AWS CLI and SAM CLI (for deployment)

### Backend Setup

1. **Clone and navigate to the project**:
   ```bash
   git clone <repository-url>
   cd PriorityOps
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. **Configure environment**:
   ```bash
   cp .env.template .env
   # Edit .env with your configuration
   ```

5. **Run the development server**:
   ```bash
   python -m uvicorn server:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000` and will automatically proxy API requests to the backend at `http://localhost:8000`.

### Environment Variables

Create a `.env` file in the backend directory with:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DATABASE=priorityops

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# AWS Configuration (for deployment)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1

# Application Configuration
ENVIRONMENT=development
LOG_LEVEL=INFO
SECRET_KEY=your-secret-key-here
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Agent Configuration
DUPLICATE_SIMILARITY_THRESHOLD=0.8
ESCALATION_TIME_THRESHOLD_MINUTES=60
ESCALATION_CHECK_INTERVAL_MINUTES=15
```

## 📊 API Documentation

Once the server is running, visit:
- **Interactive API Docs**: http://localhost:8000/docs
- **ReDoc Documentation**: http://localhost:8000/redoc

### Key Endpoints

#### Tickets
- `GET /api/v1/tickets` - List tickets with filtering and pagination
- `POST /api/v1/tickets` - Create a new ticket
- `GET /api/v1/tickets/{id}` - Get specific ticket
- `PUT /api/v1/tickets/{id}` - Update ticket
- `DELETE /api/v1/tickets/{id}` - Delete ticket

#### Analytics
- `GET /api/v1/analytics/summary` - Overall statistics
- `GET /api/v1/analytics/priority` - Priority distribution
- `GET /api/v1/analytics/trends` - Time-based trends
- `GET /api/v1/analytics/performance` - Resolution metrics

## 🤖 Cognitive Workflow Agents

The system uses a 4-stage cognitive workflow powered by AWS Step Functions and Lambda agents:

### 1. Get Ticket Details Agent (`get_ticket_details.py`)
- Retrieves complete ticket data from MongoDB Atlas
- Uses AWS Secrets Manager for secure credential management
- Handles BSON to JSON conversion for downstream processing

### 2. Duplicate Detector Agent (`duplicate_detector.py`)
- Generates semantic embeddings using Amazon Bedrock Titan
- Performs k-NN similarity search with OpenSearch Serverless
- Configurable similarity threshold (default: 0.9)
- Indexes new tickets for future duplicate detection

### 3. AI Triage Agent (`ai_triage_agent.py`)
- Classifies priority using Claude 3 Sonnet on Amazon Bedrock
- Generates category, confidence scores, and estimated resolution times
- Provides structured solution recommendations for support agents
- Skips processing for tickets identified as duplicates

### 4. Update Ticket Agent (`update_ticket_agent.py`)
- Persists AI analysis results back to MongoDB
- Handles duplicate ticket closure and linking
- Maintains comprehensive audit trails for compliance
- Updates ticket status based on processing results

### 5. Escalation Agent (`escalation_agent.py`)
- Monitors SLA compliance with configurable thresholds (1-hour default)
- Runs on 15-minute schedule via EventBridge
- Automatically escalates overdue critical/high priority tickets
- Sends SNS notifications to operations team

## 🚀 Deployment

### AWS Serverless Deployment
The application uses AWS SAM for infrastructure as code deployment:

1. **Prerequisites**:
   ```bash
   # Install AWS SAM CLI
   pip install aws-sam-cli
   
   # Configure AWS credentials
   aws configure
   ```

2. **Deploy the cognitive workflow**:
   ```bash
   cd infra
   sam build
   sam deploy --guided
   ```

3. **Set up required AWS services**:
   - Enable Amazon Bedrock model access (Claude 3 Sonnet, Titan Embeddings)
   - Create MongoDB Atlas cluster and store credentials in AWS Secrets Manager
   - Configure OpenSearch Serverless collection for vector search

For detailed deployment instructions, see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

### Environment-Specific Configuration
- **Development**: Local FastAPI + deployed Lambda agents
- **Staging**: Full serverless deployment with staging resources
- **Production**: Production serverless deployment with monitoring and alerting

## 🧪 Testing

```bash
# Run unit tests
pytest tests/

# Run with coverage
pytest --cov=backend tests/

# Run specific test file
pytest tests/test_tickets.py
```

## 📈 Monitoring and Logging

- **Structured Logging**: JSON-formatted logs for easy parsing
- **Health Check Endpoints**: `/health` for service monitoring
- **CloudWatch Integration**: Automatic log aggregation in AWS
- **Error Tracking**: Comprehensive error handling and reporting

## 🔧 Development Guidelines

### Code Organization
- **Models**: Pydantic models in `backend/models/`
- **Services**: Business logic in `backend/services/`
- **Routes**: API handlers in `backend/routes/`
- **Utils**: Shared utilities in `backend/utils/`

### Best Practices
- Use type hints throughout the codebase
- Follow FastAPI conventions for route organization
- Implement proper error handling and logging
- Write comprehensive tests for business logic
- Use Pydantic for data validation and serialization

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
