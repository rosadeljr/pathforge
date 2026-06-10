import type { Metadata } from "next";

export const dynamic = "force-dynamic";

// Auth pages shouldn't be indexed by search engines.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
