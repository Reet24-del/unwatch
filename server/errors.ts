export class AppError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

// Provider response text can contain credentials or private URLs. Keep only a
// bounded machine-readable reason, never the original body or request headers.
export class ProviderError extends AppError {
  constructor(
    public upstreamStatus: number,
    public reason: string,
    message: string,
  ) {
    super(upstreamStatus === 429 ? 429 : 502, 'PROVIDER_ERROR', message);
  }
}
