import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TypeSprint - Test Your Typing Speed",
  description: "Real-time multiplayer typing game. Test your WPM and compete with others!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
