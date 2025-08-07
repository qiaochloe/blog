import "./global.css";
import type { Metadata } from "next";
import { Navbar } from "./components/nav";
import Footer from "./components/footer";
import { baseUrl } from "./sitemap";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Chloe Qiao",
    template: "%s | Chloe Qiao",
  },
  description: "I write about computers sometimes.",
  openGraph: {
    title: "Chloe Qiao",
    description: "I write about computers sometimes.",
    url: baseUrl,
    siteName: "Chloe Qiao",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const cx = (...classes) => classes.filter(Boolean).join(" ");

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cx("text-black bg-white")}>
      <body className="antialiased max-w-xl mt-8 mx-auto px-2 overflow-visible">
        <main className="flex-auto min-w-0 mt-6 flex flex-col px-2">
          <Navbar />
          {children}
          <Footer />
        </main>
      </body>
    </html>
  );
}
