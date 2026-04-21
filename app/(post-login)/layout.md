import { Sidebar } from "@/components/swipe/sidebar";
export default function PostLoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-hidden bg-galatea-darker">
        <div className="h-full max-w-2xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
