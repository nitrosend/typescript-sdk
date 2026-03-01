export class NitrosendError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.name = 'NitrosendError';
    this.statusCode = statusCode;
    this.code = code ?? String(statusCode);
  }

  static fromResponse(status: number, body: unknown): NitrosendError {
    const b = body as Record<string, unknown> | null;
    const message = (b?.message as string) ?? `Request failed with status ${status}`;
    const code = (b?.code as string) ?? String(status);

    switch (status) {
      case 400:
        return new BadRequestError(message, code);
      case 401:
        return new AuthenticationError(message, code);
      case 402:
        return new PaymentRequiredError(message, code);
      case 403:
        return new ForbiddenError(message, code);
      case 404:
        return new NotFoundError(message, code);
      case 422: {
        const validationErrors = (b?.validation_errors ?? {}) as Record<string, string[]>;
        return new ValidationError(message, code, validationErrors);
      }
      case 429:
        return new RateLimitError(message, code);
      default:
        return new NitrosendError(message, status, code);
    }
  }
}

export class BadRequestError extends NitrosendError {
  constructor(message: string, code?: string) {
    super(message, 400, code);
    this.name = 'BadRequestError';
  }
}

export class AuthenticationError extends NitrosendError {
  constructor(message: string, code?: string) {
    super(message, 401, code);
    this.name = 'AuthenticationError';
  }
}

export class PaymentRequiredError extends NitrosendError {
  constructor(message: string, code?: string) {
    super(message, 402, code);
    this.name = 'PaymentRequiredError';
  }
}

export class ForbiddenError extends NitrosendError {
  constructor(message: string, code?: string) {
    super(message, 403, code);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends NitrosendError {
  constructor(message: string, code?: string) {
    super(message, 404, code);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends NitrosendError {
  readonly validationErrors: Record<string, string[]>;

  constructor(message: string, code: string, validationErrors: Record<string, string[]>) {
    super(message, 422, code);
    this.name = 'ValidationError';
    this.validationErrors = validationErrors;
  }
}

export class RateLimitError extends NitrosendError {
  constructor(message: string, code?: string) {
    super(message, 429, code);
    this.name = 'RateLimitError';
  }
}
