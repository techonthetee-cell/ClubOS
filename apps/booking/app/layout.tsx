import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ClubOS — Book a Tee Time",
  description: "Book tee times online at your club",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "Inter, sans-serif", background: "#fff", color: "#1e293b" }}>
        {children}
      </body>
    </html>
  );
}
