import { ImageResponse } from "next/og";
import { defaultUrl } from "@/constants/url";

/**
 * OG Image Generation Route for Home Page
 *
 * @param request - The incoming request
 * @returns ImageResponse - The generated OG image
 */
export async function GET() {
  const logoImageUrl = `${defaultUrl}/icons/logo.png`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          fontFamily: "system-ui, sans-serif",
          background: "#0f1419",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={logoImageUrl}
            alt="Tailwind Rival"
            width={100}
            height={100}
          />
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: "80px",
            fontWeight: "800",
            color: "#1e9df1",
            marginTop: "16px",
            marginBottom: "0",
            fontStyle: "italic",
            textShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
          }}
        >
          Tailwind Rival
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "32px",
            color: "rgba(255, 255, 255, 0.85)",
            marginTop: "16px",
            marginBottom: "8px",
            textAlign: "center",
            lineHeight: "1.4",
          }}
        >
          The funnest TailwindCSS game for web developers!
        </p>

        {/* Play now button */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px 64px",
            marginTop: "48px",
            background: "#3b82f6",
            borderRadius: "50px",
            boxShadow: "0 4px 20px rgba(59, 130, 246, 0.5)",
          }}
        >
          <span
            style={{
              fontSize: "32px",
              fontWeight: "600",
              color: "#ffffff",
            }}
          >
            Play now
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
