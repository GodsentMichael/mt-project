import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "McTaylor - Fashion Store",
  description: "Discover the latest trends in fashion at McTaylor. Premium quality clothing, accessories, and more.",
  icons: {
    icon: [
      { url: "/mctaylor-logo.png", type: "image/png", sizes: "32x32" },
      { url: "/mctaylor-logo.png", type: "image/png", sizes: "16x16" },
      { url: "/mctaylor-logo.png", type: "image/png", sizes: "48x48" },
    ],
    shortcut: "/mctaylor-logo.png",
    apple: [
      { url: "/mctaylor-logo.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${poppins.variable} antialiased font-sans`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
