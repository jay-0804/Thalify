import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter.js';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

export const TIMEZONE = 'Asia/Kolkata';

/**
 * Get current dayjs object in Asia/Kolkata timezone
 */
export const nowIST = () => dayjs().tz(TIMEZONE);

/**
 * Get today's date formatted as YYYY-MM-DD in IST
 */
export const getTodayIST = () => nowIST().format('YYYY-MM-DD');

/**
 * Get tomorrow's date formatted as YYYY-MM-DD in IST
 */
export const getTomorrowIST = () => nowIST().add(1, 'day').format('YYYY-MM-DD');

/**
 * Format any date or dayjs object to YYYY-MM-DD in IST
 */
export const formatDateIST = (date) => dayjs(date).tz(TIMEZONE).format('YYYY-MM-DD');

/**
 * Parse YYYY-MM-DD string into dayjs in IST
 */
export const parseDateIST = (dateStr) => dayjs.tz(dateStr, 'YYYY-MM-DD', TIMEZONE);

/**
 * Add days to a YYYY-MM-DD string in IST and return YYYY-MM-DD
 */
export const addDaysIST = (dateStr, days) => parseDateIST(dateStr).add(days, 'day').format('YYYY-MM-DD');

/**
 * Get day of week (0 = Sunday ... 6 = Saturday) for YYYY-MM-DD in IST
 */
export const getDayOfWeekIST = (dateStr) => parseDateIST(dateStr).day();

/**
 * Calculate skip deadline for a meal: (meal.date minus 1 day) at provider.cutoffTime (e.g. '20:00') in IST.
 * Returns dayjs instance in IST.
 */
export const getSkipDeadline = (mealDateStr, cutoffTime = '20:00') => {
  const [hours, minutes] = cutoffTime.split(':').map(Number);
  const previousDay = parseDateIST(mealDateStr).subtract(1, 'day');
  return previousDay.hour(hours).minute(minutes).second(0).millisecond(0);
};

/**
 * Check if the current time in IST is before the cutoff deadline
 */
export const isBeforeDeadline = (mealDateStr, cutoffTime) => {
  const deadline = getSkipDeadline(mealDateStr, cutoffTime);
  return nowIST().isBefore(deadline);
};

/**
 * Check if date falls within inclusive [from, to] range
 */
export const isDateInRange = (targetDate, fromDate, toDate) => {
  const target = parseDateIST(targetDate);
  const from = parseDateIST(fromDate);
  const to = parseDateIST(toDate);
  return target.isSameOrAfter(from, 'day') && target.isSameOrBefore(to, 'day');
};

/**
 * Get month string (YYYY-MM) from date
 */
export const getMonthString = (dateStr) => parseDateIST(dateStr).format('YYYY-MM');

export default dayjs;
