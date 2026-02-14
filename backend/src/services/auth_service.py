from typing import Optional, Dict, Any
from sqlmodel import Session, select
from datetime import timedelta
from ..models.auth import User, UserCreate, UserUpdate, AuthResponse, JWTTokenData, UserResponse
from ..utils.jwt_utils import create_access_token, verify_token
from ..utils.password_utils import hash_password, verify_password
from ..config.settings import settings


class AuthService:
    @staticmethod
    def authenticate_user(email: str, password: str, session: Session) -> Optional[User]:
        """
        Authenticate user with email and password
        """
        if not email or not password:
            return None

        # Query database for user by email
        statement = select(User).where(User.email == email)
        user = session.exec(statement).first()

        if not user:
            return None

        # Verify password
        if not verify_password(password, user.hashed_password):
            return None

        return user

    @staticmethod
    def create_access_token_for_user(user: User) -> str:
        """
        Create an access token for a user with security best practices
        """
        # Prepare data to encode in the JWT token
        data_to_encode = {
            "user_id": str(user.id),
            "email": user.email,
            "name": user.name or "",
        }

        # Create access token with expiration
        access_token_expires = timedelta(seconds=settings.JWT_EXPIRATION_DELTA)
        token = create_access_token(
            data=data_to_encode, expires_delta=access_token_expires
        )

        return token

    @staticmethod
    def create_refresh_token_for_user(user: User) -> str:
        """
        Create a refresh token for a user (in a real implementation)
        This would typically have a longer expiration than access tokens
        For this implementation, we'll use a mock approach since stateless JWTs don't typically use refresh tokens
        """
        # In a stateless JWT system, we don't typically use refresh tokens
        # But if we did, it would be a separate long-lived token
        # For this implementation, we'll just return None to indicate no refresh token used
        # In a real system, you might implement refresh token storage in a database
        return None

    @staticmethod
    def signup_new_user(user_create: UserCreate, session: Session) -> AuthResponse:
        """
        Register a new user
        """
        try:
            # Check if user already exists
            statement = select(User).where(User.email == user_create.email)
            existing_user = session.exec(statement).first()

            if existing_user:
                return AuthResponse(
                    success=False,
                    error="Email already registered"
                )

            # Validate password length
            if len(user_create.password) < 8:
                return AuthResponse(
                    success=False,
                    error="Password must be at least 8 characters"
                )

            # Hash the password
            hashed_password = hash_password(user_create.password)

            # Create new user
            new_user = User(
                email=user_create.email,
                name=user_create.name,
                hashed_password=hashed_password
            )

            # Add to database
            session.add(new_user)
            session.commit()
            session.refresh(new_user)

            # Create JWT token for the new user
            access_token = AuthService.create_access_token_for_user(new_user)

            # Create response user (without hashed_password)
            user_response = UserResponse(
                id=new_user.id,
                email=new_user.email,
                name=new_user.name,
                created_at=new_user.created_at,
                updated_at=new_user.updated_at
            )

            return AuthResponse(
                success=True,
                token=access_token,
                user=user_response
            )
        except Exception as e:
            session.rollback()
            return AuthResponse(
                success=False,
                error=str(e)
            )

    @staticmethod
    def signin_existing_user(auth_request: Dict[str, Any], session: Session) -> AuthResponse:
        """
        Sign in an existing user
        """
        try:
            email = auth_request.get('email', '')
            password = auth_request.get('password', '')

            # First check if user exists
            statement = select(User).where(User.email == email)
            user = session.exec(statement).first()

            if not user:
                return AuthResponse(
                    success=False,
                    error="No account found with this email. Please sign up first."
                )

            # Verify password
            if not verify_password(password, user.hashed_password):
                return AuthResponse(
                    success=False,
                    error="Invalid email or password"
                )

            # Create JWT token for authenticated user
            access_token = AuthService.create_access_token_for_user(user)

            # Create response user (without hashed_password)
            user_response = UserResponse(
                id=user.id,
                email=user.email,
                name=user.name,
                created_at=user.created_at,
                updated_at=user.updated_at
            )

            return AuthResponse(
                success=True,
                token=access_token,
                user=user_response
            )
        except Exception as e:
            return AuthResponse(
                success=False,
                error=str(e)
            )

    @staticmethod
    def validate_token(token: str) -> Optional[JWTTokenData]:
        """
        Validate a JWT token and return the payload
        """
        try:
            payload = verify_token(token)
            if payload:
                return JWTTokenData(
                    user_id=payload.get("user_id", ""),
                    exp=payload.get("exp", 0),
                    iat=payload.get("iat", 0),
                    email=payload.get("email", ""),
                    name=payload.get("name", "")
                )
        except Exception:
            return None

    @staticmethod
    def refresh_token_if_needed(refresh_token: str) -> Optional[Dict[str, str]]:
        """
        Refresh an access token if it's expired (in a stateless system, this is more complex)
        In a real implementation, this would validate the refresh token and issue a new access token
        For this stateless JWT implementation, we'll return a mock response
        """
        # For a true stateless JWT system, we typically don't implement refresh tokens
        # Instead, we might use shorter-lived access tokens and redirect users to login
        # when the token expires
        return None

    @staticmethod
    def signout_user(token: str) -> bool:
        """
        Handle user signout (in stateless auth, this might involve blacklisting the token)
        For this implementation, we'll just return success as tokens are stateless
        """
        # In a real implementation, you might add the token to a blacklist
        # until it expires, especially for sensitive operations
        return True