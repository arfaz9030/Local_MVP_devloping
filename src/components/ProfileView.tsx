import React from 'react';
import { AuthUser } from '../types';
import { User, Phone, CheckCircle2, Shield, LogOut, RotateCcw, Smartphone, Monitor } from 'lucide-react';

interface ProfileViewProps {
  user: AuthUser | null;
  onLogout: () => void;
  onReopenOnboarding: () => void;
  isMobileFrame: boolean;
  onToggleFrame: () => void;
  matchesCount: number;
  teamsCount: number;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onLogout,
  onReopenOnboarding,
  isMobileFrame,
  onToggleFrame,
  matchesCount,
  teamsCount,
}) => {
  return (
    <div id="profile-view" className="space-y-4 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Player Profile
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Account details & local application settings
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-[#111C34] border border-[#1E293B] rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#1d978e] to-sky-500 text-white flex items-center justify-center font-black text-2xl shadow-lg">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
          </div>

          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              {user?.name || 'Local Player'}
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#1d978e] bg-[#1d978e]/10 border border-[#1d978e]/30 px-2 py-0.5 rounded-full">
                <CheckCircle2 size={11} /> Verified
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              <Phone size={12} className="text-slate-500" />
              {user?.mobileNumber && user.mobileNumber !== 'N/A'
                ? `+91 ${user.mobileNumber}`
                : 'Guest Access Session'}
            </p>
            <p className="text-[10px] text-slate-500 font-mono mt-1">
              User ID: {user?.userId || 101} • Role: Captain & Scorer
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-slate-800">
          <div className="bg-[#0B1220] rounded-xl p-3 text-center border border-slate-800/80">
            <span className="text-2xl font-black text-blue-400">{matchesCount}</span>
            <span className="block text-[11px] font-semibold text-slate-400 mt-0.5">
              Active Matches
            </span>
          </div>

          <div className="bg-[#0B1220] rounded-xl p-3 text-center border border-slate-800/80">
            <span className="text-2xl font-black text-emerald-400">{teamsCount}</span>
            <span className="block text-[11px] font-semibold text-slate-400 mt-0.5">
              Registered Teams
            </span>
          </div>
        </div>
      </div>

      {/* Application Settings & View Mode */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-4.5 space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Display & Frame Mode
        </h3>

        <div className="flex items-center justify-between p-3 bg-[#0B1220] rounded-xl border border-slate-800">
          <div className="flex items-center gap-2.5">
            {isMobileFrame ? (
              <Smartphone size={18} className="text-[#1d978e]" />
            ) : (
              <Monitor size={18} className="text-blue-400" />
            )}
            <div>
              <span className="text-xs font-bold text-white block">
                {isMobileFrame ? 'Mobile App Shell Frame' : 'Full Width Responsive'}
              </span>
              <span className="text-[10px] text-slate-400">
                {isMobileFrame
                  ? 'Simulating native Expo/React Native mobile viewport'
                  : 'Stretching across web viewport'}
              </span>
            </div>
          </div>

          <button
            onClick={onToggleFrame}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition cursor-pointer"
          >
            Switch
          </button>
        </div>
      </div>

      {/* Account Actions */}
      <div className="space-y-2.5 pt-2">
        <button
          onClick={onReopenOnboarding}
          className="w-full py-3 bg-[#1E293B] hover:bg-slate-800 text-slate-200 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition cursor-pointer border border-slate-700/60"
        >
          <RotateCcw size={15} /> Replay Onboarding / Login Flow
        </button>

        <button
          onClick={onLogout}
          className="w-full py-3 bg-red-950/40 hover:bg-red-900/60 border border-red-900/50 text-red-300 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <LogOut size={15} /> Reset Session / Sign Out
        </button>
      </div>
    </div>
  );
};
