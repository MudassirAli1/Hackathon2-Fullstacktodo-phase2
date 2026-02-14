import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
from ..config.settings import settings


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token with the given data
    Implements security best practices:
    - Sets proper expiration times
    - Includes standard JWT claims
    - Uses configured signing algorithm and secret
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(seconds=settings.JWT_EXPIRATION_DELTA)

    # Include standard JWT claims for security
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),  # issued at time
        "iss": "todo-app-auth",   # issuer claim
        "sub": f"user:{data.get('user_id', '')}"  # subject claim
    })

    encoded_jwt = jwt.encode(to_encode, settings.BETTER_AUTH_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verify a JWT token and return the payload if valid
    Implements security checks:
    - Validates signature against secret
    - Checks expiration
    - Validates required claims
    """
    try:
        payload = jwt.decode(
            token,
            settings.BETTER_AUTH_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
            options={
                "verify_exp": True,  # Verify expiration
                "verify_iat": True,  # Verify issued-at time
                "verify_nbf": True,  # Verify not-before time
            }
        )

        # Additional security validation
        if 'user_id' not in payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user ID",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def decode_token_payload(token: str) -> Optional[Dict[str, Any]]:
    """
    Decode the JWT token payload without validating the signature
    Use only for extracting non-sensitive information after basic format validation
    WARNING: Does not verify token integrity - only use for format validation
    """
    try:
        # Validate token format first
        if not validate_token_format(token):
            return None

        # Split the token to get the payload part
        _, payload_part, _ = token.split('.')

        # Decode the payload part (base64url encoded)
        import base64
        # Add proper padding for base64 decoding
        payload_bytes = payload_part.encode('utf-8')
        # Replace URL-safe base64 characters back to standard
        payload_bytes = payload_bytes.replace(b'-', b'+').replace(b'_', b'/')
        # Add proper padding
        payload_bytes += b'=' * (4 - len(payload_bytes) % 4)

        decoded_payload = base64.b64decode(payload_bytes)
        import json
        return json.loads(decoded_payload.decode('utf-8'))
    except Exception:
        return None


def is_token_expired(token: str) -> bool:
    """
    Check if a JWT token is expired without verifying the signature
    """
    try:
        payload = decode_token_payload(token)
        if payload and 'exp' in payload:
            expiration_time = payload['exp']
            current_time = datetime.utcnow().timestamp()
            return current_time >= expiration_time
        return True  # If no expiration claim, consider expired
    except Exception:
        return True  # If error decoding, consider expired


def validate_token_format(token: str) -> bool:
    """
    Validate that the JWT token has the proper format (header.payload.signature)
    """
    try:
        parts = token.split('.')
        return len(parts) == 3  # JWT has 3 parts separated by dots
    except Exception:
        return False


def get_user_id_from_token(token: str) -> Optional[str]:
    """
    Extract user ID from a JWT token (after basic format validation)
    Does not verify the token's signature, so only use in combination with proper verification
    """
    try:
        payload = decode_token_payload(token)
        if payload:
            return payload.get('user_id')
        return None
    except Exception:
        return None


def validate_token_integrity(token: str) -> bool:
    """
    Validates the token integrity by verifying its signature against the stored secret
    """
    try:
        # This will validate the signature against the secret without fully decoding
        jwt.decode(
            token,
            settings.BETTER_AUTH_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
            options={
                "verify_signature": True,
                "verify_exp": False,  # Skip expiration check for this validation
                "verify_iat": False,  # Skip issued-at check for this validation
                "verify_nbf": False,  # Skip not-before check for this validation
            }
        )
        return True
    except jwt.InvalidSignatureError:
        return False
    except Exception:
        return False


def handle_token_validation_error(error: Exception) -> HTTPException:
    """
    Standardized error handling for token validation issues
    Provides security-appropriate error messages without revealing sensitive details
    """
    if isinstance(error, jwt.ExpiredSignatureError):
        return HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    elif isinstance(error, jwt.InvalidSignatureError):
        return HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token signature",
            headers={"WWW-Authenticate": "Bearer"},
        )
    elif isinstance(error, jwt.InvalidTokenError):
        return HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    elif isinstance(error, jwt.ImmatureSignatureError):
        return HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token not yet valid",
            headers={"WWW-Authenticate": "Bearer"},
        )
    else:
        return HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def sanitize_token_output(token: str) -> str:
    """
    Sanitize token for safe logging/output (return masked version)
    For security reasons, don't log or display the full token in most contexts
    """
    if len(token) > 10:
        return f"{token[:5]}...{token[-5:]}"
    return "INVALID_TOKEN"