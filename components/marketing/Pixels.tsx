"use client";

/**
 * Marketing Pixels — conditional ad-tracking integrations.
 *
 * Each pixel only loads if its env var is set, so dev environments
 * stay clean. Configure in Vercel → Environment Variables:
 *
 *   NEXT_PUBLIC_META_PIXEL_ID         — Facebook/Meta Pixel ID
 *   NEXT_PUBLIC_TIKTOK_PIXEL_ID       — TikTok Pixel ID
 *   NEXT_PUBLIC_GOOGLE_ADS_ID         — Google Ads conversion ID (AW-...)
 *   NEXT_PUBLIC_GA_MEASUREMENT_ID     — Google Analytics 4 ID (G-...)
 *
 * Loaded once globally from app/layout.tsx. Per-event tracking
 * helpers live in lib/marketing/track.ts.
 */

import Script from "next/script";

export function Pixels() {
  const meta = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const tiktok = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;
  const googleAds = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  const ga = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <>
      {/* ─── Meta Pixel ─── */}
      {meta && (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${meta}');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              alt=""
              src={`https://www.facebook.com/tr?id=${meta}&ev=PageView&noscript=1`}
            />
          </noscript>
        </>
      )}

      {/* ─── TikTok Pixel ─── */}
      {tiktok && (
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
              ttq.load('${tiktok}');
              ttq.page();
            }(window, document, 'ttq');
          `}
        </Script>
      )}

      {/* ─── Google Ads / Analytics 4 (gtag) ─── */}
      {(googleAds || ga) && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga || googleAds}`}
            strategy="afterInteractive"
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              ${ga ? `gtag('config', '${ga}');` : ""}
              ${googleAds ? `gtag('config', '${googleAds}');` : ""}
            `}
          </Script>
        </>
      )}
    </>
  );
}
