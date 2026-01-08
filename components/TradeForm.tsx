
import React, { useState, useEffect, useRef } from 'react';
import { TradeDirection, Trade } from '../types';
import { STRATEGIES, BYBIT_PERP_PAIRS } from '../constants';
import { calculateTradeMetrics } from '../utils/calculations';
import { X, Plus, Image as ImageIcon, Trash2, Edit, Search } from 'lucide-react';

interface TradeFormProps {
  onSubmit: (trade: Omit<Trade, 'id'>, id?: string) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
  initialData?: Trade | null;
}

const TradeForm: React.FC<TradeFormProps> = ({ onSubmit, onDelete, onClose, initialData }) => {
  const [formData, setFormData] = useState({
    symbol: initialData?.symbol || '',
    direction: initialData?.direction || TradeDirection.LONG,
    entryPrice: initialData?.entryPrice?.toString() || '',
    exitPrice: initialData?.exitPrice?.toString() || '',
    size: initialData?.size?.toString() || '',
    strategy: initialData?.strategy || STRATEGIES[0],
    emotionScale: initialData?.emotionScale || 5,
    notes: initialData?.notes || '',
    date: initialData?.date || new Date().toISOString().split('T')[0]
  });

  const [entryImage, setEntryImage] = useState<string | null>(initialData?.entryScreenshot || null);
  const [exitImage, setExitImage] = useState<string | null>(initialData?.exitScreenshot || null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const entryInputRef = useRef<HTMLInputElement>(null);
  const exitInputRef = useRef<HTMLInputElement>(null);
  const suggestionRef = useRef<HTMLDivElement>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState({ pnl: 0, roi: 0, rr: 0 });

  useEffect(() => {
    const entry = parseFloat(formData.entryPrice);
    const exit = parseFloat(formData.exitPrice);
    const size = parseFloat(formData.size);

    if (!isNaN(entry) && !isNaN(exit) && !isNaN(size)) {
      const { pnl, roi, rrRatio } = calculateTradeMetrics(entry, exit, size, formData.direction);
      setPreview({ pnl, roi, rr: rrRatio });
    }
  }, [formData]);

  // Click outside listener for suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSymbolChange = (val: string) => {
    const upperVal = val.toUpperCase();
    setFormData({ ...formData, symbol: upperVal });
    
    if (upperVal.length > 0) {
      const filtered = BYBIT_PERP_PAIRS.filter(pair => 
        pair.includes(upperVal)
      ).slice(0, 6);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (pair: string) => {
    setFormData({ ...formData, symbol: pair });
    setShowSuggestions(false);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.symbol) newErrors.symbol = 'Symbol is required';
    if (!formData.entryPrice || parseFloat(formData.entryPrice) <= 0) newErrors.entryPrice = 'Invalid entry';
    if (!formData.exitPrice || parseFloat(formData.exitPrice) <= 0) newErrors.exitPrice = 'Invalid exit';
    if (!formData.size || parseFloat(formData.size) <= 0) newErrors.size = 'Invalid size';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'entry' | 'exit') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'entry') setEntryImage(reader.result as string);
        else setExitImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const entry = parseFloat(formData.entryPrice);
      const exit = parseFloat(formData.exitPrice);
      const size = parseFloat(formData.size);
      
      const { pnl, roi, rrRatio, status } = calculateTradeMetrics(entry, exit, size, formData.direction);

      onSubmit({
        ...formData,
        entryPrice: entry,
        exitPrice: exit,
        size: size,
        pnl,
        roi,
        rrRatio,
        status,
        entryScreenshot: entryImage || undefined,
        exitScreenshot: exitImage || undefined
      }, initialData?.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 sm:bg-black/80 backdrop-blur-md sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#151921] sm:border sm:border-[#2d3748] sm:rounded-2xl w-full h-full sm:h-auto sm:max-w-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#2d3748] flex justify-between items-center bg-[#151921] sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00E396]/10 rounded-xl flex items-center justify-center">
               {initialData ? <Edit className="w-5 h-5 text-[#00E396]" /> : <Plus className="w-5 h-5 text-[#00E396]" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">
                {initialData ? 'Update Position' : 'Log New Trade'}
              </h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Trading Performance</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 -mr-2 text-slate-400 hover:text-white transition-colors active:scale-90"
          >
            <X className="w-7 h-7" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <div className="space-y-4">
              <div className="relative" ref={suggestionRef}>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2 tracking-wider">Bybit Pair</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="BTCUSDT"
                    autoComplete="off"
                    className={`w-full bg-[#0b0e14] border ${errors.symbol ? 'border-red-500' : 'border-[#2d3748]'} rounded-xl p-3.5 pl-11 text-white text-base focus:outline-none focus:border-[#00E396] transition-colors`}
                    value={formData.symbol}
                    onChange={(e) => handleSymbolChange(e.target.value)}
                  />
                  <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                </div>
                
                {showSuggestions && (
                  <div className="absolute z-50 w-full mt-2 bg-[#1a202c] border border-[#2d3748] rounded-xl shadow-2xl overflow-hidden">
                    {suggestions.map((pair) => (
                      <button
                        key={pair}
                        type="button"
                        onClick={() => selectSuggestion(pair)}
                        className="w-full text-left px-5 py-4 text-sm text-slate-300 hover:bg-[#2d3748] hover:text-[#00E396] transition-colors border-b border-[#2d3748]/50 last:border-0 font-mono"
                      >
                        {pair}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2 tracking-wider">Direction</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, direction: TradeDirection.LONG })}
                    className={`flex-1 py-4 rounded-xl border-2 transition-all font-bold text-sm ${formData.direction === TradeDirection.LONG ? 'bg-[#00E396]/10 border-[#00E396] text-[#00E396]' : 'border-[#2d3748] text-slate-500'}`}
                  >
                    LONG
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, direction: TradeDirection.SHORT })}
                    className={`flex-1 py-4 rounded-xl border-2 transition-all font-bold text-sm ${formData.direction === TradeDirection.SHORT ? 'bg-[#FF4560]/10 border-[#FF4560] text-[#FF4560]' : 'border-[#2d3748] text-slate-500'}`}
                  >
                    SHORT
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2 tracking-wider">Entry Price</label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  className={`w-full bg-[#0b0e14] border ${errors.entryPrice ? 'border-red-500' : 'border-[#2d3748]'} rounded-xl p-3.5 text-white text-base focus:outline-none focus:border-[#00E396]`}
                  value={formData.entryPrice}
                  onChange={(e) => setFormData({ ...formData, entryPrice: e.target.value })}
                />
              </div>
              <div className="col-span-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2 tracking-wider">Exit Price</label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  className={`w-full bg-[#0b0e14] border ${errors.exitPrice ? 'border-red-500' : 'border-[#2d3748]'} rounded-xl p-3.5 text-white text-base focus:outline-none focus:border-[#00E396]`}
                  value={formData.exitPrice}
                  onChange={(e) => setFormData({ ...formData, exitPrice: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2 tracking-wider">Position Size</label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  className={`w-full bg-[#0b0e14] border ${errors.size ? 'border-red-500' : 'border-[#2d3748]'} rounded-xl p-3.5 text-white text-base focus:outline-none focus:border-[#00E396]`}
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2 tracking-wider">Trade Date</label>
              <input
                type="date"
                className="w-full bg-[#0b0e14] border border-[#2d3748] rounded-xl p-3.5 text-white focus:outline-none focus:border-[#00E396] appearance-none"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2 tracking-wider">Strategy</label>
              <select
                className="w-full bg-[#0b0e14] border border-[#2d3748] rounded-xl p-3.5 text-white focus:outline-none focus:border-[#00E396] appearance-none"
                value={formData.strategy}
                onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
              >
                {STRATEGIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2 tracking-wider">Notes & Logic</label>
            <textarea
              className="w-full bg-[#0b0e14] border border-[#2d3748] rounded-xl p-4 text-white focus:outline-none focus:border-[#00E396] h-32 text-sm leading-relaxed"
              placeholder="Why did you take this trade?"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="bg-[#0b0e14]/50 rounded-2xl p-6 border border-[#2d3748] grid grid-cols-3 gap-4 border-l-4 border-l-[#00E396] shadow-inner">
             <div className="text-center">
                <span className="block text-[9px] uppercase text-slate-500 font-bold mb-1 tracking-wider">P&L</span>
                <span className={`font-mono font-bold text-base sm:text-lg ${preview.pnl >= 0 ? 'text-[#00E396]' : 'text-[#FF4560]'}`}>
                  {preview.pnl >= 0 ? '+$' : '-$'}{Math.abs(preview.pnl).toFixed(2)}
                </span>
             </div>
             <div className="text-center">
                <span className="block text-[9px] uppercase text-slate-500 font-bold mb-1 tracking-wider">ROI</span>
                <span className="font-mono font-bold text-base sm:text-lg text-white">{preview.roi.toFixed(1)}%</span>
             </div>
             <div className="text-center">
                <span className="block text-[9px] uppercase text-slate-500 font-bold mb-1 tracking-wider">R:R</span>
                <span className="font-mono font-bold text-base sm:text-lg text-white">{preview.rr.toFixed(1)}</span>
             </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-5 sm:p-6 border-t border-[#2d3748] flex gap-3 bg-[#151921] sticky bottom-0 z-10">
          {initialData && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(initialData.id)}
              className="p-4 rounded-xl border-2 border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors active:scale-95"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 p-4 rounded-xl bg-[#00E396] text-slate-950 font-bold text-base hover:bg-[#00c985] transition-all transform active:scale-[0.98] shadow-lg shadow-[#00E396]/20"
          >
            {initialData ? 'Save Changes' : 'Confirm Entry'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradeForm;