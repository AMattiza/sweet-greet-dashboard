export const metadata = { title: "Sweet Greet – KPI Grid" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body style={{margin:0}}>{children}</body>
    </html>
  );
}
