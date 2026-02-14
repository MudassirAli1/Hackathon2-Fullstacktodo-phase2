from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Any
from sqlmodel import Session
from ..utils.jwt_utils import verify_token, decode_token_payload
from ..database.database import get_session as get_database_session
from datetime import datetime

# Define the security scheme
security = HTTPBearer()


def get_db_session():
    """Dependency to get database session"""
    yield from get_database_session()


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """
    Dependency to get the current user from the JWT token in the Authorization header
    """
    token = credentials.credentials

    try:
        # Verify the token signature and return payload
        payload = verify_token(token)

        # Extract user ID from the token payload
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials - missing user ID",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Extract other user information from the token
        user_data = {
            "user_id": user_id,
            "email": payload.get("email", ""),
            "name": payload.get("name", ""),
            "exp": payload.get("exp", 0),
            "iat": payload.get("iat", 0)
        }

        # Verify that the token hasn't expired
        current_time = datetime.utcnow().timestamp()
        if user_data["exp"] < current_time:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return user_data

    except HTTPException:
        # Re-raise HTTP exceptions (they're already formatted correctly)
        raise
    except Exception:
        # Handle any other exception by raising an HTTP 401
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials - invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_active_user(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Dependency that ensures the user is active
    This can be extended with additional checks like account status, etc.
    """
    # Additional checks could be implemented here, such as:
    # - Checking if user account is suspended
    # - Checking additional permissions

    # For now, we'll just return the user data
    return current_user