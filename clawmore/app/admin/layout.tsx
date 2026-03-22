'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  ArrowLeft,
  LogOut,
  ShieldCheck,
  Zap,
  Activity,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Leads', href: '/admin/leads', icon: LayoutDashboard },
    { name: 'Beta Access', href: '/admin/users', icon: ShieldCheck },
    { name: 'User Dashboard', href: '/dashboard', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/5 bg-black/40 backdrop-blur-2xl flex flex-col z-20">
        <div className="p-8 pb-4">
          <Link href="/" className="group flex flex-col gap-2">
            <h1 className="text-xl font-black italic tracking-tighter uppercase group-hover:text-cyber-blue transition-colors">
              CLAW<span className="text-cyber-blue">MORE</span>
            </h1>
            <div className="text-[8px] font-mono text-zinc-500 uppercase tracking-[0.4em]">
              ADMIN_PORTAL_v0.9.5
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                  isActive
                    ? 'bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/20'
                    : 'text-zinc-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-widest">
                  {item.name}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="ml-auto w-1 h-1 rounded-full bg-cyber-blue shadow-[0_0_8px_rgba(0,224,255,0.8)]"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-white transition-all text-[10px] font-mono uppercase tracking-[0.2em]"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Site
          </Link>
          <div className="px-4 py-2 flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[8px] font-mono text-zinc-600 uppercase">
              System Secure
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
    </div>
  );
}
