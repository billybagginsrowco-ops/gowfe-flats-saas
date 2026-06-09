export function calculatePrice(date: string, golfers: number) {
  let base = 599;

  const month = new Date(date).getMonth();

  if ([5,6,7].includes(month)) base *= 1.3; // peak season

  return base * golfers;
}
