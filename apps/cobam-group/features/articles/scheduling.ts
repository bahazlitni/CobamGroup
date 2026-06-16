export const ARTICLE_SCHEDULE_INTERVAL_MINUTES = 5;
export const ARTICLE_SCHEDULE_INTERVAL_SECONDS =
  ARTICLE_SCHEDULE_INTERVAL_MINUTES * 60;
export const ARTICLE_SCHEDULE_INTERVAL_MS =
  ARTICLE_SCHEDULE_INTERVAL_SECONDS * 1000;

function isValidDate(value: Date) {
  return !Number.isNaN(value.getTime());
}

export function isScheduledPublishAtAligned(value: Date) {
  return (
    isValidDate(value) &&
    value.getMinutes() % ARTICLE_SCHEDULE_INTERVAL_MINUTES === 0 &&
    value.getSeconds() === 0 &&
    value.getMilliseconds() === 0
  );
}

export function isCronExecutionMinuteAligned(value: Date) {
  return (
    isValidDate(value) &&
    value.getMinutes() % ARTICLE_SCHEDULE_INTERVAL_MINUTES === 0
  );
}

export function getNextFiveMinuteDate(now = new Date()) {
  const next = new Date(now);
  const intervalMs = ARTICLE_SCHEDULE_INTERVAL_MS;
  const nextTime = Math.ceil(next.getTime() / intervalMs) * intervalMs;
  const isAlreadyAligned =
    next.getTime() === nextTime &&
    next.getSeconds() === 0 &&
    next.getMilliseconds() === 0;

  next.setTime(nextTime + (isAlreadyAligned ? intervalMs : 0));
  next.setSeconds(0, 0);

  return next;
}

function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}

export function toDatetimeLocalInputValue(value: Date | string | null | undefined) {
  if (!value) {
    return "";
  }

  const date = typeof value === "string" ? new Date(value) : value;

  if (!isValidDate(date)) {
    return "";
  }

  return [
    date.getFullYear(),
    "-",
    padDatePart(date.getMonth() + 1),
    "-",
    padDatePart(date.getDate()),
    "T",
    padDatePart(date.getHours()),
    ":",
    padDatePart(date.getMinutes()),
  ].join("");
}

export function getNextFiveMinuteLocalInputValue(now = new Date()) {
  return toDatetimeLocalInputValue(getNextFiveMinuteDate(now));
}

export function datetimeLocalValueToIso(value: string) {
  if (!value.trim()) {
    return null;
  }

  const date = new Date(value);

  return isValidDate(date) ? date.toISOString() : null;
}

export function isDatetimeLocalValueFiveMinuteAligned(value: string) {
  if (!value.trim()) {
    return false;
  }

  const date = new Date(value);

  return isScheduledPublishAtAligned(date);
}
