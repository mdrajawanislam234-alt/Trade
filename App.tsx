import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  LayoutGrid, FileText, Settings, Plus, LogOut, 
  Bell, Brain, Menu, TrendingUp, BarChart2, Zap, Search,
  ChevronLeft, ChevronRight, User, Shield, CreditCard, ExternalLink,
  AlertTriangle, CheckCircle2, Info, Edit2, Check, PieChart
} from 'lucide-react';
import { Trade, TradeDirection } from './types';
import Dashboard from './components/Dashboard';
import TradeList from './components/TradeList';
import TradeForm from './components/TradeForm';
import AIAnalyst from './components/AIAnalyst';
import Reports from './components/Reports';

const LOCAL_STORAGE_KEY = 'alpha_trader_pro_trades_v4';
const USER_DATA_KEY = 'alpha_trader_user_data';

interface SystemNotification {
  id: string;
  type: 'risk' | 'summary' | 'info' | 'system';
  title: string;
  description: string;
  time: string;
  isNew: boolean;
  priority?: 'high' | 'normal';
}

const MOCK_TRADES: Trade[] = [
  { id: '1', symbol: 'BTCUSD', direction: TradeDirection.LONG, entryPrice: 65000, exitPrice: 67200, size: 0.1, pnl: 220, roi: 3.38, rrRatio: 3.2, date: '2024-05-10', strategy: 'Breakout', emotionScale: 8, notes: 'Clean breakout', status: 'WIN' },
  { id: '2', symbol: 'EURUSD', direction: TradeDirection.SHORT, entryPrice: 1.0850, exitPrice: 1.0820, size: 50000, pnl: 150, roi: 0.28, rrRatio: 1.5, date: '2024-05-11', strategy: 'Supply & Demand', emotionScale: 9, notes: 'London session rejection', status: 'WIN' },
  { id: '3', symbol: 'NAS100', direction: TradeDirection.LONG, entryPrice: 18200, exitPrice: 18150, size: 2, pnl: -100, roi: -0.27, rrRatio: 0, date: '2024-05-12', strategy: 'Mean Reversion', emotionScale: 4, notes: 'FOMO entry', status: 'LOSS' },
];

const App: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [userName, setUserName] = useState('John Doe');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'trades' | 'reports' | 'ai'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial Load from LocalStorage
    const savedTrades = localStorage.getItem(LOCAL_STORAGE_KEY);
    const savedUser = localStorage.getItem(USER_DATA_KEY);
    
    if (savedTrades) {
      try {
        const parsed = JSON.parse(savedTrades);
        setTrades(parsed.length > 0 ? parsed : MOCK_TRADES);
      } catch (e) {
        setTrades(MOCK_TRADES);
      }
    } else {
      setTrades(MOCK_TRADES);
    }

    if (savedUser) setUserName(savedUser);

    setIsLoaded(true);
    if (window.innerWidth < 1280) setIsSidebarOpen(false);
  }, []);

  // Sync to LocalStorage whenever state changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(trades));
    }
  }, [trades, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(USER_DATA_KEY, userName);
    }
  }, [userName, isLoaded]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
        setIsEditingProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const systemNotifications = useMemo(() => {
    const list: SystemNotification[] = [];
    const now = new Date();
    const day = now.getDay();

    if (day === 6 || day === 0) {
      list.push({
        id: 'weekend-rem',
        type: 'info',
        title: 'Weekend Strategy Time',
        description: 'Markets are offline. Review your weekly performance and update your playbook.',
        time: 'Today',
        isNew: true
      });
    }

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const weeklyTrades = trades.filter(t => new Date(t.date) >= last7Days);
    if (weeklyTrades.length > 0) {
      const weeklyPnl = weeklyTrades.reduce((acc, t) => acc + t.pnl, 0);
      list.push({
        id: 'weekly-sum',
        type: 'summary',
        title: 'Weekly Performance Update',
        description: `Your weekly net P&L is ${weeklyPnl >= 0 ? '+' : ''}$${weeklyPnl.toFixed(2)} across ${weeklyTrades.length} trades.`,
        time: '1h ago',
        isNew: false
      });
    }

    const sortedByTime = [...trades].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (sortedByTime.length >= 2) {
      const lastTwo = sortedByTime.slice(0, 2);
      if (lastTwo.every(t => t.status === 'LOSS')) {
        list.push({
          id: 'risk-alert',
          type: 'risk',
          title: 'Risk Alert: Consecutive Loss',
          description: 'You hit 2 losses in a row. Close the terminal for today to protect your capital.',
          time: 'Just now',
          isNew: true,
          priority: 'high'
        });
      }
    }

    return list;
  }, [trades]);

  const handleSaveTrade = (tradeData: Omit<Trade, 'id'>, id?: string) => {
    if (id) {
      setTrades(prev => prev.map(t => t.id === id ? { ...tradeData, id } : t));
    } else {
      const newTrade: Trade = { ...tradeData, id: Math.random().toString(36).substr(2, 9) };
      setTrades(prev => [newTrade, ...prev]);
    }
    setEditingTrade(null);
  };

  const handleDeleteTrade = (id: string) => {
    if (confirm('Delete trade?')) {
      setTrades(prev => prev.filter(t => t.id !== id));
      setIsFormOpen(false);
      setEditingTrade(null);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0b0e14] text-slate-200 font-sans">
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] lg:hidden transition-opacity" onClick={toggleMobileMenu} />
      )}

      <aside className={`fixed lg:relative h-full bg-[#151921] border-r border-[#2d3748] flex flex-col transition-all duration-500 ease-in-out z-[90] ${isMobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'} ${isSidebarOpen ? 'lg:w-64' : 'lg:w-20'}`}>
        <div className="p-6 flex items-center gap-3 h-20 overflow-hidden">
          <div className="w-10 h-10 bg-[#8B5CF6] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20 border border-purple-400/20">
            <Zap className="w-6 h-6 text-white" />
          </div>
          {(isSidebarOpen || isMobileMenuOpen) && (
            <div className="animate-in fade-in slide-in-from-left-2 duration-300">
              <h1 className="text-sm font-black tracking-[0.2em] text-white uppercase">TRADEZILLA</h1>
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Professional Edge</p>
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 mt-4 space-y-1.5 overflow-y-auto custom-scrollbar overflow-x-hidden">
          <NavItem icon={<LayoutGrid size={22} />} label="Cockpit" active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} expanded={isSidebarOpen || isMobileMenuOpen} />
          <NavItem icon={<BarChart2 size={22} />} label="Trade Log" active={activeTab === 'trades'} onClick={() => { setActiveTab('trades'); setIsMobileMenuOpen(false); }} expanded={isSidebarOpen || isMobileMenuOpen} />
          <NavItem icon={<PieChart size={22} />} label="Reports" active={activeTab === 'reports'} onClick={() => { setActiveTab('reports'); setIsMobileMenuOpen(false); }} expanded={isSidebarOpen || isMobileMenuOpen} />
          <div className="my-6 px-4"><div className="h-px bg-gradient-to-r from-transparent via-[#2d3748] to-transparent"></div></div>
          <NavItem icon={<Brain size={22} />} label="AI Analyst" active={activeTab === 'ai'} onClick={() => { setActiveTab('ai'); setIsMobileMenuOpen(false); }} expanded={isSidebarOpen || isMobileMenuOpen} />
        </nav>

        <div className="p-3 border-t border-[#2d3748] space-y-1.5">
          <NavItem icon={<Settings size={22} />} label="Settings" active={false} onClick={() => {}} expanded={isSidebarOpen || isMobileMenuOpen} />
          <button onClick={toggleSidebar} className="hidden lg:flex items-center justify-center w-full p-3 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300">
            {isSidebarOpen ? <div className="flex items-center gap-3 w-full"><ChevronLeft size={22} /><span className="text-[10px] font-black uppercase tracking-widest">Collapse Menu</span></div> : <ChevronRight size={22} />}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-[#0b0e14]">
        <header className="h-20 border-b border-[#2d3748] flex items-center justify-between px-4 sm:px-8 bg-[#0b0e14]/80 backdrop-blur-xl sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <button onClick={toggleMobileMenu} className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"><Menu size={24} /></button>
            <div className="hidden lg:block">
              <h2 className="text-xs font-black text-white uppercase tracking-[0.3em] opacity-80">
                {activeTab === 'dashboard' ? 'COCKPIT' : activeTab === 'trades' ? 'TRADE LOG' : activeTab === 'reports' ? 'PERFORMANCE REPORTS' : 'AI ANALYST'}
              </h2>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">High Performance Interface</p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
             <div className="hidden md:flex items-center px-4 py-2 bg-[#151921] border border-[#2d3748] rounded-xl gap-3 text-slate-400 focus-within:border-purple-500/50 focus-within:bg-[#1a202c] transition-all">
               <Search size={16} className="text-slate-500" />
               <input type="text" placeholder="Search data..." className="bg-transparent border-none outline-none text-[11px] w-48 placeholder:text-slate-600 font-bold uppercase tracking-wider" />
             </div>
             <button onClick={() => { setEditingTrade(null); setIsFormOpen(true); }} className="flex items-center gap-2.5 bg-[#8B5CF6] text-white px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider hover:bg-purple-600 active:scale-95 transition-all shadow-lg shadow-purple-500/20 border border-purple-400/30"><Plus size={16} /> <span className="hidden sm:inline">Add Trade</span></button>
             <div className="w-px h-8 bg-[#2d3748] hidden sm:block"></div>
             <div className="flex items-center gap-2">
                <div className="relative" ref={notificationRef}>
                  <button onClick={() => setIsNotificationOpen(!isNotificationOpen)} className={`p-2.5 rounded-xl transition-all relative ${isNotificationOpen ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
                    <Bell size={20} />
                    {systemNotifications.some(n => n.isNew) && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#0b0e14]"></span>}
                  </button>
                  {isNotificationOpen && <NotificationDropdown notifications={systemNotifications} />}
                </div>

                <div className="relative" ref={profileRef}>
                  <div onClick={() => setIsProfileOpen(!isProfileOpen)} className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[1px] cursor-pointer hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-purple-500/20">
                     <div className="w-full h-full rounded-xl bg-[#0b0e14] flex items-center justify-center">
                       <span className="text-xs font-black text-white">{userName.split(' ').map(n => n[0]).join('').toUpperCase()}</span>
                     </div>
                  </div>
                  {isProfileOpen && (
                    <ProfileDropdown 
                      userName={userName} 
                      setUserName={setUserName} 
                      isEditing={isEditingProfile} 
                      setIsEditing={setIsEditingProfile} 
                    />
                  )}
                </div>
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar scroll-smooth">
          <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {activeTab === 'dashboard' && <Dashboard trades={trades} />}
            {activeTab === 'trades' && <TradeList trades={trades} onEdit={(t) => { setEditingTrade(t); setIsFormOpen(true); }} onDelete={handleDeleteTrade} />}
            {activeTab === 'reports' && <Reports trades={trades} />}
            {activeTab === 'ai' && <AIAnalyst trades={trades} />}
          </div>
        </div>
      </main>

      {isFormOpen && <TradeForm onSubmit={handleSaveTrade} onDelete={handleDeleteTrade} onClose={() => { setIsFormOpen(false); setEditingTrade(null); }} initialData={editingTrade} />}
    </div>
  );
};

const NotificationDropdown = ({ notifications }: { notifications: SystemNotification[] }) => (
  <div className="absolute top-full right-0 mt-3 w-80 bg-[#151921] border border-[#2d3748] rounded-2xl shadow-2xl z-[100] animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
    <div className="p-4 border-b border-[#2d3748] flex items-center justify-between bg-white/[0.02]">
      <h3 className="text-[10px] font-black uppercase tracking-widest text-white">Alert System</h3>
      <button className="text-[9px] font-bold text-indigo-400 uppercase hover:text-indigo-300">Clear</button>
    </div>
    <div className="max-h-96 overflow-y-auto custom-scrollbar">
      {notifications.length > 0 ? notifications.map(n => (
        <NotificationItem 
          key={n.id}
          icon={n.type === 'risk' ? <AlertTriangle className="text-red-500" size={14} /> : n.type === 'summary' ? <CheckCircle2 className="text-[#00E396]" size={14} /> : <Info className="text-blue-400" size={14} />} 
          title={n.title} 
          desc={n.description} 
          time={n.time} 
          isNew={n.isNew} 
          priority={n.priority}
        />
      )) : (
        <div className="p-8 text-center text-slate-600 text-[10px] font-bold uppercase">No Alerts</div>
      )}
    </div>
  </div>
);

interface NotificationItemProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  time: string;
  isNew?: boolean;
  priority?: string;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ icon, title, desc, time, isNew = false, priority }) => (
  <div className={`p-4 hover:bg-white/[0.02] transition-colors cursor-pointer border-b border-[#2d3748]/30 relative group ${isNew ? 'bg-indigo-500/5' : ''}`}>
    {isNew && <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${priority === 'high' ? 'bg-red-500' : 'bg-indigo-500'}`}></div>}
    <div className="flex gap-3">
      <div className={`w-8 h-8 rounded-lg bg-[#0b0e14] border ${priority === 'high' ? 'border-red-500/50' : 'border-[#2d3748]'} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-0.5">
          <p className={`text-[11px] font-black ${priority === 'high' ? 'text-red-400' : 'text-white'}`}>{title}</p>
          <span className="text-[8px] font-bold text-slate-600">{time}</span>
        </div>
        <p className="text-[10px] font-medium text-slate-400 leading-relaxed">{desc}</p>
      </div>
    </div>
  </div>
);

const ProfileDropdown = ({ userName, setUserName, isEditing, setIsEditing }: { userName: string, setUserName: (v: string) => void, isEditing: boolean, setIsEditing: (v: boolean) => void }) => {
  const [tempName, setTempName] = useState(userName);

  const handleSave = () => {
    setUserName(tempName);
    setIsEditing(false);
  };

  return (
    <div className="absolute top-full right-0 mt-3 w-64 bg-[#151921] border border-[#2d3748] rounded-2xl shadow-2xl z-[100] animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
      <div className="p-5 bg-gradient-to-br from-indigo-500/10 to-transparent border-b border-[#2d3748]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#0b0e14] border border-[#2d3748] flex items-center justify-center text-lg font-black text-white">
             {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          <div className="flex-1">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input 
                  autoFocus
                  className="bg-[#0b0e14] border border-[#2d3748] text-white text-xs px-2 py-1 rounded w-full outline-none focus:border-indigo-500"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                />
                <button onClick={handleSave} className="p-1 bg-indigo-600 text-white rounded"><Check size={14}/></button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">{userName}</h3>
                  <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mt-0.5">Pro Level</p>
                </div>
                <button onClick={() => setIsEditing(true)} className="p-1 text-slate-600 hover:text-white transition-colors"><Edit2 size={12} /></button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-2">
        <ProfileLink icon={<User size={16} />} label="View Profile" />
        <ProfileLink icon={<Shield size={16} />} label="Security" />
        <ProfileLink icon={<CreditCard size={16} />} label="Billing" />
      </div>

      <button onClick={() => { if(confirm('Logout?')) window.location.reload(); }} className="w-full p-4 flex items-center gap-3 text-red-500 hover:bg-red-500/5 transition-colors border-t border-[#2d3748]">
        <LogOut size={16} /><span className="text-[10px] font-black uppercase tracking-widest">Sign Out</span>
      </button>
    </div>
  );
};

const ProfileLink = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
  <button className="flex items-center gap-3 w-full p-3 text-slate-400 hover:text-white hover:bg-white/[0.05] rounded-xl transition-all group">
    <div className="text-slate-500 group-hover:text-indigo-400 transition-colors">{icon}</div>
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

const NavItem = ({ icon, label, active, onClick, expanded }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, expanded: boolean }) => (
  <button onClick={onClick} className={`flex items-center gap-4 w-full p-3.5 rounded-xl transition-all duration-300 relative group active:scale-[0.98] ${active ? 'bg-[#8B5CF6] text-white shadow-xl shadow-purple-500/20' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}`}>
    <div className={`flex-shrink-0 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>{icon}</div>
    <div className={`overflow-hidden transition-all duration-500 whitespace-nowrap ${expanded ? 'max-w-[200px] opacity-100' : 'max-w-0 opacity-0'}`}><span className="text-[11px] font-black uppercase tracking-wider">{label}</span></div>
    {!expanded && <div className="absolute left-full ml-6 px-3 py-1.5 bg-[#151921] border border-[#2d3748] rounded-lg text-[10px] font-black text-white uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100] shadow-2xl">{label}</div>}
    {active && expanded && <div className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_8px_white]"></div>}
  </button>
);

export default App;