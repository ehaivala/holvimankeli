/**
 * Parses a string in the format "DD.MM.YYYY" and returns a Date object.
 *
 * @param dateStr - Date string in the format "16.11.2025"
 * @returns Date object representing the date
 */
export function parseDateStr(dateStr: string): Date {
  const datePattern = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
  const match = dateStr.match(datePattern);
  if (!match) {
    throw new Error(
      `Invalid date string: '${dateStr}'. Expected format is DD.MM.YYYY`,
    );
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  // JavaScript months are zero-based
  return new Date(year, month - 1, day);
}
