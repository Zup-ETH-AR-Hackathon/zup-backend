export function isAfterOrEqualsMidday() {
  const now = new Date().getUTCHours();
  return now >= 12;
}
