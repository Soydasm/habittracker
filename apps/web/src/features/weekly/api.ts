import { api } from '../../api/client';
import type { WeeklySummary } from './types';

export const fetchWeeklySummary = () => api.get<WeeklySummary>('/api/v1/habits/weekly-summary/');
