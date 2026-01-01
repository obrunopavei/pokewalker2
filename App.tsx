import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Check, Trophy, MapPin, Footprints, Zap, Package, Settings, X, Trash2, AlertTriangle, ArrowRight, Star, Construction, LayoutGrid, ArrowLeft, BookOpen, Globe, Gift, Flag, ChevronDown, ArrowUpDown, Calendar, History } from 'lucide-react';
import { POKEMON_DB, MILESTONES, ROUTE_ORDER, SPECIAL_ROUTES, POST_NATIONAL_ROUTES } from './constants';
import { PokemonEntry, Rarity } from './types';

// --- Utility Functions ---

/**
 * Performs a fuzzy match between a query and a target string.
 */
const fuzzyMatch = (query: string, target: string): boolean => {
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase().trim();
  
  if (q === '') return true;
  if (t.includes(q)) return true;

  let queryIdx = 0;
  let targetIdx = 0;
  while (queryIdx < q.length && targetIdx < t.length) {
    if (q[queryIdx] === t[targetIdx]) {
      queryIdx++;
    }
    targetIdx++;
  }
  return queryIdx === q.length;
};

const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

// --- Helper Components ---

const RarityBadge: React.FC<{ rarity: Rarity }> = ({ rarity }) => {
  const colors = {
    [Rarity.VeryCommon]: "bg-slate-100 text-slate-600 border-slate-200",
    [Rarity.Common]: "bg-gray-100 text-gray-700 border-gray-200",
    [Rarity.Rare]: "bg-blue-100 text-blue-700 border-blue-200",
    [Rarity.VeryRare]: "bg-purple-100 text-purple-700 border-purple-200",
  };

  return (
    <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded border ${colors[rarity] || colors[Rarity.Common]}`}>
      {rarity}
    </span>
  );
};

// --- Sub-Components ---

const ProgressBar: React.FC<{ currentPoints: number, isCompletionist: boolean, onClick: () => void }> = ({ currentPoints, isCompletionist, onClick }) => {
  const getPoints = (m: typeof MILESTONES[0]) => isCompletionist ? m.pointsCompletionist : m.pointsStandard;

  const nextMilestone = MILESTONES.find(m => getPoints(m) > currentPoints);
  const prevMilestone = [...MILESTONES].reverse().find(m => getPoints(m) <= currentPoints) || { id: 0, name: "Start", pointsStandard: 0, pointsCompletionist: 0, description: "", stopAt: "" };
  
  const targetPoints = nextMilestone ? getPoints(nextMilestone) : currentPoints;
  const prevPoints = getPoints(prevMilestone);
  const isMaxed = !nextMilestone;
  
  const range = targetPoints - prevPoints;
  const progressInRange = currentPoints - prevPoints;
  const percentage = isMaxed ? 100 : Math.min(100, Math.max(0, (progressInRange / range) * 100));

  return (
    <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-300">
      <div 
        onClick={onClick}
        className="max-w-5xl mx-auto px-4 py-4 cursor-pointer group hover:bg-gray-50/50 transition-colors rounded-b-xl"
        title="Click to view full milestone timeline"
      >
        <div className="flex justify-between items-end mb-2">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider group-hover:text-rose-600 transition-colors">Current Progress</p>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">{currentPoints.toLocaleString()}</span>
                <span className="text-sm text-gray-400 font-medium">pts</span>
            </div>
          </div>
          <div className="text-right max-w-[60%]">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider group-hover:text-rose-600 transition-colors">Next Milestone</p>
            <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-rose-600 truncate w-full text-right">
                    {isMaxed ? "All Milestones Completed!" : nextMilestone?.name}
                </span>
                {!isMaxed && nextMilestone && (
                    <p className="text-[10px] text-gray-500 truncate w-full text-right hidden sm:block">
                        {nextMilestone.description}
                    </p>
                )}
                {!isMaxed && (
                     <span className="text-xs text-gray-400">
                        {targetPoints.toLocaleString()} pts target
                     </span>
                )}
            </div>
          </div>
        </div>

        {/* Bar */}
        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner relative">
          <div 
            className="h-full bg-gradient-to-r from-rose-500 to-orange-500 transition-all duration-500 ease-out rounded-full relative"
            style={{ width: `${percentage}%` }}
          >
            <div className="absolute top-0 left-0 w-full h-full bg-white opacity-20 animate-[shimmer_2s_infinite]"></div>
          </div>
        </div>
        
        {/* Helper text under bar */}
        {!isMaxed && (
            <div className="mt-1 flex justify-between text-[10px] text-gray-400 font-medium">
                <span>{prevPoints} pts</span>
                <span>{targetPoints} pts</span>
            </div>
        )}
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/75 text-white px-3 py-1 rounded-full text-xs font-bold pointer-events-none">
            View All Milestones
        </div>
      </div>
    </div>
  );
};

const PokemonCard: React.FC<{ 
    pokemon: PokemonEntry; 
    caughtTimestamp?: number; 
    onToggle: (id: string) => void; 
}> = React.memo(({ pokemon, caughtTimestamp, onToggle }) => {
  const isChecked = !!caughtTimestamp;

  return (
    <div 
        onClick={() => onToggle(pokemon.id)}
        className={`
            group relative flex items-center p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none
            ${isChecked 
                ? 'bg-rose-50 border-rose-200 shadow-sm' 
                : 'bg-white border-gray-100 hover:border-gray-300 hover:shadow-md'
            }
        `}
    >
        {/* Checkbox Visual */}
        <div className={`
            flex-shrink-0 w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-colors
            ${isChecked ? 'bg-rose-500 border-rose-500' : 'bg-transparent border-gray-300 group-hover:border-rose-400'}
        `}>
            {isChecked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
        </div>

        {/* Image */}
        <div className="relative w-12 h-12 mr-4 flex-shrink-0">
            <img 
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.dexId}.png`}
                alt={pokemon.name}
                className={`w-full h-full object-contain transition-opacity ${isChecked ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}
                loading="lazy"
            />
        </div>

        {/* Info */}
        <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
                <span className={`font-bold truncate ${isChecked ? 'text-rose-900' : 'text-gray-800'}`}>
                    {pokemon.name}
                </span>
                {pokemon.gender !== '-' && (
                    <span className={`text-xs font-bold ${pokemon.gender === '♂' ? 'text-blue-500' : 'text-pink-500'}`}>
                        {pokemon.gender}
                    </span>
                )}
                <RarityBadge rarity={pokemon.rarity} />
            </div>
            
            <div className="flex flex-col gap-1 text-xs text-gray-500">
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                        <Footprints className="w-3 h-3" /> {pokemon.steps}
                    </span>
                    {pokemon.unlockMethod !== "Default" && (
                        <span className="flex items-center gap-1 truncate max-w-[100px]">
                            <Zap className="w-3 h-3" /> {pokemon.unlockMethod}
                        </span>
                    )}
                </div>
                {isChecked && (
                    <div className="text-[10px] text-rose-600 font-medium">
                        Caught: {formatDate(caughtTimestamp)}
                    </div>
                )}
            </div>
        </div>

        {/* Points */}
        <div className="flex-shrink-0 text-right ml-2">
            <span className={`block text-lg font-black ${isChecked ? 'text-rose-600' : 'text-gray-400'}`}>
                +{pokemon.points}
            </span>
        </div>
    </div>
  );
});

const SettingsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    isCompletionist: boolean;
    onToggleCompletionist: () => void;
    autoCollapsePostNational: boolean;
    onToggleAutoCollapse: () => void;
    onResetProgress: () => void;
    onGoHome: () => void;
    onOpenGuide: () => void;
    onOpenHistory: () => void;
}> = ({ 
    isOpen, 
    onClose, 
    isCompletionist, 
    onToggleCompletionist, 
    autoCollapsePostNational,
    onToggleAutoCollapse,
    onResetProgress, 
    onGoHome, 
    onOpenGuide,
    onOpenHistory
}) => {
    const [confirmReset, setConfirmReset] = useState(false);

    useEffect(() => {
        if (isOpen) setConfirmReset(false);
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Settings className="w-5 h-5" /> Settings
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-6 max-h-[80vh] overflow-y-auto">
                    
                    {/* Game Mode Settings */}
                    <div className="space-y-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h4 className="text-base font-semibold text-gray-900 mb-1">Completionist Mode</h4>
                                <p className="text-sm text-gray-500">
                                    Include "Special Event" routes and Pokémon. This increases point milestones significantly.
                                </p>
                            </div>
                            <button 
                                onClick={onToggleCompletionist}
                                className={`
                                    relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                                    ${isCompletionist ? 'bg-rose-600' : 'bg-gray-200'}
                                `}
                            >
                                <span className={`
                                    pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                                    ${isCompletionist ? 'translate-x-5' : 'translate-x-0'}
                                `} />
                            </button>
                        </div>
                        
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h4 className="text-base font-semibold text-gray-900 mb-1">Auto-collapse Post-National</h4>
                                <p className="text-sm text-gray-500">
                                    Automatically collapse Post-National Pokédex routes when the page loads.
                                </p>
                            </div>
                            <button 
                                onClick={onToggleAutoCollapse}
                                className={`
                                    relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                                    ${autoCollapsePostNational ? 'bg-rose-600' : 'bg-gray-200'}
                                `}
                            >
                                <span className={`
                                    pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                                    ${autoCollapsePostNational ? 'translate-x-5' : 'translate-x-0'}
                                `} />
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                         <button 
                            onClick={() => { onClose(); onOpenHistory(); }}
                            className="flex items-center justify-between w-full p-3 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg transition-colors group"
                        >
                            <span className="flex items-center gap-2 font-medium text-sm">
                                <History className="w-4 h-4" />
                                View Catch History
                            </span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>

                        <button 
                            onClick={() => { onClose(); onOpenGuide(); }}
                            className="flex items-center justify-between w-full p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors group"
                        >
                            <span className="flex items-center gap-2 font-medium text-sm">
                                <BookOpen className="w-4 h-4" />
                                How to unlock special routes?
                            </span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <h4 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                             <Trash2 className="w-4 h-4 text-red-500" /> Danger Zone
                        </h4>
                        
                        {!confirmReset ? (
                            <div className="flex items-center justify-between gap-4">
                                <p className="text-sm text-gray-500">
                                    Delete all saved checklist progress.
                                </p>
                                <button
                                    onClick={() => setConfirmReset(true)}
                                    className="px-4 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors text-sm whitespace-nowrap"
                                >
                                    Reset Progress
                                </button>
                            </div>
                        ) : (
                            <div className="bg-red-50 p-4 rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-grow">
                                        <p className="text-sm font-semibold text-red-900">Are you absolutely sure?</p>
                                        <p className="text-xs text-red-700 mt-1 mb-3">
                                            This will permanently uncheck all Pokémon.
                                        </p>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={onResetProgress}
                                                className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded shadow-sm hover:bg-red-700"
                                            >
                                                Yes, Reset
                                            </button>
                                            <button 
                                                onClick={() => setConfirmReset(false)}
                                                className="px-3 py-1.5 bg-white text-gray-600 text-xs font-bold rounded border border-gray-200 hover:bg-gray-50"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <button 
                            onClick={onGoHome}
                            className="w-full py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            Back to Home Screen
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- View: History/Calendar Page ---

const HistoryPage: React.FC<{
    caughtData: Record<string, number>;
    onBack: () => void;
}> = ({ caughtData, onBack }) => {
    
    // 1. Transform Data for Heatmap
    const { activityMap, days } = useMemo(() => {
        const map: Record<string, { count: number, ids: string[] }> = {};
        
        // Populate map from caughtData
        Object.entries(caughtData).forEach(([id, timestamp]) => {
            const dateKey = new Date(timestamp as number).toDateString(); // "Mon Jan 01 2024"
            if (!map[dateKey]) {
                map[dateKey] = { count: 0, ids: [] };
            }
            map[dateKey].count += 1;
            map[dateKey].ids.push(id);
        });

        // Generate grid days (e.g., last 3 months or based on range)
        // For simplicity, let's just do a list of dates that have activity, sorted descending
        const sortedDates = Object.keys(map).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        
        return { activityMap: map, days: sortedDates };
    }, [caughtData]);

    const [selectedDate, setSelectedDate] = useState<string | null>(days.length > 0 ? days[0] : null);

    const getIntensityClass = (count: number) => {
        if (count === 0) return "bg-gray-100 text-gray-400";
        if (count <= 2) return "bg-green-200 text-green-800 border-green-300";
        if (count <= 5) return "bg-green-400 text-green-900 border-green-500";
        return "bg-green-600 text-white border-green-700";
    };

    const selectedPokemons = useMemo(() => {
        if (!selectedDate || !activityMap[selectedDate]) return [];
        const ids = activityMap[selectedDate].ids;
        return POKEMON_DB.filter(p => ids.includes(p.id));
    }, [selectedDate, activityMap]);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
             <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
                    <button 
                        onClick={onBack}
                        className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Catch History</h1>
                        <p className="text-xs text-gray-500">
                           Total Caught: {Object.keys(caughtData).length.toLocaleString()}
                        </p>
                    </div>
                </div>
            </header>

            <div className="max-w-3xl mx-auto px-4 py-8">
                {/* Heatmap / Calendar View */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Activity Log
                    </h2>
                    
                    {days.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 text-sm">
                            No Pokémon caught yet. Start your journey!
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                             {days.map(dateStr => {
                                 const data = activityMap[dateStr];
                                 const isSelected = selectedDate === dateStr;
                                 const dateObj = new Date(dateStr);
                                 
                                 return (
                                     <button
                                        key={dateStr}
                                        onClick={() => setSelectedDate(dateStr)}
                                        className={`
                                            flex flex-col items-center justify-center p-3 rounded-lg border transition-all
                                            ${isSelected ? 'ring-2 ring-rose-500 ring-offset-2' : 'hover:scale-105'}
                                            ${getIntensityClass(data.count)}
                                        `}
                                     >
                                         <span className="text-xs font-bold uppercase opacity-80">
                                             {dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                         </span>
                                         <span className="text-lg font-black">
                                             {data.count}
                                         </span>
                                     </button>
                                 )
                             })}
                        </div>
                    )}
                </div>

                {/* Details View */}
                {selectedDate && selectedPokemons.length > 0 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                             Activity for {new Date(selectedDate as string).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </h3>
                        <div className="space-y-3">
                            {selectedPokemons.map(pokemon => (
                                <div key={pokemon.id} className="flex items-center bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mr-4">
                                        <img 
                                            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.dexId}.png`}
                                            alt={pokemon.name}
                                            className="w-8 h-8 object-contain"
                                        />
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">{pokemon.name}</div>
                                        <div className="text-xs text-gray-500 flex items-center gap-2">
                                            <span>{pokemon.route}</span>
                                            <span className="text-gray-300">•</span>
                                            <span className="text-rose-600 font-medium">+{pokemon.points} pts</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- View: Special Routes Guide ---

const GuideCard: React.FC<{
    name: string;
    icon: React.ReactNode;
    method: string;
    details: string;
    color: string;
}> = ({ name, icon, method, details, color }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${color} text-white`}>
                {icon}
            </div>
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{name}</h3>
                <span className="inline-block bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded mb-2">
                    {method}
                </span>
                <p className="text-sm text-gray-500 leading-relaxed">
                    {details}
                </p>
            </div>
        </div>
    </div>
);

const SpecialRoutesGuide: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
                    <button 
                        onClick={onBack}
                        className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900">Unlock Special Routes</h1>
                </div>
            </header>

            <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-indigo-800 text-sm">
                    <p className="flex items-start gap-2">
                        <Star className="w-5 h-5 flex-shrink-0" />
                        <span>
                            These routes are required for the <strong>Completionist Mode</strong>. 
                            Most of them were limited-time Wi-Fi events, but some can still be accessed via trade or specific in-game actions.
                        </span>
                    </p>
                </div>

                <div className="grid gap-4">
                    <GuideCard 
                        name="Beyond the Sea"
                        icon={<Globe className="w-5 h-5" />}
                        color="bg-blue-500"
                        method="International Trade"
                        details="Unlocked automatically after receiving a Pokémon from a different country via the GTS (Global Trade Station) or Wonder Trade."
                    />
                    
                    <GuideCard 
                        name="Night Sky's Edge"
                        icon={<Star className="w-5 h-5" />}
                        color="bg-purple-500"
                        method="Jirachi Trade"
                        details="Unlocked by trading any Jirachi into your game. Once the Jirachi is in your party or box, the route unlocks."
                    />

                    <GuideCard 
                        name="Yellow Forest"
                        icon={<Zap className="w-5 h-5" />}
                        color="bg-yellow-500"
                        method="Event Distribution"
                        details="Originally a Wi-Fi event (2010). Famous for containing Pikachu with Fly and Surf. Now only obtainable via save editing or DNS exploits."
                    />

                    <GuideCard 
                        name="Winner's Path"
                        icon={<Trophy className="w-5 h-5" />}
                        color="bg-red-500"
                        method="Event Distribution"
                        details="Originally a Wi-Fi event (2010). Contains Munchlax knowing Selfdestruct. Requires external tools to unlock today."
                    />

                    <GuideCard 
                        name="Rally"
                        icon={<Footprints className="w-5 h-5" />}
                        color="bg-orange-500"
                        method="Event Distribution"
                        details="Originally a Wi-Fi event (2010). A route filled with common Pokémon that are usually harder to find."
                    />

                    <GuideCard 
                        name="Sightseeing"
                        icon={<MapPin className="w-5 h-5" />}
                        color="bg-teal-500"
                        method="Event Distribution"
                        details="Originally a Wi-Fi event (2009). Features Torchic and other starter Pokémon not found in Johto."
                    />

                    <GuideCard 
                        name="Amity Meadow"
                        icon={<Gift className="w-5 h-5" />}
                        color="bg-pink-500"
                        method="Event Distribution"
                        details="Originally a Wi-Fi event (2010). A peaceful route containing many baby Pokémon."
                    />
                </div>
            </div>
        </div>
    );
};

// --- View: Milestones Page ---

const MilestonesPage: React.FC<{ 
    currentPoints: number; 
    isCompletionist: boolean; 
    onBack: () => void; 
}> = ({ currentPoints, isCompletionist, onBack }) => {
    
    // Helper to get target points based on mode
    const getTarget = (m: typeof MILESTONES[0]) => isCompletionist ? m.pointsCompletionist : m.pointsStandard;

    return (
        <div className="min-h-screen bg-white pb-20">
            <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
                    <button 
                        onClick={onBack}
                        className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Milestones</h1>
                        <p className="text-xs text-gray-500">
                            {currentPoints.toLocaleString()} points earned
                        </p>
                    </div>
                </div>
            </header>

            <div className="max-w-2xl mx-auto px-6 py-8">
                <div className="relative border-l-2 border-gray-100 pl-8 ml-3 space-y-12">
                    {MILESTONES.map((milestone, index) => {
                        const target = getTarget(milestone);
                        const isUnlocked = currentPoints >= target;
                        const isNext = !isUnlocked && (index === 0 || currentPoints >= getTarget(MILESTONES[index - 1]));

                        return (
                            <div key={milestone.id} className="relative">
                                {/* Dot on timeline */}
                                <div className={`
                                    absolute -left-[41px] top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors bg-white z-10
                                    ${isUnlocked 
                                        ? 'border-rose-500 bg-rose-50' 
                                        : isNext ? 'border-orange-400 animate-pulse' : 'border-gray-200'
                                    }
                                `}>
                                    {isUnlocked && <Check className="w-3 h-3 text-rose-500" strokeWidth={3} />}
                                    {isNext && <div className="w-2 h-2 rounded-full bg-orange-400" />}
                                </div>

                                <div className={`
                                    transition-all duration-300
                                    ${isUnlocked ? 'opacity-100' : isNext ? 'opacity-100' : 'opacity-60'}
                                `}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className={`text-lg font-bold ${isUnlocked ? 'text-gray-900' : isNext ? 'text-orange-600' : 'text-gray-600'}`}>
                                            {milestone.name}
                                        </h3>
                                        {isUnlocked && <span className="text-xs text-green-600 font-medium flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full"><Flag className="w-3 h-3"/> Unlocked</span>}
                                    </div>
                                    
                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                        <span className={`text-sm font-semibold px-2 py-0.5 rounded ${isUnlocked ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {target.toLocaleString()} pts
                                        </span>
                                        {milestone.stopAt && (
                                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                Stop: {milestone.stopAt}
                                            </span>
                                        )}
                                    </div>
                                    
                                    <p className="text-sm text-gray-500 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        {milestone.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                <div className="mt-12 text-center p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <Trophy className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
                    <p className="text-slate-600 font-medium">Keep walking to unlock them all!</p>
                </div>
            </div>
        </div>
    );
};

// --- View: Tracker (Main Application Logic) ---

interface TrackerProps {
    caughtData: Record<string, number>;
    isCompletionist: boolean;
    onTogglePokemon: (id: string) => void;
    onResetProgress: () => void;
    onToggleCompletionist: () => void;
    autoCollapsePostNational: boolean;
    onToggleAutoCollapse: () => void;
    onGoHome: () => void;
    onOpenGuide: () => void;
    onOpenHistory: () => void;
    onViewMilestones: () => void;
    currentPoints: number;
}

const Tracker: React.FC<TrackerProps> = ({ 
    caughtData, 
    isCompletionist, 
    onTogglePokemon, 
    onResetProgress, 
    onToggleCompletionist,
    autoCollapsePostNational,
    onToggleAutoCollapse,
    onGoHome, 
    onOpenGuide,
    onOpenHistory,
    onViewMilestones,
    currentPoints,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState<'all' | 'caught' | 'uncaught'>('all');
  const [sortState, setSortState] = useState<'default' | 'name' | 'completion' | 'points'>('default');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Initialize collapsed routes based on the setting
  const [collapsedRoutes, setCollapsedRoutes] = useState<Set<string>>(() => {
    return autoCollapsePostNational ? new Set(POST_NATIONAL_ROUTES) : new Set();
  });

  const toggleRoute = (route: string) => {
    setCollapsedRoutes(prev => {
        const next = new Set(prev);
        if (next.has(route)) next.delete(route);
        else next.add(route);
        return next;
    });
  };

  const groupedPokemon = useMemo(() => {
    const filtered = POKEMON_DB.filter(p => {
        if (!isCompletionist && SPECIAL_ROUTES.includes(p.route)) return false;

        // Enhanced Fuzzy Search Logic: Matches against name OR route
        const matchesSearch = fuzzyMatch(searchQuery, p.name) || fuzzyMatch(searchQuery, p.route);
        if (!matchesSearch) return false;

        const isCaught = !!caughtData[p.id];
        if (filterState === 'caught') return isCaught;
        if (filterState === 'uncaught') return !isCaught;
        return true;
    });

    const groups: Record<string, PokemonEntry[]> = {};
    filtered.forEach(p => {
        if (!groups[p.route]) groups[p.route] = [];
        groups[p.route].push(p);
    });

    return Object.entries(groups).sort((a, b) => {
        const routeA = a[0];
        const routeB = b[0];

        // Specific Sorts
        if (sortState === 'name') {
            return routeA.localeCompare(routeB);
        }

        if (sortState === 'points') {
            const pointsA = a[1].reduce((sum, p) => sum + p.points, 0);
            const pointsB = b[1].reduce((sum, p) => sum + p.points, 0);
            return pointsB - pointsA; // Descending (High Points first)
        }

        if (sortState === 'completion') {
            const getRatio = (list: PokemonEntry[]) => {
                if (list.length === 0) return 0;
                return list.filter(p => !!caughtData[p.id]).length / list.length;
            }
            const ratioA = getRatio(a[1]);
            const ratioB = getRatio(b[1]);
            // Ascending (0% -> 100%) so users see what to work on first
            if (ratioA !== ratioB) return ratioA - ratioB; 
        }

        // Default / Fallback sort
        const indexA = ROUTE_ORDER.indexOf(routeA);
        const indexB = ROUTE_ORDER.indexOf(routeB);

        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return routeA.localeCompare(routeB);
    });
  }, [searchQuery, filterState, caughtData, isCompletionist, sortState]);

  return (
    <div className="min-h-screen pb-20 bg-gray-50">
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        isCompletionist={isCompletionist}
        onToggleCompletionist={onToggleCompletionist}
        autoCollapsePostNational={autoCollapsePostNational}
        onToggleAutoCollapse={onToggleAutoCollapse}
        onResetProgress={() => { onResetProgress(); setIsSettingsOpen(false); }}
        onGoHome={onGoHome}
        onOpenGuide={() => { setIsSettingsOpen(false); onOpenGuide(); }}
        onOpenHistory={() => { setIsSettingsOpen(false); onOpenHistory(); }}
      />

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-6 flex justify-between items-start">
            <div>
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
                    <span className="bg-rose-600 text-white p-2 rounded-lg">
                        <Trophy className="w-6 h-6" />
                    </span>
                    Pokéwalker Challenge
                </h1>
                <p className="mt-2 text-gray-500">Track your progress to Mt. Silver.</p>
            </div>
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                    aria-label="Settings"
                >
                    <Settings className="w-6 h-6" />
                </button>
            </div>
        </div>
      </header>

      {/* Progress Hero */}
      <ProgressBar currentPoints={currentPoints} isCompletionist={isCompletionist} onClick={onViewMilestones} />

      {/* Controls */}
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        {/* Main Controls Row */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                    type="text" 
                    placeholder="Search Pokémon or Route..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                />
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                     <div className="relative w-full sm:w-auto">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                            <ArrowUpDown className="w-4 h-4 text-gray-400" />
                        </div>
                        <select 
                            value={sortState}
                            onChange={(e) => setSortState(e.target.value as any)}
                            className="appearance-none bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-rose-500 focus:border-rose-500 block w-full pl-8 pr-8 py-2 cursor-pointer hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            <option value="default">Default Order</option>
                            <option value="name">Name (A-Z)</option>
                            <option value="completion">Progress (Low to High)</option>
                            <option value="points">Total Points (High to Low)</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                     </div>
                </div>

                <div className="hidden sm:block w-px h-6 bg-gray-200"></div>

                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
                    <Filter className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
                    {(['all', 'caught', 'uncaught'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilterState(f)}
                            className={`
                                px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors whitespace-nowrap shadow-sm
                                ${filterState === f 
                                    ? 'bg-rose-100 text-rose-700 border border-rose-200' 
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                }
                            `}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* Main List */}
      <div className="max-w-5xl mx-auto px-4 space-y-8">
        {groupedPokemon.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                <p className="text-gray-500 text-lg">No Pokémon found matching your search or filters.</p>
                <button 
                    onClick={() => {setSearchQuery(''); setFilterState('all');}}
                    className="mt-4 text-rose-600 font-semibold hover:underline"
                >
                    Clear Search & Filters
                </button>
            </div>
        ) : (
            groupedPokemon.map(([route, pokemons]) => {
                const isCollapsed = collapsedRoutes.has(route);
                const caughtCount = pokemons.filter(p => !!caughtData[p.id]).length;
                const total = pokemons.length;
                
                return (
                    <div key={route} className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <button
                            onClick={() => toggleRoute(route)}
                            className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-100 transition-colors text-left"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${caughtCount === total ? 'bg-green-100 text-green-600' : 'bg-white border border-gray-200 text-gray-400'}`}>
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-base md:text-lg font-bold text-gray-900">{route}</h2>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <div className="h-1.5 w-20 bg-gray-200 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-500 ${caughtCount === total ? 'bg-green-500' : 'bg-rose-500'}`}
                                                style={{ width: `${(caughtCount / total) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-500 font-medium">{caughtCount} / {total}</span>
                                    </div>
                                </div>
                            </div>
                            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`} />
                        </button>
                        
                        {!isCollapsed && (
                            <div className="p-4 border-t border-gray-100 bg-white">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {pokemons.map(pokemon => (
                                        <PokemonCard 
                                            key={pokemon.id} 
                                            pokemon={pokemon} 
                                            caughtTimestamp={caughtData[pokemon.id]} 
                                            onToggle={onTogglePokemon} 
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })
        )}
      </div>
    </div>
  );
};

// --- View: Landing Page ---

const LandingPage: React.FC<{ onStart: () => void }> = ({ onStart }) => {
    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-10 left-10 w-64 h-64 bg-rose-600 rounded-full blur-[100px]" />
                <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-600 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-2xl animate-in fade-in zoom-in-90 duration-700">
                <div className="mx-auto bg-white/10 backdrop-blur-md p-4 rounded-2xl w-24 h-24 flex items-center justify-center mb-8 ring-1 ring-white/20 shadow-2xl">
                     <Trophy className="w-12 h-12 text-rose-500" />
                </div>
                
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6">
                    Pokéwalker Challenge
                </h1>
                
                <p className="text-lg md:text-xl text-slate-300 leading-relaxed mb-10">
                    Embark on a nostalgic journey to complete the National Dex. 
                    Track every step, catch every Pokémon, and unlock milestones 
                    on your way to Mt. Silver.
                </p>

                <div className="flex flex-col gap-4 items-center">
                    <button 
                        onClick={onStart}
                        className="group relative inline-flex items-center gap-3 px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white font-bold text-lg rounded-full transition-all hover:scale-105 shadow-[0_0_40px_-10px_rgba(225,29,72,0.5)]"
                    >
                        Begin Your Adventure
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                <div className="mt-12 flex justify-center gap-8 text-slate-500 text-sm font-medium">
                    <span className="flex items-center gap-2">
                        <Footprints className="w-4 h-4" /> Route Tracking
                    </span>
                    <span className="flex items-center gap-2">
                        <Star className="w-4 h-4" /> Point Milestones
                    </span>
                </div>
            </div>
        </div>
    );
};

// --- View: Mode Selection ---

const ModeCard: React.FC<{
    title: string;
    description: string;
    icon: React.ReactNode;
    colorClass: string;
    onClick?: () => void;
    disabled?: boolean;
    children?: React.ReactNode;
}> = ({ title, description, icon, colorClass, onClick, disabled, children }) => {
    return (
        <div className="relative group w-full">
            <button 
                onClick={onClick}
                disabled={disabled}
                className={`
                    relative text-left p-6 rounded-2xl border-2 transition-all duration-300 w-full h-full
                    ${disabled 
                        ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed grayscale' 
                        : 'bg-white border-gray-100 hover:border-transparent hover:shadow-2xl hover:-translate-y-1'
                    }
                `}
            >
                {!disabled && (
                    <div className={`absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity bg-gradient-to-br ${colorClass} -z-10`} />
                )}
                
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${disabled ? 'bg-gray-200 text-gray-400' : 'bg-gray-50 text-gray-900 shadow-sm'}`}>
                    {icon}
                </div>
                
                <h3 className={`text-xl font-bold mb-2 ${disabled ? 'text-gray-400' : 'text-gray-900'}`}>{title}</h3>
                <p className={`text-sm leading-relaxed ${disabled ? 'text-gray-400' : 'text-gray-500'}`}>
                    {description}
                </p>

                {disabled && (
                    <span className="absolute top-4 right-4 bg-gray-200 text-gray-500 text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                        Coming Soon
                    </span>
                )}
            </button>
            {children}
        </div>
    );
};

const ModeSelection: React.FC<{ onSelectMode: (isCompletionist: boolean) => void; onOpenGuide: () => void }> = ({ onSelectMode, onOpenGuide }) => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-black text-gray-900 mb-4">Choose Your Path</h2>
                    <p className="text-gray-500">Select how you want to experience the challenge.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    <ModeCard 
                        title="Standard Course"
                        description="The classic experience. Track Pokémon from Pre-National and Post-National Dex routes. Balanced progression."
                        icon={<LayoutGrid className="w-6 h-6" />}
                        colorClass="from-blue-500/10 to-cyan-500/10 border-blue-200"
                        onClick={() => onSelectMode(false)}
                    />

                    <ModeCard 
                        title="Completionist"
                        description="For the hardcore collectors. Includes all Standard routes plus Special Event routes. Higher point milestones."
                        icon={<Star className="w-6 h-6 text-yellow-500" />}
                        colorClass="from-yellow-500/10 to-orange-500/10 border-yellow-200"
                        onClick={() => onSelectMode(true)}
                    >
                        <div className="mt-3 text-center">
                            <button 
                                onClick={(e) => { e.stopPropagation(); onOpenGuide(); }}
                                className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline inline-flex items-center gap-1"
                            >
                                <BookOpen className="w-3 h-3" />
                                How to unlock special routes?
                            </button>
                        </div>
                    </ModeCard>

                    <ModeCard 
                        title="Manual Mode"
                        description="Track your progress without the Pokéwalker step requirements. A simplified checklist experience."
                        icon={<Construction className="w-6 h-6" />}
                        colorClass=""
                        disabled={true}
                    />
                </div>
            </div>
        </div>
    );
};

// --- App Orchestrator ---

export default function App() {
    const [currentView, setCurrentView] = useState<'home' | 'modes' | 'tracker' | 'guide' | 'milestones' | 'history'>(() => {
        if (typeof window !== 'undefined') {
            const hasStarted = localStorage.getItem('pokewalker-has-started') === 'true';
            return hasStarted ? 'tracker' : 'home';
        }
        return 'home';
    });
    const [previousView, setPreviousView] = useState<'modes' | 'tracker'>('modes');

    // --- Global State ---
    
    // Migration logic from Set<string> to Record<string, number>
    const [caughtData, setCaughtData] = useState<Record<string, number>>(() => {
        const saved = localStorage.getItem('pokewalker-caught');
        if (!saved) return {};
        
        try {
            const parsed = JSON.parse(saved);
            // Check if old format (Array/Set)
            if (Array.isArray(parsed)) {
                const migratedData: Record<string, number> = {};
                parsed.forEach(id => {
                    migratedData[id] = Date.now(); // Default to now for migration
                });
                return migratedData;
            }
            return parsed;
        } catch (e) {
            console.error("Failed to parse caught data", e);
            return {};
        }
    });

    const [isCompletionist, setIsCompletionist] = useState<boolean>(() => {
        const saved = localStorage.getItem('pokewalker-mode');
        return saved ? JSON.parse(saved) : false;
    });

    const [autoCollapsePostNational, setAutoCollapsePostNational] = useState<boolean>(() => {
        const saved = localStorage.getItem('pokewalker-auto-collapse');
        // Default to true as per request "Initially, collapse 'Post-National Pokédex' routes"
        return saved ? JSON.parse(saved) : true;
    });

    // Persistence
    useEffect(() => {
        localStorage.setItem('pokewalker-caught', JSON.stringify(caughtData));
    }, [caughtData]);

    useEffect(() => {
        localStorage.setItem('pokewalker-mode', JSON.stringify(isCompletionist));
    }, [isCompletionist]);

    useEffect(() => {
        localStorage.setItem('pokewalker-auto-collapse', JSON.stringify(autoCollapsePostNational));
    }, [autoCollapsePostNational]);

    // Global Actions
    const togglePokemon = (id: string) => {
        setCaughtData(prev => {
            const next = { ...prev };
            if (next[id]) {
                delete next[id];
            } else {
                next[id] = Date.now();
            }
            return next;
        });
    };

    const resetProgress = () => {
        setCaughtData({});
    };

    const toggleCompletionist = () => {
        setIsCompletionist(prev => !prev);
    };

    const toggleAutoCollapse = () => {
        setAutoCollapsePostNational(prev => !prev);
    };

    // Derived State
    const currentPoints = useMemo(() => {
        return POKEMON_DB.reduce((acc, curr) => {
            if (!isCompletionist && SPECIAL_ROUTES.includes(curr.route)) return acc;
            return caughtData[curr.id] ? acc + curr.points : acc;
        }, 0);
    }, [caughtData, isCompletionist]);

    // Navigation Handlers
    const handleStart = () => {
        setCurrentView('modes');
    };

    const handleSelectMode = (mode: boolean) => {
        setIsCompletionist(mode);
        localStorage.setItem('pokewalker-has-started', 'true');
        setCurrentView('tracker');
    };

    const handleGoHome = () => {
        setCurrentView('home');
    };

    const handleOpenGuide = () => {
        if (currentView !== 'guide') {
            setPreviousView(currentView === 'milestones' || currentView === 'history' ? 'tracker' : currentView as 'modes' | 'tracker');
        }
        setCurrentView('guide');
    };
    
    const handleOpenHistory = () => {
        if (currentView !== 'history') {
             setPreviousView(currentView === 'milestones' || currentView === 'guide' ? 'tracker' : currentView as 'modes' | 'tracker');
        }
        setCurrentView('history');
    }

    const handleViewMilestones = () => {
        setCurrentView('milestones');
    }

    const handleBackToTracker = () => {
        setCurrentView('tracker');
    }

    const handleBackFromGuide = () => {
        setCurrentView(previousView);
    };

    if (currentView === 'home') {
        return <LandingPage onStart={handleStart} />;
    }

    if (currentView === 'guide') {
        return <SpecialRoutesGuide onBack={handleBackFromGuide} />;
    }
    
    if (currentView === 'history') {
        return <HistoryPage caughtData={caughtData} onBack={handleBackToTracker} />;
    }

    if (currentView === 'modes') {
        return <ModeSelection onSelectMode={handleSelectMode} onOpenGuide={handleOpenGuide} />;
    }

    if (currentView === 'milestones') {
        return <MilestonesPage currentPoints={currentPoints} isCompletionist={isCompletionist} onBack={handleBackToTracker} />;
    }

    return (
        <Tracker 
            caughtData={caughtData}
            isCompletionist={isCompletionist}
            onTogglePokemon={togglePokemon}
            onResetProgress={resetProgress}
            onToggleCompletionist={toggleCompletionist}
            autoCollapsePostNational={autoCollapsePostNational}
            onToggleAutoCollapse={toggleAutoCollapse}
            onGoHome={handleGoHome} 
            onOpenGuide={handleOpenGuide}
            onOpenHistory={handleOpenHistory}
            onViewMilestones={handleViewMilestones}
            currentPoints={currentPoints}
        />
    );
}