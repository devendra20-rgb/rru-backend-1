export interface LoginInput {
  username?: string;
  email?: string;
  password: string;
}

export interface RefreshInput {
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}
