import type { Metadata } from "next";
import { Plus_Jakarta_Sans, IBM_Plex_Serif, Allura } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-family-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const ibmPlexSerif = IBM_Plex_Serif({
  variable: "--font-family-serif",
  subsets: ["latin"],
  weight: ["600"],
});

const allura = Allura({
  variable: "--font-family-allura",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Ser Galgos",
  description: "Formulario de adopción de Ser Galgos",
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${plusJakartaSans.variable} ${ibmPlexSerif.variable} ${allura.variable} antialiased`}
      >
          {children}
      </body>
    </html>
  );
}
