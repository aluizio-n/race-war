import { z } from 'zod';

// Block private/internal addresses to prevent SSRF via malicious push endpoints.
// Valid push endpoints always use HTTPS and point to external push service infrastructure.
function isSafePushEndpoint(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;

    const host = parsed.hostname.toLowerCase();
    const blocked = [
      'localhost', '0.0.0.0', '[::]', '[::1]',
    ];
    if (blocked.includes(host)) return false;

    // Block private IPv4 ranges and link-local
    const privateRanges = [
      /^127\./, /^10\./, /^192\.168\./,
      /^172\.(1[6-9]|2\d|3[01])\./, /^169\.254\./,
    ];
    if (privateRanges.some(r => r.test(host))) return false;

    return true;
  } catch {
    return false;
  }
}

export const subscribePushSchema = z.object({
  endpoint: z
    .string()
    .url()
    .refine(isSafePushEndpoint, 'Endpoint de push inválido ou inseguro'),
  keys: z.object({
    p256dh: z.string().min(1).max(512),
    auth: z.string().min(1).max(128),
  }),
});

export const unsubscribePushSchema = z.object({
  endpoint: z
    .string()
    .url()
    .refine(isSafePushEndpoint, 'Endpoint de push inválido ou inseguro'),
});

export type SubscribePushInput = z.infer<typeof subscribePushSchema>;
export type UnsubscribePushInput = z.infer<typeof unsubscribePushSchema>;
