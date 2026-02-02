/**
 * Application error types
 * P0-2: Structured error handling
 */

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 500,
    public details?: unknown
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super('VALIDATION_ERROR', message, 400, details)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super('UNAUTHORIZED', message, 401)
    this.name = 'AuthenticationError'
  }
}

export class AIError extends AppError {
  constructor(message: string, details?: unknown) {
    super('AI_ERROR', message, 500, details)
    this.name = 'AIError'
  }
}
