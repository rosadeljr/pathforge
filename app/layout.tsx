import "./globals.css";

export const metadata = {
  title: "PathForge - Your Career Operating System",
  description: "Build your skills, track progress, and level up your career",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
