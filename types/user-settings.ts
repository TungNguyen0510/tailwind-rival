export type UserSettings = {
  user_id: string;
  is_admin: boolean | null;
  avatar_url: string | null;
  display_name: string | null;
  website: string | null;
  twitter: string | null;
  github: string | null;
  codepen: string | null;
  linkedin: string | null;
  instagram: string | null;
  youtube: string | null;
  twitch: string | null;
  facebook: string | null;
};

export type UserDisplayInfo = {
  userId: string;
  avatarUrl: string | null;
  displayName: string;
};
