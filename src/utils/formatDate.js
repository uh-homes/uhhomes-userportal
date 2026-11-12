// Formats a calendar date ("YYYY-MM-DD", ISO string, or Date) as a local
// date without applying a timezone shift — avoids the UTC-midnight
// off-by-one that makes Nov 12 render as Nov 11 west of UTC.
export const formatDate = (value, options) => {
  if (!value) return "";
  const [y, m, d] =
    value instanceof Date
      ? [value.getFullYear(), value.getMonth() + 1, value.getDate()]
      : String(value).slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return "";
  return new Date(y, m - 1, d).toLocaleDateString("en-US", options);
};
