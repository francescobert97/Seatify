export const formatEventDate = (date: string): string =>
  new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "2-digit",
    year: "numeric",
  });