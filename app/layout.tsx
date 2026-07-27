import type {Metadata} from "next";
import type {ReactNode} from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "PromptVault PH - AI Prompt Library for Students, Teachers & Business",
  description:
    "Ready-to-copy AI prompts for school, business, freelancing, and content creation. Made for Filipinos.",
  openGraph: {
    title: "PromptVault PH - Premium AI Prompt Library",
    description: "Stop guessing. Start prompting smarter. Crafted for Filipino creators, students, and professionals.",
    type: "website",
  },
};

export default function RootLayout({children}: Readonly<{children: ReactNode}>) {
  return (
    <html data-scroll-behavior="smooth" lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
