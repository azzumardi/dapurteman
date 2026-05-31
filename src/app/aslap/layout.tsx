import { BottomNav } from "@/components/aslap/BottomNav";
import { User } from "lucide-react";

export default function AslapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F3F6FD] pb-24">
      {/* App Bar Premium */}
      <header className="bg-white/80 backdrop-blur-md border-b border-edusync-border/40 px-5 py-3.5 sticky top-0 z-40 flex items-center justify-between shadow-[0_2px_15px_rgba(0,0,0,0.01)]">
        <div>
          <h1 className="text-base font-black tracking-tight text-edusync-text">
            ASLAP <span className="text-edusync-blue">SaaS</span>
          </h1>
          <p className="text-[9px] font-bold text-edusync-gold uppercase tracking-wider">Dapur Teman</p>
        </div>
        <div className="h-8 w-8 rounded-full bg-edusync-blue/10 border border-edusync-blue/20 flex items-center justify-center text-edusync-blue shadow-sm">
          <User className="w-4 h-4" />
        </div>
      </header>
      
      <main className="p-4 max-w-lg mx-auto">{children}</main>
      
      <BottomNav />
    </div>
  );
}
