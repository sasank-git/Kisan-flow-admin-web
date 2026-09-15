import React, { useMemo } from 'react';
import { AlertTriangle, Sparkles, PlusCircle, Check, Flame, TrendingDown, Layers, Users } from 'lucide-react';
import { useKisanFlow } from '../../context/KisanFlowContext';

export const AiCongestionBanner: React.FC = () => {
  const { isCounter3Open, openExtraCounter, centres, selectedCentreId, bookings } = useKisanFlow();
  
  const centre = centres.find(c => c.id === selectedCentreId) || centres[0];
  const activeCounters = Number(centre?.activeCounters) > 0 ? Number(centre.activeCounters) : 3;
  const maxHourlyCapacity = activeCounters * 120; 

  const hourlyBuckets = useMemo(() => {
    const buckets: Record<number, number> = { 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0 };

    // GOD MODE: Ignore dates. Count ALL active load for this center.
    const activeBookings = bookings.filter(b => 
      b.centreId === centre.id &&
      b.status !== 'COMPLETED' && 
      b.status !== 'NO_SHOW' && 
      b.status !== 'CANCELLED'
    );

    activeBookings.forEach(b => {
      const timeStr = (b.slotTime || '').trim();
      const qty = Number(b.estimatedQuantity) || 30;
      const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      
      if (match) {
        let h = parseInt(match[1], 10);
        const meridian = match[3]?.toUpperCase();
        if (meridian === 'PM' && h < 12) h += 12;
        if (meridian === 'AM' && h === 12) h = 0;
        
        if (h in buckets) buckets[h] += qty;
        else if (h < 9) buckets[9] += qty;
        else if (h > 16) buckets[16] += qty;
      } else {
        buckets[11] += qty;
      }
    });

    return Object.keys(buckets).map((key) => {
      const hourNum = parseInt(key, 10);
      const displayHour = hourNum > 12 ? hourNum - 12 : hourNum;
      const meridian = hourNum >= 12 ? 'PM' : 'AM';
      return { hour: hourNum, timeLabel: `${displayHour.toString().padStart(2, '0')}:00 ${meridian}`, volumeQtl: buckets[hourNum] };
    });
  }, [bookings, centre.id]);

  const currentHour = new Date().getHours();
  const upcomingBuckets = hourlyBuckets.filter(b => b.hour >= currentHour);
  const peakBucket = upcomingBuckets.reduce((prev, current) => (current.volumeQtl > (prev?.volumeQtl || 0)) ? current : prev, upcomingBuckets[0] || null);

  const peakVolume = peakBucket?.volumeQtl || 0;
  const peakHour = peakBucket?.timeLabel || '';

  const rawRequiredCounters = peakVolume > 0 ? Math.ceil(peakVolume / 120) : activeCounters;
  const physicalMaxCounters = centre.totalCounters || 5; 
  const requiredCounters = Math.min(rawRequiredCounters, physicalMaxCounters);
  const additionalCountersNeeded = Math.max(0, requiredCounters - activeCounters);
  const requiredLaborers = peakVolume > 0 ? Math.ceil(peakVolume / 10) : 0;
  const isOverflow = rawRequiredCounters > activeCounters;
  const maxBarVolume = Math.max(maxHourlyCapacity, peakVolume, 100);

  return (
    <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-rose-950/40 border-2 border-amber-500/60 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase font-extrabold tracking-wider bg-rose-500 text-slate-950 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm">
              <Flame className="w-3.5 h-3.5 fill-slate-950" /> AI CONGESTION ALERT (VOLUME-BASED)
            </span>
            <div className="text-xs font-mono bg-slate-800/90 text-amber-300 border border-slate-700/80 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-amber-400" />
              <span>Center Capacity: <strong>{activeCounters}</strong> of <strong>{physicalMaxCounters}</strong> Counters | Max <strong>{maxHourlyCapacity}</strong> Qtl/hr</span>
            </div>
          </div>

          <h3 className="font-heading font-extrabold text-base text-white flex items-center gap-2">
            <span>Procurement Centre {centre.name} Volume Forecast</span>
            {isOverflow && (
              <span className="text-[11px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-md font-sans font-bold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-rose-400" /> Capacity Overflow Warning
              </span>
            )}
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
            {peakVolume > 0 ? (
              <>Predicted Peak: <strong className="text-amber-400 font-bold">{peakHour}</strong>. AI Forecast predicts <strong className="text-rose-400 font-bold">{peakVolume.toLocaleString('en-IN')} Quintals</strong> of grain arriving. Recommendation: Open <strong className="text-amber-300 font-bold">{requiredCounters}</strong> counters and deploy <strong className="text-emerald-400 font-bold">{requiredLaborers}</strong> yard laborers.</>
            ) : (
              <><strong className="text-emerald-400 font-bold">No upcoming congestion predicted.</strong> All remaining operating hours are currently within standard capacity of <strong className="text-white font-semibold">{maxHourlyCapacity} Qtl/hr</strong>.</>
            )}
          </p>

          <div className="pt-2">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span>Hourly Grain Volume (Quintals)</span>
            </div>
            <div className="flex items-end gap-2 overflow-x-auto pb-1">
              {hourlyBuckets.map((b) => {
                const capacityRatio = maxHourlyCapacity > 0 ? (b.volumeQtl / maxHourlyCapacity) : 0;
                let barColor = capacityRatio > 0.9 ? 'bg-rose-500 shadow-lg shadow-rose-950/80' : capacityRatio >= 0.5 ? 'bg-amber-500 shadow-sm shadow-amber-950/60' : 'bg-emerald-500';
                let textColor = capacityRatio > 0.9 ? 'text-rose-400' : capacityRatio >= 0.5 ? 'text-amber-400' : 'text-emerald-400';
                const barHeightPct = b.volumeQtl > 0 ? Math.min(100, Math.max(12, (b.volumeQtl / maxBarVolume) * 100)) : 4;

                return (
                  <div key={b.hour} className="flex flex-col items-center flex-1 min-w-[54px] text-center">
                    <span className={`text-[10px] font-mono font-bold ${textColor}`}>{b.volumeQtl > 0 ? `${b.volumeQtl}Q` : '0Q'}</span>
                    <div className="w-full bg-slate-800/90 h-16 rounded-lg overflow-hidden flex flex-col justify-end p-0.5 mt-1 border border-slate-700/60">
                      <div className={`w-full rounded transition-all duration-500 ${barColor}`} style={{ height: `${barHeightPct}%` }} />
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 font-mono">{b.timeLabel.split(' ')[0]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-amber-500/40 p-4 rounded-2xl md:w-80 flex-shrink-0 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
            <Sparkles className="w-4 h-4" /> Recommended AI Resource Allocation
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] space-y-1.5">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1 text-slate-400"><Layers className="w-3.5 h-3.5 text-indigo-400" />Required Counters:</span>
              <span className="font-mono font-bold text-white">{requiredCounters} <span className="text-slate-400 font-normal">({activeCounters} Active)</span></span>
            </div>
          </div>

          <div className="space-y-2">
            {additionalCountersNeeded > 0 ? (
              <button onClick={() => openExtraCounter(centre.id)} className="w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md cursor-pointer">
                <div className="flex items-center gap-1.5"><PlusCircle className="w-4 h-4" /><span>Open {additionalCountersNeeded} Extra Counter{additionalCountersNeeded > 1 ? 's' : ''}</span></div>
                <span className="text-[10px] uppercase font-mono">TRIGGER</span>
              </button>
            ) : (
              <button disabled className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 flex items-center justify-between opacity-90 cursor-not-allowed">
                <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-400" /><span>Capacity Optimal</span></div>
                <span className="text-[10px] uppercase font-mono text-emerald-500/80">OPTIMAL</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};