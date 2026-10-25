import React, { useState } from 'react';
import { ArrowLeft, Copy, Check, Sparkles } from 'lucide-react';
import { Match } from '../types';

interface ShareScorePosterProps {
  match: Match;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareScorePoster: React.FC<ShareScorePosterProps> = ({
  match,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyText = () => {
    const text = `🏏 *Match Day Elite Academy Scorecard*\n🔥 ${match.team1Name} vs ${match.team2Name}\n📊 Score: ${match.runs}/${match.wickets} (${match.overs} ov)\n⚡ Status: ${match.status}\n📍 Hyderabad Gachibowli Hub`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="share-score-poster-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-md flex flex-col items-center">
        
        {/* The Authentic Digital Scorecard Poster matching original design */}
        <div
          id="digital-score-poster"
          className="w-full bg-[#0F172A] border border-[#1F2937] rounded-3xl p-6 shadow-2xl text-center relative overflow-hidden"
        >
          {/* Top Decorative Banner */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-yellow-400 via-red-500 to-[#1d978e]" />

          {/* Academy Brand Header */}
          <div className="mb-4">
            <h3 className="text-[#FACC15] font-black text-sm tracking-widest uppercase mb-0.5 flex items-center justify-center gap-1.5">
              <Sparkles size={14} className="text-yellow-400" /> Match Day Elite Academy
            </h3>
            <p className="text-xs text-slate-300 font-medium">Official Match Scorecard</p>
          </div>

          {/* Teams Header */}
          <div className="my-4 py-2 border-y border-slate-800">
            <h2 className="text-2xl font-black text-white tracking-wide">
              {match.team1Name} <span className="text-red-500 font-normal">vs</span> {match.team2Name}
            </h2>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">Match ID: {match.matchId}</p>
          </div>

          {/* Big Score Block */}
          <div className="my-5">
            <div className="text-5xl font-black text-[#22C55E] tracking-tight drop-shadow-md">
              {match.runs}/{match.wickets}
            </div>
            <p className="text-sm font-bold text-slate-200 mt-1">
              Overs: <span className="text-white font-mono">{match.overs}</span>
            </p>
          </div>

          {/* Status Badge */}
          <div className="inline-block mb-4">
            <span
              className={`px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider text-white shadow-md ${
                match.status === 'LIVE'
                  ? 'bg-red-600 animate-pulse'
                  : match.status === 'IN PROGRESS'
                  ? 'bg-amber-600'
                  : 'bg-emerald-600'
              }`}
            >
              {match.status}
            </span>
          </div>

          {/* Academy Footer Tagline matching original screen */}
          <div className="pt-3 border-t border-slate-800/80 space-y-1">
            <p className="text-xs text-sky-200 font-medium leading-relaxed px-2">
              Join our academy to play competitive matches with live scoring every weekend.
            </p>
            <p className="text-[11px] text-slate-400 font-semibold tracking-wide">
              Hyderabad • Gachibowli • Limited Seats
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="w-full flex flex-col gap-2.5 mt-4">
          <button
            onClick={handleCopyText}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check size={16} /> Scorecard Copied!
              </>
            ) : (
              <>
                <Copy size={16} /> Copy Match Scorecard
              </>
            )}
          </button>

          <button
            id="btn-close-poster"
            onClick={onClose}
            className="w-full py-3 bg-[#1E293B] hover:bg-slate-800 text-slate-200 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition cursor-pointer border border-slate-700/60"
          >
            <ArrowLeft size={16} /> Back to Match
          </button>
        </div>
      </div>
    </div>
  );
};
