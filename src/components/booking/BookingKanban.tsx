import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import {
  Plus,
  Clock,
  Users,
  AlertCircle,
  MoreHorizontal,
  Calendar as CalendarIcon,
  Sun,
  Moon,
  X,
  Save,
  CheckCircle,
  Phone,
  MessageSquare,
  ArrowRight,
  Ban,
  UserX,
  RefreshCw,
  HelpCircle,
  Edit,
  Search,
  ChevronLeft,
  ChevronRight,
  Archive,
  LayoutGrid,
  List,
  ChevronDown,
  Filter,
  MoreVertical,
  Eye,
  Mail
} from 'lucide-react';
import { Booking, BookingStatus } from '../../types';
import { bookingService } from '../../services/bookingService';
import CheckoutModal from './CheckoutModal'; // Added CheckoutModal import
import { settingsService } from '../../services/settingsService';
import { tableService } from '../../services/tableService';
import { Table } from '../../types';

const sourceLabels: Record<string, string> = {
  website: 'Website',
  facebook: 'Fanpage',
  hotline: 'Hotline',
  walk_in: 'Walk-in',
  ota: 'OTA'
};

const sourceColors: Record<string, string> = {
  website: 'bg-blue-100 text-blue-700',
  facebook: 'bg-indigo-100 text-indigo-700',
  hotline: 'bg-green-100 text-green-700',
  walk_in: 'bg-orange-100 text-orange-700',
  ota: 'bg-purple-100 text-purple-700'
};

const columns: { id: BookingStatus; label: string; color: string; borderColor: string; icon?: any }[] = [
  { id: 'new', label: 'Mới nhận', color: 'bg-blue-50', borderColor: 'border-blue-500', icon: Plus },
  { id: 'waiting_info', label: 'Chờ bổ sung', color: 'bg-yellow-50', borderColor: 'border-yellow-400', icon: HelpCircle },
  { id: 'pending', label: 'Chờ xác nhận', color: 'bg-orange-50', borderColor: 'border-orange-400', icon: Clock },
  { id: 'confirmed', label: 'Đã xác nhận', color: 'bg-green-50', borderColor: 'border-green-500', icon: CheckCircle },
  { id: 'change_requested', label: 'Đổi giờ/ngày', color: 'bg-purple-50', borderColor: 'border-purple-400', icon: RefreshCw },
  { id: 'arrived', label: 'Đã đến', color: 'bg-teal-50', borderColor: 'border-teal-500', icon: Users },
  { id: 'no_show', label: 'Không đến', color: 'bg-red-50', borderColor: 'border-red-400', icon: UserX },
  { id: 'cancelled', label: 'Đã hủy', color: 'bg-gray-100', borderColor: 'border-gray-400', icon: Ban },
  { id: 'completed', label: 'Hoàn thành', color: 'bg-gray-100', borderColor: 'border-gray-400', icon: Archive },
];

const boardColumns = [
  { id: 'col_action', label: 'Cần xử lý', color: 'bg-red-50', borderColor: 'border-red-400', icon: AlertCircle, statuses: ['new', 'waiting_info', 'pending', 'change_requested'], defaultStatus: 'new' },
  { id: 'col_confirmed', label: 'Đã chốt', color: 'bg-green-50', borderColor: 'border-green-500', icon: CheckCircle, statuses: ['confirmed'], defaultStatus: 'confirmed' },
  { id: 'col_serving', label: 'Đang phục vụ', color: 'bg-teal-50', borderColor: 'border-teal-500', icon: Users, statuses: ['arrived'], defaultStatus: 'arrived' },
];

interface BookingKanbanProps {
  isModalOpen?: boolean;
  onToggleModal?: (isOpen: boolean) => void;
  onAddBooking?: () => void;
}

export default function BookingKanban({ isModalOpen, onToggleModal, onAddBooking }: BookingKanbanProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [appSettings, setAppSettings] = useState<any>({});
  const [filterShift, setFilterShift] = useState<'all' | 'lunch' | 'dinner'>('all');
  const [isMobile, setIsMobile] = useState(false);

  // View & Filter States
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeStatusTab, setActiveStatusTab] = useState<'action_needed' | 'upcoming' | 'active' | 'done'>('action_needed');
  const [selectedStatuses, setSelectedStatuses] = useState<BookingStatus[]>([]);

  // UI Interactive States
  const [statusDropdownId, setStatusDropdownId] = useState<string | null>(null);
  const [historyDropBooking, setHistoryDropBooking] = useState<Booking | null>(null);
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);

  // Checkout States
  const [checkoutBooking, setCheckoutBooking] = useState<{ id: string, customerId?: string } | null>(null);
  const [checkoutAmount, setCheckoutAmount] = useState('');

  // Load bookings from Supabase
  const fetchBookings = async () => {
    try {
      const data = await bookingService.getBookings();
      setBookings(data);
    } catch (error) {
      console.error('Failed to load bookings', error);
    }
  };

  const fetchTables = async () => {
    try {
      const data = await tableService.getTables();
      setTables(data);
    } catch (error) {
      console.error('Failed to load tables', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const cfg = await settingsService.getAppSettings();
      setAppSettings(cfg);
    } catch (error) {
      console.error('Failed to parse settings', error);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchTables();
    fetchSettings();

    // Subscribe to realtime updates
    const subscription = bookingService.subscribeToBookings(() => {
      // Refresh data when a change occurs
      fetchBookings();
    });

    return () => {
      // Clean up subscription when component unmounts
      subscription.unsubscribe();
    };
  }, []);

  // Internal modal state for when component is used without controlling props
  const [internalIsModalOpen, setInternalIsModalOpen] = useState(false);
  const showModal = isModalOpen !== undefined ? isModalOpen : internalIsModalOpen;
  const setShowModal = onToggleModal || setInternalIsModalOpen;

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      const pName = searchParams.get('name') || '';
      const pPhone = searchParams.get('phone') || '';

      setNewBooking(prev => ({
        ...prev,
        customerName: pName,
        phone: pPhone
      }));
      setShowModal(true);

      // Clean up the URL to not pop modal again on reload
      navigate(location.pathname, { replace: true });
    }
  }, [searchParams, navigate, location.pathname, setShowModal]);

  // Mobile Action Sheet State
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Pending Status Update State (when forced to choose table before arriving)
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<{ id: string, status: BookingStatus } | null>(null);

  // Horizontal Scroll Rep
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollKanban = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth > 1024 ? 600 : 300;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  // Status Groups Definition
  const statusGroups = {
    action_needed: ['new', 'waiting_info', 'pending', 'change_requested'],
    upcoming: ['confirmed'],
    active: ['arrived'],
    done: ['completed', 'cancelled', 'no_show']
  };

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'action_needed': return 'Cần xử lý';
      case 'upcoming': return 'Đã chốt';
      case 'active': return 'Đang phục vụ';
      case 'done': return 'Lịch sử';
      default: return '';
    }
  };

  const getTabCount = (tab: 'action_needed' | 'upcoming' | 'active' | 'done') => {
    return bookings.filter(b => statusGroups[tab].includes(b.status) && (!b.bookingDate || b.bookingDate === selectedDate)).length;
  };

  // Toggle status filter
  const toggleStatusFilter = (status: BookingStatus) => {
    setSelectedStatuses(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  // Filter Logic
  const filteredBookings = bookings.filter(b => {
    // 0. Filter by Date (Essential!)
    if (b.bookingDate && b.bookingDate !== selectedDate) return false;

    // 1. Filter by Tab (Mobile only logic)
    if (isMobile && !statusGroups[activeStatusTab].includes(b.status)) return false;

    // 2. Filter by Status (Desktop only)
    if (!isMobile && selectedStatuses.length > 0 && !selectedStatuses.includes(b.status)) return false;

    // 3. Filter by Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchSearch =
        (b.customerName || '').toLowerCase().includes(query) ||
        (b.phone || '').includes(query) ||
        (b.email || '').toLowerCase().includes(query);
      if (!matchSearch) return false;
    }

    // 4. Filter by Shift (Ca trưa / Ca tối)
    if (filterShift && filterShift !== 'all') {
      const hour = parseInt(b.time?.split(':')[0] || '0', 10);

      const lunchStart = appSettings?.lunchStart || 11;
      const lunchEnd = appSettings?.lunchEnd || 14;
      const dinnerStart = appSettings?.dinnerStart || 17;
      const dinnerEnd = appSettings?.dinnerEnd || 22;

      // Logic check matching the user's settings window ranges
      if (filterShift === 'lunch' && (hour < lunchStart || hour > lunchEnd)) return false;
      if (filterShift === 'dinner' && (hour < dinnerStart || hour > dinnerEnd)) return false;
    }

    return true;
  });

  // New Booking Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newBooking, setNewBooking] = useState<Partial<Booking>>({
    customerName: '',
    phone: '',
    email: '',
    time: '',
    bookingDate: new Date().toISOString().split('T')[0],
    pax: 2,
    notes: [],
    source: 'hotline',
    selectedMenus: [],
    tableId: '',
    tableName: ''
  });
  const [noteInput, setNoteInput] = useState('');

  // Duplicate Check Logic
  const [duplicateBooking, setDuplicateBooking] = useState<Booking | null>(null);
  // Slot Suggestion Logic
  const [suggestedSlots, setSuggestedSlots] = useState<string[]>([]);

  useEffect(() => {
    if (newBooking.phone && newBooking.phone.length > 3) {
      const found = bookings.find(b =>
        b.phone === newBooking.phone &&
        b.id !== editingId // Don't warn if editing the same booking
      );
      setDuplicateBooking(found || null);
    } else {
      setDuplicateBooking(null);
    }
  }, [newBooking.phone, bookings, editingId]);

  // Mock Slot Availability Check
  useEffect(() => {
    if (newBooking.time === '19:00') {
      setSuggestedSlots(['18:30', '19:30', '20:00']);
    } else {
      setSuggestedSlots([]);
    }
  }, [newBooking.time]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reset form when modal closes
  useEffect(() => {
    if (!showModal) {
      setEditingId(null);
      setNewBooking({ customerName: '', phone: '', email: '', time: '', bookingDate: selectedDate, pax: 2, notes: [], area: undefined, source: 'hotline' });
      setPendingStatusUpdate(null);
    }
  }, [showModal]);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    const sourceDroppable = source.droppableId;
    const destDroppable = destination.droppableId;

    if (sourceDroppable === destDroppable) return;

    const destColumn = boardColumns.find(c => c.id === destDroppable);
    if (!destColumn) return;
    const newStatus = destColumn.defaultStatus as BookingStatus;

    // Check for empty table assignment on "arrived"
    if (newStatus === 'arrived') {
      const bk = bookings.find(b => b.id === draggableId);
      if (bk && !bk.tableId) {
        alert('Vui lòng xếp bàn trước khi chuyển sang Đang phục vụ!');
        setPendingStatusUpdate({ id: draggableId, status: 'arrived' });
        handleEditBooking(bk);
        return;
      }
    }

    // If dropped on serving column from confirmed, auto-set arrived
    // (default behavior handles this via defaultStatus)

    if (newStatus === 'completed') {
      // Intercept and show checkout modal (fallback if manually changed to completed without going through history)
      const bk = bookings.find(b => b.id === draggableId);
      setCheckoutBooking({ id: draggableId, customerId: (bk as any)?.customer_id });
      return;
    }

    // Optimistic UI update
    const updatedBookings = bookings.map(booking => {
      if (booking.id === draggableId) {
        return { ...booking, status: newStatus };
      }
      return booking;
    });

    setBookings(updatedBookings);

    // Update in Supabase
    try {
      await bookingService.updateBookingStatus(draggableId, newStatus);
    } catch (error) {
      // Revert if failed
      fetchBookings();
      alert('Lỗi cập nhật trạng thái');
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    if (newStatus === 'completed') {
      const bk = bookings.find(b => b.id === bookingId);
      setCheckoutBooking({ id: bookingId, customerId: (bk as any)?.customer_id });
      setSelectedBooking(null);
      return;
    }

    if (newStatus === 'arrived') {
      const bk = bookings.find(b => b.id === bookingId);
      if (bk && !bk.tableId) {
        alert('Vui lòng xếp bàn trước khi chuyển sang Đang phục vụ!');
        setPendingStatusUpdate({ id: bookingId, status: 'arrived' });
        handleEditBooking(bk);
        return;
      }
    }

    // Optimistic update
    setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
    setSelectedBooking(null);

    // Update in Supabase
    try {
      await bookingService.updateBookingStatus(bookingId, newStatus);
    } catch (error) {
      // Revert if failed
      fetchBookings();
      alert('Lỗi cập nhật trạng thái');
    }
  };

  const submitCheckout = async () => {
    if (!checkoutBooking) return;

    const amountNum = parseInt(checkoutAmount.replace(/\D/g, '')) || 0;

    // Optimistic update
    setBookings(bookings.map(b => b.id === checkoutBooking.id ? { ...b, status: 'completed' } : b));

    try {
      // For now we just update booking status. 
      // The database trigger will create the customer_visit.
      // But we still update the amount to DB if needed later via an edge function, 
      // or we can just send it along with a manual visit update.
      await bookingService.updateBookingStatus(checkoutBooking.id, 'completed');

      // Bonus: If you want to update the amount of the generated visit, you can call a custom function here or modify the trigger.

    } catch (err) {
      console.error(err);
      fetchBookings();
    }

    setCheckoutBooking(null);
    setCheckoutAmount('');
  };

  const handleSaveBooking = async () => {
    if (!newBooking.customerName || !newBooking.time) return;

    try {
      let assignedTableName = '';
      if (newBooking.tableId) {
        const matchedTable = tables.find(t => t.id === newBooking.tableId);
        assignedTableName = matchedTable ? matchedTable.name : '';
      }

      if (editingId) {
        // Update existing booking

        // Optimistic UI Update for faster response
        setBookings(bookings.map(b => b.id === editingId ? {
          ...b,
          customerName: newBooking.customerName!,
          phone: newBooking.phone,
          email: newBooking.email,
          time: newBooking.time!,
          bookingDate: newBooking.bookingDate!,
          pax: newBooking.pax || 2,
          notes: newBooking.notes,
          area: newBooking.area,
          source: newBooking.source,
          tableId: newBooking.tableId,
          tableName: assignedTableName
        } : b));

        await bookingService.updateBooking(editingId, {
          customerName: newBooking.customerName!,
          phone: newBooking.phone,
          email: newBooking.email,
          time: newBooking.time!,
          bookingDate: newBooking.bookingDate!,
          pax: newBooking.pax || 2,
          notes: newBooking.notes,
          area: newBooking.area,
          source: newBooking.source,
          tableId: newBooking.tableId,
          tableName: assignedTableName
        });
      } else {
        // Create new booking
        const bookingData = {
          customerName: newBooking.customerName!,
          phone: newBooking.phone,
          email: newBooking.email,
          time: newBooking.time!,
          bookingDate: newBooking.bookingDate!,
          pax: newBooking.pax || 2,
          status: 'new' as BookingStatus,
          notes: newBooking.notes,
          area: newBooking.area,
          source: newBooking.source
        };

        const created = await bookingService.createBooking(bookingData);
        // Optimistically put the created booking to view it instantly
        setBookings(prev => [created, ...prev]);
      }
      setShowModal(false);

      // Execute any pending status update (e.g., table assigned successfully after drag drop intercept)
      // We call bookingService.updateBookingStatus directly instead of handleStatusChange
      // because handleStatusChange re-checks bk.tableId from the stale React state closure
      if (pendingStatusUpdate && newBooking.tableId) {
        try {
          // Optimistic UI update for the status change
          setBookings(prev => prev.map(b =>
            b.id === pendingStatusUpdate.id
              ? { ...b, status: pendingStatusUpdate.status, tableId: newBooking.tableId }
              : b
          ));
          // Directly update status in database (this also triggers table sync)
          await bookingService.updateBookingStatus(pendingStatusUpdate.id, pendingStatusUpdate.status);
          setPendingStatusUpdate(null);
        } catch (e) {
          console.error("Failed executing pending status transition", e);
          fetchBookings(); // Revert on failure
        }
      }

    } catch (error) {
      console.error('Error saving booking', error);
      alert('Đã xảy ra lỗi khi lưu đặt bàn');
      fetchBookings(); // Refetch if anything breaks optimism
    }
  };

  const handleEditBooking = (booking: Booking) => {
    setEditingId(booking.id);
    setNewBooking({
      customerName: booking.customerName,
      phone: booking.phone,
      email: booking.email,
      time: booking.time,
      bookingDate: booking.bookingDate,
      pax: booking.pax,
      notes: booking.notes,
      area: booking.area,
      source: booking.source,
      customerType: booking.customerType,
      selectedMenus: booking.selectedMenus
    });
    setSelectedBooking(null); // Close mobile sheet if open
    setShowModal(true);
  };

  const handleAddNote = () => {
    if (noteInput.trim()) {
      setNewBooking({
        ...newBooking,
        notes: [...(newBooking.notes || []), noteInput.trim()]
      });
      setNoteInput('');
    }
  };

  // Helper to check missing info
  const isMissingInfo = (b: Booking) => {
    return !b.customerName || !b.phone || !b.time || !b.pax;
  };

  // --- Mobile View Components ---

  const renderMobileList = () => (
    <div className="h-full bg-gray-50 overflow-y-auto pb-24">
      {/* Mobile Filter Header */}
      <div className="bg-white px-4 py-3 border-b border-gray-200 shadow-sm flex flex-col gap-3">
        {/* Row 1: Date & Shift & Add */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
            <CalendarIcon className="w-4 h-4 text-gray-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              title="Chọn ngày"
              className="bg-transparent border-none text-sm font-bold text-gray-800 focus:ring-0 p-0 w-28"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setFilterShift('all')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${filterShift === 'all' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setFilterShift('lunch')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${filterShift === 'lunch' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
              >
                Trưa
              </button>
              <button
                onClick={() => setFilterShift('dinner')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${filterShift === 'dinner' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
              >
                Tối
              </button>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="p-1.5 bg-teal-600 text-white rounded-lg shadow-sm active:scale-95 transition-transform"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Row 2: Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm tên khách, SĐT, Email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Row 3: Status Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {(['action_needed', 'upcoming', 'active', 'done'] as const).map(tab => {
            const count = getTabCount(tab);
            const isActive = activeStatusTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveStatusTab(tab)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all
                  ${isActive
                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}
                `}
              >
                {getTabLabel(tab)}
                {count > 0 && (
                  <span className={`
                    px-1.5 py-0.5 rounded-full text-[10px] 
                    ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}
                  `}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Booking List */}
      <div className="p-4 space-y-3">
        {filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400 mt-10">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <Search className="w-8 h-8 opacity-20" />
            </div>
            <p className="text-sm">Không tìm thấy đơn đặt bàn nào</p>
          </div>
        ) : (
          filteredBookings
            .sort((a, b) => a.time.localeCompare(b.time))
            .map(booking => {
              const statusConfig = columns.find(c => c.id === booking.status);
              return (
                <div
                  key={booking.id}
                  onClick={() => setSelectedBooking(booking)}
                  className={`bg-white rounded-xl border ${isMissingInfo(booking) ? 'border-red-300 ring-1 ring-red-400/30' : 'border-gray-100'} active:scale-[0.98] transition-transform relative overflow-hidden`}
                >
                  {/* Status Indicator Bar - 3px */}
                  <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl ${isMissingInfo(booking) ? 'bg-red-500' : statusConfig?.borderColor.replace('border-', 'bg-')}`}></div>

                  <div className="pl-3.5 pr-3 py-3">
                    {/* Row 1: Name + Type + Status Badge */}
                    <div className="flex justify-between items-center gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <h4 className="font-bold text-sm text-gray-900 truncate">{booking.customerName || 'Không có tên'}</h4>
                        {booking.customerType === 'tour' ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 shrink-0">Tour</span>
                        ) : booking.customerType === 'retail' ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 shrink-0">Lẻ</span>
                        ) : null}
                        {isMissingInfo(booking) && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 shrink-0">⚠</span>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap shrink-0 ${statusConfig?.color} ${statusConfig?.borderColor.replace('border-', 'text-')}`}>
                        {statusConfig?.label}
                      </span>
                    </div>

                    {/* Row 2: Time + Pax + Source + Area */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" /> {booking.time || '--:--'}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Users className="w-3 h-3" /> {booking.pax || 0}
                      </span>
                      {booking.source && (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${sourceColors[booking.source] || 'bg-gray-100 text-gray-600'}`}>
                          {sourceLabels[booking.source] || booking.source}
                        </span>
                      )}
                      {booking.area && !booking.tableName && (
                        <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-medium uppercase text-gray-600">
                          {booking.area === 'indoor' ? 'Trong nhà' : booking.area === 'outdoor' ? 'Ngoài trời' : booking.area === 'vip' ? 'VIP' : 'Sân thượng'}
                        </span>
                      )}
                    </div>

                    {/* Row 3: Table + Notes (compact) */}
                    {(booking.tableName || (booking.notes && booking.notes.length > 0)) && (
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {booking.tableName && (
                          <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-teal-50 text-teal-700 rounded text-[10px] font-bold border border-teal-200">
                            <LayoutGrid className="w-3 h-3" />
                            {booking.tableName}
                          </span>
                        )}
                        {booking.notes && booking.notes.length > 0 && (
                          <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 truncate max-w-[180px]">
                            {booking.notes.join(', ')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
        )}
      </div>

      {/* Mobile Action Sheet (Bottom Sheet) */}
      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="bg-white w-full max-w-md rounded-t-2xl p-6 animate-in slide-in-from-bottom duration-300 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedBooking.customerName || 'Khách hàng'}</h3>
                {isMissingInfo(selectedBooking) && (
                  <div className="flex items-center gap-1.5 mt-1.5 mb-2 text-xs font-medium text-red-700 bg-red-50 px-2 py-1 rounded inline-flex border border-red-100">
                    <AlertCircle className="w-4 h-4" /> Đơn hàng bị thiếu thông tin (SĐT, Giờ, Pax...)
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                  <span>{selectedBooking.time || '--:--'} • {selectedBooking.pax || 0} Khách</span>
                  {selectedBooking.source && (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${sourceColors[selectedBooking.source]}`}>
                      {sourceLabels[selectedBooking.source]}
                    </span>
                  )}
                </div>
                {selectedBooking.email && (
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                    <Mail className="w-3.5 h-3.5" /> {selectedBooking.email}
                  </div>
                )}
              </div>
              <button onClick={() => setSelectedBooking(null)} className="p-2 bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Smart Actions */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {selectedBooking.status === 'new' && (
                <>
                  <button onClick={() => handleStatusChange(selectedBooking.id, 'confirmed')} className="flex flex-col items-center justify-center p-4 bg-green-50 text-green-700 rounded-xl font-bold border border-green-200 active:bg-green-100 shadow-sm">
                    <CheckCircle className="w-8 h-8 mb-2" />
                    Xác nhận
                  </button>
                  <button onClick={() => handleStatusChange(selectedBooking.id, 'cancelled')} className="flex flex-col items-center justify-center p-4 bg-red-50 text-red-700 rounded-xl font-bold border border-red-200 active:bg-red-100 shadow-sm">
                    <Ban className="w-8 h-8 mb-2" />
                    Hủy đơn
                  </button>
                </>
              )}
              {selectedBooking.status === 'confirmed' && (
                <button onClick={() => handleStatusChange(selectedBooking.id, 'arrived')} className="col-span-2 flex flex-col items-center justify-center p-6 bg-teal-50 text-teal-700 rounded-xl font-bold border border-teal-200 active:bg-teal-100 shadow-sm">
                  <Users className="w-10 h-10 mb-2" />
                  <span className="text-lg">Khách đã đến (Check-in)</span>
                </button>
              )}
              {selectedBooking.status === 'arrived' && (
                <button onClick={() => handleStatusChange(selectedBooking.id, 'completed')} className="col-span-2 flex flex-col items-center justify-center p-6 bg-purple-50 text-purple-700 rounded-xl font-bold border border-purple-200 active:bg-purple-100 shadow-sm">
                  <CheckCircle className="w-10 h-10 mb-2" />
                  <span className="text-lg">Hoàn thành / Thanh toán</span>
                </button>
              )}
              {/* Fallback for other statuses or secondary smart actions could go here if needed */}
              {['waiting_info', 'pending', 'change_requested'].includes(selectedBooking.status) && (
                <button onClick={() => handleStatusChange(selectedBooking.id, 'confirmed')} className="col-span-2 flex flex-col items-center justify-center p-4 bg-green-50 text-green-700 rounded-xl font-bold border border-green-200 active:bg-green-100">
                  <CheckCircle className="w-6 h-6 mb-1" />
                  Xác nhận lại
                </button>
              )}
            </div>

            {/* Secondary Actions */}
            <div className="space-y-2">
              <button
                onClick={() => handleEditBooking(selectedBooking)}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg text-gray-700 font-medium"
              >
                <Edit className="w-5 h-5 text-gray-400" />
                Chỉnh sửa thông tin
              </button>
              <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg text-gray-700 font-medium">
                <Phone className="w-5 h-5 text-gray-400" />
                Gọi điện thoại
              </button>
              <div className="h-px bg-gray-100 my-2"></div>
              <button onClick={() => handleStatusChange(selectedBooking.id, 'no_show')} className="w-full flex items-center gap-3 p-3 text-left hover:bg-red-50 rounded-lg text-red-600 font-medium">
                <UserX className="w-5 h-5" />
                Đánh dấu Không đến
              </button>
              <button onClick={() => handleStatusChange(selectedBooking.id, 'cancelled')} className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-100 rounded-lg text-gray-500 font-medium">
                <Ban className="w-5 h-5" />
                Hủy đặt bàn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // --- Desktop Table View ---

  const areaLabels: Record<string, string> = {
    indoor: 'Trong nhà',
    outdoor: 'Ngoài trời',
    vip: 'VIP',
    rooftop: 'Sân thượng'
  };

  const renderDesktopTable = () => {
    const sorted = [...filteredBookings].sort((a, b) => a.time.localeCompare(b.time));

    return (
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-600 w-[80px]">Giờ</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Khách hàng</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 w-[120px]">SĐT</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600 w-[60px]">Pax</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 w-[120px]">Khu vực</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 w-[90px]">Nguồn</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 w-[180px]">Trạng thái</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Ghi chú</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600 w-[60px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-16 text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 opacity-30" />
                      <span>Không có đơn đặt bàn nào</span>
                    </div>
                  </td>
                </tr>
              ) : (
                sorted.map(booking => {
                  const statusConfig = columns.find(c => c.id === booking.status);
                  const StatusIcon = statusConfig?.icon;
                  return (
                    <tr
                      key={booking.id}
                      className={`hover:bg-gray-50/80 transition-colors cursor-pointer group border-l-4 ${isMissingInfo(booking) ? 'border-red-400 bg-red-50/30' : (statusConfig?.borderColor || 'border-transparent')}`}
                      onClick={() => handleEditBooking(booking)}
                    >
                      {/* Giờ */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 font-semibold text-gray-900">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          {booking.time || '--:--'}
                        </div>
                      </td>

                      {/* Khách hàng */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">{booking.customerName || 'Không có tên'}</span>
                            {booking.customerType === 'tour' ? (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-700">Tour</span>
                            ) : booking.customerType === 'retail' ? (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-700">Lẻ</span>
                            ) : null}
                          </div>
                          {isMissingInfo(booking) && (
                            <span className="text-[10px] font-bold text-red-500 mt-0.5 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Thiếu thông tin
                            </span>
                          )}
                        </div>
                      </td>

                      {/* SĐT */}
                      <td className="px-4 py-3 text-gray-600">
                        <div className="flex flex-col">
                          <span>{booking.phone || <span className="text-gray-300">—</span>}</span>
                          {booking.email && <span className="text-xs text-gray-400 mt-0.5">{booking.email}</span>}
                        </div>
                      </td>

                      {/* Pax */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-700 font-medium">
                          <Users className="w-3.5 h-3.5 text-gray-400" />
                          {booking.pax || 0}
                        </div>
                      </td>

                      {/* Khu vực */}
                      <td className="px-4 py-3">
                        {booking.tableName ? (
                          <span className="px-2 py-1 bg-teal-100 text-teal-800 rounded text-xs font-bold whitespace-nowrap">
                            {booking.tableName}
                          </span>
                        ) : booking.area ? (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium whitespace-nowrap">
                            {areaLabels[booking.area] || booking.area}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>

                      {/* Nguồn */}
                      <td className="px-4 py-3">
                        {booking.source ? (
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${sourceColors[booking.source] || 'bg-gray-100 text-gray-600'}`}>
                            {sourceLabels[booking.source] || booking.source}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>

                      {/* Trạng thái (Dropdown) */}
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setStatusDropdownId(statusDropdownId === booking.id ? null : booking.id);
                            }}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-all hover:shadow-sm ${statusConfig?.color} ${statusConfig?.borderColor} ${statusConfig?.borderColor?.replace('border-', 'text-')}`}
                          >
                            {StatusIcon && <StatusIcon className="w-3 h-3" />}
                            {statusConfig?.label}
                            <ChevronDown className="w-3 h-3 opacity-50" />
                          </button>

                          {statusDropdownId === booking.id && (
                            <>
                              <div
                                className="fixed inset-0 z-[70]"
                                onClick={() => setStatusDropdownId(null)}
                              />
                              <div className="absolute top-full left-0 mt-1 z-[80] bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[160px] animate-in fade-in slide-in-from-top-1 duration-150">
                                {columns.map(col => {
                                  const ColIcon = col.icon;
                                  const isActive = booking.status === col.id;
                                  return (
                                    <button
                                      key={col.id}
                                      onClick={() => {
                                        handleStatusChange(booking.id, col.id);
                                        setStatusDropdownId(null);
                                      }}
                                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors text-left ${isActive
                                        ? 'bg-teal-50 text-teal-700 font-bold'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                      {ColIcon && <ColIcon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-500' : 'text-gray-400'}`} />}
                                      {col.label}
                                      {isActive && <CheckCircle className="w-3 h-3 ml-auto text-teal-500" />}
                                    </button>
                                  );
                                })}
                              </div>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Ghi chú & Menu */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1.5">
                          {booking.selectedMenus && booking.selectedMenus.length > 0 && (
                            <div className="flex flex-col gap-1">
                              {booking.selectedMenus.map((menu: any, mIdx: number) => (
                                <span key={`m-${mIdx}`} className="inline-flex max-w-max items-center px-1.5 py-0.5 bg-teal-50 text-teal-700 text-[10px] font-medium rounded border border-teal-100">
                                  <span className="font-bold mr-1">{menu.quantity}x</span> {menu.name}
                                </span>
                              ))}
                            </div>
                          )}

                          {booking.notes && booking.notes.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {booking.notes.map((note, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-medium rounded border border-amber-100">
                                  <AlertCircle className="w-3 h-3" />
                                  {note}
                                </span>
                              ))}
                            </div>
                          ) : null}

                          {(!booking.notes || booking.notes.length === 0) && (!booking.selectedMenus || booking.selectedMenus.length === 0) && (
                            <span className="text-gray-300">—</span>
                          )}
                        </div>
                      </td>

                      {/* Hành động */}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditBooking(booking);
                          }}
                          className="text-gray-400 hover:text-teal-600 opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-lg hover:bg-teal-50"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // --- Desktop Kanban View (3 Columns) ---

  const renderDesktopKanban = () => (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex-1 relative p-6 overflow-hidden">
        <div className="flex gap-5 h-full">
          {boardColumns.map((col) => {
            const colBookings = filteredBookings
              .filter(b => (col.statuses as BookingStatus[]).includes(b.status))
              .sort((a, b) => a.time.localeCompare(b.time));
            const ColIcon = col.icon;

            return (
              <Droppable key={col.id} droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 flex flex-col rounded-xl border transition-colors ${snapshot.isDraggingOver ? 'bg-blue-50 border-blue-300' : 'bg-gray-100/50 border-gray-200/60'
                      }`}
                  >
                    {/* Column Header */}
                    <div className={`px-4 py-3 border-b border-gray-200 flex items-center justify-between rounded-t-xl ${col.color}`}>
                      <div className="flex items-center gap-2">
                        {ColIcon && <ColIcon className={`w-4 h-4 ${col.borderColor.replace('border-', 'text-')}`} />}
                        <h3 className="font-bold text-gray-800 text-sm">{col.label}</h3>
                      </div>
                      <span className="bg-white/80 px-2.5 py-0.5 rounded-full text-xs font-bold text-gray-700 shadow-sm">
                        {colBookings.length}
                      </span>
                    </div>

                    {/* Cards Container */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                      {colBookings.map((booking, index) => {
                        const statusConfig = columns.find(c => c.id === booking.status);
                        const isServing = col.id === 'col_serving';
                        return (
                          // @ts-ignore
                          <Draggable key={booking.id} draggableId={booking.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onDoubleClick={() => setViewingBooking(booking)}
                                className={`
                                  bg-white rounded-lg shadow-sm border-l-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group relative
                                  ${isMissingInfo(booking) ? 'border-red-400 ring-1 ring-red-400/50 bg-red-50/20' : col.borderColor}
                                  ${snapshot.isDragging ? 'shadow-xl rotate-1 scale-105 z-50' : ''}
                                `}
                                style={provided.draggableProps.style}
                              >
                                <div className="p-3" onDoubleClick={() => setViewingBooking(booking)}>
                                  {/* Row 1: Name + badges + edit */}
                                  <div className="flex justify-between items-start mb-1.5">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <h4 className="font-semibold text-gray-900 text-sm truncate">{booking.customerName || 'Không tên'}</h4>
                                      {booking.customerType === 'tour' && (
                                        <span className="px-1 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-700 flex-shrink-0">Tour</span>
                                      )}
                                      {booking.customerType === 'retail' && (
                                        <span className="px-1 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-700 flex-shrink-0">Lẻ</span>
                                      )}
                                      {isMissingInfo(booking) && (
                                        <span className="px-1 py-0.5 rounded text-[9px] font-bold bg-red-100 text-red-600 flex-shrink-0">!</span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                      {col.statuses.length > 1 && statusConfig && (
                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${statusConfig.color} ${statusConfig.borderColor.replace('border-', 'text-')}`}>
                                          {statusConfig.label}
                                        </span>
                                      )}

                                      {/* Quick Status Action Menu for 'action_needed' column */}
                                      {col.id === 'col_action' && (
                                        <div className="relative">
                                          <button
                                            onClick={(e) => { e.stopPropagation(); setStatusDropdownId(statusDropdownId === booking.id ? null : booking.id); }}
                                            className="text-gray-300 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                                            title="Đổi trạng thái nhanh"
                                          >
                                            <MoreVertical className="w-3.5 h-3.5" />
                                          </button>
                                          {statusDropdownId === booking.id && (
                                            <>
                                              <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setStatusDropdownId(null); }}></div>
                                              <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-xl border border-gray-100 z-50 py-1" onClick={e => e.stopPropagation()}>
                                                <button onClick={() => { handleStatusChange(booking.id, 'waiting_info'); setStatusDropdownId(null); }} className="w-full text-left px-3 py-1.5 text-xs hover:bg-yellow-50 hover:text-yellow-700 flex items-center gap-1.5"><HelpCircle className="w-3 h-3" /> Chờ bổ sung</button>
                                                <button onClick={() => { handleStatusChange(booking.id, 'change_requested'); setStatusDropdownId(null); }} className="w-full text-left px-3 py-1.5 text-xs hover:bg-purple-50 hover:text-purple-700 flex items-center gap-1.5"><RefreshCw className="w-3 h-3" /> Đổi giờ/ngày</button>
                                                <div className="h-px bg-gray-100 my-1"></div>
                                                <button onClick={() => { handleStatusChange(booking.id, 'cancelled'); setStatusDropdownId(null); }} className="w-full text-left px-3 py-1.5 text-xs hover:bg-red-50 hover:text-red-700 flex items-center gap-1.5"><Ban className="w-3 h-3" /> Đã hủy</button>
                                                <button onClick={() => { handleStatusChange(booking.id, 'no_show'); setStatusDropdownId(null); }} className="w-full text-left px-3 py-1.5 text-xs hover:bg-red-50 hover:text-red-700 flex items-center gap-1.5"><UserX className="w-3 h-3" /> Không đến</button>
                                              </div>
                                            </>
                                          )}
                                        </div>
                                      )}

                                      <button
                                        onClick={(e) => { e.stopPropagation(); setViewingBooking(booking); }}
                                        className="text-gray-300 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                                        title="Xem chi tiết"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                      </button>

                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleEditBooking(booking); }}
                                        className="text-gray-300 hover:text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                                        title="Chỉnh sửa"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Row 2: Time · Pax · Source · Table (single line) */}
                                  <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                                    <span className="flex items-center gap-0.5 font-medium text-gray-700">
                                      <Clock className="w-3 h-3 text-gray-400" />
                                      {booking.time || '--:--'}
                                    </span>
                                    <span className="text-gray-300">·</span>
                                    <span className="flex items-center gap-0.5">
                                      <Users className="w-3 h-3 text-gray-400" />
                                      {booking.pax || 0}
                                    </span>
                                    {booking.source && (
                                      <>
                                        <span className="text-gray-300">·</span>
                                        <span className={`px-1 py-0 rounded text-[9px] font-bold uppercase ${sourceColors[booking.source]}`}>
                                          {sourceLabels[booking.source]}
                                        </span>
                                      </>
                                    )}
                                    {booking.tableName && (
                                      <>
                                        <span className="text-gray-300">·</span>
                                        <span className="inline-flex items-center gap-0.5 px-1 py-0 bg-teal-50 text-teal-700 rounded text-[9px] font-bold border border-teal-200">
                                          <LayoutGrid className="w-2.5 h-2.5" />
                                          {booking.tableName}
                                        </span>
                                      </>
                                    )}
                                    {booking.notes && booking.notes.length > 0 && (
                                      <>
                                        <span className="text-gray-300">·</span>
                                        <span className="inline-flex items-center gap-0.5 px-1 py-0 bg-amber-50 text-amber-600 rounded text-[9px] font-medium border border-amber-100" title={booking.notes.join(', ')}>
                                          💬 {booking.notes.length}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>

                                {/* Quick-complete button for Serving column */}
                                {isServing && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleStatusChange(booking.id, 'completed'); }}
                                    className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-gray-400 bg-gray-50 border-t border-gray-100 rounded-b-lg hover:bg-green-50 hover:text-green-700 transition-colors"
                                  >
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    Hoàn thành
                                  </button>
                                )}
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </div>
    </DragDropContext>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50 relative">
      {/* Filter Bar (Shared - Merged Upper Action Bar & Filter Row) */}
      <div className="hidden md:flex px-4 md:px-6 py-3 bg-white border-b border-gray-200 items-center justify-between flex-shrink-0 gap-4">

        {/* Left Side: Date & Shift Filters */}
        <div className="flex items-center gap-4 border-r border-gray-100 pr-4">
          <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm hover:bg-gray-100 transition-colors">
            <CalendarIcon className="w-4 h-4 text-teal-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              title="Chọn ngày"
              className="bg-transparent border-none text-sm font-bold text-gray-800 focus:ring-0 p-0 w-28 cursor-pointer"
            />
          </div>

          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button
              onClick={() => setFilterShift('all')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${filterShift === 'all' ? 'bg-white shadow-sm text-teal-700' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterShift('lunch')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${filterShift === 'lunch' ? 'bg-white shadow-sm text-amber-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Sun className="w-3.5 h-3.5" />
              Ca Trưa
            </button>
            <button
              onClick={() => setFilterShift('dinner')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${filterShift === 'dinner' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Moon className="w-3.5 h-3.5" />
              Ca Tối
            </button>
          </div>
        </div>

        {/* Middle: Stats */}
        <div className="flex-1 flex items-center gap-2 text-xs md:text-sm">
          <div className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-md font-medium border border-gray-200">
            Sức chứa: {appSettings.restaurantCapacity || 250}
          </div>
          <div className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md font-medium border border-blue-100">
            Đã đặt: {bookings.filter(b => statusGroups.action_needed.includes(b.status) || statusGroups.upcoming.includes(b.status) || statusGroups.active.includes(b.status)).reduce((acc, curr) => acc + (curr.pax || 0), 0)}
          </div>
          <div className="px-3 py-1.5 bg-green-50 text-green-700 rounded-md font-medium border border-green-100">
            Còn trống: {(appSettings.restaurantCapacity || 250) - bookings.filter(b => statusGroups.action_needed.includes(b.status) || statusGroups.upcoming.includes(b.status) || statusGroups.active.includes(b.status)).reduce((acc, curr) => acc + (curr.pax || 0), 0)}
          </div>
        </div>

        {/* Right Side: Actions & View Toggles */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm tên, SĐT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
            />
          </div>

          <div className="w-px h-6 bg-gray-200 mx-1"></div>

          {/* View Toggles */}
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'kanban' ? 'bg-white shadow-sm text-teal-600' : 'text-gray-400 hover:text-gray-600'}`}
              title="Kanban"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-teal-600' : 'text-gray-400 hover:text-gray-600'}`}
              title="Bảng"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-gray-200 mx-1"></div>

          {/* Add Button */}
          <button
            onClick={() => {
              if (onAddBooking) {
                onAddBooking();
              } else {
                setNewBooking({
                  customerName: '',
                  phone: '',
                  time: '',
                  bookingDate: selectedDate,
                  pax: 2,
                  status: 'new',
                  source: 'walk_in',
                  customerType: 'retail'
                });
                setShowModal(true);
              }
            }}
            className="flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white pl-3 pr-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Đặt bàn mới
          </button>
        </div>
      </div>

      {/* Desktop Status Filter Bar (Simplified 3 groups) */}
      {viewMode === 'kanban' && (
        <div className="hidden md:flex px-6 py-2.5 bg-white border-b border-gray-100 items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400 mr-1 flex-shrink-0">
            <Filter className="w-3.5 h-3.5" />
          </div>
          {boardColumns.map(col => {
            const count = bookings.filter(b => (col.statuses as BookingStatus[]).includes(b.status)).length;
            const ColIcon = col.icon;
            return (
              <div key={col.id} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${col.color} ${col.borderColor.replace('border-', 'text-')}`}>
                {ColIcon && <ColIcon className="w-3.5 h-3.5" />}
                {col.label}
                <span className="bg-white/70 px-1.5 py-0.5 rounded-full text-[10px] text-gray-700 font-bold shadow-sm">
                  {count}
                </span>
              </div>
            );
          })}
          <div className="ml-auto">
            <button
              onClick={() => {
                setViewMode('table');
                setSelectedStatuses(['completed', 'cancelled', 'no_show']);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors border border-gray-200"
            >
              <Archive className="w-3.5 h-3.5" />
              Xem lịch sử
              <span className="bg-gray-100 px-1.5 py-0.5 rounded-full text-[10px] text-gray-500 font-bold">
                {bookings.filter(b => ['completed', 'cancelled', 'no_show'].includes(b.status)).length}
              </span>
            </button>
          </div>
        </div>
      )}
      {viewMode === 'table' && (
        <div className="hidden md:flex px-6 py-2.5 bg-white border-b border-gray-100 items-center gap-2 flex-shrink-0 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400 mr-1 flex-shrink-0">
            <Filter className="w-3.5 h-3.5" />
            Trạng thái
          </div>
          <button
            onClick={() => setSelectedStatuses([])}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${selectedStatuses.length === 0
              ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
              : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700'
              }`}
          >
            Tất cả
            <span className={`ml-1 ${selectedStatuses.length === 0 ? 'text-gray-300' : 'text-gray-400'}`}>
              {bookings.length}
            </span>
          </button>
          {columns.map(col => {
            const ColIcon = col.icon;
            const isActive = selectedStatuses.includes(col.id);
            const count = bookings.filter(b => b.status === col.id).length;
            return (
              <button
                key={col.id}
                onClick={() => toggleStatusFilter(col.id)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${isActive
                  ? `${col.color} ${col.borderColor} ${col.borderColor.replace('border-', 'text-')} shadow-sm`
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700'
                  }`}
              >
                {ColIcon && <ColIcon className="w-3 h-3" />}
                {col.label}
                {count > 0 && (
                  <span className={`px-1 py-0 rounded-full text-[10px] ${isActive ? 'bg-white/50' : 'bg-gray-100'
                    }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
          {selectedStatuses.length > 0 && (
            <button
              onClick={() => setSelectedStatuses([])}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
            >
              <X className="w-3 h-3" />
              Xóa lọc
            </button>
          )}
        </div>
      )}

      {/* Conditional Rendering */}
      {isMobile
        ? renderMobileList()
        : viewMode === 'kanban'
          ? renderDesktopKanban()
          : renderDesktopTable()
      }

      {/* Add Booking Modal (Shared) */}
      {showModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-lg text-gray-800">
                {editingId ? 'Cập nhật thông tin' : 'Thêm đặt bàn mới'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách hàng</label>
                <input
                  type="text"
                  value={newBooking.customerName}
                  onChange={(e) => setNewBooking({ ...newBooking, customerName: e.target.value })}
                  placeholder="VD: Nguyễn Văn A"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              {newBooking.selectedMenus && newBooking.selectedMenus.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between items-center">
                    <span>Thực đơn khách đã chọn</span>
                    {newBooking.customerType ? (
                      <span className={`${newBooking.customerType === 'tour' ? 'text-purple-700 bg-purple-100 border-purple-200' : 'text-blue-700 bg-blue-100 border-blue-200'} text-[10px] font-bold border px-1.5 py-0.5 rounded uppercase`}>{newBooking.customerType === 'tour' ? 'KHÁCH TOUR' : 'KHÁCH LẺ'}</span>
                    ) : null}
                  </label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
                    {newBooking.selectedMenus.map((menu: any, index: number) => (
                      <div key={index} className="flex justify-between items-center text-sm border-b border-gray-200/60 pb-2 last:border-0 last:pb-0">
                        <div className="font-medium text-gray-700"><span className="text-teal-600 font-bold mr-2 bg-white px-1.5 py-0.5 rounded shadow-sm">{menu.quantity}x</span>{menu.name}</div>
                        <div className="text-gray-600 flex flex-col items-end">
                          <span className="font-semibold text-gray-800">{(menu.price * menu.quantity).toLocaleString()} ₫</span>
                          {menu.price > 0 && <span className="text-[10px] text-gray-400">{menu.price.toLocaleString()} ₫/pax</span>}
                        </div>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-gray-300 flex justify-between items-center font-bold">
                      <span>Tổng cộng:</span>
                      <span className="text-teal-700 text-lg">
                        {newBooking.selectedMenus.reduce((sum: number, menu: any) => sum + (menu.price * menu.quantity), 0).toLocaleString()} ₫
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={newBooking.phone || ''}
                    onChange={(e) => setNewBooking({ ...newBooking, phone: e.target.value })}
                    placeholder="09..."
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${duplicateBooking ? 'border-orange-300 bg-orange-50' : 'border-gray-300'}`}
                  />
                  {duplicateBooking && (
                    <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
                      <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-orange-800">Cảnh báo trùng lặp!</p>
                        <p className="text-xs text-orange-700 mt-1">
                          Khách <strong>{duplicateBooking.customerName}</strong> đã có đơn lúc <strong>{duplicateBooking.time}</strong> ({duplicateBooking.pax} khách).
                        </p>
                        <button
                          onClick={() => handleEditBooking(duplicateBooking)}
                          className="mt-2 text-xs font-bold text-orange-700 underline hover:text-orange-900"
                        >
                          Xem đơn cũ
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-gray-400 font-normal">(Tùy chọn)</span></label>
                  <input
                    type="email"
                    value={newBooking.email || ''}
                    onChange={(e) => setNewBooking({ ...newBooking, email: e.target.value })}
                    placeholder="example@mail.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số khách (Pax)</label>
                  <input
                    type="number"
                    value={newBooking.pax}
                    onChange={(e) => setNewBooking({ ...newBooking, pax: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nguồn đặt bàn</label>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {Object.entries(sourceLabels).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setNewBooking({ ...newBooking, source: key as any })}
                      className={`
                        px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all
                        ${newBooking.source === key
                          ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}
                      `}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Khu vực mong muốn</label>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {[
                    { id: 'indoor', label: 'Trong nhà' },
                    { id: 'outdoor', label: 'Ngoài trời' },
                    { id: 'vip', label: 'Phòng VIP' },
                    { id: 'rooftop', label: 'Sân thượng' }
                  ].map((area) => (
                    <button
                      key={area.id}
                      onClick={() => setNewBooking({ ...newBooking, area: area.id as any })}
                      className={`
                        px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all
                        ${newBooking.area === area.id
                          ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}
                      `}
                    >
                      {area.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày đến</label>
                  <input
                    type="date"
                    value={newBooking.bookingDate || ''}
                    onChange={(e) => setNewBooking({ ...newBooking, bookingDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giờ đến</label>
                  <input
                    type="time"
                    value={newBooking.time}
                    onChange={(e) => setNewBooking({ ...newBooking, time: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${suggestedSlots.length > 0 ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                  />
                </div>
              </div>

              {suggestedSlots.length > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg animate-in fade-in slide-in-from-top-1">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-blue-800">Khung giờ này đã kín chỗ!</span>
                  </div>
                  <p className="text-xs text-blue-700 mb-2">Gợi ý các khung giờ còn trống:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedSlots.map(slot => (
                      <button
                        key={slot}
                        onClick={() => setNewBooking({ ...newBooking, time: slot })}
                        className="px-3 py-1 bg-white border border-blue-200 text-blue-700 text-xs font-bold rounded-md shadow-sm hover:bg-blue-100 transition-colors"
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Xếp bàn</label>
                <select
                  title="Chọn bàn"
                  value={newBooking.tableId || ''}
                  onChange={(e) => setNewBooking({ ...newBooking, tableId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                >
                  <option value="">-- Chưa xếp bàn --</option>
                  {tables.map(table => (
                    <option key={table.id} value={table.id}>
                      {table.name} ({table.pax} chỗ) - {table.status === 'empty' ? 'Trống' : 'Có khách/Đặt trước'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú (Tags)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    title="Nhập ghi chú"
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                    placeholder="VD: Sinh nhật, Dị ứng..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                  <button
                    onClick={handleAddNote}
                    className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {newBooking.notes?.map((note, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded border border-amber-100">
                      {note}
                      <button
                        onClick={() => setNewBooking({ ...newBooking, notes: newBooking.notes?.filter((_, i) => i !== idx) })}
                        className="hover:text-amber-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveBooking}
                className="px-4 py-2 bg-teal-600 text-white hover:bg-teal-700 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {editingId ? 'Lưu thay đổi' : 'Lưu đặt bàn'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {checkoutBooking && (
        <CheckoutModal
          booking={checkoutBooking}
          onClose={() => setCheckoutBooking(null)}
          onSuccess={() => {
            // Update local state to reflect completed status and free table immediately
            setBookings(bookings.map(b => b.id === checkoutBooking.id ? { ...b, status: 'completed', tableId: undefined, tableName: undefined } : b));
            setCheckoutBooking(null);
            fetchBookings(); // refresh from DB just in case
          }}
        />
      )}

      {/* History Drop Modal */}
      {historyDropBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 text-center">Chuyển vào Lịch Sử</h3>
              <p className="text-sm text-gray-500 text-center mt-2">Vui lòng chọn trạng thái chính xác cho đơn đặt bàn này</p>
            </div>
            <div className="p-6 flex flex-col gap-3">
              <button
                onClick={() => {
                  setHistoryDropBooking(null);
                  handleStatusChange(historyDropBooking.id, 'completed');
                }}
                className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all text-left group"
              >
                <div className="p-2.5 bg-gray-100 group-hover:bg-gray-200 rounded-lg shrink-0">
                  <Archive className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <div className="font-bold text-gray-800">Hoàn thành</div>
                  <div className="text-xs text-gray-500 mt-0.5">Khách đã dùng bữa và thanh toán</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setHistoryDropBooking(null);
                  handleStatusChange(historyDropBooking.id, 'no_show');
                }}
                className="flex items-center gap-3 p-4 rounded-xl border border-red-100 hover:border-red-300 hover:bg-red-50 transition-all text-left group"
              >
                <div className="p-2.5 bg-red-100 group-hover:bg-red-200 rounded-lg shrink-0">
                  <UserX className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <div className="font-bold text-red-700">Không đến (No-show)</div>
                  <div className="text-xs text-red-500/70 mt-0.5">Khách đã đặt nhưng không tới</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setHistoryDropBooking(null);
                  handleStatusChange(historyDropBooking.id, 'cancelled');
                }}
                className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-gray-400 hover:bg-gray-100 transition-all text-left group"
              >
                <div className="p-2.5 bg-gray-200 group-hover:bg-gray-300 rounded-lg shrink-0">
                  <Ban className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-600">Hủy đơn</div>
                  <div className="text-xs text-gray-500 mt-0.5">Khách hoặc nhà hàng chủ động hủy</div>
                </div>
              </button>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => setHistoryDropBooking(null)}
                className="w-full py-2.5 rounded-xl text-gray-600 font-bold hover:bg-gray-200 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Details Read-Only Modal */}
      {viewingBooking && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setViewingBooking(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-lg text-gray-800">Chi tiết đặt bàn</h3>
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${columns.find(c => c.id === viewingBooking.status)?.color} ${columns.find(c => c.id === viewingBooking.status)?.borderColor.replace('border-', 'text-')}`}>
                  {columns.find(c => c.id === viewingBooking.status)?.label || viewingBooking.status}
                </span>
              </div>
              <button onClick={() => setViewingBooking(null)} className="text-gray-400 hover:text-gray-600 bg-white p-1.5 rounded-full shadow-sm border border-gray-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar bg-white">
              {/* Customer Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{viewingBooking.customerName || 'Không có tên'}</h2>
                  {viewingBooking.phone && (
                    <div className="flex items-center text-teal-600 font-medium">
                      <Phone className="w-4 h-4 mr-1.5" />
                      {viewingBooking.phone}
                    </div>
                  )}
                </div>
                {viewingBooking.customerType && (
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${viewingBooking.customerType === 'tour' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    Khách {viewingBooking.customerType === 'tour' ? 'Tour' : 'Lẻ'}
                  </span>
                )}
              </div>

              {/* Time & Info block */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Thời gian</p>
                  <p className="text-sm font-semibold flex items-center gap-1.5">
                    <CalendarIcon className="w-4 h-4 text-gray-500" />
                    {viewingBooking.bookingDate ? new Date(viewingBooking.bookingDate).toLocaleDateString('vi-VN') : 'Không rõ'}
                    <span className="text-gray-300 mx-0.5">•</span>
                    <Clock className="w-4 h-4 text-gray-500" />
                    {viewingBooking.time || '--:--'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Số lượng khách</p>
                  <p className="text-sm font-semibold flex items-center gap-1.5 text-gray-900">
                    <Users className="w-4 h-4 text-gray-500" />
                    {viewingBooking.pax} <span className="font-normal text-gray-500">người</span>
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Bàn phục vụ</p>
                  <p className="text-sm font-semibold flex items-center gap-1.5 text-gray-900">
                    <LayoutGrid className="w-4 h-4 text-teal-500" />
                    {viewingBooking.tableName ? (
                      <span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded border border-teal-100">{viewingBooking.tableName}</span>
                    ) : (
                      <span className="text-gray-400 font-normal italic">Chưa xếp bàn</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nguồn đặt</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {sourceLabels[viewingBooking.source] || viewingBooking.source}
                  </p>
                </div>
              </div>

              {/* Notes block */}
              {viewingBooking.notes && viewingBooking.notes.length > 0 && (
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-amber-500" />
                    Ghi chú từ khách hàng / hệ thống
                  </p>
                  <div className="space-y-2">
                    {viewingBooking.notes.map((note, idx) => (
                      <div key={idx} className="bg-amber-50 border border-amber-100 text-amber-800 text-sm p-3 rounded-lg flex items-start gap-2">
                        <span className="mt-0.5 text-amber-400">•</span>
                        <span>{note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setViewingBooking(null);
                  handleEditBooking(viewingBooking);
                }}
                className="w-full py-2.5 bg-white border border-gray-200 hover:border-teal-500 hover:text-teal-600 text-gray-700 text-sm font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Sửa thông tin đơn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
