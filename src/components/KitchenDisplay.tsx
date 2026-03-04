import React, { useState, useEffect, useRef } from 'react';
import { Clock, AlertTriangle, CheckCircle, Flame, Check, ChefHat, BellRing, Filter, X, LayoutGrid, List, ChevronLeft, ChevronRight, CheckSquare } from 'lucide-react';

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

const mockOrders: OrderTicket[] = [
  {
    id: '1',
    table: 'Bàn 1',
    orderTime: new Date(Date.now() - 1000 * 60 * 5),
    status: 'pending',
    bookingStatus: 'confirmed',
    items: [
      { id: '1-2', name: 'Súp bí đỏ', quantity: 2, status: 'done', category: 'Khai vị' },
      { id: '1-1', name: 'Bò bít tết (Medium Rare)', quantity: 2, notes: ['Sốt tiêu đen', 'Không hành tây'], status: 'cooking', category: 'Món chính' },
    ]
  },
  {
    id: '2',
    table: 'VIP 2',
    orderTime: new Date(Date.now() - 1000 * 60 * 12),
    status: 'pending',
    bookingStatus: 'pending',
    items: [
      { id: '2-2', name: 'Salad Caesar', quantity: 1, status: 'pending', category: 'Khai vị' },
      { id: '2-1', name: 'Cá hồi áp chảo', quantity: 1, notes: ['DỊ ỨNG ĐẬU PHỘNG'], status: 'pending', category: 'Món chính' },
      { id: '2-3', name: 'Mỳ Ý Carbonara', quantity: 1, status: 'pending', category: 'Món chính' },
    ]
  },
  {
    id: '3',
    table: 'Bàn 5',
    orderTime: new Date(Date.now() - 1000 * 60 * 2),
    status: 'pending',
    bookingStatus: 'confirmed',
    items: [
      { id: '3-1', name: 'Gà nướng mật ong', quantity: 1, status: 'pending', category: 'Món chính' },
      { id: '3-2', name: 'Khoai tây chiên', quantity: 1, notes: ['Ít muối'], status: 'pending', category: 'Khai vị' },
    ]
  },
  {
    id: '4',
    table: 'Bàn 7',
    orderTime: new Date(Date.now() - 1000 * 60 * 18),
    status: 'pending',
    bookingStatus: 'arrived',
    items: [
      { id: '4-1', name: 'Lẩu hải sản (Lớn)', quantity: 1, notes: ['Cay nhiều'], status: 'cooking', category: 'Món chính' },
      { id: '4-2', name: 'Rau thêm', quantity: 2, status: 'done', category: 'Món chính' },
    ]
  },
];

const categoryOrder: Record<ItemCategory, number> = {
  'Khai vị': 1,
  'Món chính': 2,
  'Tráng miệng': 3,
  'Đồ uống': 4
};

export default function KitchenDisplay() {
  const [orders, setOrders] = useState<OrderTicket[]>(mockOrders);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [filterCategory, setFilterCategory] = useState<ItemCategory | 'All'>('All');
  const [filterTimeSlot, setFilterTimeSlot] = useState<'All' | 'Lunch' | 'Dinner'>('All');
  const [showConfirmedOnly, setShowConfirmedOnly] = useState(true);
  const [notification, setNotification] = useState<{ message: string, visible: boolean }>({ message: '', visible: false });
  const [viewMode, setViewMode] = useState<'table' | 'dish'>('table');

  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
      scrollContainerRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  const getElapsedTime = (date: Date) => {
    const diff = Math.floor((currentTime.getTime() - date.getTime()) / 1000 / 60);
    return diff;
  };

  const getStatusStyles = (minutes: number) => {
    if (minutes >= 15) return {
      card: 'border-red-400 shadow-red-200 animate-pulse-slow',
      header: 'bg-red-500 text-white border-b border-red-600',
      timer: 'text-white bg-red-600 px-2 py-0.5 rounded'
    }; // Critical
    if (minutes >= 10) return {
      card: 'border-amber-300 shadow-amber-100',
      header: 'bg-amber-100 text-amber-800 border-b border-amber-200',
      timer: 'text-amber-800 bg-amber-200 px-2 py-0.5 rounded'
    }; // Warning
    return {
      card: 'border-gray-200 shadow-sm',
      header: 'bg-white text-gray-800 border-b border-gray-100',
      timer: 'text-gray-600 bg-gray-100 px-2 py-0.5 rounded'
    }; // Normal
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
    <div className="h-[calc(100vh-64px)] bg-[#f3f4f6] flex flex-col relative overflow-hidden">
      {/* Toast Notification */}
      {notification.visible && (
        <div className="fixed top-20 right-6 z-50 bg-gray-900 text-white px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300 font-bold text-lg">
          <CheckCircle className="w-7 h-7 text-green-400" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white border-b shadow-sm shrink-0 z-10 w-full overflow-x-auto no-scrollbar gap-4">
        <div className="flex items-center gap-4 shrink-0">
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">KDS <span className="text-teal-600">BẾP</span></h2>
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${viewMode === 'table'
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <LayoutGrid className="w-5 h-5" /> Theo Bàn
            </button>
            <button
              onClick={() => setViewMode('dish')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${viewMode === 'dish'
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <List className="w-5 h-5" /> Tổng hợp món
            </button>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-start md:justify-end shrink-0">
          {/* Category Filter */}
          <div className="flex bg-gray-50 p-1.5 rounded-xl border border-gray-200 min-w-max">
            {(['All', 'Khai vị', 'Món chính', 'Tráng miệng', 'Đồ uống'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${filterCategory === cat
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {cat === 'All' ? 'Tất cả món' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden flex flex-col md:flex-row">

        {/* Left Scroll Button */}
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-0 bottom-0 w-24 md:w-16 bg-gradient-to-r from-gray-900/10 to-transparent hover:from-gray-900/20 z-10 flex items-center justify-start pl-2 md:pl-2 transition-colors focus:outline-none"
        >
          <div className="w-14 h-28 bg-white/80 backdrop-blur rounded-xl shadow-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-white hover:text-teal-600 hover:scale-105 active:scale-95 transition-all">
            <ChevronLeft className="w-12 h-12" />
          </div>
        </button>

        {/* Kanban Board Container */}
        <div
          ref={scrollContainerRef}
          className={`flex-1 overflow-x-auto overflow-y-auto no-scrollbar font-sans p-6 px-16 md:px-20 ${viewMode === 'table' ? 'flex items-start gap-6 snap-x snap-mandatory' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 content-start'}`}
        >
          {viewMode === 'table' ? (
            // =============================
            // TABLE VIEW
            // =============================
            filteredOrders.map((order) => {
              const elapsed = getElapsedTime(order.orderTime);
              const isCritical = elapsed >= 15;
              const styles = getStatusStyles(elapsed);
              const allItemsDone = order.items.every(i => i.status === 'done');

              const sortedItems = [...order.items].sort((a, b) => categoryOrder[a.category] - categoryOrder[b.category]);

              return (
                <div
                  key={order.id}
                  className={`flex flex-col rounded-2xl border-[3px] bg-white transition-all w-80 md:w-96 shrink-0 snap-start h-max ${styles.card}`}
                >
                  {/* Header */}
                  <div className={`px-5 py-4 flex justify-between items-center rounded-t-xl ${styles.header}`}>
                    <h3 className="text-3xl font-black flex items-center gap-2 tracking-tight">
                      {order.table}
                      {isCritical && <Flame className="w-8 h-8 animate-bounce fill-current" />}
                    </h3>
                    <div className={`flex items-center gap-1 font-mono text-xl font-black ${styles.timer}`}>
                      <Clock className="w-5 h-5" />
                      {elapsed}'
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-3 flex-1 flex flex-col gap-3 bg-gray-50/50">
                    {/* Mark All Done Button */}
                    {!allItemsDone && (
                      <button
                        onClick={() => markAllDone(order.id)}
                        className="w-full py-3 mb-2 rounded-xl bg-teal-50 text-teal-700 border-2 border-teal-200 font-bold flex items-center justify-center gap-2 hover:bg-teal-100 active:bg-teal-200 transition-colors text-lg"
                      >
                        <CheckSquare className="w-6 h-6" /> Đánh dấu xong tất cả
                      </button>
                    )}

                    {sortedItems.map((item, index) => {
                      const showCategoryHeader = index === 0 || sortedItems[index - 1].category !== item.category;
                      const isDone = item.status === 'done';

                      return (
                        <React.Fragment key={item.id}>
                          {showCategoryHeader && (
                            <div className="text-sm font-black text-gray-400 uppercase tracking-widest mt-2 px-2 border-b-2 border-gray-200 pb-1">
                              {item.category}
                            </div>
                          )}
                          <div
                            onClick={() => cycleItemStatus(order.id, item.id)}
                            className={`
                              group cursor-pointer select-none transition-all duration-200 active:scale-[0.98]
                              flex items-stretch rounded-xl border-2 overflow-hidden shadow-sm min-h-[5rem]
                              ${isDone
                                ? 'border-green-500 bg-green-50/50 opacity-60'
                                : 'border-gray-200 bg-white hover:border-teal-400'
                              }
                            `}
                          >
                            {/* Quantity Indicator */}
                            <div className={`
                                w-20 flex items-center justify-center border-r-2
                                ${isDone ? 'bg-green-500 border-green-500 text-white' : 'bg-gray-100 border-gray-200 text-red-600'}
                            `}>
                              <span className="text-4xl font-black font-mono">
                                {item.quantity}
                              </span>
                            </div>

                            {/* Item Details */}
                            <div className="flex-1 p-3 flex flex-col justify-center relative pr-12">
                              <div className={`text-xl font-bold leading-tight ${isDone ? 'line-through text-green-700' : 'text-gray-900'}`}>
                                {item.name}
                              </div>

                              {/* Notes */}
                              {item.notes && item.notes.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {item.notes.map((note, idx) => {
                                    const isAllergy = note.toLowerCase().includes('dị ứng');
                                    return (
                                      <span
                                        key={idx}
                                        className={`
                                          inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-bold uppercase border-2
                                          ${isAllergy
                                            ? 'bg-red-100 text-red-800 border-red-300'
                                            : 'bg-amber-100 text-amber-800 border-amber-300'}
                                        `}
                                      >
                                        <AlertTriangle className="w-4 h-4" />
                                        {note}
                                      </span>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Status Icon Indicator */}
                              {isDone && (
                                <div className="absolute top-1/2 -translate-y-1/2 right-3 text-green-500 bg-white rounded-full p-0.5 shadow-sm">
                                  <CheckCircle className="w-8 h-8" />
                                </div>
                              )}
                            </div>

                          </div>
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* Footer Action */}
                  <div className="p-4 bg-white border-t-2 border-gray-100 rounded-b-xl">
                    <button
                      onClick={() => completeOrder(order.id)}
                      disabled={!allItemsDone}
                      className={`w-full py-4 rounded-xl font-black text-xl flex items-center justify-center gap-3 transition-all shadow-md ${allItemsDone
                          ? 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed hidden'
                        }`}
                    >
                      <BellRing className="w-7 h-7" />
                      GỌI PHỤC VỤ
                    </button>
                    {!allItemsDone && (
                      <div className="text-center text-base font-bold text-gray-400 py-2">
                        Hãy làm xong tất cả món để gọi phục vụ
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            // =============================
            // DISH VIEW (Tổng hợp món)
            // =============================
            <React.Fragment>
              {aggregatedItems.map((item, index) => {
                const isDone = item.pendingQuantity === 0;

                return (
                  <div
                    key={`agg-${index}`}
                    onClick={() => handleCompleteAggregatedItem(item.originalItems, isDone)}
                    className={`
                                flex items-stretch rounded-2xl border-[3px] overflow-hidden shadow-sm cursor-pointer transition-transform duration-200 active:scale-[0.98] w-full min-h-[6rem]
                                ${isDone ? 'border-green-500 bg-green-50/50 opacity-60' : 'border-gray-200 hover:border-teal-500 bg-white'}
                            `}
                  >
                    {/* Quantity */}
                    <div className={`
                                w-28 md:w-32 flex flex-col items-center justify-center border-r-[3px] p-2 relative shrink-0
                                ${isDone ? 'bg-green-500 border-green-500 text-white' : 'bg-gray-100 border-gray-200 text-red-600'}
                            `}>
                      <span className={`text-6xl font-black font-mono leading-none ${isDone ? 'text-white' : 'text-red-600'}`}>
                        {isDone ? item.doneQuantity : item.pendingQuantity}
                      </span>
                      <span className={`text-sm font-bold uppercase mt-1 tracking-wider ${isDone ? 'text-green-100' : 'text-gray-500'}`}>
                        {isDone ? 'Hoàn tất' : 'Đang chờ'}
                      </span>
                    </div>

                    {/* Detail */}
                    <div className="flex-1 p-5 flex flex-col justify-center relative pr-4">
                      <div className="text-sm font-black text-gray-400 mb-1 uppercase tracking-widest">{item.category}</div>
                      <div className={`text-2xl font-bold leading-tight ${isDone ? 'line-through text-green-700' : 'text-gray-900'}`}>
                        {item.name}
                      </div>

                      {item.notes.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3 p-3 bg-amber-50 rounded-xl border-2 border-amber-200 shadow-sm">
                          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                          <div className="flex flex-col gap-1">
                            {item.notes.map((note, idx) => (
                              <span key={idx} className="text-sm font-black text-amber-800 uppercase">• {note}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Status Icon Indicator */}
                      {isDone && (
                        <div className="absolute top-1/2 -translate-y-1/2 right-6 text-green-500 bg-white rounded-full p-0.5 shadow-sm">
                          <CheckCircle className="w-10 h-10" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {aggregatedItems.length === 0 && (
                <div className="w-full col-span-full h-full min-h-[50vh] flex items-center justify-center text-gray-400 font-bold text-2xl">
                  Không có danh sách món nào đang chờ.
                </div>
              )}
            </React.Fragment>
          )}
        </div>

        {/* Right Scroll Button */}
        <button
          onClick={scrollRight}
          className="absolute right-0 top-0 bottom-0 w-24 md:w-16 bg-gradient-to-l from-gray-900/10 to-transparent hover:from-gray-900/20 z-10 flex items-center justify-end pr-2 md:pr-2 transition-colors focus:outline-none"
        >
          <div className="w-14 h-28 bg-white/80 backdrop-blur rounded-xl shadow-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-white hover:text-teal-600 hover:scale-105 active:scale-95 transition-all">
            <ChevronRight className="w-12 h-12" />
          </div>
        </button>

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

