'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft, Zap, Mail, ShieldCheck } from 'lucide-react';
import LeadForm from '../../components/LeadForm';
import Modal from '../../components/Modal';

export default function UnauthorizedPage() {
  const [showLeadForm, setShowLeadForm] = React.useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-cyber-blue/30 selection:text-cyber-blue font-sans overflow-hidden flex flex-col items-center justify-center p-6 relative">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyber-blue/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-xl w-full text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex flex-col items-center"
        >
          {/* Logo */}
          <Link href="/" className="mb-12 group">
            <div className="flex flex-col items-center gap-3">
              <Image
                src="/logo.png"
                alt="ClawMore Logo"
                width={60}
                height={60}
                className="drop-shadow-[0_0_15px_rgba(0,224,255,0.4)] transition-all group-hover:scale-110"
              />
              <h1 className="text-3xl font-black italic tracking-tighter uppercase">
                CLAW<span className="text-cyber-blue">MORE</span>
              </h1>
            </div>
          </Link>

          <div className="bg-zinc-900/50 border border-white/5 p-10 rounded-[32px] backdrop-blur-xl mb-10 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-8 mx-auto">
              <ShieldAlert className="w-8 h-8 text-amber-500" />
            </div>

            <h2 className="text-2xl font-bold mb-4 tracking-tight">
              Access Restricted
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed mb-8">
              ClawMore is currently in{' '}
              <span className="text-white font-bold italic">
                Managed Beta Access
              </span>
              . Only invited and approved users can authenticate with the
              Synthesis Engine at this time.
            </p>

            <div className="space-y-4">
              <button
                onClick={() => setShowLeadForm(true)}
                className="w-full py-4 bg-cyber-blue text-black font-black italic uppercase tracking-widest rounded-xl hover:bg-white transition-all shadow-[0_0_30px_rgba(0,224,255,0.2)] flex items-center justify-center gap-3"
              >
                <Zap className="w-4 h-4" /> Request Beta Access
              </button>

              <Link
                href="/"
                className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-white/5 text-sm"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Home
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-8 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3 h-3 text-emerald-500/50" />
              Secure Protocol
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3 h-3 text-cyber-blue/50" />
              Managed Onboarding
            </div>
          </div>
        </motion.div>
      </div>

      <Modal isOpen={showLeadForm} onClose={() => setShowLeadForm(false)}>
        <LeadForm
          type="beta"
          apiUrl="/api/leads"
          onSuccess={() => setShowLeadForm(false)}
        />
      </Modal>
    </div>
  );
}
