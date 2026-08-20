import "./global.css";
import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { Navbar } from "./components/nav";
import Footer from "./components/footer";
import { MaxWidthWrapper } from "./components/MaxWidthWrapper";
import { PostPageLayout } from "./components/PostPageLayout";
import { baseUrl } from "./sitemap";
import { Analytics } from "@vercel/analytics/next"

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  icons: {
    icon: [
      { url: "/favicon/favicon.ico", sizes: "any" },
      { url: "/favicon/favicon-96x96.png", type: "image/png", sizes: "96x96" },
      { url: "/favicon/icon0.svg", type: "image/svg+xml" },
      { url: "/favicon/icon1.png", type: "image/png" },
    ],
    shortcut: [{ url: "/favicon/favicon.ico" }],
    apple: [{ url: "/favicon/apple-icon.png" }],
  },
  manifest: "/favicon/manifest.json",
  appleWebApp: {
    title: "Chloe Qiao",
  },
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${figtree.variable} text-black bg-white`}>
      <body className="antialiased">
        <Analytics />
        <main className="flex-auto min-w-0 flex flex-col">
          <MaxWidthWrapper>
            <PostPageLayout>
              <Navbar />
              <div className="mt-6 sm:min-w-xl">{children}</div>
              <Footer />
            </PostPageLayout>
          </MaxWidthWrapper>
        </main>
      </body>
    </html>
  );
}
