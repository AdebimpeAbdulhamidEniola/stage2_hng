import axios from "axios";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID as string;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET as string;
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI as string;


export interface GitHubUser {
  id: number;
  login: string;
  email: string | null;
  avatar_url: string;
  name: string | null;
}

interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  error?: string;
}


interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
}

export const buildAuthorizationUrl = (state: string, codeChallenge: string) => {
    const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: GITHUB_REDIRECT_URI,
    scope: "read:user user:email",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;

}


// Step 2: Exchange authorization code for access token


export const exchangeCodeForToken = async (
  code: string,
  codeVerifier: string,
  redirectUri?: string                              // ← ADD THIS
): Promise<GitHubTokenResponse | null> => {
  try {
    const { data } = await axios.post<GitHubTokenResponse>(
      "https://github.com/login/oauth/access_token",
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri ?? GITHUB_REDIRECT_URI, // ← USE PARAM, fall back to env
        code_verifier: codeVerifier,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    if (data.error) return { error: data.error_description || data.error } as any;
    return data;
  } catch (error: any) {
    console.error("Token exchange failed:", error.response?.data || error.message);
    return { error: error.response?.data?.error_description || error.response?.data?.error || error.message } as any;
  }
};


export const fetchGitHubUser = async (accessToken: string): Promise<GitHubUser | null> => {
  try {
    const { data } = await axios.get<GitHubUser>("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    return data;
  } catch (error) {
    console.error("Failed to fetch GitHub user:", error);
    return null;
  }
};



// Step 4: Fetch user's primary email
export const fetchGitHubEmail = async (accessToken: string): Promise<string | null> => {
  try {
    const { data: emails } = await axios.get<GitHubEmail[]>(
      "https://api.github.com/user/emails",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    const primary = emails.find((e) => e.primary && e.verified);
    return primary?.email || emails[0]?.email || null;
  } catch (error) {
    console.error("Failed to fetch GitHub email:", error);
    return null;
  }
};