import React, { useState } from 'react';
import { X, Trophy, AlertCircle } from 'lucide-react';
import { Match } from '../types';

interface CreateMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (newMatch: Match) => void;
}

export const CreateMatchModal: React.FC<CreateMatchModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [team1Name, setTeam1Name] = useState('');
  const [team2Name, setTeam2Name] = useState('');
  const [team1Error, setTeam1Error] = useState('');
  const [team2Error, setTeam2Error] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const trimmed1 = team1Name.trim().toUpperCase();
    const trimmed2 = team2Name.trim().toUpperCase();
    const validRegex = /^[A-Za-z0-9 ]+$/;
    const maxLength = 6;

    let valid = true;
    setTeam1Error('');
    setTeam2Error('');

    if (!trimmed1) {
      setTeam1Error('Please enter Team 1 name');
      valid = false;
    } else if (trimmed1.length > maxLength) {
      setTeam1Error(`Team 1 name must be at most ${maxLength} chars (e.g. RCB, IND)`);
      valid = false;
    } else if (!validRegex.test(trimmed1)) {
      setTeam1Error('Team 1 name contains invalid characters');
      valid = false;
    }

    if (!trimmed2) {
      setTeam2Error('Please enter Team 2 name');
      valid = false;
    } else if (trimmed2.length > maxLength) {
      setTeam2Error(`Team 2 name must be at most ${maxLength} chars (e.g. CSK, AUS)`);
      valid = false;
    } else if (!validRegex.test(trimmed2)) {
      setTeam2Error('Team 2 name contains invalid characters');
      valid = false;
    }

    if (trimmed1 && trimmed2 && trimmed1.toLowerCase() === trimmed2.toLowerCase()) {
      setTeam1Error('Team names must be different');
      setTeam2Error('Team names must be different');
      valid = false;
    }

    return valid;
  };

  const handleSaveMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setTimeout(() => {
      const matchId = `M${Math.floor(1000 + Math.random() * 9000)}`;
      const newMatch: Match = {
        matchId,
        team1Name: team1Name.trim().toUpperCase(),
        team2Name: team2Name.trim().toUpperCase(),
        runs: 0,
        wickets: 0,
        overs: 0.0,
        status: 'LIVE',
        currentInning: '1st Inning',
        summary: `Match created between ${team1Name.toUpperCase()} and ${team2Name.toUpperCase()}. Toss completed.`,
        recentBalls: [],
        lastUpdated: 'Just now',
      };

      onCreate(newMatch);
      setLoading(false);
      onClose();
      // Reset
      setTeam1Name('');
      setTeam2Name('');
    }, 400);
  };

  return (
    <div
      id="create-match-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-md bg-[#0B1220] border border-[#1E293B] rounded-3xl p-6 shadow-2xl text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Trophy size={18} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Create Match</h2>
              <p className="text-xs text-slate-400">Milestone 3 live match setup</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSaveMatch} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wide">
              1st Team Name
            </label>
            <input
              type="text"
              id="team1-name-input"
              value={team1Name}
              onChange={(e) => {
                setTeam1Name(e.target.value);
                if (team1Error) setTeam1Error('');
              }}
              placeholder="e.g. RCB, IND, TITANS"
              className={`w-full bg-[#111C34] border ${
                team1Error ? 'border-red-500' : 'border-[#1E293B]'
              } rounded-xl px-4 py-3 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 uppercase transition`}
              autoFocus
            />
            {team1Error && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {team1Error}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wide">
              2nd Team Name
            </label>
            <input
              type="text"
              id="team2-name-input"
              value={team2Name}
              onChange={(e) => {
                setTeam2Name(e.target.value);
                if (team2Error) setTeam2Error('');
              }}
              placeholder="e.g. CSK, AUS, WARRIORS"
              className={`w-full bg-[#111C34] border ${
                team2Error ? 'border-red-500' : 'border-[#1E293B]'
              } rounded-xl px-4 py-3 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 uppercase transition`}
            />
            {team2Error && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {team2Error}
              </p>
            )}
          </div>

          {/* Quick Suggestions */}
          <div className="pt-1">
            <span className="text-[11px] text-slate-500 block mb-1.5">Quick team pairs:</span>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {[
                ['RCB', 'CSK'],
                ['IND', 'PAK'],
                ['MI', 'KKR'],
                ['SRH', 'DC'],
              ].map(([t1, t2], i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setTeam1Name(t1);
                    setTeam2Name(t2);
                    setTeam1Error('');
                    setTeam2Error('');
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-bold border border-slate-700 transition"
                >
                  {t1} vs {t2}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-3">
            <button
              type="submit"
              id="btn-save-match"
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-extrabold rounded-2xl text-sm shadow-lg shadow-blue-600/30 transition cursor-pointer"
            >
              {loading ? 'Saving Match...' : 'Save Match'}
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
