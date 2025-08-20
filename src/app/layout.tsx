import "antd/dist/reset.css";
import "@/styles/globals.css";
import Providers from "@/app/providers";

export const metadata = {
  title: "Events",
  description: "Promote shows and sell tickets.",
  metadataBase: new URL("https://your-domain.com"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
