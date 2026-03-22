'use client';

import React from 'react';
import Link from 'next/link';
import {
  User,
  Mail,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  RefreshCcw,
  Check,
  X,
  Search,
} from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [refreshing, setRefreshing] = React.useState(false);

  const fetchUsers = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const toggleApproval = async (user: any) => {
    const newStatus = user.status === 'APPROVED' ? 'PENDING' : 'APPROVED';
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, status: newStatus }),
      });
      if (res.ok) {
        setUsers(
          users.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
        );
      }
    } catch (err) {
      console.error('Error toggling approval:', err);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin text-cyber-blue">
          <RefreshCcw className="w-8 h-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 md:py-16 px-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="text-cyber-blue font-mono text-[10px] uppercase tracking-[0.4em] mb-2">
            BETA_PROVISIONING
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter">
            User Approvals{' '}
            <span className="text-zinc-500 font-normal not-italic ml-4 text-2xl">
              ({users.length})
            </span>
          </h1>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const email = (e.target as any).email.value;
            if (!email) return;
            const res = await fetch('/api/admin/users', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, name: 'Pre-approved User' }),
            });
            if (res.ok) {
              (e.target as any).email.value = '';
              fetchUsers();
            }
          }}
          className="flex gap-2"
        >
          <input
            name="email"
            type="email"
            placeholder="Invite by email..."
            className="bg-zinc-900 border border-white/10 rounded-xl py-3 px-4 text-xs focus:outline-none focus:border-cyber-blue font-mono min-w-[240px]"
            required
          />
          <button className="bg-white text-black px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-cyber-blue transition-all">
            Pre-approve
          </button>
        </form>
      </div>

      <div className="mb-8 relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-zinc-900 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-cyber-blue/50 transition-all font-mono"
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredUsers.length === 0 ? (
          <div className="glass-card p-20 text-center border-white/5 bg-white/[0.02]">
            <p className="text-zinc-500 font-mono text-sm leading-relaxed">
              {search
                ? 'NO_USERS_MATCH_SEARCH_QUERY'
                : 'NO_REGISTERED_USERS_FOUND'}
            </p>
          </div>
        ) : (
          filteredUsers.map((user: any) => (
            <div
              key={user.id}
              className={`glass-card p-6 flex flex-col md:flex-row md:items-center gap-6 border-white/5 transition-all bg-white/[0.01] ${
                user.status === 'APPROVED'
                  ? 'border-l-4 border-l-emerald-500'
                  : 'border-l-4 border-l-amber-500'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <User
                    size={16}
                    className={
                      user.status === 'APPROVED'
                        ? 'text-emerald-500'
                        : 'text-amber-500'
                    }
                  />
                  <span className="font-bold text-lg">
                    {user.name || 'Anonymous'}
                  </span>
                  {user.status === 'APPROVED' ? (
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest font-mono">
                      <Check size={8} /> Approved
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase tracking-widest font-mono">
                      <X size={8} /> Pending
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-zinc-400 text-sm">
                  <Mail size={14} />
                  <span className="font-mono">{user.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => toggleApproval(user)}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
                    user.status === 'APPROVED'
                      ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                  }`}
                >
                  {user.status === 'APPROVED'
                    ? 'Revoke Access'
                    : 'Grant Access'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-20 border-t border-white/5 pt-10 flex justify-between items-center">
        <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.4em]">
          &copy; 2026 CLAWMORE_BETA_ACCESS_PROTOCOL
        </p>
        <button
          onClick={fetchUsers}
          className={`p-2 rounded-full hover:bg-white/5 transition-all text-zinc-500 hover:text-white ${refreshing ? 'animate-spin' : ''}`}
        >
          <RefreshCcw size={14} />
        </button>
      </div>
    </div>
  );
}
