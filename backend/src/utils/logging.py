import logging
import sys
from datetime import datetime
from typing import Any, Dict, Optional
from ..config.settings import settings


def setup_logging():
    """
    Configure logging for the application
    Sets up different log levels based on environment and security considerations
    """
    # Create a custom formatter that includes more security-relevant information
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s - %(pathname)s:%(lineno)d'
    )

    # Configure the root logger
    root_logger = logging.getLogger()

    # Set log level based on environment
    if settings.environment.lower() == 'development':
        root_logger.setLevel(logging.DEBUG)
    else:
        root_logger.setLevel(logging.INFO)

    # Remove default handlers to avoid duplicates
    if root_logger.handlers:
        root_logger.handlers.clear()

    # Create console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)

    # In production, you might also want to add file handler
    if settings.environment.lower() != 'development':
        file_handler = logging.FileHandler('app.log')
        file_handler.setFormatter(formatter)
        root_logger.addHandler(file_handler)

    return root_logger


def log_auth_event(event_type: str, user_id: Optional[str] = None, details: Optional[Dict[str, Any]] = None):
    """
    Log authentication-related events with appropriate security context
    Examples: login_success, login_failure, token_creation, token_verification, etc.
    """
    logger = logging.getLogger(__name__)

    event_details = {
        'event_type': event_type,
        'timestamp': datetime.utcnow().isoformat(),
        'user_id': user_id or 'unknown',
        'details': details or {},
    }

    # Don't log sensitive information like passwords or full tokens
    if 'token' in event_details['details']:
        # Mask the token for security
        original_token = event_details['details']['token']
        masked_token = f"{original_token[:10]}..." if len(original_token) > 10 else "MASKED"
        event_details['details']['token'] = masked_token

    if event_type.startswith('login') or event_type.startswith('auth'):
        logger.info(f"AUTH_EVENT: {event_details}")
    else:
        logger.debug(f"AUTH_EVENT: {event_details}")


def log_security_event(event_type: str, user_id: Optional[str] = None, ip_address: Optional[str] = None, details: Optional[Dict[str, Any]] = None):
    """
    Log security-relevant events
    Examples: invalid_token, expired_token, unauthorized_access, etc.
    """
    logger = logging.getLogger(__name__)

    event_details = {
        'event_type': event_type,
        'timestamp': datetime.utcnow().isoformat(),
        'user_id': user_id or 'unknown',
        'ip_address': ip_address or 'unknown',
        'details': details or {},
    }

    logger.warning(f"SECURITY_EVENT: {event_details}")


def log_token_event(event_type: str, user_id: Optional[str] = None, token_id: Optional[str] = None, details: Optional[Dict[str, Any]] = None):
    """
    Log JWT token-related events with security considerations
    Examples: token_generated, token_verified, token_expired, token_invalid, etc.
    """
    logger = logging.getLogger(__name__)

    event_details = {
        'event_type': event_type,
        'timestamp': datetime.utcnow().isoformat(),
        'user_id': user_id or 'unknown',
        'token_id': token_id or 'unknown',  # In a real implementation, you might track token IDs
        'details': details or {},
    }

    if event_type == 'token_invalid' or event_type == 'token_expired':
        logger.warning(f"TOKEN_EVENT: {event_details}")
    else:
        logger.info(f"TOKEN_EVENT: {event_details}")


def sanitize_log_message(message: str) -> str:
    """
    Remove sensitive information from log messages
    """
    import re

    # Remove potential email addresses
    sanitized = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '[EMAIL_MASKED]', message)

    # Remove potential tokens (anything that looks like JWT: part.part.part)
    sanitized = re.sub(r'[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+', '[TOKEN_MASKED]', sanitized)

    # Remove potential passwords or other sensitive terms
    sanitized = re.sub(r'password["\']?\s*[:=]\s*["\'][^"\']*["\']?', 'password":"[PASSWORD_MASKED]"', sanitized)

    return sanitized


# Initialize the logging configuration
setup_logging()