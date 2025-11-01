# Contributing to PriorityOps

Thank you for your interest in contributing to PriorityOps! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Python 3.8+ with pip
- Node.js 16+ with npm
- MongoDB Atlas account or local MongoDB instance
- AWS account (for serverless deployment)
- Git for version control

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/PriorityOps.git
   cd PriorityOps
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.template .env
   # Configure your .env file
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cp .env.example .env.local
   # Configure your .env.local file
   ```

4. **Run Development Servers**
   ```bash
   # Backend (Terminal 1)
   cd backend
   python -m uvicorn server:app --reload --host 0.0.0.0 --port 8000
   
   # Frontend (Terminal 2)
   cd frontend
   npm run dev
   ```

## 📋 How to Contribute

### Reporting Issues
- Use GitHub Issues to report bugs or request features
- Provide detailed information including:
  - Steps to reproduce
  - Expected vs actual behavior
  - Environment details (OS, Python/Node versions)
  - Screenshots if applicable

### Submitting Changes

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Follow the coding standards below
   - Add tests for new functionality
   - Update documentation as needed

3. **Test Your Changes**
   ```bash
   # Backend tests
   cd backend
   pytest tests/
   
   # Frontend tests
   cd frontend
   npm test
   
   # Type checking
   npm run type-check
   ```

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

5. **Push and Create Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then create a Pull Request on GitHub.

## 🎯 Development Guidelines

### Code Style

#### Python (Backend)
- Follow PEP 8 style guidelines
- Use type hints for all function parameters and return values
- Use Pydantic models for data validation
- Write docstrings for all public functions and classes
- Maximum line length: 88 characters (Black formatter)

```python
from typing import List, Optional
from pydantic import BaseModel

class TicketCreate(BaseModel):
    """Model for creating a new ticket."""
    title: str
    description: str
    priority: Optional[str] = "medium"
    
async def create_ticket(ticket_data: TicketCreate) -> Ticket:
    """Create a new ticket in the database."""
    # Implementation here
    pass
```

#### TypeScript (Frontend)
- Use TypeScript for all new code
- Follow React best practices and hooks patterns
- Use proper type definitions for all props and state
- Prefer functional components over class components

```typescript
interface TicketProps {
  ticket: Ticket;
  onUpdate: (ticket: Ticket) => void;
}

const TicketCard: React.FC<TicketProps> = ({ ticket, onUpdate }) => {
  // Component implementation
};
```

#### Lambda Agents
- Follow the established pattern from existing agents
- Include comprehensive error handling and logging
- Use environment variables for configuration
- Add proper retry logic and timeout handling

```python
def lambda_handler(event, context):
    """Lambda handler with proper error handling."""
    logger.info(f"Processing event: {json.dumps(event)}")
    
    try:
        # Agent logic here
        return {"status": "SUCCESS"}
    except Exception as e:
        logger.error(f"Error: {e}")
        raise Exception(str(e))
```

### Testing Guidelines

#### Backend Tests
- Write unit tests for all business logic
- Use pytest with fixtures for database testing
- Mock external services (AWS, OpenAI, etc.)
- Aim for >80% code coverage

```python
import pytest
from unittest.mock import Mock, patch

@pytest.fixture
def mock_ticket_service():
    return Mock()

def test_create_ticket_success(mock_ticket_service):
    # Test implementation
    pass
```

#### Frontend Tests
- Write component tests using React Testing Library
- Test user interactions and API integration
- Use MSW for API mocking in tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { TicketForm } from './TicketForm';

test('submits ticket form with valid data', () => {
  // Test implementation
});
```

### Documentation Standards

- Update README.md for significant changes
- Add inline code comments for complex logic
- Document API changes in the OpenAPI spec
- Update environment variable documentation

### Commit Message Format

Use conventional commits format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(agents): add escalation agent with SNS notifications
fix(api): resolve duplicate ticket detection issue
docs(readme): update installation instructions
```

## 🏗️ Architecture Guidelines

### Adding New Agents
1. Create new Lambda function in `backend/agents/`
2. Follow the established pattern with proper error handling
3. Add environment variables to SAM template
4. Update the Step Functions workflow if needed
5. Add comprehensive tests

### API Changes
1. Update Pydantic models in `backend/models/`
2. Modify route handlers in `backend/routes/`
3. Update frontend types in `frontend/src/types/`
4. Add API tests and update documentation

### Database Changes
1. Update MongoDB models and indexes
2. Create migration scripts if needed
3. Update the database utility functions
4. Test with sample data

## 🔍 Code Review Process

### For Contributors
- Ensure all tests pass before submitting PR
- Write clear PR descriptions explaining changes
- Respond to review feedback promptly
- Keep PRs focused and reasonably sized

### For Reviewers
- Check code quality and adherence to guidelines
- Verify tests cover new functionality
- Ensure documentation is updated
- Test the changes locally when possible

## 🚀 Release Process

1. **Version Bumping**: Update version numbers in package.json and relevant files
2. **Changelog**: Update CHANGELOG.md with new features and fixes
3. **Testing**: Run full test suite and manual testing
4. **Documentation**: Ensure all documentation is up to date
5. **Deployment**: Deploy to staging for final validation
6. **Release**: Create GitHub release with proper tags

## 📞 Getting Help

- **GitHub Discussions**: For general questions and discussions
- **GitHub Issues**: For bug reports and feature requests
- **Documentation**: Check the README and docs/ directory
- **Code Examples**: Look at existing implementations for patterns

## 🎉 Recognition

Contributors will be recognized in:
- GitHub contributors list
- CHANGELOG.md for significant contributions
- README.md acknowledgments section

Thank you for contributing to PriorityOps! 🚀