export async function sendHoldEmail(email: string, date: string) {
  return {
    to: email,
    subject: "Gowfe Flats Weekend Reserved",
    text: `Your weekend ${date} is now on HOLD. No payment required until Feb 1, 2027.`
  };
}
