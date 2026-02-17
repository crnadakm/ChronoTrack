
import { TimeElapsed, DisplayFormat } from '../types';

export const calculateTimeElapsed = (startDateStr: string): TimeElapsed => {
  const start = new Date(startDateStr);
  const now = new Date();
  
  if (now < start) {
    return {
        years: 0, months: 0, days: 0, 
        hours: 0, minutes: 0, seconds: 0, 
        totalDays: 0, totalHours: 0, totalMinutes: 0
    };
  }

  const diffMs = now.getTime() - start.getTime();
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // 1. Calculate Years
  let years = now.getFullYear() - start.getFullYear();
  
  // 2. Determine last Anniversary date
  // Create a date for this year's anniversary
  let anniversary = new Date(start);
  anniversary.setFullYear(start.getFullYear() + years);
  
  // If anniversary hasn't happened yet this year, subtract a year
  if (anniversary > now) {
    years--;
    anniversary = new Date(start);
    anniversary.setFullYear(start.getFullYear() + years);
  }

  // 3. Calculate remaining days since the last anniversary
  const msSinceAnniversary = now.getTime() - anniversary.getTime();
  const daysSinceAnniversary = Math.floor(msSinceAnniversary / (1000 * 60 * 60 * 24));

  // 4. Calculate Months (for the 'mo' display)
  let months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  let lastMonthlyAnniversary = new Date(start);
  lastMonthlyAnniversary.setMonth(start.getMonth() + months);
  
  if (lastMonthlyAnniversary > now) {
    months--;
    lastMonthlyAnniversary = new Date(start);
    lastMonthlyAnniversary.setMonth(start.getMonth() + months);
  }
  const daysSinceMonthlyAnniversary = Math.floor((now.getTime() - lastMonthlyAnniversary.getTime()) / (1000 * 60 * 60 * 24));

  return {
    years,
    months,
    days: daysSinceMonthlyAnniversary, // Exact days since last month
    hours: Math.floor((diffMs / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diffMs / (1000 * 60)) % 60),
    seconds: Math.floor((diffMs / 1000) % 60),
    totalDays,
    totalHours: Math.floor(diffMs / (1000 * 60 * 60)),
    totalMinutes: Math.floor(diffMs / (1000 * 60)),
    // We'll use a special property for the format logic to stay clean
    daysSinceYearlyAnniversary: daysSinceAnniversary
  } as any; // Cast as any to avoid type errors with the extra property
};

export const formatTimeDisplay = (elapsed: any, format: DisplayFormat = 'full'): string => {
  switch (format) {
    case 'days':
      return `${elapsed.totalDays}d`;
    case 'hm':
      return `${elapsed.totalHours}h ${elapsed.minutes}m`;
    case 'total-hours':
      return `${elapsed.totalHours}h`;
    case 'full':
    default:
      // Case 1: More than a year -> Exact Y and Exact D
      if (elapsed.years > 0) {
        return `${elapsed.years}Y ${elapsed.daysSinceYearlyAnniversary}d`;
      }
      
      // Case 2: More than a month -> Exact mo and Exact d
      if (elapsed.months > 0) {
        return `${elapsed.months}mo ${elapsed.days}d`;
      }
      
      // Case 3: Less than a month -> Xd HH:MM:SS
      const timeString = `${elapsed.hours.toString().padStart(2, '0')}:${elapsed.minutes.toString().padStart(2, '0')}:${elapsed.seconds.toString().padStart(2, '0')}`;
      return `${elapsed.totalDays}d ${timeString}`;
  }
};

export const getRelativeColor = (color: string) => {
    const colors: Record<string, string> = {
        blue: 'bg-blue-500',
        green: 'bg-emerald-500',
        red: 'bg-rose-500',
        purple: 'bg-violet-500',
        orange: 'bg-orange-500',
        pink: 'bg-pink-500',
    };
    return colors[color] || 'bg-slate-500';
}
