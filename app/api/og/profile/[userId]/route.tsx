import { ImageResponse } from "next/og";
import { getUserDisplayInfo } from "@/app/actions/user";
import { getUserProfileStats } from "@/app/actions/stats";

/**
 * OG Image Generation Route for User Profile
 *
 * Generates a dynamic Open Graph image for user profile pages.
 *
 * @param request - The incoming request
 * @param params - Route params containing userId
 * @returns ImageResponse - The generated OG image
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  // Fetch user info and stats in parallel
  const [userInfo, statsResult] = await Promise.all([
    getUserDisplayInfo(userId),
    getUserProfileStats(userId),
  ]);

  const stats = statsResult.stats;
  const displayName = userInfo.displayName || "User";
  const avatarUrl = userInfo.avatarUrl;

  // Format stats for display
  const globalRank = stats?.globalRank ?? "-";
  const targetsPlayed = stats?.completedChallenges ?? 0;
  const currentStreak = stats?.currentStreak ?? 0;
  const streakText =
    currentStreak > 1 ? `${currentStreak} days` : `${currentStreak} day`;

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
        {/* Logo in top-left corner */}
        <div
          style={{
            position: "absolute",
            top: "32px",
            left: "40px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
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
        </div>

        {/* Main content container */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "60px",
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: "160px",
              height: "160px",
              borderRadius: "50%",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #1e3a5f 0%, #0a1628 100%)",
            }}
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={displayName}
                width={160}
                height={160}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <span
                style={{
                  fontSize: "64px",
                  fontWeight: "bold",
                  color: "#ffffff",
                }}
              >
                {displayName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Display Name */}
          <h1
            style={{
              fontSize: "52px",
              fontWeight: "700",
              color: "#ffffff",
              marginTop: "24px",
              marginBottom: "8px",
              textShadow: "0 2px 8px rgba(0, 0, 0, 0.5)",
            }}
          >
            {displayName}
          </h1>
        </div>

        {/* Stats container */}
        <div
          style={{
            display: "flex",
            gap: "24px",
            marginTop: "auto",
            marginBottom: "60px",
            width: "90%",
            maxWidth: "1000px",
          }}
        >
          {/* Global Rank */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px 16px",
              background: "rgba(0, 0, 0, 0.3)",
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <span
              style={{
                fontSize: "48px",
                fontWeight: "bold",
                color: "#ca8a04",
              }}
            >
              {globalRank}
            </span>
            <span
              style={{
                fontSize: "32px",
                color: "rgba(255, 255, 255, 0.7)",
                marginTop: "8px",
              }}
            >
              Global rank
            </span>
          </div>

          {/* Challenges Played */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px 16px",
              background: "rgba(0, 0, 0, 0.3)",
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <span
              style={{
                fontSize: "48px",
                fontWeight: "bold",
                color: "#ca8a04",
              }}
            >
              {targetsPlayed}
            </span>
            <span
              style={{
                fontSize: "32px",
                color: "rgba(255, 255, 255, 0.7)",
                marginTop: "8px",
              }}
            >
              Challenges played
            </span>
          </div>

          {/* Current Streak */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px 16px",
              background: "rgba(0, 0, 0, 0.3)",
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <span
              style={{
                fontSize: "48px",
                fontWeight: "bold",
                color: "#ca8a04",
              }}
            >
              {streakText}
            </span>
            <span
              style={{
                fontSize: "32px",
                color: "rgba(255, 255, 255, 0.7)",
                marginTop: "8px",
              }}
            >
              Current streak
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
