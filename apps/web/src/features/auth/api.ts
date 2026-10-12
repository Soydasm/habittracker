import { api } from '../../api/client';
import type { Credentials, Session, User } from './types';

export const register = (credentials: Credentials) => api.post<Session>('/api/v1/auth/register/', credentials);
export const login = (credentials: Credentials) => api.post<Session>('/api/v1/auth/login/', credentials);
export const fetchMe = () => api.get<User>('/api/v1/auth/me/');
