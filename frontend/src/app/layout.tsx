import type { Metadata } from "next";
import { Inter, Saira_Semi_Condensed } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });
const saira = Saira_Semi_Condensed({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-saira" });

const SITE = "https://eletox.com";
const TITLE = "Eletox - Elehome Solutions PVT. LTD. | AC & Appliance Repair Service Jaipur";
const DESC = "Eletox (Elehome Solutions) provides AC repair, washing machine, microwave, geyser, water purifier, water cooler and electrician services in Jaipur. 24x7 doorstep service. Call +91 9571071342.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: TITLE,
  description: DESC,
  keywords: ["Eletox", "Elehome Solutions", "AC repair Jaipur", "AC service Jaipur", "washing machine repair Jaipur", "geyser repair Jaipur", "water purifier repair Jaipur", "electrician Jaipur"],
  alternates: { canonical: SITE + "/" },
  robots: { index: true, follow: true },
  openGraph: { type: "website", url: SITE + "/", siteName: "Eletox", title: TITLE, description: DESC, images: [{ url: "/eletox-assets/hero-1.jpg" }], locale: "en_IN" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC, images: ["/eletox-assets/hero-1.jpg"] },
  icons: { icon: "/eletox-assets/favicon.png" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Eletox - Elehome Solutions PVT. LTD.",
  alternateName: "Eletox",
  url: SITE,
  logo: SITE + "/eletox-assets/logo.png",
  image: SITE + "/eletox-assets/hero-1.jpg",
  telephone: "+919571071342",
  email: "eletox07@gmail.com",
  address: { "@type": "PostalAddress", streetAddress: "Tilak Vihar, Gokulpura, near Gs Swimming Pool, Jhotwara", addressLocality: "Jaipur", addressRegion: "Rajasthan", postalCode: "302012", addressCountry: "IN" },
  openingHours: "Mo-Su 00:00-23:59",
  areaServed: "Jaipur",
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
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className={`${inter.className} ${saira.variable}`}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
