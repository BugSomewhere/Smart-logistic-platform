import { api, setTokens, clearTokens } from './client';
import { AuthResponse, AuthTokens, LoginDto, RegisterDto, User, UserProfile } from './types';

export const authApi = {
  async login(dto: LoginDto): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/login', dto, { skipAuth: true });
    if (res.access_token) {
      setTokens(res.access_token, res.refresh_token);
    }
    return res;
  },

  async register(dto: RegisterDto): Promise<User> {
    return api.post<User>('/auth/register', dto, { skipAuth: true });
  },

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const res = await api.post<AuthTokens>(
      '/auth/refresh',
      {},
      {
        headers: { Authorization: `Bearer ${refreshToken}` },
        skipAuth: true,
      },
    );
    if (res.access_token) {
      setTokens(res.access_token, res.refresh_token);
    }
    return res;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      clearTokens();
    }
  },

  async getProfile(): Promise<UserProfile> {
    return api.get<UserProfile>('/user/me');
  },
};
