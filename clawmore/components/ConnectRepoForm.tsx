'use client';

import { useState } from 'react';
import { Plus, Loader2, CheckCircle, ExternalLink, Trash2 } from 'lucide-react';

interface ConnectedRepo {
  id: string;
  name: string;
  url: string;
  branch: string;
  status: string;
  connectedAt: string;
  lastScanAt: string | null;
  scanCount: number;
  fixCount: number;
}

interface ConnectRepoFormProps {
  onRepoConnected?: (repo: ConnectedRepo) => void;
}

export default function ConnectRepoForm({
  onRepoConnected,
}: ConnectRepoFormProps) {
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<ConnectedRepo | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/onboarding/repos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl, branch }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to connect repository');
        return;
      }

      setSuccess(data.repo);
      setRepoUrl('');
      onRepoConnected?.(data.repo);
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-8 text-center">
        <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">
          Repository Connected
        </h3>
        <p className="text-sm text-zinc-400 mb-4">{success.name}</p>
        <p className="text-xs text-zinc-500 font-mono">
          First scan will run shortly. Results will appear in your dashboard.
        </p>
        <button
          onClick={() => setSuccess(null)}
          className="mt-4 text-xs text-cyber-blue hover:underline font-mono"
        >
          Connect another repository
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-500 mb-2 ml-1">
          GitHub Repository URL
        </label>
        <input
          type="url"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="https://github.com/your-org/your-repo"
          required
          className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-cyber-blue transition-colors text-sm"
        />
      </div>

      <div>
        <label className="block text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-500 mb-2 ml-1">
          Branch
        </label>
        <input
          type="text"
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          placeholder="main"
          className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-cyber-blue transition-colors text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !repoUrl}
        className="w-full py-3 rounded-sm bg-cyber-blue text-black font-bold uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2 disabled:opacity-30 text-sm"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <Plus className="w-4 h-4" />
            Connect Repository
          </>
        )}
      </button>

      {error && (
        <p className="text-red-400 text-xs text-center font-mono">{error}</p>
      )}
    </form>
  );
}

interface RepoListProps {
  repos: ConnectedRepo[];
  onDisconnect: (repoId: string) => void;
}

export function RepoList({ repos, onDisconnect }: RepoListProps) {
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  const handleDisconnect = async (repoId: string) => {
    setDisconnecting(repoId);
    try {
      await fetch(
        `/api/onboarding/repos?repoId=${encodeURIComponent(repoId)}`,
        {
          method: 'DELETE',
        }
      );
      onDisconnect(repoId);
    } catch {
      // silent fail, UI will refresh
    } finally {
      setDisconnecting(null);
    }
  };

  if (repos.length === 0) {
    return (
      <div className="text-center py-8 bg-black/20 border border-white/5 border-dashed rounded-2xl">
        <p className="text-xs text-zinc-600 font-mono uppercase tracking-widest">
          No repositories connected
        </p>
        <p className="text-[10px] text-zinc-700 mt-2">
          Connect a repository to start automated code analysis
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {repos.map((repo) => (
        <div
          key={repo.id}
          className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-xl hover:border-white/10 transition-all"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-2 h-2 rounded-full shrink-0 ${
                repo.status === 'ACTIVE'
                  ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                  : 'bg-zinc-500'
              }`}
            />
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">
                {repo.name}
              </p>
              <p className="text-[10px] text-zinc-500 font-mono">
                {repo.branch} &middot; {repo.scanCount} scans &middot;{' '}
                {repo.fixCount} fixes
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-zinc-500 hover:text-white transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={() => handleDisconnect(repo.id)}
              disabled={disconnecting === repo.id}
              className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
            >
              {disconnecting === repo.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
