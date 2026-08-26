import React from 'react';
import { Match } from '../types';
import { ArrowLeft, PlusCircle, Share2, Flame, ShieldAlert, Sparkles, TrendingUp } from 'lucide-react';

interface MatchDetailProps {
  match: Match;
  onBack: () => void;
  onOpenAddScore: () => void;
  onOpenSharePoster: () => void;
  onQuickScore?: (runsAdd: number, isWicket?: boolean) => void;
}

export const MatchDetail: React.FC<MatchDetailProps> = ({
  match,
  onBack,
  onOpenAddScore,
  onOpenSharePoster,
  onQuickScore,
}) => {
  // Calculate run rate
  const runRate = match.overs > 0 ? (match.runs / match.overs).toFixed(2) : '0.00';

  return (
    <div id="match-detail-view" className="space-y-4 pb-8">
      {/* Back Button and Header */}
      <div className="flex items-center justify-between">
        <button
          id="btn-back-to-matches"
          onClick={onBack}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-bold transition py-1 cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Matches
        </button>

        <div
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide ${
            match.status === 'LIVE'
              ? 'bg-red-600 text-white animate-pulse'
              : match.status === 'IN PROGRESS'
              ? 'bg-amber-600 text-white'
              : 'bg-slate-700 text-slate-300'
          }`}
        >
          {match.status === 'LIVE' && <Flame size={12} className="fill-white" />}
          {match.status}
        </div>
      </div>

      {/* Match Title & ID */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {match.team1Name} <span className="text-blue-500 font-bold">vs</span> {match.team2Name}
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-1">Match ID: {match.matchId}</p>
      </div>

      {/* Primary Score Card */}
      <div className="bg-[#111C34] border border-[#1E293B] rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Current Batting Score
            </span>
            <div className="text-5xl font-black text-[#22C55E] tracking-tight mt-1">
              {match.runs}/{match.wickets}
            </div>
          </div>

          <div className="text-right">
            <div className="text-xl font-extrabold text-slate-200">
              {match.overs} <span className="text-xs font-normal text-slate-400">Overs</span>
            </div>
            <div className="text-xs font-medium text-slate-400 mt-1 flex items-center justify-end gap-1">
              <TrendingUp size={12} className="text-blue-400" /> CRR: {runRate}
            </div>
          </div>
        </div>

        {/* Target if chasing */}
        {match.target && (
          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-xs font-medium">
            <span className="text-slate-400">Target Score: <strong className="text-white font-bold">{match.target}</strong></span>
            <span className="text-emerald-400 font-semibold">
              Needs {Math.max(0, match.target - match.runs)} runs to win
            </span>
          </div>
        )}
      </div>

      {/* Quick Ball-by-Ball Instant Buttons */}
      {onQuickScore && match.status !== 'COMPLETED' && (
        <div className="bg-[#0F172A] border border-slate-800/80 rounded-2xl p-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Sparkles size={12} className="text-yellow-400" /> Quick Live Scorer
            </span>
            <span className="text-[10px] text-slate-500">Tap to record ball</span>
          </div>

          <div className="grid grid-cols-6 gap-1.5">
            <button
              onClick={() => onQuickScore(0, false)}
              className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-xs transition cursor-pointer"
            >
              Dot (0)
            </button>
            <button
              onClick={() => onQuickScore(1, false)}
              className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-xs transition cursor-pointer"
            >
              1
            </button>
            <button
              onClick={() => onQuickScore(2, false)}
              className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-xs transition cursor-pointer"
            >
              2
            </button>
            <button
              onClick={() => onQuickScore(4, false)}
              className="py-2 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-lg text-xs transition cursor-pointer shadow-sm"
            >
              4 (FOUR)
            </button>
            <button
              onClick={() => onQuickScore(6, false)}
              className="py-2 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-lg text-xs transition cursor-pointer shadow-sm"
            >
              6 (SIX)
            </button>
            <button
              onClick={() => onQuickScore(0, true)}
              className="py-2 bg-red-600 hover:bg-red-500 text-white font-black rounded-lg text-xs transition cursor-pointer shadow-sm flex items-center justify-center gap-0.5"
            >
              <ShieldAlert size={12} /> OUT
            </button>
          </div>
        </div>
      )}

      {/* Match Summary Card */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-4.5 space-y-2">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          Match Summary
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          {match.summary || 'Batting side is building pressure nicely. Live ball-by-ball updates and overs tracking active.'}
        </p>
        <p className="text-[11px] text-slate-500">
          This screen now fetches and persists the latest score in real time.
        </p>
      </div>

      {/* Action Buttons matching the original app */}
      <div className="space-y-2.5 pt-2">
        <button
          id="btn-add-score"
          onClick={onOpenAddScore}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-extrabold rounded-2xl text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <PlusCircle size={18} /> Add / Update Score
        </button>

        <button
          id="btn-share-poster"
          onClick={onOpenSharePoster}
          className="w-full py-3.5 bg-[#1E293B] hover:bg-[#283548] text-slate-100 font-bold rounded-2xl text-sm flex items-center justify-center gap-2 transition cursor-pointer border border-slate-700/50"
        >
          <Share2 size={17} /> Share Score Poster
        </button>

        <button
          onClick={onBack}
          className="w-full py-3 bg-[#020617] hover:bg-slate-900 border border-slate-800 text-slate-400 font-semibold rounded-2xl text-xs transition cursor-pointer text-center"
        >
          Back to Matches
        </button>
      </div>
    </div>
  );
};
