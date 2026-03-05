import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Clock, AlertTriangle, CheckCircle, Flame, Check, ChefHat, BellRing, Filter, X, LayoutGrid, List, ChevronLeft, ChevronRight, CheckSquare } from 'lucide-react';

interface ContextType {
  isSidebarCollapsed: boolean;
}

type ItemStatus = 'pending' | 'cooking' | 'done';
type ItemCategory = 'Khai vị' | 'Món chính' | 'Tráng miệng' | 'Đồ uống';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  notes?: string[];
  status: ItemStatus;
  category: ItemCategory;
}

interface OrderTicket {
  id: string;
  table: string;
  orderTime: Date;
  items: OrderItem[];
  status: 'pending' | 'completed';
  bookingStatus: 'confirmed' | 'pending' | 'new' | 'arrived';
}

const generateMockOrders = (): OrderTicket[] => {
  const getRand = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
  const categories: ItemCategory[] = ['Khai vị', 'Món chính', 'Tráng miệng', 'Đồ uống'];
  const dishNames: Record<ItemCategory, string[]> = {
    'Khai vị': ['Súp bí đỏ', 'Salad Caesar', 'Khoai tây chiên', 'Nem rán', 'Gỏi cuốn', 'Súp hải sản'],
    'Món chính': ['Bò bít tết (Medium Rare)', 'Cá hồi áp chảo', 'Mỳ Ý Carbonara', 'Gà nướng mật ong', 'Lẩu hải sản (Lớn)', 'Cơm chiên dương châu', 'Sườn xào chua ngọt', 'Vịt quay Bắc Kinh'],
    'Tráng miệng': ['Bánh Tiramisu', 'Kem Vanilla', 'Trái cây theo mùa', 'Panna Cotta', 'Chè hạt sen'],
    'Đồ uống': ['Nước dưa hấu', 'Trà đào cam sả', 'Coca Cola', 'Bia Heineken', 'Rượu vang đỏ']
  };
  const statuses: ItemStatus[] = ['pending', 'cooking', 'done'];
  const notesPool = ['Ít muối', 'Không hành tây', 'Cay nhiều', 'DỊ ỨNG ĐẬU PHỘNG', 'Không đá', 'Nhiều sốt'];

  const orders: OrderTicket[] = [];
  for (let t = 1; t <= 10; t++) { // Generate 10 active tables
    const numItems = Math.floor(Math.random() * 6) + 5; // 5 to 10 items per table
    const items: OrderItem[] = [];
    for (let i = 1; i <= numItems; i++) {
      const cat = getRand(categories) as ItemCategory;
      const name = getRand(dishNames[cat]);
      const status = getRand(statuses) as ItemStatus;
      const hasNote = Math.random() > 0.8; // 20% chance to have a note
      const notes = hasNote ? [getRand(notesPool)] : [];
      items.push({
        id: `t${t}-${i}`,
        name,
        quantity: Math.floor(Math.random() * 3) + 1, // 1 to 3 qty
        notes,
        status,
        category: cat
      });
    }

    orders.push({
      id: `order-${t}`,
      table: `Bàn ${t}`,
      orderTime: new Date(Date.now() - 1000 * 60 * Math.floor(Math.random() * 45)), // 0 to 45 mins ago
      status: 'pending',
      bookingStatus: 'confirmed',
      items
    });
  }
  return orders;
};

const mockOrders: OrderTicket[] = generateMockOrders();

const categoryOrder: Record<ItemCategory, number> = {
  'Khai vị': 1,
  'Món chính': 2,
  'Tráng miệng': 3,
  'Đồ uống': 4
};

export default function KitchenDisplay() {
  const context = useOutletContext<ContextType>();
  const isSidebarCollapsed = context ? context.isSidebarCollapsed : false;
  const [orders, setOrders] = useState<OrderTicket[]>(mockOrders);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [filterCategory, setFilterCategory] = useState<ItemCategory | 'All'>('All');
  const [filterTimeSlot, setFilterTimeSlot] = useState<'All' | 'Lunch' | 'Dinner'>('All');
  const [showConfirmedOnly, setShowConfirmedOnly] = useState(true);
  const [notification, setNotification] = useState<{ message: string, visible: boolean }>({ message: '', visible: false });
  const [viewMode, setViewMode] = useState<'table' | 'dish'>('table');
  const [isMobile, setIsMobile] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const showNotification = (message: string) => {
    setNotification({ message, visible: true });
    setTimeout(() => setNotification({ message: '', visible: false }), 3000);
  };

  const cycleItemStatus = (orderId: string, itemId: string) => {
    setOrders(orders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          items: order.items.map(item => {
            if (item.id === itemId) {
              // Simply toggle pending <-> done to minimize touches
              return { ...item, status: item.status === 'done' ? 'pending' : 'done' };
            }
            return item;
          })
        };
      }
      return order;
    }));
  };

  const markAllDone = (orderId: string) => {
    setOrders(orders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          items: order.items.map(item => ({ ...item, status: 'done' }))
        };
      }
      return order;
    }));
  };

  const completeOrder = (orderId: string) => {
    setOrders(orders.filter(o => o.id !== orderId));
    showNotification('Đã hoàn thành đơn hàng!');
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const containerWidth = scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollBy({ left: -containerWidth, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const containerWidth = scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollBy({ left: containerWidth, behavior: 'smooth' });
    }
  };

  const getElapsedTime = (date: Date) => {
    const diff = Math.floor((currentTime.getTime() - date.getTime()) / 1000 / 60);
    return diff;
  };

  const getStatusStyles = (minutes: number) => {
    if (minutes >= 15) return {
      card: 'border border-red-500 shadow-sm',
      header: 'bg-[#E52020] text-white',
      timer: 'text-white border border-white/20 bg-white/10 px-2 py-0.5 rounded'
    }; // Critical
    if (minutes >= 10) return {
      card: 'border border-amber-400 shadow-sm',
      header: 'bg-amber-500 text-white',
      timer: 'text-white border border-white/20 bg-white/10 px-2 py-0.5 rounded'
    }; // Warning
    return {
      card: 'border border-gray-200 shadow-sm',
      header: 'bg-white text-gray-800 border-b border-gray-100',
      timer: 'text-gray-500 bg-gray-100 px-2 py-0.5 rounded'
    }; // Normal (On track)
  };

  const filteredOrders = orders
    .filter(order => {
      // Filter by booking status
      if (showConfirmedOnly && !['confirmed', 'arrived'].includes(order.bookingStatus)) {
        return false;
      }

      // Filter by time slot
      if (filterTimeSlot === 'All') return true;
      const hour = order.orderTime.getHours();
      if (filterTimeSlot === 'Lunch') return hour >= 10 && hour < 15;
      if (filterTimeSlot === 'Dinner') return hour >= 17 && hour < 23;
      return true;
    })
    .map(order => ({
      ...order,
      items: filterCategory === 'All' ? order.items : order.items.filter(i => i.category === filterCategory)
    }))
    .filter(order => order.items.length > 0);

  // We no longer need orderChunks, we will render filteredOrders directly


  // Aggregation logic for Dish View
  const aggregatedItems = React.useMemo(() => {
    const itemsMap = new Map<string, {
      name: string,
      pendingQuantity: number,
      doneQuantity: number,
      category: ItemCategory,
      notes: string[],
      originalItems: { orderId: string, itemId: string }[]
    }>();

    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        // Group by name + specific notes to be safe
        const key = `${item.name}-${item.notes?.join(',') || ''}`;
        if (!itemsMap.has(key)) {
          itemsMap.set(key, {
            name: item.name,
            pendingQuantity: 0,
            doneQuantity: 0,
            category: item.category,
            notes: item.notes || [],
            originalItems: []
          });
        }
        const aggregated = itemsMap.get(key)!;
        if (item.status === 'done') {
          aggregated.doneQuantity += item.quantity;
        } else {
          aggregated.pendingQuantity += item.quantity;
        }
        aggregated.originalItems.push({ orderId: order.id, itemId: item.id });
      });
    });

    return Array.from(itemsMap.values())
      .filter(item => item.pendingQuantity > 0 || item.doneQuantity > 0)
      .sort((a, b) => categoryOrder[a.category] - categoryOrder[b.category]);
  }, [filteredOrders]);

  const handleCompleteAggregatedItem = (originalItems: { orderId: string, itemId: string }[], isDone: boolean) => {
    setOrders(orders.map(order => {
      let newOrder = { ...order };
      const itemsToUpdate = originalItems.filter(oi => oi.orderId === order.id).map(oi => oi.itemId);

      if (itemsToUpdate.length > 0) {
        newOrder.items = newOrder.items.map(item => {
          if (itemsToUpdate.includes(item.id)) {
            return { ...item, status: isDone ? 'pending' : 'done' }; // Toggle status
          }
          return item;
        });
      }
      return newOrder;
    }));
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-white flex flex-col relative overflow-hidden">
      {/* Toast Notification */}
      {notification.visible && (
        <div className="fixed top-20 right-6 z-50 bg-gray-900 text-white px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300 font-bold text-lg">
          <CheckCircle className="w-7 h-7 text-green-400" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header controls — compact on mobile */}
      <div className="flex flex-col md:flex-row md:items-center justify-between py-3 px-3 md:py-4 md:px-6 bg-white border-b border-gray-200 shrink-0 z-10 w-full gap-3 md:gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <h2 className="hidden sm:block text-2xl font-black text-gray-800 tracking-tight">KDS <span className="text-teal-600">BẾP</span></h2>
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-bold transition-all ${viewMode === 'table'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden xs:inline">Theo Bàn</span><span className="xs:hidden">Bàn</span>
            </button>
            <button
              onClick={() => setViewMode('dish')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-bold transition-all ${viewMode === 'dish'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <List className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden xs:inline">Tổng hợp món</span><span className="xs:hidden">Món</span>
            </button>
          </div>
          {/* Mobile table counter */}
          {isMobile && viewMode === 'table' && (
            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
              {filteredOrders.length} bàn
            </span>
          )}
        </div>

        <div className="flex flex-1 items-center justify-start md:justify-end shrink-0 overflow-x-auto no-scrollbar">
          {/* Category Filter — horizontal scroll on mobile */}
          <div className="flex items-center gap-1.5 md:gap-2 min-w-max">
            {(['All', 'Khai vị', 'Món chính', 'Tráng miệng', 'Đồ uống'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap min-h-[36px] ${filterCategory === cat
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100/50'
                  }`}
              >
                {cat === 'All' ? 'Tất cả món' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden flex flex-col md:flex-row group">

        {/* Left Scroll Button */}
        {viewMode === 'table' && !isMobile && (
          <button
            onClick={scrollLeft}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-[55] opacity-0 group-hover:opacity-100 transition-opacity duration-300 focus:outline-none"
          >
            <div className="w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-white hover:text-teal-600 hover:scale-110 active:scale-95 transition-all">
              <ChevronLeft className="w-5 h-5" />
            </div>
          </button>
        )}

        {/* Kanban Board Container */}
        <div
          ref={scrollContainerRef}
          className={`flex-1 overflow-y-auto no-scrollbar font-sans pb-10 ${viewMode === 'table'
            ? isMobile
              ? 'flex flex-col w-full items-stretch px-3 py-4 gap-3'
              : 'flex flex-wrap w-full items-start px-6 py-6 gap-4'
            : 'block w-full overflow-x-hidden p-3 sm:p-4 md:p-6'
            }`}
        >
          {viewMode === 'table' ? (
            // =============================
            // TABLE VIEW
            // =============================
            <>
              {filteredOrders.map((order) => {
                const elapsed = getElapsedTime(order.orderTime);
                const isCritical = elapsed >= 15;
                const styles = getStatusStyles(elapsed);
                const allItemsDone = order.items.every(i => i.status === 'done');

                const sortedItems = [...order.items].sort((a, b) => categoryOrder[a.category] - categoryOrder[b.category]);

                return (
                  <div
                    key={order.id}
                    className={`flex flex-col rounded-xl bg-white transition-all h-max ${styles.card} ${isMobile
                      ? 'w-full'
                      : 'flex-shrink-0 snap-start w-[calc(20%-12.8px)]'
                      }`}
                  >
                    {/* Header */}
                    <div className={`px-3 py-2.5 md:px-4 md:py-2.5 flex justify-between items-center rounded-t-xl ${styles.header}`}>
                      <h3 className="text-lg md:text-xl font-black flex items-center gap-1.5 tracking-tight">
                        {order.table}
                        {isCritical && <Flame className="w-4 h-4 md:w-5 md:h-5 animate-pulse text-white" />}
                      </h3>

                      <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1 font-mono text-sm md:text-sm font-bold ${styles.timer}`}>
                          <Clock className="w-3.5 h-3.5" />
                          {elapsed}'
                        </div>

                        {/* Mark All Done Button — Desktop: small in header, Mobile: hidden here (shown below) */}
                        {!allItemsDone && !isMobile && (
                          <button
                            onClick={() => markAllDone(order.id)}
                            className="py-0.5 px-2 rounded-md bg-white/20 hover:bg-white/30 text-white border border-white/30 font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all text-[10px]"
                            title="Xong tất cả"
                          >
                            <CheckSquare className="w-3 h-3" /> Xong tất cả
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Mobile-only: Full-width "Xong tất cả" button below header */}
                    {!allItemsDone && isMobile && (
                      <button
                        onClick={() => markAllDone(order.id)}
                        className="mx-2 mt-2 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-900 text-white font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all text-sm"
                      >
                        <CheckSquare className="w-4 h-4" /> Xong tất cả
                      </button>
                    )}

                    {/* Body */}
                    <div className="p-2 md:p-3 flex-1 flex flex-col gap-2 bg-white">

                      {sortedItems.map((item, index) => {
                        const showCategoryHeader = index === 0 || sortedItems[index - 1].category !== item.category;
                        const isDone = item.status === 'done';

                        return (
                          <React.Fragment key={item.id}>
                            {showCategoryHeader && (
                              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1.5 mb-0.5 px-1">
                                {item.category}
                              </div>
                            )}
                            <div
                              onClick={() => cycleItemStatus(order.id, item.id)}
                              className={`
                              group cursor-pointer select-none transition-all duration-200 active:scale-[0.98]
                              flex items-stretch rounded-xl border min-h-[4rem]
                              ${isDone
                                  ? 'border-emerald-300 bg-emerald-50/50'
                                  : 'border-gray-200 bg-white hover:border-teal-400 shadow-sm'
                                }
                            `}
                            >
                              {/* Quantity Indicator */}
                              <div className={`
                                w-10 md:w-12 flex items-center justify-center rounded-l-xl
                                ${isDone ? 'bg-emerald-400 text-white' : 'bg-white text-red-500'}
                            `}>
                                <span className="text-lg md:text-xl font-black font-mono">
                                  {item.quantity}
                                </span>
                              </div>

                              {/* Item Details */}
                              <div className={`flex-1 p-2 flex flex-col justify-center relative min-w-0 w-full overflow-hidden rounded-r-xl ${isDone ? 'bg-emerald-50/30' : 'bg-white'}`}>
                                <div className="pr-6 w-full">
                                  <div className={`text-[13px] md:text-[15px] font-bold leading-tight ${isMobile ? 'break-words' : 'truncate'} ${isDone ? 'text-emerald-500 line-through opacity-70' : 'text-gray-800'}`} title={item.name}>
                                    {item.name}
                                  </div>

                                  {/* Notes */}
                                  {item.notes && item.notes.length > 0 && (
                                    <div className="mt-1 flex flex-wrap gap-1">
                                      {item.notes.map((note, idx) => {
                                        const isAllergy = note.toLowerCase().includes('dị ứng');
                                        return (
                                          <span
                                            key={idx}
                                            className={`
                                              inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[9px] font-bold uppercase border truncate max-w-full
                                              ${isAllergy
                                                ? 'bg-red-50 text-red-600 border-red-200'
                                                : 'bg-amber-50 text-amber-600 border-amber-200'}
                                            `}
                                            title={note}
                                          >
                                            <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                                            <span className="truncate">{note}</span>
                                          </span>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>

                                {/* Status Icon Indicator */}
                                {isDone && (
                                  <div className="absolute top-1/2 -translate-y-1/2 right-2 text-emerald-500 bg-white rounded-full p-0.5 shadow-sm">
                                    <CheckCircle className="w-4 h-4 shrink-0" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </React.Fragment>
                        );
                      })}
                    </div>

                    {/* Footer Action */}
                    <div className="p-2 md:p-3 bg-white border-t border-gray-100 rounded-b-xl">
                      <button
                        onClick={() => completeOrder(order.id)}
                        disabled={!allItemsDone}
                        className={`w-full py-2 rounded-xl font-black text-sm md:text-base flex items-center justify-center gap-2 transition-all shadow-sm ${allItemsDone
                          ? 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed hidden'
                          }`}
                      >
                        <BellRing className="w-4 h-4 md:w-5 md:h-5" />
                        GỌI PHỤC VỤ
                      </button>
                      {!allItemsDone && (
                        <div className="text-center text-[10px] md:text-xs font-bold text-gray-400 py-1">
                          Làm xong tất cả để phục vụ
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            // =============================
            // DISH VIEW (Tổng hợp món)
            // =============================
            <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 2xl:gap-8 px-3 sm:px-4 pb-12">
              {aggregatedItems.map((item, index) => {
                const isDone = item.pendingQuantity === 0;

                // Color themes
                const qtyClass = isDone
                  ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                  : 'bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-red-500/30';

                const cardBorderClass = isDone
                  ? 'border-emerald-200 bg-emerald-50/40 hover:shadow-emerald-100/50'
                  : 'border-transparent bg-white shadow-[0_3px_15px_rgb(0,0,0,0.05)] hover:shadow-md hover:shadow-red-500/10 hover:border-red-100';

                return (
                  <div
                    key={`agg-${index}`}
                    onClick={() => handleCompleteAggregatedItem(item.originalItems, isDone)}
                    className={`
                      relative group flex flex-col p-4 2xl:p-8 rounded-2xl 2xl:rounded-3xl cursor-pointer 
                      transition-all duration-300 transform hover:-translate-y-1 active:scale-[0.98] 
                      shadow-sm border overflow-hidden min-h-[8rem] 2xl:min-h-[14rem]
                      ${cardBorderClass}
                    `}
                  >
                    {/* Subtle decorative background gradient blob for pending items */}
                    {!isDone && (
                      <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-orange-400/10 to-red-500/10 rounded-full blur-3xl pointer-events-none transition-opacity duration-500 group-hover:opacity-100 opacity-60"></div>
                    )}

                    {/* Top Row: Quantity Badge + Category */}
                    <div className="flex justify-between items-start mb-3 2xl:mb-6 relative z-10">
                      <div className={`
                        flex flex-col items-center justify-center w-12 h-12 2xl:w-24 2xl:h-24 rounded-xl 2xl:rounded-3xl shadow-lg border border-white/20
                        ${qtyClass}
                      `}>
                        <span className="text-2xl 2xl:text-5xl font-black font-mono leading-none tracking-tighter">
                          {isDone ? item.doneQuantity : item.pendingQuantity}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`text-[9px] 2xl:text-[14px] font-black uppercase tracking-widest px-2 py-1 2xl:px-4 2xl:py-2 rounded-full border shadow-sm ${isDone ? 'bg-emerald-100 text-emerald-700 border-emerald-200/50' : 'bg-gray-50 text-gray-500 border-gray-200/50'}`}>
                          {item.category}
                        </span>
                        <span className={`text-[10px] 2xl:text-base font-bold uppercase mt-1.5 2xl:mt-3 tracking-wider ${isDone ? 'text-emerald-500' : 'text-red-500/80 animate-pulse'}`}>
                          {isDone ? 'Hoàn tất' : 'Đang chờ'}
                        </span>
                      </div>
                    </div>

                    {/* Middle: Dish Name */}
                    <div className="relative z-10 flex-1 flex flex-col justify-start">
                      <h3 className={`text-lg 2xl:text-4xl font-black leading-tight tracking-tight break-words pr-2 ${isDone ? 'line-through text-emerald-700/50' : 'text-slate-800'}`}>
                        {item.name}
                      </h3>
                    </div>

                    {/* Bottom: Notes */}
                    {item.notes.length > 0 && (
                      <div className="mt-3 2xl:mt-8 flex flex-wrap gap-1.5 2xl:gap-3 relative z-10">
                        {item.notes.map((note, idx) => (
                          <span key={idx} className={`
                            inline-flex items-center gap-1 text-[10px] 2xl:text-sm font-black uppercase 
                            px-2 py-1 2xl:px-4 2xl:py-2 rounded-lg 2xl:rounded-2xl border shadow-sm backdrop-blur-sm transition-colors
                            ${isDone ? 'bg-white/50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'}
                          `}>
                            <AlertTriangle className={`w-3 h-3 2xl:w-5 2xl:h-5 ${isDone ? 'text-emerald-500' : 'text-amber-500'}`} />
                            {note}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Done Icon Overlay */}
                    {isDone && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                        <CheckCircle className="w-24 h-24 2xl:w-32 2xl:h-32 text-emerald-500/10" />
                      </div>
                    )}
                  </div>
                );
              })}

              {aggregatedItems.length === 0 && (
                <div className="col-span-full h-[50vh] flex flex-col items-center justify-center gap-4 text-gray-400">
                  <ChefHat className="w-16 h-16 opacity-30" />
                  <p className="font-bold text-2xl">Bếp đang rảnh rỗi</p>
                  <p className="text-sm">Chưa có món nào chờ nấu</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Scroll Button */}
        {viewMode === 'table' && !isMobile && (
          <button
            onClick={scrollRight}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-[55] opacity-0 group-hover:opacity-100 transition-opacity duration-300 focus:outline-none"
          >
            <div className="w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-white hover:text-teal-600 hover:scale-110 active:scale-95 transition-all">
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>
        )}

      </div>

      <style>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        /* Hide scrollbar for IE, Edge and Firefox */
        .no-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
        .animate-pulse-slow {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: .9; transform: scale(0.99); }
        }
      `}</style>
    </div>
  );
}
