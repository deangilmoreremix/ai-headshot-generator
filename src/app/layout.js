import { Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Providers } from "@/components/Providers";

const font = Outfit({ subsets: ["latin"] });

export const metadata = {
  title: "AI Headshot Studio",
  description: "Generate professional AI headshots and videos.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-dvh w-full transition-colors duration-500" style={{ colorScheme: 'light' }}>
      <body className={`${font.className} h-dvh w-full flex flex-col antialiased transition-colors duration-500`}>
        <Providers>
          <Navbar />
          <div className="flex-1 flex flex-col overflow-hidden">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
