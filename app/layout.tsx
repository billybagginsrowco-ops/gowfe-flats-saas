import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata = {
  title: 'Gowfe Flats - Stay Here. Play There.',
  description: 'Hold your 2027 golf weekend today. No payment required.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
