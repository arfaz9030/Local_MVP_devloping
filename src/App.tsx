import React, { useState, useEffect } from 'react';
import { TabType, Match, Team, AuthUser, MatchStatus, Player } from './types';
import {
  getStoredMatches,
  saveStoredMatches,
  getStoredTeams,
  saveStoredTeams,
  getStoredUser,
  saveStoredUser,
} from './services/storageService';
import { INITIAL_MATCHES, INITIAL_TEAMS, ACADEMY_INFO } from './data/mockData';
import {
  Trophy,
  Users,
  Award,
  User,
  Smartphone,
  Monitor,
  Plus,
  Play,
  Share2,
  RotateCcw,
  CheckCircle2,
  Phone,
  Shield,
  HelpCircle,
  FileText,
  Clock,
  ArrowLeft,
  Copy,
  ChevronUp,
  X,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('matches');
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isMobileFrame, setIsMobileFrame] = useState(true);

  // Live scoring simulator state
  const [activeScoringMatch, setActiveScoringMatch] = useState<Match | null>(null);
  const [currentBalls, setCurrentBalls] = useState<string[]>(['6', '2', '3', '4']);
  const [strikerRuns, setStrikerRuns] = useState(11);
  const [strikerBalls, setStrikerBalls] = useState(3);
  const [nonStrikerRuns, setNonStrikerRuns] = useState(7);
  const [nonStrikerBalls, setNonStrikerBalls] = useState(3);
  const [bowlerFigures, setBowlerFigures] = useState({ overs: '0.4', maidens: '0', runs: '15', wickets: '0' });
  const [history, setHistory] = useState<any[]>([]);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isOverCompleteOpen, setIsOverCompleteOpen] = useState(false);
  const [syncedToast, setSyncedToast] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Teams tab state
  const [teamsSearch, setTeamsSearch] = useState('');
  const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newCaptainName, setNewCaptainName] = useState('');
  const [newCity, setNewCity] = useState('Hyderabad (Telangana)');

  // Load initial data
  useEffect(() => {
    const loadedMatches = getStoredMatches();
    const loadedTeams = getStoredTeams();
    const loadedUser = getStoredUser();

    setMatches(loadedMatches.length > 0 ? loadedMatches : INITIAL_MATCHES);
    setTeams(loadedTeams.length > 0 ? loadedTeams : INITIAL_TEAMS);
    setUser(
      loadedUser || {
        userId: 101,
        name: 'Arfaz Mohammad',
        mobileNumber: '7680922101',
        isGuest: false,
      }
    );
  }, []);

  const triggerSyncToast = () => {
    setSyncedToast(true);
    setTimeout(() => setSyncedToast(false), 1600);
  };

  // Ball-by-ball scoring action
  const handleBallScore = (action: string, runs: number, isLegal = true) => {
    if (!activeScoringMatch) return;

    // Save previous snapshot for undo
    setHistory((prev) => [
      ...prev,
      {
        match: { ...activeScoringMatch },
        balls: [...currentBalls],
        strikerRuns,
        strikerBalls,
        nonStrikerRuns,
        nonStrikerBalls,
        bowlerFigures: { ...bowlerFigures },
      },
    ]);

    const newRuns = activeScoringMatch.runs + runs;
    let newOvers = activeScoringMatch.overs;
    let nextBalls = [...currentBalls];

    if (action === 'WD' || action === 'NB') {
      nextBalls.push(action);
    } else if (action === 'OUT') {
      nextBalls.push('W');
      newOvers = parseFloat((newOvers + 0.1).toFixed(1));
    } else {
      nextBalls.push(action);
      newOvers = parseFloat((newOvers + 0.1).toFixed(1));
      setStrikerRuns((prev) => prev + runs);
      setStrikerBalls((prev) => prev + 1);

      // Strike rotation on odd runs
      if (runs % 2 === 1) {
        const tempR = strikerRuns + runs;
        const tempB = strikerBalls + 1;
        setStrikerRuns(nonStrikerRuns);
        setStrikerBalls(nonStrikerBalls);
        setNonStrikerRuns(tempR);
        setNonStrikerBalls(tempB);
      }
    }

    const updatedMatch: Match = {
      ...activeScoringMatch,
      runs: newRuns,
      overs: newOvers,
      wickets: action === 'OUT' ? activeScoringMatch.wickets + 1 : activeScoringMatch.wickets,
      recentBalls: nextBalls,
    };

    setActiveScoringMatch(updatedMatch);
    setCurrentBalls(nextBalls);
    triggerSyncToast();

    // Check legal delivery over complete
    const legalCount = nextBalls.filter((b) => b !== 'WD' && b !== 'NB').length;
    if (legalCount >= 6) {
      setIsOverCompleteOpen(true);
    }

    // Update global list
    const updatedList = matches.map((m) => (m.matchId === updatedMatch.matchId ? updatedMatch : m));
    setMatches(updatedList);
    saveStoredMatches(updatedList);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setHistory((prev) => prev.slice(0, prev.length - 1));
    setActiveScoringMatch(last.match);
    setCurrentBalls(last.balls);
    setStrikerRuns(last.strikerRuns);
    setStrikerBalls(last.strikerBalls);
    setNonStrikerRuns(last.nonStrikerRuns);
    setNonStrikerBalls(last.nonStrikerBalls);
    setBowlerFigures(last.bowlerFigures);
    setIsOverCompleteOpen(false);
    triggerSyncToast();
  };

  const handleNextOver = () => {
    if (!activeScoringMatch) return;
    const completedOvers = Math.floor(activeScoringMatch.overs) + 1;
    const updated = {
      ...activeScoringMatch,
      overs: completedOvers,
    };
    setActiveScoringMatch(updated);
    setCurrentBalls([]);
    setIsOverCompleteOpen(false);
    triggerSyncToast();
  };

  const handleCopyId = () => {
    if (!activeScoringMatch) return;
    navigator.clipboard?.writeText(activeScoringMatch.matchId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 1800);
  };

  // Add team
  const handleCreateTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    const newTeam: Team = {
      id: String(Date.now()),
      name: newTeamName.trim(),
      captainName: newCaptainName.trim() || 'Captain',
      city: newCity,
      players: [
        { id: 'p-' + Date.now(), name: newCaptainName.trim() || 'Captain', role: 'All-Rounder' },
      ],
    };
    const updatedTeams = [newTeam, ...teams];
    setTeams(updatedTeams);
    saveStoredTeams(updatedTeams);
    setNewTeamName('');
    setNewCaptainName('');
    setIsAddTeamModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0B1220] text-slate-100 flex flex-col items-center">
      {/* Top Simulator Control Bar */}
      <header className="w-full bg-[#111C34] border-b border-[#1E293B] px-4 py-2.5 flex items-center justify-between text-xs sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-[#5EEAD4] tracking-wider uppercase text-sm">
            Match Day
          </span>
          <span className="bg-[#007F78]/30 text-teal-300 px-2 py-0.5 rounded-full font-mono text-[11px] font-semibold">
            v1.0 Live Demo
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileFrame(!isMobileFrame)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition cursor-pointer"
          >
            {isMobileFrame ? <Monitor size={14} /> : <Smartphone size={14} />}
            <span>{isMobileFrame ? 'Desktop Width' : 'Mobile Viewport'}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main
        className={`w-full flex-1 flex flex-col transition-all duration-200 ${
          isMobileFrame
            ? 'max-w-[420px] my-4 rounded-3xl border border-[#1E293B] shadow-2xl overflow-hidden bg-[#0B1220]'
            : 'max-w-4xl p-4'
        }`}
      >
        {/* VIEW 1: LIVE SCORING SCREEN (Active Match) */}
        {activeScoringMatch ? (
          <div className="flex flex-col flex-1 min-h-[640px] bg-[#0B1220] relative">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#111C34] border-b border-[#1E293B]">
              <button
                onClick={() => setActiveScoringMatch(null)}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <ArrowLeft size={20} />
              </button>
              <h2 className="font-bold text-white text-base tracking-wide">
                {activeScoringMatch.team1Name}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    navigator.clipboard?.writeText(
                      `🏏 Match Day Live Score: ${activeScoringMatch.team1Name} vs ${activeScoringMatch.team2Name}: ${activeScoringMatch.runs}/${activeScoringMatch.wickets} (${activeScoringMatch.overs} ov)`
                    )
                  }
                  className="p-1.5 text-slate-300 hover:text-white"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            {/* Score Summary Block */}
            <div className="text-center py-5 px-4 bg-gradient-to-b from-[#111C34]/40 to-transparent">
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-black text-white tracking-tight">
                  {activeScoringMatch.runs}/{activeScoringMatch.wickets}
                </span>
                <span className="text-xl font-bold text-slate-400">
                  ({activeScoringMatch.overs}/5)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {activeScoringMatch.team1Name} won the toss and elected to bat
              </p>
              <button
                onClick={handleCopyId}
                className="inline-flex items-center gap-1.5 mt-2.5 text-[11px] text-slate-400 font-mono hover:text-slate-200"
              >
                Match ID: {activeScoringMatch.matchId}
                <Copy size={12} />
                {copiedId && <span className="text-[#5EEAD4] ml-1">Copied!</span>}
              </button>
            </div>

            {/* Compact Batters Card */}
            <div className="mx-4 bg-[#111C34] border border-[#1E293B] rounded-2xl p-3 flex justify-between">
              <div className="flex-1 pr-2 border-r border-[#1E293B]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#007F78] text-white flex items-center justify-center font-bold text-xs">
                    🏏
                  </div>
                  <span className="text-xs font-bold text-white truncate">
                    A-1 Children Sweets
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-200 mt-1 pl-8">
                  {strikerRuns}({strikerBalls})
                </div>
              </div>

              <div className="flex-1 pl-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-xs">
                    🏏
                  </div>
                  <span className="text-xs font-bold text-white truncate">
                    Mohammad Arfaz
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-400 mt-1 pl-8">
                  {nonStrikerRuns}({nonStrikerBalls})
                </div>
              </div>
            </div>

            {/* Bowler Bar */}
            <div className="mx-4 mt-2.5 bg-[#111C34] border border-[#1E293B] rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2">
                <span>🔴</span>
                <span className="text-white">Rafah</span>
                <span className="text-[#5EEAD4] font-mono tracking-tighter">|||</span>
              </div>
              <span className="font-mono text-slate-300">
                {bowlerFigures.overs}-{bowlerFigures.maidens}-{bowlerFigures.runs}-{bowlerFigures.wickets}
              </span>
            </div>

            {/* Ball Sequence */}
            <div className="mx-4 my-3 flex items-center gap-2 overflow-x-auto py-1">
              {currentBalls.length === 0 ? (
                <span className="text-xs text-slate-500 italic">New over starting...</span>
              ) : (
                currentBalls.map((b, i) => {
                  let bg = 'bg-white text-slate-900';
                  if (b === '4') bg = 'bg-[#F59E0B] text-white';
                  if (b === '6') bg = 'bg-[#84CC16] text-slate-900';
                  if (b === 'W') bg = 'bg-[#EF4444] text-white';
                  if (b === 'WD' || b === 'NB') bg = 'bg-[#0284C7] text-white';
                  return (
                    <div
                      key={i}
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shadow ${bg}`}
                    >
                      {b}
                    </div>
                  );
                })
              )}
            </div>

            {/* Floating Synced Toast */}
            {syncedToast && (
              <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-[#1E293B] border border-slate-700 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold text-white shadow-xl z-20">
                <CheckCircle2 size={13} className="text-[#5EEAD4]" /> Synced
              </div>
            )}

            {/* Scoring Keypad */}
            <div className="mt-auto bg-white text-slate-900 rounded-t-3xl overflow-hidden shadow-2xl">
              <div className="grid grid-cols-4 border-b border-slate-200 text-center font-bold">
                <button
                  onClick={() => handleBallScore('0', 0)}
                  className="py-4 text-xl border-r border-slate-200 hover:bg-slate-50 cursor-pointer"
                >
                  0
                </button>
                <button
                  onClick={() => handleBallScore('1', 1)}
                  className="py-4 text-xl border-r border-slate-200 hover:bg-slate-50 cursor-pointer"
                >
                  1
                </button>
                <button
                  onClick={() => handleBallScore('2', 2)}
                  className="py-4 text-xl border-r border-slate-200 hover:bg-slate-50 cursor-pointer"
                >
                  2
                </button>
                <button
                  onClick={handleUndo}
                  className="py-4 text-sm font-extrabold text-[#007F78] hover:bg-slate-50 cursor-pointer"
                >
                  UNDO
                </button>
              </div>

              <div className="grid grid-cols-4 border-b border-slate-200 text-center font-bold">
                <button
                  onClick={() => handleBallScore('3', 3)}
                  className="py-4 text-xl border-r border-slate-200 hover:bg-slate-50 cursor-pointer"
                >
                  3
                </button>
                <button
                  onClick={() => handleBallScore('4', 4)}
                  className="py-3 border-r border-slate-200 hover:bg-slate-50 cursor-pointer"
                >
                  <span className="text-xl block">4</span>
                  <span className="text-[10px] text-slate-400 font-normal">Four</span>
                </button>
                <button
                  onClick={() => handleBallScore('6', 6)}
                  className="py-3 border-r border-slate-200 hover:bg-slate-50 cursor-pointer"
                >
                  <span className="text-xl block">6</span>
                  <span className="text-[10px] text-slate-400 font-normal">Six</span>
                </button>
                <button
                  onClick={() => handleBallScore('5', 5)}
                  className="py-4 text-sm font-extrabold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  5, 7
                </button>
              </div>

              <div className="grid grid-cols-4 border-b border-slate-200 text-center font-bold text-sm">
                <button
                  onClick={() => handleBallScore('WD', 1, false)}
                  className="py-4 border-r border-slate-200 hover:bg-slate-50 cursor-pointer"
                >
                  WD
                </button>
                <button
                  onClick={() => handleBallScore('NB', 1, false)}
                  className="py-4 border-r border-slate-200 hover:bg-slate-50 cursor-pointer"
                >
                  NB
                </button>
                <button
                  onClick={() => handleBallScore('BYE', 1, true)}
                  className="py-4 border-r border-slate-200 hover:bg-slate-50 cursor-pointer"
                >
                  BYE
                </button>
                <button
                  onClick={() => handleBallScore('LB', 1, true)}
                  className="py-4 hover:bg-slate-50 cursor-pointer"
                >
                  LB
                </button>
              </div>

              {/* OUT Action */}
              <button
                onClick={() => handleBallScore('OUT', 0, true)}
                className="w-full py-3.5 bg-red-50 hover:bg-red-100 text-[#DC2626] font-black tracking-widest text-sm border-b border-slate-200 cursor-pointer"
              >
                OUT
              </button>

              {/* Bottom Shortcuts Bar */}
              <button
                onClick={() => setIsShortcutsOpen(true)}
                className="w-full py-2.5 bg-[#64748B] hover:bg-[#475569] text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Scoring shortcuts</span>
                <ChevronUp size={16} />
              </button>
            </div>

            {/* Over Complete Sheet */}
            {isOverCompleteOpen && (
              <div className="absolute inset-0 bg-black/70 flex flex-col justify-end z-40 p-4">
                <div className="bg-white text-slate-900 rounded-3xl p-5 shadow-2xl">
                  <h3 className="text-lg font-bold text-red-600 mb-3">Over complete</h3>
                  <div className="grid grid-cols-4 gap-2 bg-slate-100 rounded-2xl p-3 text-center mb-4">
                    <div>
                      <div className="text-xl font-black text-slate-900">
                        {currentBalls.reduce((acc, b) => acc + (parseInt(b) || (b === 'WD' || b === 'NB' ? 1 : 0)), 0)}
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase">Runs</div>
                    </div>
                    <div>
                      <div className="text-xl font-black text-slate-900">1</div>
                      <div className="text-[10px] text-slate-500 uppercase">Overs</div>
                    </div>
                    <div>
                      <div className="text-xl font-black text-slate-900">
                        {currentBalls.filter((b) => b === 'W').length}
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase">Wickets</div>
                    </div>
                    <div>
                      <div className="text-xl font-black text-slate-900">
                        {currentBalls.filter((b) => b === 'WD' || b === 'NB').length}
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase">Extras</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mb-4">End of over by Rafah</p>

                  <button
                    onClick={handleNextOver}
                    className="w-full py-3.5 bg-[#007F78] hover:bg-[#005F5A] text-white font-bold rounded-xl shadow mb-2 text-sm cursor-pointer"
                  >
                    Start next over
                  </button>

                  <button
                    onClick={() => setIsOverCompleteOpen(false)}
                    className="w-full py-2 text-xs font-bold text-[#007F78] hover:underline cursor-pointer"
                  >
                    Continue this over
                  </button>
                </div>
              </div>
            )}

            {/* Shortcuts Sheet */}
            {isShortcutsOpen && (
              <div className="absolute inset-0 bg-black/70 flex flex-col justify-end z-40 p-4">
                <div className="bg-white text-slate-900 rounded-3xl p-5 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                    <span className="font-bold text-sm text-slate-700">Select a shortcut</span>
                    <button
                      onClick={() => setIsShortcutsOpen(false)}
                      className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-center text-xs">
                    <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-100 cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                        <HelpCircle size={18} />
                      </div>
                      <span>Need Help</span>
                    </div>

                    <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-100 cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                        <FileText size={18} />
                      </div>
                      <span>Match Rules</span>
                    </div>

                    <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-100 cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                        <Users size={18} />
                      </div>
                      <span>Change Scorer</span>
                    </div>

                    <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-100 cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                        <Shield size={18} />
                      </div>
                      <span>Change Squad</span>
                    </div>

                    <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-100 cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                        <Trophy size={18} />
                      </div>
                      <span>Full Scorecard</span>
                    </div>

                    <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-100 cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                        <Clock size={18} />
                      </div>
                      <span>Match Overs</span>
                    </div>

                    <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-100 cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                        <RotateCcw size={18} />
                      </div>
                      <span>Replace Batters</span>
                    </div>

                    <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-100 cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                        <Plus size={18} />
                      </div>
                      <span>Bonus Runs</span>
                    </div>
                  </div>

                  <div className="text-center mt-5">
                    <button
                      onClick={() => setIsShortcutsOpen(false)}
                      className="text-xs font-bold text-[#007F78] hover:underline cursor-pointer"
                    >
                      More shortcuts
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* VIEW 2: MAIN TABS CONTAINER */
          <div className="flex flex-col flex-1">
            {/* Matches Tab */}
            {activeTab === 'matches' && (
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-black text-white">Live Matches</h1>
                  <span className="text-xs bg-[#007F78]/20 border border-[#007F78]/50 text-[#5EEAD4] px-2.5 py-1 rounded-full font-bold">
                    {matches.length} Matches
                  </span>
                </div>

                <div className="space-y-3">
                  {matches.map((m) => (
                    <div
                      key={m.matchId}
                      className="bg-[#111C34] border border-[#1E293B] rounded-2xl p-4 shadow-lg hover:border-[#007F78]/60 transition"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                        <span className="font-mono">Match #{m.matchId}</span>
                        <span className="px-2 py-0.5 rounded-full bg-red-600/30 text-red-400 font-bold uppercase text-[10px]">
                          {m.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between my-2">
                        <div className="font-black text-base text-white">
                          {m.team1Name} <span className="text-slate-500 font-normal">vs</span>{' '}
                          {m.team2Name}
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-black text-emerald-400">
                            {m.runs}/{m.wickets}
                          </div>
                          <div className="text-xs text-slate-400">Overs: {m.overs}</div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between">
                        <span className="text-xs text-slate-400">{m.summary || 'League Match'}</span>
                        <button
                          onClick={() => setActiveScoringMatch(m)}
                          className="px-3.5 py-1.5 bg-[#007F78] hover:bg-[#005F5A] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Play size={12} /> Live Scoring
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Teams Tab */}
            {activeTab === 'teams' && (
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-black text-white">Teams & Squads</h1>
                  <button
                    onClick={() => setIsAddTeamModalOpen(true)}
                    className="px-3 py-1.5 bg-[#007F78] hover:bg-[#005F5A] text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={14} /> Add Team
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Quick search teams or captains..."
                  value={teamsSearch}
                  onChange={(e) => setTeamsSearch(e.target.value)}
                  className="w-full bg-[#111C34] border border-[#1E293B] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#007F78]"
                />

                <div className="space-y-3">
                  {teams
                    .filter(
                      (t) =>
                        t.name.toLowerCase().includes(teamsSearch.toLowerCase()) ||
                        t.captainName.toLowerCase().includes(teamsSearch.toLowerCase())
                    )
                    .map((t) => (
                      <div
                        key={t.id}
                        className="bg-[#111C34] border border-[#1E293B] rounded-2xl p-4 shadow"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#007F78] to-teal-400 text-white font-black flex items-center justify-center text-sm">
                            {t.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-sm">{t.name}</h3>
                            <p className="text-xs text-slate-400">
                              Captain: {t.captainName} • {t.city || 'Hyderabad'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Academy Tab */}
            {activeTab === 'academy' && (
              <div className="p-4 space-y-4">
                <h1 className="text-2xl font-black text-white">Match Day Academy</h1>
                <div className="bg-[#111C34] border border-[#1E293B] rounded-2xl p-5 shadow-lg space-y-3">
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-400/20 text-yellow-300 rounded-full text-xs font-semibold">
                    <Sparkles size={12} /> Elite Coaching Program
                  </div>
                  <h2 className="text-lg font-bold text-white">English Willow Bat Customizer & Masterclasses</h2>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Book dedicated batting simulator sessions, video biomechanics analysis, and professional bowling machine turf lanes.
                  </p>
                  <div className="pt-2 text-xs text-slate-400">
                    📍 Gachibowli Sports Complex, Hyderabad
                  </div>
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="p-4 space-y-4">
                <h1 className="text-2xl font-black text-white">Profile</h1>
                <div className="bg-[#111C34] border border-[#1E293B] rounded-2xl p-5 shadow space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#007F78] text-white font-bold flex items-center justify-center text-lg">
                      AM
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">Arfaz Mohammad</h3>
                      <p className="text-xs text-[#5EEAD4]">Pro Batsman | Elite Match Day Member</p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-[#1E293B] text-xs text-slate-400 space-y-1">
                    <p>Phone: +91 7680922101</p>
                    <p>Email: arfaz3838@gmail.com</p>
                    <p>Role: Captain & Official Scorer</p>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Tab Navigation Bar */}
            <nav className="mt-auto bg-[#111C34] border-t border-[#1E293B] px-6 py-2.5 flex items-center justify-between text-[11px] font-bold">
              <button
                onClick={() => setActiveTab('matches')}
                className={`flex flex-col items-center gap-1 cursor-pointer transition ${
                  activeTab === 'matches' ? 'text-[#5EEAD4]' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Trophy size={18} />
                <span>Matches</span>
              </button>

              <button
                onClick={() => setActiveTab('teams')}
                className={`flex flex-col items-center gap-1 cursor-pointer transition ${
                  activeTab === 'teams' ? 'text-[#5EEAD4]' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users size={18} />
                <span>Teams</span>
              </button>

              <button
                onClick={() => setActiveTab('academy')}
                className={`flex flex-col items-center gap-1 cursor-pointer transition ${
                  activeTab === 'academy' ? 'text-[#5EEAD4]' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Award size={18} />
                <span>Academy</span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`flex flex-col items-center gap-1 cursor-pointer transition ${
                  activeTab === 'profile' ? 'text-[#5EEAD4]' : 'text-slate-400 hover:text-white'
                }`}
              >
                <User size={18} />
                <span>Profile</span>
              </button>
            </nav>
          </div>
        )}
      </main>

      {/* Add Team Modal */}
      {isAddTeamModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#111C34] border border-[#1E293B] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-white text-base mb-3">Create New Team</h3>
            <form onSubmit={handleCreateTeamSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 font-bold block mb-1">
                  Team Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nizampet Warriors"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full bg-[#0B1220] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-bold block mb-1">
                  Captain Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Shaik Arfaz"
                  value={newCaptainName}
                  onChange={(e) => setNewCaptainName(e.target.value)}
                  className="w-full bg-[#0B1220] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddTeamModalOpen(false)}
                  className="flex-1 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#007F78] hover:bg-[#005F5A] text-white text-xs font-bold rounded-xl"
                >
                  Save Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
