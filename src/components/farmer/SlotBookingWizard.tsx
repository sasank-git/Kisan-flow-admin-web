import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  ChevronRight, 
  AlertCircle, 
  TrendingDown, 
  Info, 
  Scale,
  X
} from 'lucide-react';
import { useKisanFlow } from '../../context/KisanFlowContext';
import { supabase } from '../../utils/supabase'; 

// Database Submission Logic
async function submitToken(
  supabaseClient: any,
  formData: {
    centre_id: string;
    farmer_id: string;
    farmer_name: string;
    mobile: string;
    crop_type: string;
    variety: string;
    estimated_quantity: number;
    total_amount: number;
    village: string;
    slot_date: string; 
    slot_time: string; 
  }
) {
  // Pre-flight Check: Prevent duplicate bookings for the same farmer on the same date
  let checkQuery = supabaseClient
    .from('tokens')
    .select('id, token_number, slot_date, slot_time, status, farmer_id, mobile')
    .eq('slot_date', formData.slot_date)
    .in('status', ['BOOKED', 'CHECKED_IN', 'PROCESSING']);

  if (formData.farmer_id && formData.mobile) {
    checkQuery = checkQuery.or(`farmer_id.eq.${formData.farmer_id},mobile.eq.${formData.mobile}`);
  } else if (formData.farmer_id) {
    checkQuery = checkQuery.eq('farmer_id', formData.farmer_id);
  } else if (formData.mobile) {
    checkQuery = checkQuery.eq('mobile', formData.mobile);
  }

  const { data: existingActiveBookings, error: checkError } = await checkQuery;

  if (checkError) {
    console.warn('Pre-flight duplicate check notice:', checkError.message);
  }

  // TASK 1: Halt immediately if active booking exists - strictly block reaching the insert block
  if (existingActiveBookings && existingActiveBookings.length > 0) {
    const existingToken = existingActiveBookings[0];
    const tokenIdentifier = existingToken?.token_number ? `(${existingToken.token_number})` : '';
    throw new Error(
      `Duplicate Booking: You already have an active slot ${tokenIdentifier} reserved for this date. Please complete or cancel it before booking another.`
    );
  }

  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const tokenNumber = `KF-${randomSuffix}`;

  const { data, error } = await supabaseClient
    .from('tokens')
    .insert([
      {
        token_number: tokenNumber,
        centre_id: formData.centre_id,
        farmer_id: formData.farmer_id,
        farmer_name: formData.farmer_name,
        mobile: formData.mobile,
        village: formData.village,
        crop_type: formData.crop_type,
        variety: formData.variety,
        estimated_quantity: formData.estimated_quantity,
        total_amount: formData.total_amount,
        slot_date: formData.slot_date,
        slot_time: formData.slot_time,
        status: 'BOOKED'
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export const SlotBookingWizard: React.FC = () => {
  const { centres, bookNewSlot, t, setActiveTabFarmer, farmer } = useKisanFlow();

  const [cropType, setCropType] = useState('Wheat (Sharbati)');
  const [variety, setVariety] = useState('Sharbati Gold');
  const [quantity, setQuantity] = useState(32);
  
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const todayISO = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
  const [manualDate, setManualDate] = useState(todayISO);
  const [manualTime, setManualTime] = useState('');

  const [dynamicDate, setDynamicDate] = useState('Today');
  const [dynamicTime, setDynamicTime] = useState('09:00 AM');
  const [isSlotLoading, setIsSlotLoading] = useState(true);

  // BUG FIX 1: Dynamically find the center with the lowest wait time!
  const recommendedCentre = centres && centres.length > 0 
    ? [...centres].sort((a, b) => (a.waitTimeMin || 0) - (b.waitTimeMin || 0))[0] 
    : centres[0];

  const getMsp = (crop: string) => {
    const c = (crop || '').toLowerCase();
    if (c.includes('wheat')) return 2275;
    if (c.includes('cotton')) return 6620;
    if (c.includes('soya') || c.includes('soybean')) return 4600;
    if (c.includes('mustard')) return 5650;
    if (c.includes('maize')) return 2090;
    return 2183;
  };

  useEffect(() => {
    async function calculateNextSlot() {
      if (!recommendedCentre) return;
      
      setIsSlotLoading(true);
      try {
        const { data: latestTokens } = await supabase
          .from('tokens')
          .select('slot_time, slot_date, estimated_quantity')
          .eq('centre_id', recommendedCentre.id)
          .eq('slot_date', 'Today')
          .order('created_at', { ascending: false })
          .limit(1);

        let nextSlot = new Date();
        const now = new Date();

        if (latestTokens && latestTokens.length > 0) {
          const prevTimeStr = latestTokens[0].slot_time || "09:00 AM";
          const prevQuantity = latestTokens[0].estimated_quantity || 30;
          
          const match = prevTimeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
          
          if (match) {
            let hours = parseInt(match[1], 10);
            const minutes = parseInt(match[2], 10);
            const meridian = match[3]?.toUpperCase() || 'AM';
            if (meridian === 'PM' && hours < 12) hours += 12;
            if (meridian === 'AM' && hours === 12) hours = 0;

            const durationMinutes = Math.max(15, Math.ceil(prevQuantity / 30) * 15);
            nextSlot.setHours(hours, minutes + durationMinutes, 0, 0);
          }
        } else {
          // If no bookings, start at 9 AM
          nextSlot.setHours(9, 0, 0, 0);
        }

        // BUG FIX 2: Prevent booking in the past! If nextSlot is earlier than right now, jump to right now.
        if (nextSlot < now) {
          nextSlot = new Date(); // Reset to current time
          // Round up to the next 15-minute block
          const remainder = 15 - (nextSlot.getMinutes() % 15);
          nextSlot.setMinutes(nextSlot.getMinutes() + remainder);
          nextSlot.setSeconds(0, 0);
        }

        // Enforce 5:00 PM cutoff
        if (nextSlot.getHours() >= 17) {
          setDynamicDate('Tomorrow');
          setDynamicTime('09:00 AM');
        } else {
          setDynamicDate('Today');
          setDynamicTime(nextSlot.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }));
        }
        
      } catch (error) {
        console.error('Error fetching slot:', error);
      } finally {
        setIsSlotLoading(false);
      }
    }
    calculateNextSlot();
  }, [recommendedCentre?.id]);

  const getAvailableManualTimes = () => {
    const times = [];
    const isToday = manualDate === todayISO;
    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();

    let autoQueueHour = 9;
    let autoQueueMinute = 0;
    
    if (isToday) {
      const match = dynamicTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (match) {
        autoQueueHour = parseInt(match[1], 10);
        autoQueueMinute = parseInt(match[2], 10);
        if (match[3]?.toUpperCase() === 'PM' && autoQueueHour < 12) autoQueueHour += 12;
        if (match[3]?.toUpperCase() === 'AM' && autoQueueHour === 12) autoQueueHour = 0;
      }
    }

    for (let h = 9; h <= 17; h++) {
      for (let m = 0; m < 60; m += 30) {
        if (h === 17 && m > 0) continue; 

        if (isToday) {
          // Hide slots based on the queue AND the actual real-world clock
          if (h < autoQueueHour || (h === autoQueueHour && m < autoQueueMinute) || (h < currentHour) || (h === currentHour && m <= currentMin)) {
            continue; 
          }
        }

        const meridian = h >= 12 ? 'PM' : 'AM';
        const displayHour = h > 12 ? h - 12 : (h === 0 ? 12 : h);
        const timeStr = `${displayHour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${meridian}`;
        times.push(timeStr);
      }
    }
    return times;
  };

  const availableManualTimes = getAvailableManualTimes();

  const handleBook = async (centreId: string, time: string, isManual: boolean = false, date: string = 'Today') => {
    try {
      setBookingError(null);
      setIsBooking(true);
      const totalAmount = Number(quantity) * getMsp(cropType);
      const finalDate = isManual ? date : dynamicDate;
      const finalTime = isManual ? time : dynamicTime;

      const createdToken = await submitToken(supabase, {
        centre_id: centreId,
        farmer_id: farmer?.id || `KF-${Math.floor(1000 + Math.random() * 9000)}`,
        farmer_name: farmer?.name || 'Test Farmer',
        mobile: farmer?.mobile || '+91 98765 43210',
        village: farmer?.village || 'Taraori',
        crop_type: cropType,
        variety: variety,
        estimated_quantity: Number(quantity),
        total_amount: totalAmount,
        slot_date: finalDate,
        slot_time: finalTime
      });

      bookNewSlot({
        centreId,
        cropType,
        variety,
        estimatedQuantity: Number(quantity),
        bookingDate: finalDate,
        slotTime: finalTime, 
        tokenNumber: createdToken?.token_number,
        skipDbInsert: true,
      });

    } catch (error: any) {
      console.error("Booking failed:", error);
      const errorMessage = error?.message || "Failed to connect to database.";
      setBookingError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsBooking(false);
    }
  };

  if (!recommendedCentre) return null;

  return (
    <div className="space-y-4">
      {/* Validation / Duplicate Booking Error Alert Banner */}
      {bookingError && (
        <div 
          id="booking-error-alert" 
          className="bg-rose-950/80 border-2 border-rose-500/80 rounded-2xl p-4 shadow-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <p className="font-bold text-rose-200 mb-0.5">Booking Validation Alert</p>
            <p className="text-rose-300 leading-relaxed font-medium">{bookingError}</p>
          </div>
          <button
            onClick={() => setBookingError(null)}
            className="text-rose-400 hover:text-rose-200 transition-colors p-1 -mr-1 -mt-1 cursor-pointer"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            1. Crop & Procurement Details
          </span>
          <span className="text-xs text-emerald-400 font-medium">Step 1 of 2</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1">Crop Commodity</label>
            <select
              value={cropType}
              onChange={(e) => setCropType(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
            >
              <option value="Wheat (Sharbati)">Wheat (Sharbati)</option>
              <option value="Paddy (Dhan)">Paddy (Dhan)</option>
              <option value="Cotton">Cotton (Kapas)</option>
              <option value="Soyabean">Soyabean (Yellow)</option>
              <option value="Mustard">Mustard (Sarson)</option>
              <option value="Maize">Maize (Makka)</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1">Variety / Grade</label>
            <input
              type="text"
              value={variety}
              onChange={(e) => setVariety(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
              placeholder="e.g. Sharbati Gold"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs text-slate-400 font-medium">Estimated Harvest Quantity</label>
            <span className="text-sm font-bold text-emerald-400 font-mono">
              {quantity} Quintals (~{(quantity * 100).toLocaleString('en-IN')} kg)
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="150"
            step="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
            <span>5 Qtl</span>
            <span>Est. Govt MSP: ₹{(quantity * getMsp(cropType)).toLocaleString('en-IN')}</span>
            <span>150 Qtl</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-emerald-950/70 via-slate-900 to-teal-950/70 border-2 border-emerald-500/60 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold text-emerald-300 uppercase tracking-wider block">
                AI SMART SLOT RECOMMENDATION
              </span>
              <span className="text-xs text-slate-300 font-medium">
                Procurement Load Score: <span className="text-emerald-400 font-bold">Optimal / Low Congestion</span>
              </span>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
            RECOMMENDED
          </span>
        </div>

        <div className="mt-4 p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/40 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-heading font-bold text-base text-white">
                {recommendedCentre.name}
              </h4>
              <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{recommendedCentre.distanceKm} km distance from your farm</span>
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase block">Expected Wait</span>
              <span className="text-emerald-400 font-extrabold text-base">~{recommendedCentre.waitTimeMin} mins</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block">Available Slot</span>
              <span className="font-bold text-amber-300">
                {isSlotLoading ? 'Calculating...' : `${dynamicDate}, ${dynamicTime}`}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block">Current Queue</span>
              <span className="font-bold text-emerald-400">{recommendedCentre.currentQueue} farmers</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block">Congestion Level</span>
              <span className="font-bold text-emerald-400">{recommendedCentre.congestion || 'LOW'}</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <span className="text-emerald-400 font-semibold block flex items-center gap-1">
              <Info className="w-3 h-3" />
              Dynamic Slot Calculation
            </span>
            <p className="text-[11px] text-slate-300 leading-snug">
              KisanFlow allocates precise time blocks based on crop volume. Larger harvests automatically reserve wider operating windows to prevent bottlenecking.
            </p>
          </div>

          <button
            onClick={() => handleBook(recommendedCentre.id, dynamicTime, false, dynamicDate)}
            disabled={isBooking || isSlotLoading}
            className={`w-full font-heading font-extrabold text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all ${
              isBooking || isSlotLoading
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-emerald-950/50 active:scale-98 cursor-pointer'
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 ${isBooking || isSlotLoading ? 'fill-slate-700' : 'fill-slate-950'} text-white`} />
            <span>{isBooking ? 'Processing Booking...' : 'Book Recommended Slot'}</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            All Nearby Mandi Centres
          </span>
          <button
            onClick={() => setIsCustomMode(!isCustomMode)}
            className="text-xs text-emerald-400 font-medium hover:underline"
          >
            {isCustomMode ? 'Hide Custom Pick' : 'Choose Manually'}
          </button>
        </div>

        <div className="space-y-2.5">
          {centres.map(centre => {
            const isRec = centre.id === recommendedCentre.id; // BUG FIX 3: Dynamic BEST tag
            const isHigh = centre.congestion === 'HIGH';

            return (
              <div
                key={centre.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isRec 
                    ? 'bg-emerald-950/20 border-emerald-500/50' 
                    : isHigh
                      ? 'bg-slate-900/80 border-rose-900/40 opacity-90'
                      : 'bg-slate-800/40 border-slate-700/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-sm text-white">
                        {centre.name}
                      </span>
                      {isRec && (
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold">
                          BEST
                        </span>
                      )}
                      {isHigh && (
                        <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded font-bold">
                          AVOID (HIGH RUSH)
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 mt-0.5 block">
                      {centre.distanceKm} km away • {centre.address}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-300 block">
                      Queue: <strong className={isHigh ? 'text-rose-400' : 'text-emerald-400'}>{centre.currentQueue}</strong>
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Wait: ~{centre.waitTimeMin}m
                    </span>
                  </div>
                </div>

                {isCustomMode && (
                  <div className="mt-3 pt-3 border-t border-slate-700/40 space-y-3">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-[10px] text-slate-400 block mb-1">Select Date</label>
                        <input 
                          type="date"
                          min={todayISO}
                          value={manualDate} 
                          onChange={(e) => {
                            setManualDate(e.target.value);
                            setManualTime(''); 
                          }}
                          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] text-slate-400 block mb-1">Select Time</label>
                        <select 
                          value={manualTime} 
                          onChange={(e) => setManualTime(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                        >
                          <option value="" disabled>Select an open slot</option>
                          {availableManualTimes.length > 0 ? (
                            availableManualTimes.map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))
                          ) : (
                            <option value="" disabled>Fully Booked Today</option>
                          )}
                        </select>
                      </div>
                    </div>
                    <button
                      onClick={() => handleBook(centre.id, manualTime, true, manualDate)}
                      disabled={isBooking || !manualTime}
                      className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold disabled:opacity-50 transition-colors"
                    >
                      {isBooking ? 'Processing...' : 'Confirm Manual Booking'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};