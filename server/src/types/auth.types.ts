export interface GoogleLoginRequest {
  idToken: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    full_name: string;
    avatar_url: string | null;
    role: string;
  };
  token: string;
}


