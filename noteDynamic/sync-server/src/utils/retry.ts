/**
 * Retry utility with exponential backoff and jitter
 * Used for handling transient failures in sync operations
 */

export interface RetryOptions {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitterFactor: number;
  retryableErrors?: (error: unknown) => boolean;
  onRetry?: (attempt: number, error: unknown, delayMs: number) => void;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: unknown;
  attempts: number;
  totalTimeMs: number;
}

/**
 * Default retry options
 */
export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  jitterFactor: 0.3,
};

/**
 * Calculate delay with exponential backoff and jitter
 */
export function calculateDelay(
  attempt: number,
  baseDelayMs: number,
  maxDelayMs: number,
  jitterFactor: number
): number {
  // Exponential backoff: baseDelay * 2^(attempt-1)
  const exponentialDelay = baseDelayMs * Math.pow(2, attempt - 1);

  // Add jitter to prevent thundering herd
  const jitter = exponentialDelay * jitterFactor * Math.random();

  // Cap at max delay
  return Math.min(exponentialDelay + jitter, maxDelayMs);
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    // Network errors
    if (error.message.includes('ECONNREFUSED') ||
        error.message.includes('ETIMEDOUT') ||
        error.message.includes('ENOTFOUND') ||
        error.message.includes('network')) {
      return true;
    }

    // Database errors that may be transient
    if (error.message.includes('database') ||
        error.message.includes('timeout') ||
        error.message.includes('connection')) {
      return true;
    }

    // Rate limiting
    if (error.message.includes('rate limit') ||
        error.message.includes('TooManyRequests')) {
      return true;
    }
  }

  return false;
}

/**
 * Retry a function with exponential backoff and jitter
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<RetryResult<T>> {
  const opts: RetryOptions = { ...DEFAULT_RETRY_OPTIONS, ...options };
  const startTime = Date.now();
  let lastError: unknown;

  for (let attempt = 1; attempt <= opts.maxRetries; attempt++) {
    try {
      const data = await fn();
      return {
        success: true,
        data,
        attempts: attempt,
        totalTimeMs: Date.now() - startTime,
      };
    } catch (error) {
      lastError = error;

      // Check if we should retry this error
      const shouldRetry = opts.retryableErrors
        ? opts.retryableErrors(error)
        : isRetryableError(error);

      if (!shouldRetry || attempt >= opts.maxRetries) {
        break;
      }

      // Calculate delay
      const delayMs = calculateDelay(
        attempt,
        opts.baseDelayMs,
        opts.maxDelayMs,
        opts.jitterFactor
      );

      // Call onRetry callback if provided
      opts.onRetry?.(attempt, error, delayMs);

      // Wait before retrying
      await sleep(delayMs);
    }
  }

  return {
    success: false,
    error: lastError,
    attempts: opts.maxRetries,
    totalTimeMs: Date.now() - startTime,
  };
}

/**
 * Retry decorator factory for class methods
 */
export function retryable<T extends (...args: unknown[]) => Promise<unknown>>(
  options: Partial<RetryOptions> = {}
) {
  return function (
    _target: unknown,
    _propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>
  ): TypedPropertyDescriptor<T> {
    const originalMethod = descriptor.value!;

    descriptor.value = async function (this: unknown, ...args: Parameters<T>): Promise<ReturnType<T>> {
      const result = await retry(() => originalMethod.apply(this, args), options);
      if (result.success) {
        return result.data as ReturnType<T>;
      }
      throw result.error;
    } as T;

    return descriptor;
  };
}

/**
 * Batch retry for multiple operations
 */
export async function retryBatch<T>(
  items: T[],
  operation: (item: T) => Promise<unknown>,
  options: Partial<RetryOptions> = {}
): Promise<{ successful: T[]; failed: { item: T; error: unknown }[] }> {
  const successful: T[] = [];
  const failed: { item: T; error: unknown }[] = [];

  await Promise.all(
    items.map(async (item) => {
      const result = await retry(() => operation(item), options);
      if (result.success) {
        successful.push(item);
      } else {
        failed.push({ item, error: result.error });
      }
    })
  );

  return { successful, failed };
}
