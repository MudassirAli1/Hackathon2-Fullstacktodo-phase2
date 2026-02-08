export interface SignUpCredentials {
  email: string
  password: string
  name?: string
}

export interface SignInCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  user?: {
    id: string
    email: string
    name?: string
  }
  token?: string
  error?: string
}

export interface LogoutResponse {
  success: boolean
  message?: string
}

export interface JwtPayload {
  userId: string
  exp: number
  iat: number
}
