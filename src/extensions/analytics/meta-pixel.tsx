import { ReactNode } from 'react';
import Script from 'next/script';

import { AnalyticsConfigs, AnalyticsProvider } from '.';

/**
 * Meta Pixel configs
 * @docs https://developers.facebook.com/docs/meta-pixel
 */
export interface MetaPixelConfigs extends AnalyticsConfigs {
  pixelId: string;
}

/**
 * Meta Pixel provider
 * @website https://www.facebook.com/business/tools/meta-pixel
 */
export class MetaPixelAnalyticsProvider implements AnalyticsProvider {
  readonly name = 'meta-pixel';

  configs: MetaPixelConfigs;

  constructor(configs: MetaPixelConfigs) {
    this.configs = configs;
  }

  getHeadScripts(): ReactNode {
    return (
      <>
        <Script
          id={this.name}
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${this.configs.pixelId}');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${this.configs.pixelId}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
      </>
    );
  }
}
