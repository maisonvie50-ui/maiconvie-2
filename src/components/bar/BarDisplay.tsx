import React, { useState, useEffect, useRef } from 'react';
import { Clock, AlertTriangle, CheckCircle, Flame, Check, Wine, BellRing, Filter, X, LayoutGrid, List, ChevronLeft, ChevronRight, CheckSquare } from 'lucide-react';
import { orderService, OrderTicket, OrderItem } from '../../services/orderService';
import { notificationService } from '../../services/notificationService';

type ItemStatus = 'pending' | 'cooking' | 'done';

export default function BarDisplay() {
  const [orders, setOrders] = useState<OrderTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [filterCategory, setFilterCategory] = useState<'All' | 'Đồ uống'>('All');
  const [notification, setNotification] = useState<{ message: string, visible: boolean }>({ message: '', visible: false });
  const [viewMode, setViewMode] = useState<'table' | 'dish'>('table');
  const [isMobile, setIsMobile] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const loadOrders = async () => {
    try {
      const data = await orderService.getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const subscription = orderService.subscribeToOrders(() => {
      loadOrders();
    });
    return () => { subscription.unsubscribe(); };
  }, []);

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

  const cycleItemStatus = async (orderId: string, itemId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const item = order.items.find(i => i.id === itemId);
    if (!item) return;

    const targetStatus = item.status === 'done' ? 'pending' : 'done';
    setOrders(prev => prev.map(o => o.id === orderId ? {
      ...o,
      items: o.items.map(i => i.id === itemId ? { ...i, status: targetStatus } : i)
    } : o));

    try {
      await orderService.updateItemStatus(itemId, targetStatus);
      if (targetStatus === 'done' && order.table) {
        const itemName = `${item.quantity}x ${item.name}`;
        await notificationService.broadcastCallServer([order.table], orderId, [itemName]);
        showNotification(`Đã báo phục vụ: ${item.name}`);
      }
    } catch (error) {
      console.error('Failed to update status', error);
      loadOrders();
    }
  };

  const markAllDone = async (orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? {
      ...o,
      items: o.items.map(i => ({ ...i, status: 'done' }))
    } : o));
    try {
      await orderService.markAllItemsDone(orderId);
    } catch (error) {
      console.error('Failed to mark all items done', error);
      loadOrders();
    }
  };

  const completeOrder = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    setOrders(prev => prev.filter(o => o.id !== orderId));
    showNotification('Đã gọi phục vụ!');
    try {
      if (order && order.table) {
        await notificationService.broadcastCallServer([order.table], orderId);
      }
      await orderService.completeOrder(orderId);
    } catch (error) {
      console.error('Failed to complete order', error);
      loadOrders();
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -scrollContainerRef.current.clientWidth, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: scrollContainerRef.current.clientWidth, behavior: 'smooth' });
    }
  };

  const getElapsedTime = (date: Date) => {
    return Math.floor((currentTime.getTime() - date.getTime()) / 1000 / 60);
  };

  const getStatusStyles = (minutes: number) => {
    if (minutes >= 15) return {
      card: 'border border-red-500 shadow-sm',
      header: 'bg-[#E52020] text-white',
      timer: 'text-white border border-white/20 bg-white/10 px-2 py-0.5 rounded'
    };
    if (minutes >= 10) return {
      card: 'border border-amber-400 shadow-sm',
      header: 'bg-amber-500 text-white',
      timer: 'text-white border border-white/20 bg-white/10 px-2 py-0.5 rounded'
    };
    return {
      card: 'border border-gray-200 shadow-sm',
      header: 'bg-white text-gray-800 border-b border-gray-100',
      timer: 'text-gray-500 bg-gray-100 px-2 py-0.5 rounded'
    };
  };

  // Filter orders to show only drink items
  const filteredOrders = orders
    .filter(order => {
      if (!['confirmed', 'arrived'].includes(order.bookingStatus)) return false;
      return true;
    })
    .map(order => ({
      ...order,
      // Only show drink items (Đồ uống category)
      items: order.items.filter(i => i.category === 'Đồ uống')
    }))
    .filter(order => order.items.length > 0);

  // Aggregation for Dish View
  const aggregatedItems = React.useMemo(() => {
    const itemsMap = new Map<string, {
      name: string,
      pendingQuantity: number,
      doneQuantity: number,
      category: string,
      notes: string[],
      originalItems: { orderId: string, itemId: string }[]
    }>();

    filteredOrders.forEach(order => {
      order.items.forEach(item => {
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
      .filter(item => item.pendingQuantity > 0 || item.doneQuantity > 0);
  }, [filteredOrders]);

  const handleCompleteAggregatedItem = async (originalItems: { orderId: string, itemId: string }[], isDone: boolean, itemName?: string) => {
    const targetStatus = isDone ? 'pending' : 'done';
    const tableNames = targetStatus === 'done'
      ? [...new Set(originalItems.map(oi => orders.find(o => o.id === oi.orderId)?.table).filter(Boolean) as string[])]
      : [];

    setOrders(orders.map(order => {
      let newOrder = { ...order };
      const itemsToUpdate = originalItems.filter(oi => oi.orderId === order.id).map(oi => oi.itemId);
      if (itemsToUpdate.length > 0) {
        newOrder.items = newOrder.items.map(item => {
          if (itemsToUpdate.includes(item.id)) return { ...item, status: targetStatus };
          return item;
        });
      }
      return newOrder;
    }));

    try {
      await Promise.all(originalItems.map(item => orderService.updateItemStatus(item.itemId, targetStatus)));
      if (targetStatus === 'done' && tableNames.length > 0) {
        const readyItems = itemName ? [itemName] : [];
        await notificationService.broadcastCallServer(tableNames, originalItems[0].orderId, readyItems);
        showNotification(`Đã báo phục vụ: ${itemName || 'Đồ uống đã xong'}`);
      }
    } catch (error) {
      console.error('Failed to update aggregated item status', error);
      loadOrders();
    }
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

      {/* Header controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between py-3 px-3 md:py-4 md:px-6 bg-white border-b border-gray-200 shrink-0 z-10 w-full gap-3 md:gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <h2 className="hidden sm:block text-2xl font-black text-gray-800 tracking-tight">KDS <span className="text-blue-600">BAR</span></h2>
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-bold transition-all ${viewMode === 'table'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden xs:inline">Bàn</span>
            </button>
            <button
              onClick={() => setViewMode('dish')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-bold transition-all ${viewMode === 'dish'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <List className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden xs:inline">Món</span>
            </button>
          </div>
          {isMobile && viewMode === 'table' && (
            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
              {filteredOrders.length} bàn
            </span>
          )}
        </div>

        <div className="flex flex-1 items-center justify-start md:justify-end shrink-0 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 md:gap-2 min-w-max">
            {(['All', 'Đồ uống'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap min-h-[36px] ${filterCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100/50'
                  }`}
              >
                {cat === 'All' ? 'Tất cả đồ uống' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden flex flex-col md:flex-row group">
        {/* Left Scroll Button */}
        {viewMode === 'table' && !isMobile && (
          <button onClick={scrollLeft} className="absolute left-2 top-1/2 -translate-y-1/2 z-[55] opacity-0 group-hover:opacity-100 transition-opacity duration-300 focus:outline-none">
            <div className="w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-white hover:text-blue-600 hover:scale-110 active:scale-95 transition-all">
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
            <>
              {filteredOrders.map((order) => {
                const elapsed = getElapsedTime(order.orderTime);
                const isCritical = elapsed >= 15;
                const styles = getStatusStyles(elapsed);
                const allItemsDone = order.items.every(i => i.status === 'done');

                return (
                  <div
                    key={order.id}
                    className={`flex flex-col rounded-xl bg-white transition-all h-max ${styles.card} ${isMobile
                      ? 'w-full'
                      : 'flex-shrink-0 snap-start w-[calc(25%-12px)]'
                      }`}
                  >
                    {/* Header */}
                    <div className={`px-2 py-2 md:px-3 md:py-2.5 flex justify-between items-center rounded-t-xl gap-2 ${styles.header}`}>
                      <h3 className="text-base md:text-lg font-black flex items-center gap-1.5 tracking-tight min-w-0">
                        <span className="truncate">{order.table}</span>
                        {isCritical && <Flame className="w-4 h-4 md:w-5 md:h-5 shrink-0 animate-pulse text-white" />}
                      </h3>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className={`flex items-center gap-1 font-mono text-[11px] md:text-xs font-bold whitespace-nowrap ${styles.timer}`}>
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          {elapsed}'
                        </div>
                        {!allItemsDone && !isMobile && (
                          <button
                            onClick={() => markAllDone(order.id)}
                            className="py-0.5 px-1.5 rounded-md bg-white/20 hover:bg-white/30 text-white border border-white/30 font-bold flex items-center justify-center gap-1 active:scale-95 transition-all text-[10px] whitespace-nowrap shrink-0"
                            title="Xong tất cả"
                          >
                            <CheckSquare className="w-3 h-3 shrink-0" /> Xong
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-2 md:p-3 flex-1 flex flex-col gap-2 bg-white">
                      {order.items.map((item, index) => {
                        const isDone = item.status === 'done';
                        return (
                          <React.Fragment key={item.id}>
                            {index === 0 && (
                              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1.5 mb-0.5 px-1">
                                ĐỒ UỐNG
                              </div>
                            )}
                            <div
                              onClick={() => cycleItemStatus(order.id, item.id)}
                              className={`group cursor-pointer select-none transition-all duration-200 active:scale-[0.98]
                                flex items-stretch rounded-xl border min-h-[4rem]
                                ${isDone
                                  ? 'border-emerald-300 bg-emerald-50/50'
                                  : 'border-gray-200 bg-white hover:border-blue-400 shadow-sm'
                                }`}
                            >
                              <div className={`w-10 md:w-12 flex items-center justify-center rounded-l-xl
                                ${isDone ? 'bg-emerald-400 text-white' : 'bg-white text-red-500'}`}>
                                <span className="text-lg md:text-xl font-black font-mono">{item.quantity}</span>
                              </div>
                              <div className={`flex-1 p-2 flex flex-col justify-center relative min-w-0 w-full overflow-hidden rounded-r-xl ${isDone ? 'bg-emerald-50/30' : 'bg-white'}`}>
                                <div className="pr-6 w-full">
                                  <div className={`text-[13px] md:text-[15px] font-bold leading-tight break-words ${isDone ? 'text-emerald-500 line-through opacity-70' : 'text-gray-800'}`}>
                                    {item.name}
                                  </div>
                                  {item.notes && item.notes.length > 0 && (
                                    <div className="mt-1 flex flex-wrap gap-1">
                                      {item.notes.map((note, idx) => (
                                        <span key={idx} className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[9px] font-bold uppercase border truncate max-w-full bg-amber-50 text-amber-600 border-amber-200">
                                          <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                                          <span className="truncate">{note}</span>
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
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
                          Pha xong tất cả để gọi phục vụ
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            // DISH VIEW
            <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 px-6 py-6 pb-12">
              {aggregatedItems.map((item, index) => {
                const isDone = item.pendingQuantity === 0;
                const qtyClass = isDone ? 'bg-emerald-500 text-white' : 'bg-gradient-to-br from-blue-500 to-blue-700 text-white';
                const cardBorderClass = isDone ? 'border-emerald-200 bg-emerald-50/40' : 'border-gray-200/60 bg-white hover:shadow-md hover:border-gray-300';

                return (
                  <div key={`agg-${index}`} className="h-full w-full">
                    <div
                      onClick={() => handleCompleteAggregatedItem(item.originalItems, isDone, `${isDone ? item.doneQuantity : item.pendingQuantity}x ${item.name}`)}
                      className={`h-full w-full relative group flex flex-col p-3 rounded-xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] shadow-sm border overflow-hidden ${cardBorderClass}`}
                    >
                      <div className="flex justify-between items-start mb-2 relative z-10">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-lg shadow-sm ${qtyClass}`}>
                          <span className="text-lg font-black font-mono leading-none">
                            {isDone ? item.doneQuantity : item.pendingQuantity}
                          </span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${isDone ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                            {item.category}
                          </span>
                          <span className={`text-[10px] font-bold uppercase tracking-wide ${isDone ? 'text-emerald-500' : 'text-red-500/80'}`}>
                            {isDone ? 'Hoàn tất' : 'Đang chờ'}
                          </span>
                        </div>
                      </div>
                      <div className="relative z-10 flex-1 flex flex-col justify-start">
                        <h3 className={`text-sm font-bold leading-snug break-words ${isDone ? 'line-through text-emerald-700/50' : 'text-gray-800'}`}>
                          {item.name}
                        </h3>
                      </div>
                      {item.notes.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1 relative z-10">
                          {item.notes.map((note, idx) => (
                            <span key={idx} className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md border ${isDone ? 'bg-white/50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                              <AlertTriangle className={`w-3 h-3 ${isDone ? 'text-emerald-500' : 'text-amber-500'}`} />
                              {note}
                            </span>
                          ))}
                        </div>
                      )}
                      {isDone && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                          <CheckCircle className="w-16 h-16 text-emerald-500/10" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {aggregatedItems.length === 0 && (
                <div className="col-span-full h-[50vh] flex flex-col items-center justify-center gap-4 text-gray-400">
                  <Wine className="w-16 h-16 opacity-30" />
                  <p className="font-bold text-2xl">Bar đang rảnh rỗi</p>
                  <p className="text-sm">Chưa có đồ uống nào chờ pha chế</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Scroll Button */}
        {viewMode === 'table' && !isMobile && (
          <button onClick={scrollRight} className="absolute right-2 top-1/2 -translate-y-1/2 z-[55] opacity-0 group-hover:opacity-100 transition-opacity duration-300 focus:outline-none">
            <div className="w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-white hover:text-blue-600 hover:scale-110 active:scale-95 transition-all">
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>
        )}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
