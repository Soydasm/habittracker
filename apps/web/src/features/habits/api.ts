import { api } from '../../api/client';
import type { Habit, Page } from './types';

/** A user has far fewer habits than the page cap, so the list is read in one request. */
export const fetchHabits = () => api.get<Page<Habit>>('/api/v1/habits/?page_size=100');
export const fetchHabit = (id: string) => api.get<Habit>(`/api/v1/habits/${id}/`);
export const createHabit = (name: string) => api.post<Habit>('/api/v1/habits/', { name });
export const renameHabit = (id: string, name: string) => api.patch<Habit>(`/api/v1/habits/${id}/`, { name });
export const deleteHabit = (id: string) => api.delete<Record<string, never>>(`/api/v1/habits/${id}/`);
