import React, { useState } from 'react';
import { X, Check, ShieldAlert } from 'lucide-react';
import { Match, MatchStatus } from '../types';

interface AddScoreModalProps {
  match: Match;
  isOpen: boolean;
  onClose: () => void;
  onSaveScore: (matchId: string, runs: number, wickets: number, overs: number, status?: MatchStatus) => void;
}

export const AddScoreModal: React.FC<AddScoreModalProps> = ({
  match,
  isOpen,
  onClose,
  onSaveScore,
}) => {
  const [runs, setRuns] = useState(String(match.runs));
  const [wickets, setWickets] = useState(String(match.wickets));
  const [overs, setOvers] = useState(String(match.overs));
  const [status, setStatus] = useState<MatchStatus>(match.status);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const runsTrimmed = runs.trim();
    const wicketsTrimmed = wickets.trim();
    const oversTrimmed = overs.trim();

    if (!runsTrimmed || !oversTrimmed) {
      setError('Please enter at least runs and overs.');
      return;
    }

    const runsNum = parseInt(runsTrimmed, 10);
    const wicketsNum = wicketsTrimmed ? parseInt(wicketsTrimmed, 10) : 0;
    const oversNum = parseFloat(oversTrimmed);

    if (isNaN(runsNum) || isNaN(oversNum) || isNaN(wicketsNum)) {
      setError('Runs, wickets, and overs must be valid numbers.');
      return;
    }

    if (runsNum < 0 || wicketsNum < 0 || oversNum < 0) {
      setError('Score values cannot be negative.');
      return;
    }

    if (wicketsNum > 10) {
      setError('Wickets cannot exceed 10 in cricket.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      onSaveScore(match.matchId, runsNum, wicketsNum, oversNum, status);
      setLoading(false);
      onClose();
    }, 300);
  };

  return (
    <div
      id="add-score-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-md bg-[#020617] border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Update Score</h2>
            <p className="text-xs text-sky-400 font-semibold mt-0.5">
              {match.team1Name} vs {match.team2Name}
            </p>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              Match ID: {match.matchId}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-800 rounded-xl text-xs text-red-300 flex items-center gap-2">
            <ShieldAlert size={16} className="text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Card */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Runs Scored
              </label>
              <input
                type="number"
                id="score-input-runs"
                value={runs}
                onChange={(e) => setRuns(e.target.value)}
                placeholder="e.g. 186"
                className="w-full bg-[#020617] border border-slate-800 rounded-xl px-3.5 py-2.5 text-base font-bold text-emerald-400 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Wickets Lost
                </label>
                <input
                  type="number"
                  id="score-input-wickets"
                  value={wickets}
                  onChange={(e) => setWickets(e.target.value)}
                  placeholder="e.g. 4"
                  max={10}
                  className="w-full bg-[#020617] border border-slate-800 rounded-xl px-3.5 py-2.5 text-base font-bold text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Overs Completed
                </label>
                <input
                  type="number"
                  step="0.1"
                  id="score-input-overs"
                  value={overs}
                  onChange={(e) => setOvers(e.target.value)}
                  placeholder="e.g. 18.3"
                  className="w-full bg-[#020617] border border-slate-800 rounded-xl px-3.5 py-2.5 text-base font-bold text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Match Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['LIVE', 'IN PROGRESS', 'COMPLETED'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`py-2 rounded-xl text-[11px] font-bold transition ${
                      status === s
                        ? s === 'LIVE'
                          ? 'bg-red-600 text-white'
                          : s === 'IN PROGRESS'
                          ? 'bg-amber-600 text-white'
                          : 'bg-emerald-600 text-white'
                        : 'bg-[#020617] border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              type="submit"
              id="btn-save-score"
              disabled={loading}
              className="w-full py-4 bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-50 text-white font-extrabold rounded-2xl text-sm shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Check size={18} /> {loading ? 'Saving…' : 'Save Score'}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 bg-[#1E293B] hover:bg-slate-800 text-slate-300 font-bold rounded-2xl text-xs transition cursor-pointer text-center"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
