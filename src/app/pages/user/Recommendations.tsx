import { useState, useMemo, useEffect, useCallback, type FC } from 'react';
import { useNavigate, Link } from 'react-router';
import { useApp } from '@/app/context/AppContext';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import {
  Film, ArrowLeft, Brain, Sparkles, Users, TrendingUp,
  AlertTriangle, CheckCircle, Zap, Heart, Eye,
  Compass, Moon, Trophy, ChevronRight, ShieldCheck,
  ArrowRight, Clock, Minus, Plus,
} from 'lucide-react';
import { type Mood, MOOD_CONFIG } from '@/app/utils/recommendationEngine';

// ─── Constants ────────────────────────────────────────────────────────────────

const MOOD_ICONS: Record<Mood, FC<{ className?: string }>> = {
  pumped: Zap,
  romantic: Heart,
  mysterious: Eye,
  adventurous: Compass,
  chill: Moon,
  epic: Trophy,
};

const MOODS = Object.keys(MOOD_CONFIG) as Mood[];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreBar({ score, colorClass }: { score: number; colorClass: string }) {
  return (
    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${colorClass} transition-all duration-500`}
        style={{ width: `${Math.min(100, score)}%` }}
      />
    </div>
  );
}

function RiskGauge({ risk, level }: { risk: number; level: 'low' | 'medium' | 'high' }) {
  const color = level === 'low' ? '#10b981' : level === 'medium' ? '#f59e0b' : '#ef4444';
  const Icon = level === 'low' ? ShieldCheck : AlertTriangle;
  const label = level === 'low' ? 'Low Risk' : level === 'medium' ? 'Medium Risk' : 'High Risk';
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center border-4"
        style={{ borderColor: color, boxShadow: `0 0 20px ${color}40` }}
      >
        <span className="text-xl font-black" style={{ color }}>{risk}%</span>
      </div>
      <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color }}>
        <Icon className="w-4 h-4" />
        {label}
      </div>
    </div>
  );
}

function MoodDistributionRow({
  mood,
  count,
  total,
  groupSize,
  onDecrement,
  onIncrement,
  onSetCount,
}: {
  mood: Mood;
  count: number;
  total: number;
  groupSize: number;
  onDecrement: () => void;
  onIncrement: () => void;
  onSetCount: (n: number) => void;
}) {
  const cfg = MOOD_CONFIG[mood];
  const Icon = MOOD_ICONS[mood];
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const canIncrement = total < groupSize;
  const [inputVal, setInputVal] = useState(String(count));

  // Keep local input in sync when count changes externally (e.g. group size shrinks)
  useEffect(() => { setInputVal(String(count)); }, [count]);

  return (
    <div className={`
      rounded-xl p-4 border transition-all duration-200
      ${count > 0 ? `${cfg.bgClass} ${cfg.borderClass}` : 'bg-white/3 border-white/8'}
    `}>
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className={`
          w-10 h-10 rounded-xl flex items-center justify-center shrink-0
          bg-gradient-to-br ${cfg.gradient}
          ${count > 0 ? 'opacity-100' : 'opacity-40'} transition-opacity
        `}>
          <Icon className="w-5 h-5 text-white" />
        </div>

        {/* Label + bar */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-sm font-semibold ${count > 0 ? cfg.textClass : 'text-gray-500'}`}>
              {cfg.label}
            </span>
            <span className={`text-xs font-medium ${count > 0 ? cfg.textClass : 'text-gray-600'}`}>
              {count > 0 ? `${count} ${count === 1 ? 'person' : 'people'} · ${pct}%` : 'None'}
            </span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${cfg.gradient} transition-all duration-500`}
              style={{ width: total > 0 ? `${pct}%` : '0%' }}
            />
          </div>
          <p className="text-[10px] text-gray-600 mt-1.5 leading-tight">{cfg.description}</p>
        </div>

        {/* Counter */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onDecrement}
            disabled={count === 0}
            className={`
              w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-150
              ${count > 0
                ? `${cfg.borderClass} ${cfg.textClass} hover:${cfg.bgClass}`
                : 'border-white/10 text-gray-700 cursor-not-allowed'}
            `}
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={inputVal}
            onChange={e => {
              const raw = e.target.value.replace(/\D/g, '');
              setInputVal(raw);
              const n = parseInt(raw);
              if (!isNaN(n)) {
                // clamp to available space: can't exceed groupSize - (total - count)
                const maxAllowed = groupSize - (total - count);
                onSetCount(Math.min(n, Math.max(0, maxAllowed)));
              }
            }}
            onBlur={() => {
              const n = parseInt(inputVal);
              const maxAllowed = groupSize - (total - count);
              const clamped = isNaN(n) ? 0 : Math.min(Math.max(0, n), Math.max(0, maxAllowed));
              onSetCount(clamped);
              setInputVal(String(clamped));
            }}
            className={`
              w-12 text-center text-base font-black bg-transparent outline-none
              border-b-2 transition-colors pb-0.5
              ${count > 0
                ? `${cfg.textClass} border-current/40 focus:border-current`
                : 'text-gray-500 border-white/10 focus:border-purple-500/40'}
              [appearance:textfield]
            `}
          />

          <button
            type="button"
            onClick={onIncrement}
            disabled={!canIncrement}
            className={`
              w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-150
              ${canIncrement
                ? `${cfg.borderClass} ${cfg.textClass} hover:${cfg.bgClass}`
                : 'border-white/10 text-gray-700 cursor-not-allowed'}
            `}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Recommendations() {
  const { currentUser, movies, bookings, getRecommendations } = useApp();
  const navigate = useNavigate();

  const [groupSize, setGroupSize] = useState(10);
  const [groupSizeInput, setGroupSizeInput] = useState('10');
  const [distribution, setDistribution] = useState<Record<Mood, number>>({
    pumped: 0, romantic: 0, mysterious: 0, adventurous: 0, chill: 0, epic: 0,
  });
  const [engineResult, setEngineResult] = useState<any>(null);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'user') navigate('/');
  }, [currentUser, navigate]);

  // When group size shrinks, cap distribution counts
  useEffect(() => {
    const total = Object.values(distribution).reduce((a, b) => a + b, 0);
    if (total > groupSize) {
      // Scale down proportionally
      const scale = groupSize / total;
      setDistribution(prev => {
        const scaled = {} as Record<Mood, number>;
        let remaining = groupSize;
        const entries = (Object.entries(prev) as [Mood, number][]).sort((a, b) => b[1] - a[1]);
        entries.forEach(([mood, count], i) => {
          if (i === entries.length - 1) {
            scaled[mood] = remaining;
          } else {
            const v = Math.floor(count * scale);
            scaled[mood] = v;
            remaining -= v;
          }
        });
        return scaled;
      });
    }
  }, [groupSize]);

  const decrement = useCallback((mood: Mood) => {
    setDistribution(prev => ({ ...prev, [mood]: Math.max(0, prev[mood] - 1) }));
  }, []);

  const increment = useCallback((mood: Mood) => {
    setDistribution(prev => {
      const total = Object.values(prev).reduce((a, b) => a + b, 0);
      if (total >= groupSize) return prev;
      return { ...prev, [mood]: prev[mood] + 1 };
    });
  }, [groupSize]);

  const setMoodCount = useCallback((mood: Mood, n: number) => {
    setDistribution(prev => {
      const totalOthers = Object.entries(prev)
        .filter(([m]) => m !== mood)
        .reduce((a, [, v]) => a + v, 0);
      const maxAllowed = groupSize - totalOthers;
      return { ...prev, [mood]: Math.min(Math.max(0, n), Math.max(0, maxAllowed)) };
    });
  }, [groupSize]);

  // ── Derived ──

  const totalAssigned = Object.values(distribution).reduce((a, b) => a + b, 0);
  const unassigned = groupSize - totalAssigned;
  const readyForResults = totalAssigned >= 2;

  const consensus = useMemo(() => {
    if (!readyForResults) return null;
    const sorted = (Object.entries(distribution) as [Mood, number][])
      .sort((a, b) => b[1] - a[1]);
    const [dominant, dominantCount] = sorted[0];
    if (dominantCount === 0) return null;
    const percent = Math.round((dominantCount / totalAssigned) * 100);
    return { distribution, dominant, dominantCount, percent, total: totalAssigned };
  }, [distribution, totalAssigned, readyForResults]);

  const userBookings = useMemo(
    () => bookings.filter(b => b.userName === currentUser?.name),
    [bookings, currentUser]
  );

  const userBookedGenres = useMemo(
    () => userBookings.map(b => movies.find(m => m.id === b.movieId)?.genre).filter(Boolean) as string[],
    [userBookings, movies]
  );

  useEffect(() => {
    if (!readyForResults || !currentUser) {
      setEngineResult(null);
      return;
    }
    getRecommendations(groupSize, distribution)
      .then(setEngineResult)
      .catch((error) => {
        console.error('Recommendation service unavailable', error);
        setEngineResult(null);
      });
  }, [currentUser, distribution, getRecommendations, groupSize, readyForResults]);

  const recommendations = useMemo(() => {
    if (!engineResult) return [];
    return engineResult.recommendations
      .map((result: any) => {
        const movie = movies.find(movie => movie.id === result.movieId);
        return movie ? { movie, score: { total: result.totalScore, moodScore: result.moodScore, personalScore: result.personalScore, popularityScore: result.popularityScore, reasons: result.reasons } } : null;
      })
      .filter(Boolean) as Array<{ movie: typeof movies[number]; score: { total: number; moodScore: number; personalScore: number; popularityScore: number; reasons: string[] } }>;
  }, [engineResult, movies]);

  const topRec = recommendations[0];

  const riskResult = engineResult?.cancellationRisk || null;

  const personalizedPicks = useMemo(() => {
    const genreFreq: Record<string, number> = {};
    userBookedGenres.forEach(g => { genreFreq[g] = (genreFreq[g] || 0) + 1; });
    const unbooked = movies.filter(m => !userBookings.find(b => b.movieId === m.id));
    return (unbooked.length ? unbooked : movies)
      .sort((a, b) => (genreFreq[b.genre] || 0) - (genreFreq[a.genre] || 0))
      .slice(0, 3);
  }, [movies, userBookings, userBookedGenres]);

  const dominantCfg = consensus ? MOOD_CONFIG[consensus.dominant] : null;

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="glass-card border-b border-purple-500/20 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/user/home">
              <Button variant="ghost" size="sm" className="hover:bg-purple-500/10 hover:text-purple-300 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <div className="h-5 w-px bg-purple-500/30" />
            <div className="flex items-center gap-2.5">
              <div className="bg-gradient-to-br from-red-500 to-purple-600 p-1.5 rounded-lg glow-red">
                <Film className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold bg-gradient-to-r from-red-500 to-purple-500 bg-clip-text text-transparent">
                Minema
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-gradient-to-r from-red-500/10 to-purple-600/10 px-3 py-1.5 rounded-full border border-purple-500/20">
            <Brain className="h-4 w-4 text-purple-400" />
            <span className="text-xs text-purple-300 font-medium hidden sm:inline">AI Recommendations</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">

        {/* Hero */}
        <section className="text-center space-y-4 pt-2">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500/15 to-purple-600/15 border border-purple-500/25 px-4 py-2 rounded-full">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="text-sm text-purple-300 font-medium">Mood-Aware · Group-Smart · ML-Powered</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
            <span className="text-white">Find your group's</span>
            <br />
            <span className="bg-gradient-to-r from-red-500 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              perfect movie match
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Set your group size and roughly distribute how everyone is feeling tonight.
            The ML engine handles the rest — no need to add 80 people one by one.
          </p>
        </section>

        {/* ── Group Setup ── */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-red-500/20 to-purple-600/20 p-2 rounded-lg border border-purple-500/30">
              <Users className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Set Up Your Group</h2>
              <p className="text-sm text-gray-400 mt-0.5">
                How big is the group, and roughly how is everyone feeling?
              </p>
            </div>
          </div>

          {/* Group size selector */}
          <div className="glass-card rounded-xl p-5 border border-purple-500/20">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="bg-purple-500/20 p-2.5 rounded-lg border border-purple-500/30">
                  <Users className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-white font-semibold">Total Group Size</p>
                  <p className="text-xs text-gray-500 mt-0.5">How many people are in your group?</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const next = Math.max(2, groupSize - 1);
                    setGroupSize(next);
                    setGroupSizeInput(String(next));
                  }}
                  className="w-10 h-10 rounded-xl border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 flex items-center justify-center transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={groupSizeInput}
                  onChange={e => {
                    const raw = e.target.value.replace(/\D/g, '');
                    setGroupSizeInput(raw);
                    const n = parseInt(raw);
                    if (!isNaN(n) && n >= 2 && n <= 500) setGroupSize(n);
                  }}
                  onBlur={() => {
                    const n = parseInt(groupSizeInput);
                    const clamped = isNaN(n) ? 2 : Math.max(2, Math.min(500, n));
                    setGroupSize(clamped);
                    setGroupSizeInput(String(clamped));
                  }}
                  className="w-20 text-center text-2xl font-black text-white bg-transparent
                             border-b-2 border-purple-500/40 focus:border-red-500/60 outline-none
                             transition-colors pb-1 [appearance:textfield]"
                />

                <button
                  type="button"
                  onClick={() => {
                    const next = Math.min(500, groupSize + 1);
                    setGroupSize(next);
                    setGroupSizeInput(String(next));
                  }}
                  className="w-10 h-10 rounded-xl border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 flex items-center justify-center transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>

                <span className="text-gray-400 text-sm">people</span>
              </div>
            </div>

            {/* Quick size presets */}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/8">
              <span className="text-xs text-gray-500 self-center mr-1">Quick:</span>
              {[5, 10, 20, 30, 50, 80, 100].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => { setGroupSize(n); setGroupSizeInput(String(n)); }}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150
                    ${groupSize === n
                      ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                      : 'bg-white/5 border-white/10 text-gray-500 hover:border-purple-500/30 hover:text-gray-300'
                    }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Mood distribution */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-300">
                Distribute moods across your group
              </p>
              {/* Running total */}
              <div className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all
                ${totalAssigned === groupSize
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                  : totalAssigned > 0
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                  : 'bg-white/5 border-white/10 text-gray-500'
                }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${totalAssigned === groupSize ? 'bg-emerald-400' : totalAssigned > 0 ? 'bg-amber-400' : 'bg-gray-600'}`} />
                {totalAssigned}/{groupSize} assigned
                {unassigned > 0 && totalAssigned > 0 && (
                  <span className="text-gray-500 font-normal">· {unassigned} undecided</span>
                )}
              </div>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              You don't need to be exact — just estimate the rough split. Undecided members won't affect the recommendation.
            </p>

            <div className="space-y-2.5">
              {MOODS.map(mood => (
                <MoodDistributionRow
                  key={mood}
                  mood={mood}
                  count={distribution[mood]}
                  total={totalAssigned}
                  groupSize={groupSize}
                  onDecrement={() => decrement(mood)}
                  onIncrement={() => increment(mood)}
                  onSetCount={n => setMoodCount(mood, n)}
                />
              ))}
            </div>
          </div>

          {!readyForResults && (
            <div className="flex items-start gap-2.5 text-sm text-gray-500 bg-white/3 border border-white/8 rounded-lg px-4 py-3">
              <Brain className="h-4 w-4 shrink-0 mt-0.5 text-purple-500" />
              Assign at least 2 people to any mood to unlock AI recommendations
            </div>
          )}
        </section>

        {/* ── Results ── */}
        {readyForResults && consensus && dominantCfg && (
          <>
            {/* Consensus Panel */}
            <section className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-red-500/20 to-purple-600/20 p-2 rounded-lg border border-purple-500/30">
                  <Brain className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Group Mood Consensus</h2>
                  <p className="text-sm text-gray-400 mt-0.5">
                    Aggregated across {totalAssigned} of {groupSize} members
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Dominant mood */}
                <div className="glass-card rounded-xl p-6 flex flex-col items-center justify-center gap-3 text-center">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${dominantCfg.gradient} flex items-center justify-center`}
                    style={{ boxShadow: `0 0 28px ${dominantCfg.glowColor}` }}
                  >
                    {(() => { const Icon = MOOD_ICONS[consensus.dominant]; return <Icon className="w-8 h-8 text-white" />; })()}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Dominant mood</p>
                    <p className={`text-xl font-black ${dominantCfg.textClass}`}>{dominantCfg.label}</p>
                    <p className="text-sm text-gray-400 mt-0.5">
                      {consensus.dominantCount} of {totalAssigned} members
                    </p>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${dominantCfg.gradient} transition-all duration-700`}
                      style={{ width: `${consensus.percent}%` }}
                    />
                  </div>
                  <p className={`text-3xl font-black ${dominantCfg.textClass}`}>{consensus.percent}%</p>
                </div>

                {/* Breakdown */}
                <div className="sm:col-span-2 glass-card rounded-xl p-5 space-y-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full breakdown</p>
                  {(Object.entries(consensus.distribution) as [Mood, number][])
                    .sort((a, b) => b[1] - a[1])
                    .filter(([, count]) => count > 0)
                    .map(([mood, count]) => {
                      const cfg = MOOD_CONFIG[mood];
                      const Icon = MOOD_ICONS[mood];
                      const pct = Math.round((count / totalAssigned) * 100);
                      return (
                        <div key={mood} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <div className={`flex items-center gap-1.5 font-medium ${cfg.textClass}`}>
                              <Icon className="w-3 h-3" />
                              {cfg.label}
                            </div>
                            <span className="text-gray-400">{count} people · {pct}%</span>
                          </div>
                          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${cfg.gradient} transition-all duration-700`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  {unassigned > 0 && (
                    <div className="pt-2 border-t border-white/8 flex items-center justify-between text-xs text-gray-600">
                      <span>Undecided / no preference</span>
                      <span>{unassigned} people</span>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* AI-Ranked Movies */}
            <section className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-red-500/20 to-purple-600/20 p-2 rounded-lg border border-purple-500/30">
                    <TrendingUp className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">AI-Ranked Movies</h2>
                    <p className="text-sm text-gray-400 mt-0.5">
                      Scored by mood fit · your history · popularity
                    </p>
                  </div>
                </div>
                <Badge className="bg-red-500/15 text-red-400 border-red-500/30 text-xs shrink-0">
                  {recommendations.length} ranked
                </Badge>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {recommendations.slice(0, 6).map(({ movie, score }, idx) => {
                  const isPrimary = idx === 0;
                  return (
                    <div
                      key={movie.id}
                      className={`
                        glass-card rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.01]
                        ${isPrimary
                          ? 'border-2 border-red-500/50 glow-red'
                          : 'border border-purple-500/20 hover:border-purple-500/40'
                        }
                      `}
                    >
                      <div className="flex">
                        <div className="w-28 sm:w-32 shrink-0 relative bg-black/50">
                          <img
                            src={movie.imageUrl}
                            alt={movie.title}
                            className="w-full h-full object-cover"
                            style={{ minHeight: '160px' }}
                          />
                          {isPrimary && (
                            <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                              #1 Pick
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#1a1a1a]/50" />
                        </div>

                        <div className="flex-1 p-4 flex flex-col gap-2.5 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-bold text-white text-sm leading-tight">{movie.title}</h3>
                              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                <span className="text-xs text-gray-400">{movie.genre}</span>
                                <span className="w-1 h-1 rounded-full bg-gray-600" />
                                <span className="text-xs text-gray-400">{movie.duration}</span>
                              </div>
                            </div>
                            <div className="shrink-0 text-right">
                              <div className={`text-2xl font-black bg-gradient-to-r ${dominantCfg.gradient} bg-clip-text text-transparent`}>
                                {score.total}%
                              </div>
                              <div className="text-[10px] text-gray-500">match</div>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            {[
                              { label: 'Mood', value: score.moodScore, max: 40, gradient: dominantCfg.gradient },
                              { label: 'History', value: score.personalScore, max: 30, gradient: 'from-purple-500 to-pink-500' },
                              { label: 'Popularity', value: score.popularityScore, max: 20, gradient: 'from-blue-500 to-cyan-400' },
                            ].map(bar => (
                              <div key={bar.label}>
                                <div className="flex items-center justify-between text-[10px] text-gray-500 mb-0.5">
                                  <span>{bar.label}</span>
                                  <span>{bar.value}/{bar.max}</span>
                                </div>
                                <ScoreBar score={(bar.value / bar.max) * 100} colorClass={bar.gradient} />
                              </div>
                            ))}
                          </div>

                          {score.reasons[0] && (
                            <p className="text-[11px] text-gray-400 italic leading-snug">{score.reasons[0]}</p>
                          )}

                          <Link to={`/user/movie-flow/${movie.id}`} className="mt-auto">
                            <Button
                              size="sm"
                              className={`w-full text-xs ${
                                isPrimary
                                  ? 'gradient-button glow-red border-0'
                                  : 'border border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20'
                              }`}
                            >
                              Book This Movie
                              <ArrowRight className="ml-1.5 h-3 w-3" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Cancellation Risk */}
            {riskResult && topRec && (
              <section className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-amber-500/20 to-orange-600/20 p-2 rounded-lg border border-amber-500/30">
                    <Brain className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Cancellation Risk Predictor</h2>
                    <p className="text-sm text-gray-400 mt-0.5">
                      ML estimate for "{topRec.movie.title}" with your group of {groupSize}
                    </p>
                  </div>
                </div>

                <div className="glass-card rounded-xl p-6 border border-purple-500/20">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <RiskGauge risk={riskResult.risk} level={riskResult.level} />
                      <p className="text-xs text-gray-500 text-center">Estimated cancellation probability</p>
                    </div>

                    <div className="md:col-span-2 space-y-4">
                      <p className="text-sm font-semibold text-gray-300">Contributing Factors</p>
                      <div className="space-y-2.5">
                        {riskResult.factors.map((f, i) => (
                          <div key={i} className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`w-2 h-2 rounded-full shrink-0 ${f.impact < 0 ? 'bg-emerald-400' : 'bg-red-400'}`} />
                              <span className="text-sm text-gray-300 truncate">{f.label}</span>
                            </div>
                            <span className={`text-sm font-bold shrink-0 ${f.impact < 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {f.impact > 0 ? '+' : ''}{f.impact}%
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className={`
                        mt-2 p-4 rounded-lg flex items-start gap-3 border
                        ${riskResult.level === 'low'
                          ? 'bg-emerald-500/10 border-emerald-500/30'
                          : riskResult.level === 'medium'
                          ? 'bg-amber-500/10 border-amber-500/30'
                          : 'bg-red-500/10 border-red-500/30'
                        }
                      `}>
                        {riskResult.level === 'low'
                          ? <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                          : <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${riskResult.level === 'high' ? 'text-red-400' : 'text-amber-400'}`} />
                        }
                        <p className="text-sm text-gray-300 leading-relaxed">{riskResult.suggestion}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </>
        )}

        {/* Personalized Picks */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-red-500/20 to-purple-600/20 p-2 rounded-lg border border-purple-500/30">
              <Sparkles className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {userBookedGenres.length > 0 ? 'Tailored For You' : 'Top Picks to Explore'}
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">
                {userBookedGenres.length > 0
                  ? 'Based on your personal booking history'
                  : 'Great starting points for your first group booking'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {personalizedPicks.map(movie => (
              <Link key={movie.id} to={`/user/movie/${movie.id}`}>
                <Card className="cinema-poster glass-card overflow-hidden border-purple-500/20 hover:border-purple-500/50 transition-all cursor-pointer group h-full">
                  <div className="aspect-[2/3] overflow-hidden bg-black/50">
                    <img
                      src={movie.imageUrl}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader className="pb-2 pt-4">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base text-white group-hover:text-purple-400 transition-colors leading-tight">
                        {movie.title}
                      </CardTitle>
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs shrink-0">
                        {movie.rating}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-400">{movie.genre}</span>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        {movie.duration}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 pb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">₹{movie.pricePerPerson}/person</span>
                      <Button size="sm" variant="ghost" className="text-purple-400 hover:text-white hover:bg-purple-500/20 px-2 py-1 h-auto text-xs">
                        View <ChevronRight className="h-3 w-3 ml-0.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="pb-6">
          <div className="glass-card rounded-2xl p-8 border border-purple-500/20 text-center space-y-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-purple-600/5 pointer-events-none" />
            <div className="relative">
              <Sparkles className="h-8 w-8 text-purple-400 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-white">Ready to book your group's night out?</h3>
              <p className="text-gray-400 mt-2 mb-5">
                Choose a movie and let Minema handle the rest — hall, time slot, and snacks included.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/user/select-movie">
                  <Button className="gradient-button glow-red border-0 px-6">
                    <Film className="mr-2 h-4 w-4" />
                    Browse All Movies
                  </Button>
                </Link>
                <Link to="/user/select-hall">
                  <Button variant="outline" className="border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500/50 px-6">
                    <Users className="mr-2 h-4 w-4" />
                    Browse Halls
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
