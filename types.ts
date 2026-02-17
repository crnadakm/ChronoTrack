
export type DisplayFormat = 'full' | 'days' | 'hm' | 'total-hours';

export interface TimeCounter {
  id: string;
  name: string;
  startDate: string; // ISO string
  createdAt: string; // ISO string
  color: string;
  backgroundImage?: string; // Optional URL for custom background
  displayFormat: DisplayFormat;
  isWidget: boolean;
}

export interface TimeElapsed {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
}
