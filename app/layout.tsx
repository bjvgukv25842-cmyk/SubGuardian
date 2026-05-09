import type { Metadata } from "next";
import "./globals.css";
import { Web3Provider } from "@/components/Web3Provider";
import { LanguageProvider } from "@/components/LanguageProvider";

export const metadata: Metadata = {
  title: "SubGuardian",
  description: "AI Subscription Firewall for Web3 Users",
  icons: {
    icon: "/icon.svg"
  },
  other: {
    google: "notranslate"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" translate="no" className="notranslate">
      <body>
        <LanguageProvider>
          <Web3Provider>{children}</Web3Provider>
        </LanguageProvider>
      </body>
    </html>
  );
}
