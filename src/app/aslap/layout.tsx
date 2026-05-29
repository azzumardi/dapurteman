import { BottomNav } from "@/components/aslap/BottomNav";

export default function AslapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* App Bar / Header could go here */}
      <header className="bg-white shadow-sm px-4 py-3 sticky top-0 z-10">
        <h1 className="text-lg font-bold text-gray-900">ASLAP <span className="text-blue-600">SaaS</span></h1>
      </header>
      
      <main className="p-4">{children}</main>
      
      <BottomNav />
    </div>
  );
}
