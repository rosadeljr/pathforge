import { ImageResponse } from "next/og";

// Main app icon — used for browser tab + PWA. 512px for crispness everywhere.
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

// The PathForge mark rendered as an SVG data URI (Satori renders <img> reliably).
const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
  <defs>
    <linearGradient id="g" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#818cf8"/>
      <stop offset="50%" stop-color="#a855f7"/>
      <stop offset="100%" stop-color="#ec4899"/>
    </linearGradient>
  </defs>
  <path d="M20 2.5 L34.5 11 L34.5 29 L20 37.5 L5.5 29 L5.5 11 Z" fill="url(#g)"/>
  <g fill="none" stroke="white" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 23 L20 14 L28 23"/>
    <path d="M14.5 28.5 L20 23 L25.5 28.5" stroke-opacity="0.55"/>
  </g>
</svg>`;

export default function Icon() {
  const dataUri = `data:image/svg+xml,${encodeURIComponent(LOGO_SVG)}`;
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0a0f 0%, #1a1433 100%)",
          borderRadius: "22%",
        }}
      >
        {/* Logo sized to leave maskable safe-zone padding */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={dataUri} width={320} height={320} alt="PathForge" />
      </div>
    ),
    { ...size }
  );
}
