import React, { useState, useEffect } from 'react';
import { TabType, Match, Team, AuthUser, MatchStatus, Player } from './types';
import { MatchList } from './components/MatchList';
import { MatchDetail } from './components/MatchDetail';
import { TeamsView } from './components/TeamsView';
import { AcademyView } from './components/AcademyView';
import { ProfileView } from './components/ProfileView';
import { NavigationTabBar } from './components/NavigationTabBar';
import { CreateMatchModal } from './components/CreateMatchModal';
import { AddScoreModal } from './components/AddScoreModal';
import { ShareScorePoster } from './components/ShareScorePoster';
import { OnboardingModal } from './components/OnboardingModal';
import {
  getStoredMatches,
  saveStoredMatches,
  getStoredTeams,
  saveStoredTeams,
  getStoredUser,
  saveStoredUser,
} from './services/storageService';
import { Trophy, Smartphone, Monitor } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('matches');
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);

  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [isCreateMatchOpen, setIsCreateMatchOpen] = useState(false);
  const [isAddScoreOpen, setIsAddScoreOpen] = useState(false);
  const [isSharePosterOpen, setIsSharePosterOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isMobileFrame, setIsMobileFrame] = useState(false);

  // Load initial data from localStorage
  useEffect(() => {
    const loadedMatches = getStoredMatches();
    const loadedTeams = getStoredTeams();
    const loadedUser = getStoredUser();

    setMatches(loadedMatches);
    setTeams(loadedTeams);
    setUser(loadedUser);

    if (!loadedUser) {
      setIsOnboardingOpen(true);
    }
  }, []);

  // Update matches state & storage
  const handleUpdateMatches = (updatedMatches: Match[]) => {
    setMatches(updatedMatches);
    saveStoredMatches(updatedMatches);
  };

  // Update teams state & storage
  const handleUpdateTeams = (updatedTeams: Team[]) => {
    setTeams(updatedTeams);
    saveStoredTeams(updatedTeams);
  };

  // Add a new match
  const handleCreateMatch = (newMatch: Match) => {
    const updated = [newMatch, ...matches];
    handleUpdateMatches(updated);
    setSelectedMatchId(newMatch.matchId);
  };

  // Update match score
  const handleSaveScore = (
    matchId: string,
    runs: number,
    wickets: number,
    overs: number,
    status?: MatchStatus
  ) => {
    const updated = matches.map((m) => {
      if (m.matchId === matchId) {
        return {
          ...m,
          runs,
          wickets,
          overs,
          status: status || m.status,
          lastUpdated: 'Just now',
        };
      }
      return m;
    });
    handleUpdateMatches(updated);
    setIsAddScoreOpen(false);
  };

  // Quick incremental score on detail screen
  const handleQuickScore = (runsAdd: number, isWicket?: boolean) => {
    if (!selectedMatchId) return;

    const updated = matches.map((m) => {
      if (m.matchId === selectedMatchId) {
        const nextRuns = m.runs + runsAdd;
        const nextWickets = isWicket ? Math.min(10, m.wickets + 1) : m.wickets;
        
        // Advance overs slightly or record ball
        const currentBalls = Math.round((m.overs % 1) * 10);
        let nextOvers = m.overs;
        let ballToken = String(runsAdd);
        if (isWicket) ballToken = 'W';

        if (currentBalls >= 5) {
          nextOvers = Math.floor(m.overs) + 1;
        } else {
          nextOvers = Number((m.overs + 0.1).toFixed(1));
        }

        const recent = m.recentBalls ? [...m.recentBalls, ballToken] : [ballToken];

        return {
          ...m,
          runs: nextRuns,
          wickets: nextWickets,
          overs: nextOvers,
          recentBalls: recent.slice(-8),
          lastUpdated: 'Just now',
          status: nextWickets >= 10 ? ('COMPLETED' as MatchStatus) : m.status,
        };
      }
      return m;
    });
    handleUpdateMatches(updated);
  };

  // Add new team
  const handleAddTeam = (newTeam: Team) => {
    const updated = [newTeam, ...teams];
    handleUpdateTeams(updated);
  };

  // Add player to a team
  const handleAddPlayer = (teamId: string, player: Player) => {
    const updated = teams.map((t) => {
      if (t.id === teamId) {
        return {
          ...t,
          players: [...t.players, player],
        };
      }
      return t;
    });
    handleUpdateTeams(updated);
  };

  // User onboarding completion
  const handleOnboardingComplete = (completedUser: AuthUser) => {
    setUser(completedUser);
    saveStoredUser(completedUser);
    setIsOnboardingOpen(false);
  };

  // Logout handler
  const handleLogout = () => {
    setUser(null);
    saveStoredUser(null);
    setIsOnboardingOpen(true);
  };

  // Current selected match object
  const currentMatch = matches.find((m) => m.matchId === selectedMatchId);

  // Live match count for navigation badge
  const liveMatchCount = matches.filter((m) => m.status === 'LIVE').length;

  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100 flex flex-col items-center">
      {/* Top Device / Viewport Toggle Bar */}
      <header className="w-full bg-[#0B1322] border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between z-30 sticky top-0 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#007F78] to-teal-400 flex items-center justify-center text-white shadow-md">
            <Trophy size={16} />
          </div>
          <span className="font-black text-sm tracking-tight text-white flex items-center gap-1.5">
            CrickHeroes <span className="text-[10px] bg-[#007F78]/30 text-teal-300 px-1.5 py-0.5 rounded font-mono font-bold">MVP</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileFrame(!isMobileFrame)}
            title={isMobileFrame ? 'Expand to Full View' : 'Switch to Mobile Frame'}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700/60 transition cursor-pointer"
          >
            {isMobileFrame ? (
              <>
                <Monitor size={13} /> Full View
              </>
            ) : (
              <>
                <Smartphone size={13} /> Mobile Frame
              </>
            )}
          </button>

          {user ? (
            <button
              onClick={() => {
                setActiveTab('profile');
                setSelectedMatchId(null);
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-700/60 cursor-pointer"
            >
              <div className="w-5 h-5 rounded-full bg-[#007F78] text-white flex items-center justify-center text-[10px]">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="truncate max-w-[80px]">{user.name.split(' ')[0]}</span>
            </button>
          ) : (
            <button
              onClick={() => setIsOnboardingOpen(true)}
              className="text-[11px] font-bold bg-[#007F78] hover:bg-[#006660] text-white px-2.5 py-1 rounded-lg transition cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area: Responsive mobile simulator container or fluid layout */}
      <main
        className={`w-full transition-all duration-300 flex-1 flex flex-col ${
          isMobileFrame
            ? 'max-w-[420px] my-4 rounded-3xl border border-slate-800 bg-[#0B1220] shadow-2xl overflow-hidden min-h-[750px] relative'
            : 'max-w-2xl px-4 py-4 w-full pb-24'
        }`}
      >
        <div className={`flex-1 ${isMobileFrame ? 'p-4 pb-24 overflow-y-auto' : ''}`}>
          {/* Matches Tab */}
          {activeTab === 'matches' && (
            <>
              {selectedMatchId && currentMatch ? (
                <MatchDetail
                  match={currentMatch}
                  onBack={() => setSelectedMatchId(null)}
                  onOpenAddScore={() => setIsAddScoreOpen(true)}
                  onOpenSharePoster={() => setIsSharePosterOpen(true)}
                  onQuickScore={handleQuickScore}
                />
              ) : (
                <MatchList
                  matches={matches}
                  onSelectMatch={(id) => setSelectedMatchId(id)}
                  onCreateMatch={() => setIsCreateMatchOpen(true)}
                />
              )}
            </>
          )}

          {/* Teams Tab */}
          {activeTab === 'teams' && (
            <TeamsView
              teams={teams}
              onAddTeam={handleAddTeam}
              onAddPlayer={handleAddPlayer}
            />
          )}

          {/* Academy Tab */}
          {activeTab === 'academy' && <AcademyView />}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <ProfileView
              user={user}
              onLogout={handleLogout}
              onReopenOnboarding={() => setIsOnboardingOpen(true)}
              isMobileFrame={isMobileFrame}
              onToggleFrame={() => setIsMobileFrame(!isMobileFrame)}
              matchesCount={matches.length}
              teamsCount={teams.length}
            />
          )}
        </div>

        {/* Bottom Tab Navigation */}
        <NavigationTabBar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setSelectedMatchId(null);
          }}
          liveMatchCount={liveMatchCount}
        />
      </main>

      {/* Create Match Modal */}
      <CreateMatchModal
        isOpen={isCreateMatchOpen}
        onClose={() => setIsCreateMatchOpen(false)}
        onCreate={handleCreateMatch}
      />

      {/* Add / Update Score Modal */}
      {currentMatch && (
        <AddScoreModal
          match={currentMatch}
          isOpen={isAddScoreOpen}
          onClose={() => setIsAddScoreOpen(false)}
          onSaveScore={handleSaveScore}
        />
      )}

      {/* Share Scorecard Poster */}
      {currentMatch && (
        <ShareScorePoster
          match={currentMatch}
          isOpen={isSharePosterOpen}
          onClose={() => setIsSharePosterOpen(false)}
        />
      )}

      {/* Onboarding & Authentication Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={handleOnboardingComplete}
        onClose={() => setIsOnboardingOpen(false)}
      />
    </div>
  );
}
