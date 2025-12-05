import { ImageResponse } from "next/og";
import { createClient } from "@/utils/supabase/server";
import { Challenge } from "@/types/challenge";

/**
 * OG Image Generation Route for Challenge/Play Page
 *
 * Generates a dynamic Open Graph image for challenge pages.
 *
 * @param request - The incoming request
 * @param params - Route params containing challenge id
 * @returns ImageResponse - The generated OG image
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: challenge } = (await supabase
    .from("challenges")
    .select("*")
    .eq("id", id)
    .single()) as { data: Challenge };

  const challengeImage = challenge?.image || "";
  const targetDay = challenge?.target_day || "Unknown";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          position: "relative",
          fontFamily: "system-ui, sans-serif",
          background: "#0f1419",
        }}
      >
        {/* Logo at top center */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="60"
          height="60"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#1e9df1"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          className="lucide lucide-swords-icon lucide-swords"
          style={{
            marginTop: "16px",
          }}
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
            fontSize: "40px",
            fontWeight: "700",
            color: "#ffffff",
            marginTop: "16px",
            marginBottom: "0",
            textShadow: "0 2px 8px rgba(0, 0, 0, 0.5)",
          }}
        >
          Can you make this with TailwindCSS?
        </h1>

        {/* Subtitle - Target number */}
        <p
          style={{
            fontSize: "20px",
            color: "rgba(255, 255, 255, 0.6)",
            marginTop: "8px",
            marginBottom: "24px",
          }}
        >
          Challenge {targetDay}
        </p>

        {/* Challenge image container */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "400px",
            height: "300px",
            background: "rgba(45, 45, 45, 0.95)",
            borderRadius: "16px",
            border: "2px solid rgba(80, 80, 80, 0.8)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
            overflow: "hidden",
          }}
        >
          {challengeImage && (
            <img
              src={challengeImage}
              alt="Challenge"
              width={400}
              height={300}
              style={{
                objectFit: "contain",
              }}
            />
          )}
        </div>

        {/* Play Now button */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "32px",
            padding: "12px 32px",
            background: "#1d4ed8",
            borderRadius: "50px",
            boxShadow: "0 4px 16px rgba(37, 99, 235, 0.4)",
          }}
        >
          <span
            style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "#ffffff",
            }}
          >
            Play Now!
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
