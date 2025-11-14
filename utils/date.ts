export const getTimeInTimezone = (timeZone: string) => {
  const now = new Date();

  // get formatter for the target zone
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const parts = formatter.formatToParts(now);

  const get = (type: string) => parts.find((p) => p.type === type)?.value;

  // build a correct "local time in target timezone"
  const year = Number(get("year"));
  const month = Number(get("month"));
  const day = Number(get("day"));
  const hour = Number(get("hour"));
  const minute = Number(get("minute"));
  const second = Number(get("second"));

  // This is an ACTUAL Date object for *that timezone*
  const date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));

  return date;
};