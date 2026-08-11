import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getViewer } from "@/lib/access";
import "./globals.css";

// Body/UI face — matches design.md's Inter token
const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

// Display/headline face — substitute for the custom "Family" typeface
// (design.md suggests Druk Wide Medium / GT America Compressed Medium;
// Space Grotesk is the closest freely-licensed stand-in)
const headingFont = Space_Grotesk({
  variable: "--font-heading",
  weight: ["500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Catwine Club",
  description: "A club for people who love wine, cats, and each other's company.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const viewer = await getViewer();

  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${headingFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Nav viewer={viewer} />
        <main className="flex flex-1 flex-col">{children}</main>
        <Footer viewer={viewer} />
      </body>
    </html>
  );
}
