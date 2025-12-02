export interface Submission {
  id: string;
  user_id: string;
  challenge_id: string;
  accuracy: number;
  score: number;
  code: string;
  created_at: string;
}

export interface SubmissionWithUser extends Submission {
  user_avatar_url?: string;
  user_full_name?: string;
}
