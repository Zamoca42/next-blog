import "@/app/globals.css";

export default function PostLayout({
  children,
  sidebar,
}: Readonly<{
  children: React.ReactNode;
  sidebar: React.ReactNode;
}>) {
  return (
    <>
      <div>{sidebar}</div>
      <div className="min-h-screen">{children}</div>
    </>
  );
}
