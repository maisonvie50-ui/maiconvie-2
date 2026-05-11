import React, { useState, useEffect, useRef, useMemo } from 'react';
import { orderService } from '../../services/orderService';
import { ChevronLeft, ChevronRight, Bell, Wine } from 'lucide-react';
import { CircleCheckBig, LayoutList, List, Flame, SquareCheckBig, Clock, TriangleAlert } from 'lucide-react';
import { notificationService } from '../../services/notificationService';

const BAR_CATEGORY_KEYWORDS = [
  'đồ uống', 'do uong', 'bar order', 'bar oder', 'bar',
  'rượu', 'ruou', 'rượu vang', 'ruou vang', 'wine',
  'cocktail', 'mocktail', 'beer', 'bia', 'trà', 'tra',
  'cà phê', 'ca phe', 'nước ép', 'nuoc ep', 'sinh tố', 'sinh to', 'soda'
];

const normalizeCategory = (category = '') => category
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .trim();

const isBarItem = (category = ''): boolean => {
  const raw = category.toLowerCase();
  const normalized = normalizeCategory(category);
  return BAR_CATEGORY_KEYWORDS.some(keyword => {
    const normalizedKeyword = normalizeCategory(keyword);
    return raw.includes(keyword.toLowerCase()) || normalized.includes(normalizedKeyword);
  });
};

const CATEGORY_ORDER: Record<string, number> = {
  "Đồ uống": 1, "Rượu vang": 2, "Cocktail": 3, "Mocktail": 4,
  "Beer": 5, "Bia": 5, "Trà": 6, "Cà phê": 7
};

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  status: string;
  category: string;
  notes?: string[];
}

interface Order {
  id: string;
  table: string;
  orderTime: Date;
  bookingStatus?: string;
  items: OrderItem[];
}

export default function BarDisplay() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const [filterCategory, setFilterCategory] = useState("All");
  const [activeOnly, setActiveOnly] = useState(true);
  const [toast, setToast] = useState({ message: "", visible: false });
  const [viewMode, setViewMode] = useState<"table" | "dish">("table");
  const [isMobile, setIsMobile] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadOrders = async () => {
    try {
      const data = await orderService.getOrders();
      setOrders(data as any);
    } catch (err) {
      console.error("Failed to load orders", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderRealtimePayload = (payload?: any) => {
    if (!payload) {
      loadOrders();
      return;
    }

    if (payload.table === 'order_items' && payload.eventType === 'UPDATE') {
      const item = payload.new;
      setOrders(prev => prev.map(order => ({
        ...order,
        items: order.items.map(i => i.id === item.id ? { ...i, status: item.status } : i)
      })));
      return;
    }

    if (payload.table === 'orders' && payload.eventType === 'UPDATE') {
      const order = payload.new;
      if (order.status !== 'pending') {
        setOrders(prev => prev.filter(o => o.id !== order.id));
        return;
      }
      setOrders(prev => prev.map(o => o.id === order.id ? {
        ...o,
        table: order.table_name,
        bookingStatus: order.booking_status || 'confirmed',
        orderTime: new Date(order.order_time)
      } : o));
      return;
    }

    if (payload.table === 'orders' && payload.eventType === 'DELETE') {
      setOrders(prev => prev.filter(o => o.id !== payload.old?.id));
      return;
    }

    loadOrders();
  };

  useEffect(() => {
    loadOrders();
    const sub = orderService.subscribeToOrders(handleOrderRealtimePayload);
    return () => { sub.unsubscribe(); };
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg: string) => {
    setToast({ message: msg, visible: true });
    setTimeout(() => setToast({ message: "", visible: false }), 3000);
  };

  const toggleItemStatus = async (orderId: string, itemId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const item = order.items.find(i => i.id === itemId);
    if (!item) return;
    const newStatus = item.status === "done" ? "pending" : "done";

    setOrders(prev => prev.map(o => o.id === orderId ? {
      ...o, items: o.items.map(i => i.id === itemId ? { ...i, status: newStatus } : i)
    } : o));

    try {
      await orderService.updateItemStatus(itemId, newStatus);
      if (order.table) {
        const label = `${item.quantity}x ${item.name}`;
        if (newStatus === "done") {
          await notificationService.broadcastCallServer([order.table], orderId, [label]);
          showToast(`Đã báo phục vụ: ${item.name}`);
        } else {
          await notificationService.broadcastDismissAlert({ orderId, readyItems: [label] });
          showToast(`Đã tắt báo phục vụ: ${item.name}`);
        }
      }
    } catch (err) {
      console.error("Failed to update status", err);
      loadOrders();
    }
  };

  const markAllDone = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const barItemIds = order.items.filter(i => isBarItem(i.category)).map(item => item.id);

    setOrders(prev => prev.map(o => o.id === orderId ? {
      ...o, items: o.items.map(i => barItemIds.includes(i.id) ? { ...i, status: "done" } : i)
    } : o));
    try {
      await Promise.all(barItemIds.map(itemId => orderService.updateItemStatus(itemId, "done")));
    } catch (err) {
      console.error("Failed to mark all items done", err);
      loadOrders();
    }
  };

  const completeOrder = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    setOrders(prev => prev.filter(o => o.id !== orderId));
    showToast("Đã gọi phục vụ — Đồ uống sẵn sàng!");
    try {
      if (order?.table) {
        const readyItems = order.items
          .filter(i => isBarItem(i.category))
          .filter(item => item.status === "done")
          .map(item => `${item.quantity}x ${item.name}`);
        await notificationService.broadcastCallServer([order.table], orderId, readyItems.length ? readyItems : ["Đồ uống đã pha xong"]);
      }
    } catch (err) {
      console.error("Failed to complete order", err);
      loadOrders();
    }
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -scrollRef.current.clientWidth, behavior: "smooth" });
    }
  };
  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: scrollRef.current.clientWidth, behavior: "smooth" });
    }
  };

  const getMinutes = (orderTime: Date) => Math.floor((now.getTime() - new Date(orderTime).getTime()) / 1000 / 60);

  const getTimerStyle = (mins: number) => {
    if (mins >= 15) return { card: "border border-red-500 shadow-sm", header: "bg-[#E52020] text-white", timer: "text-white border border-white/20 bg-white/10 px-2 py-0.5 rounded" };
    if (mins >= 10) return { card: "border border-amber-400 shadow-sm", header: "bg-amber-500 text-white", timer: "text-white border border-white/20 bg-white/10 px-2 py-0.5 rounded" };
    return { card: "border border-gray-200 shadow-sm", header: "bg-white text-gray-800 border-b border-gray-100", timer: "text-gray-500 bg-gray-100 px-2 py-0.5 rounded" };
  };

  const filteredOrders = orders
    .filter(o => !(activeOnly && !["confirmed", "arrived"].includes(o.bookingStatus || "")))
    .map(o => ({ ...o, items: o.items.filter(i => isBarItem(i.category)).filter(i => filterCategory === "All" || i.category === filterCategory) }))
    .filter(o => o.items.length > 0);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    orders.forEach(o => o.items.forEach(i => { if (isBarItem(i.category)) cats.add(i.category); }));
    return Array.from(cats);
  }, [orders]);

  const aggregatedItems = useMemo(() => {
    const map = new Map<string, any>();
    filteredOrders.forEach(o => {
      o.items.forEach(item => {
        const key = `${item.name}-${(item.notes?.join(",")) || ""}`;
        if (!map.has(key)) map.set(key, { name: item.name, pendingQuantity: 0, doneQuantity: 0, category: item.category, notes: item.notes || [], originalItems: [] });
        const agg = map.get(key)!;
        if (item.status === "done") agg.doneQuantity += item.quantity;
        else agg.pendingQuantity += item.quantity;
        agg.originalItems.push({ orderId: o.id, itemId: item.id });
      });
    });
    return Array.from(map.values())
      .filter((a: any) => a.pendingQuantity > 0 || a.doneQuantity > 0)
      .sort((a: any, b: any) => (CATEGORY_ORDER[a.category] || 99) - (CATEGORY_ORDER[b.category] || 99));
  }, [filteredOrders]);

  const toggleAggregated = async (originalItems: { orderId: string; itemId: string }[], isDone: boolean, label: string) => {
    const newStatus = isDone ? "pending" : "done";
    const tables = newStatus === "done"
      ? [...new Set(originalItems.map(oi => orders.find(o => o.id === oi.orderId)?.table).filter(Boolean))] as string[]
      : [];

    setOrders(orders.map(o => {
      const itemIds = originalItems.filter(oi => oi.orderId === o.id).map(oi => oi.itemId);
      if (itemIds.length === 0) return o;
      return { ...o, items: o.items.map(i => itemIds.includes(i.id) ? { ...i, status: newStatus } : i) };
    }));

    try {
      await Promise.all(originalItems.map(oi => orderService.updateItemStatus(oi.itemId, newStatus)));
      if (newStatus === "done" && tables.length > 0) {
        await notificationService.broadcastCallServer(tables, originalItems[0].orderId, [label]);
        showToast(`Đã báo phục vụ: ${label || "Đồ uống đã xong"}`);
      } else if (newStatus === "pending") {
        await notificationService.broadcastDismissAlert({ orderId: originalItems[0].orderId, readyItems: [label] });
        showToast(`Đã tắt báo phục vụ: ${label || "Đồ uống đã xong"}`);
      }
    } catch (err) {
      console.error("Failed to update aggregated item status", err);
      loadOrders();
    }
  };

  return (
    <div className="h-[calc(100vh/var(--ui-zoom,1)-64px)] bg-white flex flex-col relative overflow-hidden">
      {/* Toast */}
      {toast.visible && (
        <div className="fixed top-20 right-6 z-50 bg-gray-900 text-white px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300 font-bold text-lg">
          <CircleCheckBig className="w-7 h-7 text-blue-400" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between py-3 px-3 md:py-4 md:px-6 bg-white border-b border-gray-200 shrink-0 z-10 w-full gap-3 md:gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <h2 className="hidden sm:block text-2xl font-black text-gray-800 tracking-tight">
            KDS <span className="text-blue-600">BAR</span>
          </h2>
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button onClick={() => setViewMode("table")} className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-bold transition-all ${viewMode === "table" ? "bg-white text-blue-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              <LayoutList className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden xs:inline">Theo Bàn</span><span className="xs:hidden">Bàn</span>
            </button>
            <button onClick={() => setViewMode("dish")} className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-bold transition-all ${viewMode === "dish" ? "bg-white text-blue-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              <List className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden xs:inline">Tổng hợp</span><span className="xs:hidden">Món</span>
            </button>
          </div>
          {isMobile && viewMode === "table" && (
            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{filteredOrders.length} bàn</span>
          )}
        </div>

        <div className="flex flex-1 items-center justify-start md:justify-end shrink-0 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 md:gap-2 min-w-max">
            <button onClick={() => setFilterCategory("All")} className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap min-h-[36px] ${filterCategory === "All" ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-800 hover:bg-gray-100/50"}`}>
              Tất cả đồ uống
            </button>
            {categories.map(cat => (
              <button key={cat} onClick={() => setFilterCategory(cat)} className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap min-h-[36px] ${filterCategory === cat ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-800 hover:bg-gray-100/50"}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative overflow-hidden flex flex-col md:flex-row group">
        {viewMode === "table" && !isMobile && (
          <button onClick={scrollLeft} className="absolute left-2 top-1/2 -translate-y-1/2 z-[55] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-white hover:text-blue-600 hover:scale-110 active:scale-95 transition-all">
              <ChevronLeft className="w-5 h-5" />
            </div>
          </button>
        )}

        <div ref={scrollRef} className={`flex-1 overflow-y-auto no-scrollbar font-sans pb-10 ${viewMode === "table" ? (isMobile ? "flex flex-col w-full items-stretch px-3 py-4 gap-3" : "flex flex-wrap w-full items-start px-6 py-6 gap-4") : "block w-full overflow-x-hidden p-3 sm:p-4 md:p-6"}`}>
          {viewMode === "table" ? (
            <>
              {filteredOrders.map(order => {
                const mins = getMinutes(order.orderTime);
                const isUrgent = mins >= 15;
                const style = getTimerStyle(mins);
                const allDone = order.items.every(i => i.status === "done");
                const sortedItems = [...order.items].sort((a, b) => (CATEGORY_ORDER[a.category] || 99) - (CATEGORY_ORDER[b.category] || 99));

                return (
                  <div key={order.id} className={`flex flex-col rounded-xl bg-white transition-all h-max ${style.card} ${isMobile ? "w-full" : "flex-shrink-0 snap-start w-[calc(20%-12.8px)]"}`}>
                    <div className={`px-2 py-2 md:px-3 md:py-2.5 flex justify-between items-center rounded-t-xl gap-2 ${style.header}`}>
                      <h3 className="text-base md:text-lg font-black flex items-center gap-1.5 tracking-tight min-w-0" title={order.table}>
                        <span className="truncate">{order.table}</span>
                        {isUrgent && <Flame className="w-4 h-4 md:w-5 md:h-5 shrink-0 animate-pulse text-white" />}
                      </h3>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className={`flex items-center gap-1 font-mono text-[11px] md:text-xs font-bold whitespace-nowrap ${style.timer}`}>
                          <Clock className="w-3.5 h-3.5 shrink-0" />{mins}'
                        </div>
                        {!allDone && !isMobile && (
                          <button onClick={() => markAllDone(order.id)} className="py-0.5 px-1.5 rounded-md bg-white/20 hover:bg-white/30 text-white border border-white/30 font-bold flex items-center justify-center gap-1 active:scale-95 transition-all text-[10px] whitespace-nowrap shrink-0" title="Xong tất cả">
                            <SquareCheckBig className="w-3 h-3 shrink-0" /> Xong
                          </button>
                        )}
                      </div>
                    </div>

                    {!allDone && isMobile && (
                      <button onClick={() => markAllDone(order.id)} className="mx-2 mt-2 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-900 text-white font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all text-sm">
                        <SquareCheckBig className="w-4 h-4" /> Xong tất cả
                      </button>
                    )}

                    <div className="p-2 md:p-3 flex-1 flex flex-col gap-2 bg-white">
                      {sortedItems.map((item, idx) => {
                        const showCategoryHeader = idx === 0 || sortedItems[idx - 1].category !== item.category;
                        const done = item.status === "done";
                        return (
                          <React.Fragment key={item.id}>
                            {showCategoryHeader && <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-1.5 mb-0.5 px-1">{item.category}</div>}
                            <div onClick={() => toggleItemStatus(order.id, item.id)} className={`group cursor-pointer select-none transition-all duration-200 active:scale-[0.98] flex items-stretch rounded-xl border min-h-[4rem] ${done ? "border-emerald-300 bg-emerald-50/50" : "border-gray-200 bg-white hover:border-blue-400 shadow-sm"}`}>
                              <div className={`w-10 md:w-12 flex items-center justify-center rounded-l-xl ${done ? "bg-emerald-400 text-white" : "bg-white text-red-500"}`}>
                                <span className="text-lg md:text-xl font-black font-mono">{item.quantity}</span>
                              </div>
                              <div className={`flex-1 p-2 flex flex-col justify-center relative min-w-0 w-full overflow-hidden rounded-r-xl ${done ? "bg-emerald-50/30" : "bg-white"}`}>
                                <div className="pr-6 w-full">
                                  <div className={`text-[13px] md:text-[15px] font-bold leading-tight break-words ${done ? "text-emerald-500 line-through opacity-70" : "text-gray-800"}`} title={item.name}>{item.name}</div>
                                  {item.notes && item.notes.length > 0 && (
                                    <div className="mt-1 flex flex-wrap gap-1">
                                      {item.notes.map((note, ni) => (
                                        <span key={ni} className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[9px] font-bold uppercase border truncate max-w-full bg-amber-50 text-amber-600 border-amber-200" title={note}>
                                          <TriangleAlert className="w-2.5 h-2.5 shrink-0" /><span className="truncate">{note}</span>
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                {done && <div className="absolute top-1/2 -translate-y-1/2 right-2 text-emerald-500 bg-white rounded-full p-0.5 shadow-sm"><CircleCheckBig className="w-4 h-4 shrink-0" /></div>}
                              </div>
                            </div>
                          </React.Fragment>
                        );
                      })}
                    </div>

                    <div className="p-2 md:p-3 bg-white border-t border-gray-100 rounded-b-xl">
                      <button onClick={() => completeOrder(order.id)} disabled={!allDone} className={`w-full py-2 rounded-xl font-black text-sm md:text-base flex items-center justify-center gap-2 transition-all shadow-sm ${allDone ? "bg-blue-600 hover:bg-blue-700 text-white active:scale-95" : "bg-gray-100 text-gray-400 cursor-not-allowed hidden"}`}>
                        <Bell className="w-4 h-4 md:w-5 md:h-5" />GỌI PHỤC VỤ
                      </button>
                      {!allDone && <div className="text-center text-[10px] md:text-xs font-bold text-gray-400 py-1">Pha xong tất cả để gọi phục vụ</div>}
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 px-6 py-6 pb-12">
              {aggregatedItems.map((item: any, idx: number) => {
                const done = item.pendingQuantity === 0;
                return (
                  <div key={`agg-${idx}`} className="h-full w-full">
                    <div onClick={() => toggleAggregated(item.originalItems, done, `${done ? item.doneQuantity : item.pendingQuantity}x ${item.name}`)} className={`h-full w-full relative group flex flex-col p-3 rounded-xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] shadow-sm border overflow-hidden ${done ? "border-emerald-200 bg-emerald-50/40" : "border-gray-200/60 bg-white hover:shadow-md hover:border-gray-300"}`}>
                      <div className="flex justify-between items-start mb-2 relative z-10">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-lg shadow-sm ${done ? "bg-emerald-500 text-white" : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"}`}>
                          <span className="text-lg font-black font-mono leading-none">{done ? item.doneQuantity : item.pendingQuantity}</span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${done ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-blue-50 text-blue-600 border-blue-200"}`}>{item.category}</span>
                          <span className={`text-[10px] font-bold uppercase tracking-wide ${done ? "text-emerald-500" : "text-red-500/80"}`}>{done ? "Hoàn tất" : "Đang chờ"}</span>
                        </div>
                      </div>
                      <div className="relative z-10 flex-1 flex flex-col justify-start">
                        <h3 className={`text-sm font-bold leading-snug break-words ${done ? "line-through text-emerald-700/50" : "text-gray-800"}`}>{item.name}</h3>
                      </div>
                      {item.notes.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1 relative z-10">
                          {item.notes.map((note: string, ni: number) => (
                            <span key={ni} className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md border ${done ? "bg-white/50 text-emerald-600 border-emerald-200" : "bg-amber-50 text-amber-600 border-amber-200"}`}>
                              <TriangleAlert className={`w-3 h-3 ${done ? "text-emerald-500" : "text-amber-500"}`} />{note}
                            </span>
                          ))}
                        </div>
                      )}
                      {done && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"><CircleCheckBig className="w-16 h-16 text-emerald-500/10" /></div>}
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

        {viewMode === "table" && !isMobile && (
          <button onClick={scrollRight} className="absolute right-2 top-1/2 -translate-y-1/2 z-[55] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
