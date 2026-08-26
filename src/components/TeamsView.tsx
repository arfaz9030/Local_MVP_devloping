import React, { useState } from 'react';
import { Team, Player, PlayerRole } from '../types';
import { Users, Shield, Plus, ChevronDown, ChevronUp, UserCheck, Award } from 'lucide-react';

interface TeamsViewProps {
  teams: Team[];
  onAddTeam: (newTeam: Team) => void;
  onAddPlayer: (teamId: string, player: Player) => void;
}

export const TeamsView: React.FC<TeamsViewProps> = ({
  teams,
  onAddTeam,
  onAddPlayer,
}) => {
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(teams[0]?.id || null);
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState<string | null>(null);

  // New Team State
  const [newTeamName, setNewTeamName] = useState('');
  const [newCaptainName, setNewCaptainName] = useState('');
  const [newCity, setNewCity] = useState('Hyderabad');

  // New Player State
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newJersey, setNewJersey] = useState('');
  const [newRole, setNewRole] = useState<PlayerRole>('All-Rounder');

  const toggleExpand = (id: string) => {
    setExpandedTeamId(expandedTeamId === id ? null : id);
  };

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim() || !newCaptainName.trim()) return;

    const newTeam: Team = {
      id: String(Date.now()),
      name: newTeamName.trim(),
      captainName: newCaptainName.trim(),
      city: newCity.trim(),
      players: [
        {
          id: `p_${Date.now()}`,
          name: newCaptainName.trim(),
          jerseyNumber: 7,
          role: 'All-Rounder',
          runsScored: 0,
          wicketsTaken: 0,
        },
      ],
    };

    onAddTeam(newTeam);
    setNewTeamName('');
    setNewCaptainName('');
    setShowAddTeamModal(false);
    setExpandedTeamId(newTeam.id);
  };

  const handleCreatePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAddPlayerModal || !newPlayerName.trim()) return;

    const player: Player = {
      id: `p_${Date.now()}`,
      name: newPlayerName.trim(),
      jerseyNumber: newJersey ? parseInt(newJersey, 10) : Math.floor(Math.random() * 99) + 1,
      role: newRole,
      runsScored: 0,
      wicketsTaken: 0,
    };

    onAddPlayer(showAddPlayerModal, player);
    setNewPlayerName('');
    setNewJersey('');
    setShowAddPlayerModal(null);
  };

  return (
    <div id="teams-view" className="space-y-4">
      {/* Header matching original screen */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Registered Teams
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage tournament rosters & captain assignments
          </p>
        </div>

        <button
          id="btn-add-team"
          onClick={() => setShowAddTeamModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1d978e] hover:bg-[#188078] active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
        >
          <Plus size={16} /> New Team
        </button>
      </div>

      {/* Teams List */}
      <div className="space-y-3">
        {teams.map((team) => {
          const isExpanded = expandedTeamId === team.id;

          return (
            <div
              key={team.id}
              id={`team-card-${team.id}`}
              className="bg-[#111C34] border border-[#1E293B] rounded-2xl overflow-hidden shadow-md transition-all duration-200"
            >
              {/* Card Header */}
              <div
                onClick={() => toggleExpand(team.id)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#152342] transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-sm shadow-md">
                    {team.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      {team.name}
                      {team.city && (
                        <span className="text-[10px] font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                          {team.city}
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <Shield size={12} className="text-amber-400" />
                      Captain: <span className="text-slate-200 font-semibold">{team.captainName}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#1d978e] bg-[#1d978e]/10 border border-[#1d978e]/30 px-2.5 py-1 rounded-lg">
                    {team.players.length} Players
                  </span>
                  <div className="text-slate-400 p-1">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>
              </div>

              {/* Collapsible Players Section */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-slate-800/80 bg-[#0B1220]/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Roster ({team.players.length})
                    </span>

                    <button
                      onClick={() => setShowAddPlayerModal(team.id)}
                      className="text-[11px] font-bold text-[#1d978e] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={13} /> Add Player
                    </button>
                  </div>

                  {team.players.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-2">No players added yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {team.players.map((player) => (
                        <div
                          key={player.id}
                          className="flex items-center justify-between bg-[#111C34] border border-slate-800 rounded-xl p-2.5 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 font-mono font-bold flex items-center justify-center text-[10px] border border-slate-700">
                              #{player.jerseyNumber ?? '-'}
                            </span>
                            <div>
                              <span className="font-semibold text-white block">
                                {player.name}
                              </span>
                              {player.name === team.captainName && (
                                <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-0.5">
                                  <Award size={9} /> Team Captain
                                </span>
                              )}
                            </div>
                          </div>

                          {player.role && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                player.role === 'Batsman'
                                  ? 'bg-blue-900/40 text-blue-300 border border-blue-800'
                                  : player.role === 'Bowler'
                                  ? 'bg-red-900/40 text-red-300 border border-red-800'
                                  : player.role === 'Wicketkeeper'
                                  ? 'bg-amber-900/40 text-amber-300 border border-amber-800'
                                  : 'bg-emerald-900/40 text-emerald-300 border border-emerald-800'
                              }`}
                            >
                              {player.role}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Team Modal */}
      {showAddTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0F172A] border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100">
            <h2 className="text-xl font-bold text-white mb-1">Create New Team</h2>
            <p className="text-xs text-slate-400 mb-4">Register team for local league matches</p>

            <form onSubmit={handleCreateTeam} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Team Name</label>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="e.g. Deccan Chargers"
                  className="w-full bg-[#020617] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#1d978e]"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Captain Name</label>
                <input
                  type="text"
                  value={newCaptainName}
                  onChange={(e) => setNewCaptainName(e.target.value)}
                  placeholder="e.g. Arfaz Mohammad"
                  className="w-full bg-[#020617] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#1d978e]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">City / Region</label>
                <input
                  type="text"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  placeholder="e.g. Hyderabad"
                  className="w-full bg-[#020617] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#1d978e]"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#1d978e] hover:bg-[#188078] text-white font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Save Team
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddTeamModal(false)}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Player Modal */}
      {showAddPlayerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0F172A] border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100">
            <h2 className="text-xl font-bold text-white mb-1">Add Player to Roster</h2>
            <p className="text-xs text-slate-400 mb-4">Assign role and jersey number</p>

            <form onSubmit={handleCreatePlayer} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Player Name</label>
                <input
                  type="text"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-[#020617] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#1d978e]"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Jersey Number</label>
                  <input
                    type="number"
                    value={newJersey}
                    onChange={(e) => setNewJersey(e.target.value)}
                    placeholder="e.g. 18"
                    className="w-full bg-[#020617] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#1d978e]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as PlayerRole)}
                    className="w-full bg-[#020617] border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-[#1d978e]"
                  >
                    <option value="Batsman">Batsman</option>
                    <option value="Bowler">Bowler</option>
                    <option value="All-Rounder">All-Rounder</option>
                    <option value="Wicketkeeper">Wicketkeeper</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#1d978e] hover:bg-[#188078] text-white font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Add Player
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddPlayerModal(null)}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
