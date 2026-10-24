import * as Sentry from '@sentry/node';
import { config } from './config';
if (config.sentryDsn)
  Sentry.init({
    dsn: config.sentryDsn,
    tracesSampleRate: 0.2,
    defaultIntegrations: false,
    beforeSend(event) {
      delete event.request;
      delete event.user;
      delete event.breadcrumbs;
      return event;
    },
  });
export async function trace<T>(name: string, op: string, fn: () => Promise<T>): Promise<T> {
  return Sentry.startSpan({ name, op }, fn);
}
export function modelUsage(input: number, output: number, cost: number) {
  const span = Sentry.getActiveSpan();
  span?.setAttributes({
    'gen_ai.usage.input_tokens': input,
    'gen_ai.usage.output_tokens': output,
    'gen_ai.usage.total_cost': cost,
    'gen_ai.request.model': config.model,
  });
}
export function recordFailure(code: string) {
  Sentry.captureMessage(`UNWATCH request failed: ${code}`, 'warning');
}
