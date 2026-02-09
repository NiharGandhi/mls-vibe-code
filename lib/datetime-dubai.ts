/**
 * Challenge dates are stored in the DB as UTC (with timezone).
 * All display and form input for challenge dates use Dubai timezone (Asia/Dubai, UTC+4).
 */

export const DUBAI_TIMEZONE = "Asia/Dubai";

/**
 * Format a UTC date for display (date only) in Dubai.
 */
export function formatDateInDubai(isoOrDate: string | Date | null): string {
  if (isoOrDate == null) return "TBD";
  const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  if (Number.isNaN(d.getTime())) return "TBD";
  return d.toLocaleDateString("en-US", {
    timeZone: DUBAI_TIMEZONE,
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format a UTC date for display (date and time) in Dubai.
 */
export function formatDateTimeInDubai(isoOrDate: string | Date | null): string {
  if (isoOrDate == null) return "—";
  const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    timeZone: DUBAI_TIMEZONE,
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/**
 * Convert a datetime-local value (YYYY-MM-DDTHH:mm) from the form
 * from Dubai time to a Date (UTC) for storage.
 */
export function dubaiInputToUTC(dateTimeLocalValue: string | null): Date | null {
  if (!dateTimeLocalValue || !dateTimeLocalValue.trim()) return null;
  const s = dateTimeLocalValue.trim();
  // Interpret as Dubai: append +04:00 (Gulf Standard Time)
  const withOffset = s.includes("T") ? `${s}:00+04:00` : `${s}T00:00:00+04:00`;
  const d = new Date(withOffset);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Convert a UTC Date to a datetime-local input value (YYYY-MM-DDTHH:mm) in Dubai.
 * Used for defaultValue in create/edit challenge forms.
 */
export function utcToDubaiInputValue(date: Date | string | null): string {
  if (date == null) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: DUBAI_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(d);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  const year = get("year");
  const month = get("month");
  const day = get("day");
  const hour = get("hour");
  const minute = get("minute");
  if (!year || !month || !day) return "";
  return `${year}-${month}-${day}T${hour}:${minute}`;
}
