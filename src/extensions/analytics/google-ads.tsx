import { ReactNode } from 'react';
import Script from 'next/script';

import { AnalyticsConfigs, AnalyticsProvider } from '.';

/**
 * Google Ads configs
 * @docs https://support.google.com/google-ads/answer/6095821
 */
export interface GoogleAdsConfigs extends AnalyticsConfigs {
  conversionId: string; // Google Ads conversion ID (AW-XXXXXXXXX)
}

/**
 * Google Ads provider for conversion tracking
 * @website https://ads.google.com
 */
export class GoogleAdsProvider implements AnalyticsProvider {
  readonly name = 'google-ads';

  configs: GoogleAdsConfigs;

  constructor(configs: GoogleAdsConfigs) {
    this.configs = configs;
  }

  getHeadScripts(): ReactNode {
    return (
      <>
        {/* Google tag (gtag.js) for Google Ads */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${this.configs.conversionId}`}
          strategy="afterInteractive"
          async
        />
        <Script
          id={this.name}
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${this.configs.conversionId}');
            `,
          }}
        />
      </>
    );
  }
}
