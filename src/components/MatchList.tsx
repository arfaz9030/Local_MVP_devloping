import React, { useState } from 'react';
import { Match, MatchStatus } from '../types';
import { Plus, Search, Trophy, Flame, Clock, CheckCircle2, ChevronRight, Activity } from 'lucide-react';

interface MatchListProps {
  matches: Match[];
  onSelectMatch: (matchId: string) => void;
  onCreateMatch: () => void;
}

export const MatchList: React.FC<MatchListProps> = ({
  matches,
  onSelectMatch,
  onCreateMatch,
}) => {
  const [filter, setFilter] = useState<'ALL' | MatchStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMatches = matches.filter((m) => {
    const matchesFilter = filter === 'ALL' || m.status === filter;
    const matchesQuery =
      m.team1Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.team2Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.matchId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  return (
    <div id="match-list-view" className="space-y-4">
      {/* Header Block matching the original screen */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            CrickHero MVP <span className="text-xs px-2 py-0.5 rounded-md bg-blue-600/20 text-blue-400 font-bold border border-blue-500/30">v1.0</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Live & recent cricket matches</p>
        </div>

        <button
          id="btn-create-match"
          onClick={onCreateMatch}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 transition cursor-pointer"
        >
          <Plus size={16} className="stroke-[3]" />
          Create Match
        </button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search teams or Match ID (e.g. RCB, M1001)..."
            className="w-full bg-[#111C34] border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          {(['ALL', 'LIVE', 'IN PROGRESS', 'COMPLETED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] whitespace-nowrap transition cursor-pointer ${
                filter === status
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-[#111C34] border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {status === 'LIVE' && '🔥 '}
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Matches List */}
      <div className="space-y-3 pt-1">
        {filteredMatches.length === 0 ? (
          <div className="bg-[#111C34] border border-slate-800 rounded-2xl p-8 text-center my-6">
            <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3 stroke-1" />
            <h3 className="text-base font-bold text-white mb-1">No matches found</h3>
            <p className="text-xs text-slate-400 mb-4 max-w-xs mx-auto">
              Create your first match or adjust your filter parameters to get started.
            </p>
            <button
              onClick={onCreateMatch}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-500 transition"
            >
              + Create Match
            </button>
          </div>
        ) : (
          filteredMatches.map((item) => (
            <div
              key={item.matchId}
              id={`match-card-${item.matchId}`}
              onClick={() => onSelectMatch(item.matchId)}
              className="group bg-[#111C34] hover:bg-[#152342] border border-[#1E293B] hover:border-blue-500/50 rounded-2xl p-4.5 transition-all duration-200 cursor-pointer shadow-md relative overflow-hidden"
            >
              {/* Status & Match Title Row */}
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-base font-bold text-white truncate">
                    {item.team1Name} <span className="text-slate-500 font-normal">vs</span> {item.team2Name}
                  </span>
                </div>

                <div
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    item.status === 'LIVE'
                      ? 'bg-red-600 text-white animate-pulse'
                      : item.status === 'IN PROGRESS'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {item.status === 'LIVE' && <Flame size={10} className="fill-white" />}
                  {item.status === 'IN PROGRESS' && <Clock size={10} />}
                  {item.status === 'COMPLETED' && <CheckCircle2 size={10} />}
                  {item.status}
                </div>
              </div>

              {/* Big Score Display */}
              <div className="flex items-baseline justify-between mt-2 mb-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black tracking-tight text-[#22C55E]">
                    {item.runs}/{item.wickets}
                  </span>
                  <span className="text-xs font-semibold text-slate-300">
                    ({item.overs} ov)
                  </span>
                </div>

                {item.currentInning && (
                  <span className="text-[11px] font-medium text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded-md">
                    {item.currentInning}
                  </span>
                )}
              </div>

              {/* Recent Balls / Overs preview */}
              {item.recentBalls && item.recentBalls.length > 0 && (
                <div className="flex items-center gap-1.5 my-2.5">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mr-1">
                    This Over:
                  </span>
                  <div className="flex gap-1">
                    {item.recentBalls.slice(-6).map((ball, bIdx) => (
                      <span
                        key={bIdx}
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          ball === 'W'
                            ? 'bg-red-600 text-white'
                            : ball === '4' || ball === '6'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {ball}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer Row */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-500">
                <span>Match ID: <strong className="text-slate-400 font-mono">{item.matchId}</strong></span>
                <span className="flex items-center gap-0.5 text-blue-400 group-hover:text-blue-300 font-semibold transition">
                  View Scorecard <ChevronRight size={13} />
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
