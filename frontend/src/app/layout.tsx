import type { Metadata } from "next";
import { Inter, Saira_Semi_Condensed } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });
const saira = Saira_Semi_Condensed({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-saira" });

export const metadata: Metadata = {
  title: "Eletox - Elehome Solutions PVT. LTD. | AC & Appliance Repair Service Jaipur",
  description: "Elehome provide quality repair service: AC repair, washing machine, microwave, geyser, water purifier and electrician services in Jaipur. 24x7 services.",
  icons: { icon: "/eletox-assets/favicon.png" },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${saira.variable}`}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
