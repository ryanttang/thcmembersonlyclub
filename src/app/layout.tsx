import "@/styles/globals.css";
import { Inter } from "next/font/google";
import Providers from "@/app/providers";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "Live Events - Discover Amazing Shows",
  description: "Find and book tickets for the best live events, concerts, and performances in your area.",
  keywords: "live events, concerts, shows, tickets, entertainment, performances",
  authors: [{ name: "Events Team" }],
  openGraph: {
    title: "Live Events - Discover Amazing Shows",
    description: "Find and book tickets for the best live events, concerts, and performances in your area.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Live Events - Discover Amazing Shows",
    description: "Find and book tickets for the best live events, concerts, and performances in your area.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
