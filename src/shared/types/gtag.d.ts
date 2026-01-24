/**
 * Google Analytics/Ads gtag.js type declarations
 */
interface Window {
  gtag?: (
    command: 'config' | 'event' | 'js' | 'set',
    targetIdOrEventName: string | Date,
    params?: Record<string, unknown>
  ) => void;
  dataLayer?: unknown[];
}
