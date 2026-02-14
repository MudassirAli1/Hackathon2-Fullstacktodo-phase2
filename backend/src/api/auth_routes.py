from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import Dict, Any
from ..models.auth import AuthRequest, AuthResponse
from ..services.auth_service import AuthService
from ..database.database import get_session
from ..config.settings import settings

router = APIRouter()


@router.post("/auth/signup")
def signup(
    auth_request: AuthRequest,
    session: Session = Depends(get_session)
) -> Dict[str, Any]:
    """
    Register a new user account
    """
    try:
        # Use the AuthService to create the user
        result = AuthService.signup_new_user(auth_request, session)

        if result.success and result.token:
            # Format user response
            user_dict = None
            if result.user:
                user_dict = {
                    "id": str(result.user.id),
                    "email": result.user.email,
                    "name": result.user.name,
                }

            # Return success response with JWT token
            return {
                "success": True,
                "token": result.token,
                "user": user_dict,
                "message": "Account created successfully"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.error or "Signup failed"
            )
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error during signup: {str(e)}"
        )


@router.post("/auth/signin")
def signin(
    auth_request: AuthRequest,
    session: Session = Depends(get_session)
) -> Dict[str, Any]:
    """
    Authenticate an existing user
    """
    try:
        # Use the AuthService to authenticate the user
        result = AuthService.signin_existing_user({
            "email": auth_request.email,
            "password": auth_request.password
        }, session)

        if result.success and result.token:
            # Format user response
            user_dict = None
            if result.user:
                user_dict = {
                    "id": str(result.user.id),
                    "email": result.user.email,
                    "name": result.user.name,
                }

            return {
                "success": True,
                "token": result.token,
                "user": user_dict,
                "message": "Signin successful"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=result.error or "Invalid credentials"
            )
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error during signin: {str(e)}"
        )


@router.post("/auth/logout")
def logout() -> Dict[str, Any]:
    """
    Logout the current user (in stateless auth, this confirms logout)
    """
    # In a stateless JWT system, there's no server-side session to clear
    # This endpoint confirms to the frontend that logout was initiated
    return {
        "success": True,
        "message": "Successfully logged out"
    }