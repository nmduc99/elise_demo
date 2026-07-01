export type PeriodOption =
    | "all"
    | "today"
    | "yesterday"
    | "thisWeek"
    | "lastWeek"
    | "thisMonth"
    | "lastMonth"
    | "thisQuarter"
    | "lastQuarter"
    | "thisYear"
    | "lastYear";

/**
 * Check if a date string is within the selected period
 */
export const isDateInPeriod = (dateStr: string, period: PeriodOption): boolean => {
    if (period === "all") return true;

    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return false;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (period) {
        case "today": {
            const endOfToday = new Date(startOfToday);
            endOfToday.setHours(23, 59, 59, 999);
            return date >= startOfToday && date <= endOfToday;
        }
        case "yesterday": {
            const yesterday = new Date(startOfToday);
            yesterday.setDate(yesterday.getDate() - 1);
            const endOfYesterday = new Date(yesterday);
            endOfYesterday.setHours(23, 59, 59, 999);
            return date >= yesterday && date <= endOfYesterday;
        }
        case "thisWeek": {
            const day = startOfToday.getDay();
            const diffToMonday = (day + 6) % 7;
            const weekStart = new Date(startOfToday);
            weekStart.setDate(weekStart.getDate() - diffToMonday);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 7);
            weekEnd.setHours(23, 59, 59, 999);
            return date >= weekStart && date <= weekEnd;
        }
        case "lastWeek": {
            const day = startOfToday.getDay();
            const diffToMonday = (day + 6) % 7;
            const weekStart = new Date(startOfToday);
            weekStart.setDate(weekStart.getDate() - diffToMonday - 7);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 7);
            weekEnd.setHours(23, 59, 59, 999);
            return date >= weekStart && date <= weekEnd;
        }
        case "thisMonth": {
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            monthEnd.setHours(23, 59, 59, 999);
            return date >= monthStart && date <= monthEnd;
        }
        case "lastMonth": {
            const monthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
            monthEnd.setHours(23, 59, 59, 999);
            return date >= monthStart && date <= monthEnd;
        }
        case "thisQuarter": {
            const quarter = Math.floor(now.getMonth() / 3);
            const quarterStart = new Date(now.getFullYear(), quarter * 3, 1);
            const quarterEnd = new Date(now.getFullYear(), quarter * 3 + 3, 1);
            quarterEnd.setHours(23, 59, 59, 999);
            return date >= quarterStart && date <= quarterEnd;
        }
        case "lastQuarter": {
            const quarter = Math.floor(now.getMonth() / 3);
            const quarterStart = new Date(now.getFullYear(), (quarter - 1) * 3, 1);
            const quarterEnd = new Date(now.getFullYear(), quarter * 3, 1);
            quarterEnd.setHours(23, 59, 59, 999);
            return date >= quarterStart && date <= quarterEnd;
        }
        case "thisYear": {
            const yearStart = new Date(now.getFullYear(), 0, 1);
            const yearEnd = new Date(now.getFullYear() + 1, 0, 1);
            yearEnd.setHours(23, 59, 59, 999);
            return date >= yearStart && date <= yearEnd;
        }
        case "lastYear": {
            const yearStart = new Date(now.getFullYear() - 1, 0, 1);
            const yearEnd = new Date(now.getFullYear(), 0, 1);
            yearEnd.setHours(23, 59, 59, 999);
            return date >= yearStart && date <= yearEnd;
        }
        default:
            return false;
    }
};

/**
 * Get the end date of the selected period
 */
export const getPeriodEndDate = (period: PeriodOption): Date => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let periodEndDate = new Date(now);

    switch (period) {
        case "today":
            periodEndDate = new Date(startOfToday);
            periodEndDate.setHours(23, 59, 59, 999);
            break;
        case "yesterday": {
            const yesterday = new Date(startOfToday);
            yesterday.setDate(yesterday.getDate() - 1);
            periodEndDate = new Date(yesterday);
            periodEndDate.setHours(23, 59, 59, 999);
            break;
        }
        case "thisWeek": {
            const day = startOfToday.getDay();
            const diffToMonday = (day + 6) % 7;
            const weekStart = new Date(startOfToday);
            weekStart.setDate(weekStart.getDate() - diffToMonday);
            periodEndDate = new Date(weekStart);
            periodEndDate.setDate(periodEndDate.getDate() + 7);
            periodEndDate.setHours(23, 59, 59, 999);
            break;
        }
        case "lastWeek": {
            const day = startOfToday.getDay();
            const diffToMonday = (day + 6) % 7;
            const weekStart = new Date(startOfToday);
            weekStart.setDate(weekStart.getDate() - diffToMonday - 7);
            periodEndDate = new Date(weekStart);
            periodEndDate.setDate(periodEndDate.getDate() + 7);
            periodEndDate.setHours(23, 59, 59, 999);
            break;
        }
        case "thisMonth":
            periodEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            periodEndDate.setHours(23, 59, 59, 999);
            break;
        case "lastMonth":
            periodEndDate = new Date(now.getFullYear(), now.getMonth(), 1);
            periodEndDate.setHours(23, 59, 59, 999);
            break;
        case "thisQuarter": {
            const quarter = Math.floor(now.getMonth() / 3);
            periodEndDate = new Date(now.getFullYear(), quarter * 3 + 3, 1);
            periodEndDate.setHours(23, 59, 59, 999);
            break;
        }
        case "lastQuarter": {
            const quarter = Math.floor(now.getMonth() / 3);
            periodEndDate = new Date(now.getFullYear(), quarter * 3, 1);
            periodEndDate.setHours(23, 59, 59, 999);
            break;
        }
        case "thisYear":
            periodEndDate = new Date(now.getFullYear() + 1, 0, 1);
            periodEndDate.setHours(23, 59, 59, 999);
            break;
        case "lastYear":
            periodEndDate = new Date(now.getFullYear(), 0, 1);
            periodEndDate.setHours(23, 59, 59, 999);
            break;
        default:
            periodEndDate = now;
    }

    return periodEndDate;
};

