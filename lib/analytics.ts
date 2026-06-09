export function checkAvailability(bookings: any[], date: string) {
  const match = bookings.find(b => b.date === date);

  if (!match) return "AVAILABLE";
  if (match.status === "HOLD") return "HELD";
  if (match.status === "CONFIRMED") return "BOOKED";
}
