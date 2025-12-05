import { ImageResponse } from "next/og";

/**
 * OG Image Generation Route for Home Page
 *
 * @param request - The incoming request
 * @returns ImageResponse - The generated OG image
 */
export async function GET() {
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="100"
          height="100"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#1e9df1"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          className="lucide lucide-swords-icon lucide-swords"
        >
          <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
          <line x1="13" x2="19" y1="19" y2="13" />
          <line x1="16" x2="20" y1="16" y2="20" />
          <line x1="19" x2="21" y1="21" y2="19" />
          <polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5" />
          <line x1="5" x2="9" y1="14" y2="18" />
          <line x1="7" x2="4" y1="17" y2="20" />
          <line x1="3" x2="5" y1="19" y2="21" />
        </svg>

        {/* Title */}
        <h1
          style={{
            fontSize: "80px",
            fontWeight: "800",
            color: "#ffffff",
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
