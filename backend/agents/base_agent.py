"""
Base agent class for all AI agents in the PriorityOps system.
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, Optional
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class BaseAgent(ABC):
    """
    Abstract base class for all AI agents.
    
    Provides common functionality and interface for agent implementations.
    """
    
    def __init__(self, name: str, config: Optional[Dict[str, Any]] = None):
        """
        Initialize the base agent.
        
        Args:
            name: The name of the agent
            config: Optional configuration dictionary
        """
        self.name = name
        self.config = config or {}
        self.is_healthy = True
        self.last_health_check = datetime.utcnow()
        logger.info(f"Initialized agent: {self.name}")
    
    @abstractmethod
    async def process(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process data and return results.
        
        Args:
            data: Input data to process
            
        Returns:
            Dictionary containing processing results
        """
        pass
    
    async def health_check(self) -> Dict[str, Any]:
        """
        Perform health check for the agent.
        
        Returns:
            Dictionary containing health status information
        """
        try:
            # Basic health check - can be overridden by subclasses
            self.is_healthy = True
            self.last_health_check = datetime.utcnow()
            
            return {
                "agent": self.name,
                "status": "healthy" if self.is_healthy else "unhealthy",
                "last_check": self.last_health_check.isoformat(),
                "config": self.config
            }
        except Exception as e:
            logger.error(f"Health check failed for agent {self.name}: {str(e)}")
            self.is_healthy = False
            return {
                "agent": self.name,
                "status": "unhealthy",
                "error": str(e),
                "last_check": self.last_health_check.isoformat()
            }
    
    def get_status(self) -> Dict[str, Any]:
        """
        Get current agent status.
        
        Returns:
            Dictionary containing current status information
        """
        return {
            "name": self.name,
            "healthy": self.is_healthy,
            "last_health_check": self.last_health_check.isoformat(),
            "config": self.config
        }