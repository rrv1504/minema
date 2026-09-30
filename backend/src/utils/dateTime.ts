const timePattern = /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i;

export function parseTimeToMinutes(value: string): number | null {
  const match = value.trim().match(timePattern);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3]?.toUpperCase();
  if (minutes > 59 || hours > 24 || hours < 0) return null;
  if (meridiem) {
    if (hours < 1 || hours > 12) return null;
    if (hours === 12) hours = 0;
    if (meridiem === "PM") hours += 12;
  }
  return hours * 60 + minutes;
}

export function isDateWithinBookingWindow(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const requested = new Date(date + "T00:00:00");
  if (Number.isNaN(requested.valueOf())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastAllowed = new Date(today);
  lastAllowed.setDate(today.getDate() + 7);
  return requested >= today && requested <= lastAllowed;
}

export function formatDate(date: Date): string {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

export function generateTwoHourSlots(startTime: string, endTime: string): string[] {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  if (start === null || end === null || end <= start) return [];
  const slots: string[] = [];
  for (let minute = start; minute < end; minute += 120) {
    const hours24 = Math.floor(minute / 60) % 24;
    const suffix = hours24 >= 12 ? "PM" : "AM";
    const hours12 = hours24 % 12 || 12;
    slots.push(String(hours12).padStart(2, "0") + ":" + String(minute % 60).padStart(2, "0") + " " + suffix);
  }
  return slots;
}
