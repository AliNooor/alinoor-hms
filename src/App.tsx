import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, BedDouble, UserPlus, LogOut, 
  CheckCircle2, AlertCircle, IndianRupee, 
  Users, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
interface Room {
  id: string;
  type: 'Single' | 'Double' | 'Suite';
  status: 'occupied' | 'available';
  student: string | null;
  feePaid: boolean;
  floor: string;
}

interface ToastMessage {
  text: string;
  type: 'success' | 'error';
}

// --- Theme Constants ---
const COLORS = {
  primary: '#1A2E5A', 
  secondary: '#62A9A9',
  bg: '#F4F7F9'
};

const App = () => {
  // Load data from LocalStorage or use defaults
  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = localStorage.getItem('hostel_data');
    return saved ? JSON.parse(saved) : [
      { id: '101', type: 'Single', status: 'occupied', student: 'Ahmed Khan', feePaid: true, floor: '1st' },
      { id: '102', type: 'Double', status: 'available', student: null, feePaid: false, floor: '1st' },
      { id: '201', type: 'Double', status: 'occupied', student: 'Zainab Bibi', feePaid: false, floor: '2nd' },
      { id: '301', type: 'Suite', status: 'available', student: null, feePaid: false, floor: '3rd' },
      { id: '302', type: 'Double', status: 'available', student: null, feePaid: false, floor: '3rd' },
    ];
  });

  const [currentPage, setCurrentPage] = useState<'dashboard' | 'rooms' | 'allocate' | 'vacate'>('dashboard');
  const [formData, setFormData] = useState({ studentName: '', roomId: '' });
  const [message, setMessage] = useState<ToastMessage | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'occupied'>('all');

  // Persistence Sync
  useEffect(() => {
    localStorage.setItem('hostel_data', JSON.stringify(rooms));
  }, [rooms]);

  // Real-time Calculations
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
  const availableRooms = totalRooms - occupiedRooms;
  const pendingFees = rooms.filter(r => r.status === 'occupied' && !r.feePaid).length;

  const showToast = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAllocate = (e: React.FormEvent) => {
    e.preventDefault();
    const targetRoom = rooms.find(r => r.id === formData.roomId);
    
    if (!targetRoom) return showToast('Invalid Room ID', 'error');
    if (targetRoom.status !== 'available') return showToast('Room already occupied', 'error');

    setRooms(prev => prev.map(r => 
      r.id === formData.roomId 
        ? { ...r, status: 'occupied', student: formData.studentName, feePaid: false } 
        : r
    ));
    
    setFormData({ studentName: '', roomId: '' });
    setCurrentPage('rooms');
    showToast(`${formData.studentName} assigned to Room ${formData.roomId}`, 'success');
  };

  const toggleFeeStatus = (id: string) => {
    setRooms(prev => prev.map(r => 
      r.id === id ? { ...r, feePaid: !r.feePaid } : r
    ));
    showToast('Fee status updated', 'success');
  };

  const handleVacate = (id: string) => {
    if(window.confirm(`Are you sure you want to vacate room ${id}?`)) {
        setRooms(prev => prev.map(r => 
          r.id === id ? { ...r, status: 'available', student: null, feePaid: false } : r
        ));
        showToast(`Room ${id} is now vacant`, 'success');
    }
  };

  const filteredRooms = rooms.filter(r => {
    const matchesFilter = filterStatus === 'all' || r.status === filterStatus;
    return matchesFilter;
  });

  // --- UI Components ---

  const Header = ({ title, subtitle, color = COLORS.primary }: { title: string, subtitle: string, color?: string }) => (
    <div className="pt-10 pb-16 px-6 text-white rounded-b-[48px] relative overflow-hidden" 
         style={{ backgroundColor: color }}>
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-display font-black tracking-tight">{title}</h1>
          <p className="text-sm opacity-80 font-medium font-sans mt-0.5">{subtitle}</p>
        </div>
        <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md border border-white/30">
          <LayoutDashboard size={24} />
        </div>
      </div>
    </div>
  );

  const Dashboard = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="pb-32"
    >
      <Header title="HMS Admin" subtitle="Pak-Austria Hostel Management" />
      
      <div className="px-6 -mt-8 grid grid-cols-2 gap-4 relative z-20">
        {[
          { label: 'Total Rooms', val: totalRooms, color: '#1A2E5A', icon: <BedDouble size={18}/> },
          { label: 'Available', val: availableRooms, color: '#62A9A9', icon: <CheckCircle2 size={18}/> },
          { label: 'Occupied', val: occupiedRooms, color: '#F59E0B', icon: <Users size={18}/> },
          { label: 'Pending Fees', val: pendingFees, color: '#EF4444', icon: <IndianRupee size={18}/> },
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            whileHover={{ scale: 1.02 }}
            className="bg-white p-5 rounded-[32px] shadow-sm border border-gray-100 flex flex-col justify-between h-32"
          >
            <div className="flex items-center gap-2 text-gray-400">
                <div className="p-2 rounded-xl bg-gray-50" style={{ color: stat.color }}>
                  {stat.icon}
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wider font-display">{stat.label}</p>
            </div>
            <h3 className="text-3xl font-display font-black" style={{ color: stat.color }}>{stat.val}</h3>
          </motion.div>
        ))}
      </div>

      <div className="mt-10 px-6">
        <h4 className="text-brand-primary font-display font-extrabold mb-5 flex items-center gap-2 text-lg">
            <AlertCircle size={20} className="text-orange-500" /> 
            Urgent Alerts
        </h4>
        <div className="space-y-4">
          <AnimatePresence>
            {rooms.filter(r => r.status === 'occupied' && !r.feePaid).map(room => (
              <motion.div 
                key={room.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-red-50/50 backdrop-blur-sm border border-red-100 flex items-center justify-between p-5 rounded-3xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-500">
                    <IndianRupee size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-base text-red-900 font-display">{room.student}</p>
                    <p className="text-[10px] text-red-600 font-bold uppercase tracking-widest font-sans">Room {room.id} • Fee Pending</p>
                  </div>
                </div>
                <button 
                  onClick={() => toggleFeeStatus(room.id)} 
                  className="bg-red-600 hover:bg-red-700 text-white text-[11px] px-4 py-2 rounded-xl font-bold font-display shadow-lg shadow-red-200 transition-colors"
                >
                  SET PAID
                </button>
              </motion.div>
            ))}
            {pendingFees === 0 && (
              <p className="text-gray-400 text-center py-4 bg-white/50 rounded-3xl border border-dashed border-gray-200 font-medium text-sm italic">No pending fee alerts at this moment.</p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );

  const RoomManagement = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="pb-32"
    >
      <Header title="All Rooms" subtitle="Live occupancy & status tracking" color={COLORS.secondary} />
      <div className="px-6 mt-6">
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {(['all', 'available', 'occupied'] as const).map(s => (
                <button 
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-6 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-wider font-display transition-all ${filterStatus === s ? 'bg-brand-primary text-white shadow-lg shadow-blue-100' : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'}`}
                >
                    {s}
                </button>
            ))}
        </div>
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredRooms.map(room => (
              <motion.div 
                key={room.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="bg-white rounded-[32px] p-5 flex items-center justify-between shadow-sm border border-gray-50/50"
              >
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${room.status === 'occupied' ? 'bg-orange-50 text-orange-500' : 'bg-teal-50 text-teal-600'}`}>
                    <BedDouble size={28} />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-brand-primary text-lg">Room {room.id}</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide font-sans">{room.student || 'Ready for Allocation'}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-[10px] px-3 py-1 rounded-lg font-black uppercase tracking-wider ${room.status === 'occupied' ? 'bg-orange-100 text-orange-700' : 'bg-teal-100 text-teal-700'}`}>
                      {room.status}
                  </span>
                  {room.status === 'occupied' && (
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${room.feePaid ? 'bg-teal-500 animate-pulse' : 'bg-red-500 animate-pulse'}`} />
                        <span className={`text-[10px] font-bold font-sans ${room.feePaid ? 'text-teal-600' : 'text-red-500'}`}>
                            {room.feePaid ? 'FEES PAID' : 'FEES DUE'}
                        </span>
                      </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#F4F7F9] selection:bg-teal-100 font-sans">
      {/* Toast Notification */}
      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm"
          >
            <div className={`px-6 py-4 rounded-[24px] text-white text-sm font-bold shadow-2xl flex items-center gap-3 ${message.type === 'success' ? 'bg-teal-600' : 'bg-red-500'}`}>
              <div className="bg-white/20 p-1.5 rounded-lg">
                {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              </div>
              {message.text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-md mx-auto min-h-screen bg-[#F4F7F9] relative shadow-[0_0_80px_rgba(0,0,0,0.05)] border-x border-gray-100/50">
        <div className="min-h-screen">
          <AnimatePresence mode="wait">
            {currentPage === 'dashboard' && <Dashboard key="dashboard" />}
            {currentPage === 'rooms' && <RoomManagement key="rooms" />}
            {currentPage === 'allocate' && (
              <motion.div 
                key="allocate"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8 pt-16 flex flex-col h-full"
              >
                  <h2 className="text-3xl font-display font-black text-brand-primary mb-3">Room Allocation</h2>
                  <p className="text-gray-400 text-sm mb-10 font-medium font-sans">Assign a new resident to an available hostel room.</p>
                  <form onSubmit={handleAllocate} className="space-y-6">
                      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 group transition-all focus-within:ring-2 focus-within:ring-teal-500/20">
                          <label className="text-[11px] font-black text-gray-300 uppercase block mb-3 tracking-widest font-display">Student Full Name</label>
                          <input 
                              required 
                              className="w-full bg-transparent focus:outline-none font-bold text-brand-primary text-lg placeholder:text-gray-200" 
                              placeholder="e.g. Mustafa Ahmed"
                              value={formData.studentName}
                              onChange={e => setFormData({...formData, studentName: e.target.value})}
                          />
                      </div>
                      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 group transition-all focus-within:ring-2 focus-within:ring-teal-500/20">
                          <label className="text-[11px] font-black text-gray-300 uppercase block mb-3 tracking-widest font-display">Assign Room ID</label>
                          <div className="relative">
                            <select 
                                required 
                                className="w-full bg-transparent focus:outline-none font-bold text-brand-primary text-lg appearance-none cursor-pointer"
                                value={formData.roomId}
                                onChange={e => setFormData({...formData, roomId: e.target.value})}
                            >
                                <option value="" className="text-gray-400">Select a room...</option>
                                {rooms.filter(r => r.status === 'available').map(r => (
                                    <option key={r.id} value={r.id} className="text-brand-primary">Room {r.id} — {r.type}</option>
                                ))}
                            </select>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                              <ChevronRight size={20} className="rotate-90" />
                            </div>
                          </div>
                      </div>
                      <button type="submit" className="w-full bg-brand-secondary hover:bg-[#539292] text-white py-6 rounded-[32px] font-display font-black text-base uppercase tracking-[0.2em] shadow-xl shadow-teal-100 active:scale-95 transition-all">
                          Confirm & Save
                      </button>
                  </form>
              </motion.div>
            )}
            {currentPage === 'vacate' && (
              <motion.div 
                key="vacate"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8 pt-16"
              >
                  <h2 className="text-3xl font-display font-black text-brand-primary mb-3">Check Out</h2>
                  <p className="text-gray-400 text-sm mb-10 font-medium font-sans">View active residents and manage move-out requests.</p>
                  <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                      {rooms.filter(r => r.status === 'occupied').map(r => (
                          <motion.div 
                            key={r.id}
                            layout
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white p-6 rounded-[40px] flex items-center justify-between border border-gray-100 shadow-sm"
                          >
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-brand-primary font-bold">
                                  {r.id}
                                </div>
                                <div className="flex flex-col">
                                    <h4 className="font-display font-black text-brand-primary text-base leading-tight">{r.student}</h4>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Floor • {r.floor}</p>
                                </div>
                              </div>
                              <button 
                                onClick={() => handleVacate(r.id)} 
                                className="p-4 bg-red-50 hover:bg-red-100 text-red-500 rounded-2xl transition-colors shadow-sm"
                                title="Vacate Room"
                              >
                                  <LogOut size={22} />
                              </button>
                          </motion.div>
                      ))}
                      {rooms.filter(r => r.status === 'occupied').length === 0 && (
                        <div className="text-center py-20">
                          <Users size={48} className="mx-auto text-gray-200 mb-4" />
                          <p className="text-gray-400 font-medium italic">No active residents found.</p>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-6 pb-8 pt-4 z-50">
            <div className="bg-white/70 backdrop-blur-2xl rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/40 px-8 py-5 flex justify-between items-center">
                {[
                    { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
                    { id: 'rooms', icon: BedDouble, label: 'Rooms' },
                    { id: 'allocate', icon: UserPlus, label: 'Assign' },
                    { id: 'vacate', icon: LogOut, label: 'Vacate' },
                ].map(item => (
                    <button 
                        key={item.id}
                        onClick={() => setCurrentPage(item.id as any)}
                        className={`flex flex-col items-center gap-1.5 transition-all relative ${currentPage === item.id ? 'text-brand-secondary' : 'text-gray-300 hover:text-gray-400'}`}
                    >
                        {currentPage === item.id && (
                          <motion.div 
                            layoutId="nav-glow"
                            className="absolute -top-3 w-8 h-1 bg-brand-secondary rounded-full"
                            transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                          />
                        )}
                        <item.icon size={22} strokeWidth={currentPage === item.id ? 2.5 : 2} className="transition-transform duration-300" />
                        <span className="text-[9px] font-black uppercase tracking-wider font-display">{item.label}</span>
                    </button>
                ))}
            </div>
        </nav>
      </main>
    </div>
  );
};

export default App;
