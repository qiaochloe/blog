import "./global.css";
import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { Navbar } from "./components/nav";
import Footer from "./components/footer";
import { MaxWidthWrapper } from "./components/MaxWidthWrapper";
import { PostPageLayout } from "./components/PostPageLayout";
import { baseUrl } from "./sitemap";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

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
    <html lang="en" className={cx(figtree.variable, "text-black bg-white")}>
      <body className="antialiased">
        <main className="flex-auto min-w-0 flex flex-col">
          <MaxWidthWrapper>
            <PostPageLayout>
              <Navbar />
              <div className="mt-6">{children}</div>
              <Footer />
            </PostPageLayout>
          </MaxWidthWrapper>
        </main>
      </body>
    </html>
  );
}
