import { ImageResponse } from "next/og";

// Apple touch icon — shown when users add PathForge to their iPhone home screen.
// iOS applies its own squircle mask, so we render a full-bleed background here.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
  <defs>
    <linearGradient id="g" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#a5b4fc"/>
      <stop offset="50%" stop-color="#c084fc"/>
      <stop offset="100%" stop-color="#f472b6"/>
    </linearGradient>
  </defs>
  <path d="M20 2.5 L34.5 11 L34.5 29 L20 37.5 L5.5 29 L5.5 11 Z" fill="url(#g)"/>
  <g fill="none" stroke="white" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 23 L20 14 L28 23"/>
    <path d="M14.5 28.5 L20 23 L25.5 28.5" stroke-opacity="0.55"/>
  </g>
</svg>`;

export default function AppleIcon() {
  const dataUri = `data:image/svg+xml,${encodeURIComponent(LOGO_SVG)}`;
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(140deg, #15122e 0%, #0a0a0f 52%, #1c1033 100%)",
          overflow: "hidden",
        }}
      >
        {/* Soft colored halo so the mark glows off the dark surface */}
        <div
          style={{
            position: "absolute",
            display: "flex",
            width: "82%",
            height: "82%",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(168,85,247,0.55) 0%, rgba(129,140,248,0.22) 42%, rgba(168,85,247,0) 72%)",
          }}
        />
        {/* Diagonal top-light sheen for depth */}
        <div
          style={{
            position: "absolute",
            display: "flex",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 46%)",
          }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={dataUri} width={116} height={116} alt="PathForge" />
      </div>
    ),
    { ...size }
  );
}
