import React, { useState } from 'react';
import { ACADEMY_INFO } from '../data/mockData';
import { Phone, MessageSquare, MapPin, CheckCircle2, Award, Calendar, Sparkles, Clock, Check } from 'lucide-react';

export const AcademyView: React.FC = () => {
  const [inquirySent, setInquirySent] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState('Weekend Morning (6:00 AM - 9:00 AM)');

  const handleCall = () => {
    window.open(`tel:${ACADEMY_INFO.contact.phone}`, '_self');
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent('Hi, I am interested in joining CrickHero Elite Academy training batches.');
    window.open(`https://wa.me/917680922101?text=${msg}`, '_blank');
  };

  const handleBookTrial = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySent(true);
    setTimeout(() => setInquirySent(false), 3500);
  };

  return (
    <div id="academy-view" className="space-y-4 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          {ACADEMY_INFO.name}
        </h1>
        <p className="text-xs text-sky-400 font-semibold mt-0.5">
          {ACADEMY_INFO.tagline}
        </p>
      </div>

      {/* Featured Masterclass Hero Card matching original screen */}
      <div className="bg-[#111C34] border border-[#1E293B] rounded-3xl overflow-hidden shadow-xl">
        <div className="relative h-44 w-full">
          <img
            src={ACADEMY_INFO.masterclass.imageUrl}
            alt="Cricket Training Masterclass"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111C34] via-transparent to-black/40" />
          
          <span className="absolute top-3 left-3 px-3 py-1 bg-red-600 text-white text-[10px] font-extrabold rounded-full uppercase tracking-wider shadow-md">
            FEATURED
          </span>

          <div className="absolute bottom-2 left-4 right-4">
            <h2 className="text-xl font-extrabold text-white">
              {ACADEMY_INFO.masterclass.title}
            </h2>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <p className="text-xs text-slate-300 leading-relaxed">
            {ACADEMY_INFO.masterclass.description}
          </p>

          <div className="bg-[#0B1220] border border-slate-800 rounded-xl p-3 flex items-start gap-2.5">
            <Award className="text-yellow-400 shrink-0 mt-0.5" size={16} />
            <div>
              <span className="text-[11px] font-bold text-slate-200 block">Lead Mentor</span>
              <span className="text-[11px] text-slate-400">{ACADEMY_INFO.masterclass.coach}</span>
            </div>
          </div>
        </div>
      </div>

      {/* About Academy Card */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-4.5 space-y-3">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            About Academy
          </h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {ACADEMY_INFO.about}
          </p>
        </div>

        <div className="pt-2 border-t border-slate-800">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <MapPin size={13} className="text-red-400" /> Location
          </h4>
          <p className="text-xs text-slate-400">
            {ACADEMY_INFO.location}
          </p>
        </div>

        <div className="pt-2 border-t border-slate-800">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Training Highlights
          </h4>
          <ul className="space-y-1.5">
            {ACADEMY_INFO.highlights.map((h, i) => (
              <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                <CheckCircle2 size={13} className="text-[#1d978e] shrink-0 mt-0.5" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Elite Training Centres */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Elite Training Centres
        </h3>
        <div className="space-y-2">
          {ACADEMY_INFO.centers.map((center, idx) => (
            <div key={idx} className="bg-[#111C34] border border-slate-800 rounded-xl p-3.5">
              <h4 className="text-xs font-bold text-white">{center.name}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">{center.address}</p>
              <div className="flex items-center gap-1 mt-2 text-[10px] font-semibold text-emerald-400">
                <Clock size={11} /> Timings: {center.timing}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Booking Form */}
      <div className="bg-[#0F172A] border border-[#1d978e]/30 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#1d978e]">
          <Calendar size={14} /> Schedule a Free Assessment Trial
        </div>

        {inquirySent ? (
          <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <Check size={16} /> Trial session request confirmed! Academy coach will contact you.
          </div>
        ) : (
          <form onSubmit={handleBookTrial} className="space-y-2.5">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Select Training Batch</label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="w-full bg-[#020617] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#1d978e]"
              >
                <option>Morning Batch (6:00 AM - 9:00 AM)</option>
                <option>Evening Batch (4:00 PM - 7:30 PM)</option>
                <option>Weekend Tournament Scorer Batch</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#1d978e] hover:bg-[#188078] text-white font-bold rounded-xl text-xs transition cursor-pointer"
            >
              Request Free Trial Pass
            </button>
          </form>
        )}
      </div>

      {/* Action Buttons matching original screen */}
      <div className="space-y-2.5 pt-2">
        <button
          onClick={handleCall}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition cursor-pointer"
        >
          <Phone size={16} /> Call Academy Hotline (+91 76809 22101)
        </button>

        <button
          onClick={handleWhatsApp}
          className="w-full py-3 bg-[#128C7E] hover:bg-[#0f7a6e] text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
        >
          <MessageSquare size={16} /> WhatsApp Enquiry
        </button>

        <p className="text-[11px] text-center text-slate-500 pt-1">
          MVP Version — Academy training schedules & slots synced with Gachibowli turf.
        </p>
      </div>
    </div>
  );
};
