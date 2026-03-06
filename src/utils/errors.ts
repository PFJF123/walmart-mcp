export class WalmartError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = "WalmartError";
  }
}

export class RateLimitError extends WalmartError {
  constructor() {
    super("Daily API rate limit exceeded (5000/day)", "RATE_LIMIT", 429);
  }
}

export class AuthError extends WalmartError {
  constructor(message: string) {
    super(message, "AUTH_ERROR", 401);
  }
}

export class BrowserError extends WalmartError {
  constructor(message: string) {
    super(message, "BROWSER_ERROR");
  }
}

export class CheckoutError extends WalmartError {
  constructor(message: string) {
    super(message, "CHECKOUT_ERROR");
  }
}
