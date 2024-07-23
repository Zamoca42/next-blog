import { CMS_NAME, HOME_OG_IMAGE_URL } from "@/lib/constant";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/style/globals.css";
import { NavBar } from "@/component/layout/navbar";
import { SideBarProvider } from "@/component/context/sidebar-provider";
import { ThemeProvider } from "@/component/context/theme-provider";
import { Analytics } from "@vercel/analytics/react";
import { AppProvider } from "@/component/context/app-provider";
import { blogConfig } from "@/blog-config";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: `${blogConfig.name} | Blog with ${CMS_NAME}`,
  description: blogConfig.description,
  openGraph: {
    images: [HOME_OG_IMAGE_URL],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon/favicon-16x16.png"
        />
        <link rel="/manifest" href="/favicon/site.webmanifest" />
        <link
          rel="mask-icon"
          href="/favicon/safari-pinned-tab.svg"
          color="#000000"
        />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta
          name="msapplication-config"
          content="/favicon/browserconfig.xml"
        />
        <meta name="theme-color" content="#000" />
        <link
          rel="alternate"
          type="application/rss+xml"
          href="/api/rss"
          title={`RSS Feed for ${blogConfig.name}`}
        />
        <link
          rel="alternate"
          type="application/atom+xml"
          href="/api/rss?format=atom"
          title={`Atom Feed for ${blogConfig.name}`}
        />
        <link
          rel="alternate"
          type="application/json"
          href="/api/rss?format=json"
          title={`JSON Feed for ${blogConfig.name}`}
        />
      </head>
      <body className={inter.className}>
        <AppProvider
          contexts={[
            {
              component: ThemeProvider,
              props: {
                attribute: "class",
                defaultTheme: "system",
                enableSystem: true,
              },
            },
            { component: SideBarProvider },
          ]}
        >
          <NavBar />
          <div className="max-w-8xl mx-auto mt-12">{children}</div>
        </AppProvider>
        <Analytics />
      </body>
    </html>
  );
}
