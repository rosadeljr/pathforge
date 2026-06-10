import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create a free PathForge account and start your first quest in minutes.",
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
