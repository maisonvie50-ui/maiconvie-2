import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BookingKanban from '../booking/BookingKanban';
import TrainingPortal from '../training/TrainingPortal';
import CustomerCRM from '../crm/CustomerCRM';
import Settings from '../settings/Settings';
import AdvancedAnalytics from '../analytics/AdvancedAnalytics';
import MenuManagement from '../menu/MenuManagement';
import KitchenDisplay from '../kitchen/KitchenDisplay';
import { level1Tables, vipRooms, eventHall } from '../../data/mockTables';
import type { Category, MenuItem, SetMenu } from '../../types';
import { menuService } from '../../services/menuService';
import {
  Menu,
  Search,
  Plus,
  Minus,
  ShoppingBag,
  Send,
  CheckCircle,
  Clock,
  Users,
  ChevronLeft,
  Utensils,
  LayoutGrid,
  Bell,
  CalendarDays,
  MoreHorizontal,
  BookOpen,
  Settings as SettingsIcon,
  BarChart3,
  ChefHat,
  LogOut,
  Receipt,
  X
} from 'lucide-react';
import { tableService } from '../../services/tableService';
import { orderService } from '../../services/orderService';
import { notificationService } from '../../services/notificationService';
import CheckoutModal from '../booking/CheckoutModal';
import OrderHistory from '../analytics/OrderHistory';

type TableStatus = 'empty' | 'occupied' | 'reserved';
interface Table {
  id: string;
  name: string;
  type: 'circle' | 'square';
  status: TableStatus;
  pax: number;
  customerName?: string;
  time?: string;
  duration?: string;
  notes?: string;
  floor?: number;
}

interface VipRoom {
  id: string;
  name: string;
  capacity: number;
  status: 'empty' | 'in-use';
  customerName?: string;
  time?: string;
  notes?: string;
}

type ViewState = 'tables' | 'menu' | 'cart' | 'success' | 'bookings' | 'more' | 'training' | 'crm' | 'settings' | 'reports' | 'menu-management' | 'kitchen' | 'order-history';

interface MobileCaptainAppProps {
  onLogout?: () => void;
}

export default function MobileCaptainApp({ onLogout }: MobileCaptainAppProps) {
  const [view, setView] = useState<ViewState>('tables');
  const [activeZone, setActiveZone] = useState<'T1' | 'T2' | 'T3'>('T1');
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [tableActionTarget, setTableActionTarget] = useState<Table | VipRoom | null>(null);
  const [tableCheckoutId, setTableCheckoutId] = useState<string | null>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Real database states
  const [menuCategories, setMenuCategories] = useState<Category[]>([]);
  const [menuItemsList, setMenuItemsList] = useState<MenuItem[]>([]);
  const [setMenusList, setSetMenusList] = useState<SetMenu[]>([]);
  const [tablesL1, setTablesL1] = useState<Table[]>([]);
  const [tablesL3, setTablesL3] = useState<Table[]>([]);
  const [vipRoomsList, setVipRoomsList] = useState<VipRoom[]>([]);

  // Kitchen Notification State
  const [kitchenAlert, setKitchenAlert] = useState<{ visible: boolean, tables: string[], orderId: string, readyItems?: string[] } | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Load tables from Supabase
  const fetchTables = async () => {
    try {
      const allTables = await tableService.getTables();
      setTablesL1(allTables.filter(t => t.floor === 1));

      // Map floor 2 to vipRooms
      const vip = allTables.filter(t => t.floor === 2).map(t => ({
        id: t.id,
        name: t.name,
        capacity: t.pax,
        status: (t.status === 'occupied' || t.status === 'reserved') ? 'in-use' : 'empty',
        customerName: t.customerName,
        time: t.time || undefined,
        notes: t.notes || undefined
      } as VipRoom));
      setVipRoomsList(vip);

      setTablesL3(allTables.filter(t => t.floor === 3));
    } catch (e) {
      console.error('Failed to load tables in mobile app', e);
      // Fallback to mock data if needed
      setTablesL1(level1Tables as any);
      setVipRoomsList(vipRooms as any);
      setTablesL3(eventHall as any); // Type assertion hack for fallback
    }
  };

  const fetchMenuData = async () => {
    try {
      const [categories, items, setMenus] = await Promise.all([
        menuService.getCategories(),
        menuService.getMenuItems(),
        menuService.getSetMenus()
      ]);
      setMenuCategories(categories);
      setMenuItemsList(items);
      setSetMenusList(setMenus);
    } catch (e) {
      console.error('Failed to load menu data in mobile app', e);
    }
  };

  useEffect(() => {
    fetchTables();
    fetchMenuData();
    notificationService.requestNotificationPermission();

    const subscription = tableService.subscribeToTables(() => {
      fetchTables();
    });

    const unsubscribeMenu = menuService.subscribeToMenuChanges(() => {
      fetchMenuData();
    });

    const unsubscribeKitchen = notificationService.subscribeToKitchenCalls((payload) => {
      if (payload && payload.tableNames && payload.tableNames.length > 0) {
        setKitchenAlert({
          visible: true,
          tables: payload.tableNames,
          orderId: payload.orderId,
          readyItems: payload.readyItems
        });

        const itemsText = payload.readyItems?.length
          ? payload.readyItems.join(', ')
          : 'Vui lòng đến lấy món';
        notificationService.showBrowserNotification(`Món cho ${payload.tableNames.join(', ')} đã xong!`, {
          body: itemsText,
          requireInteraction: true
        });
      }
    });

    return () => {
      subscription.unsubscribe();
      unsubscribeMenu();
      if (unsubscribeKitchen) unsubscribeKitchen();
    };
  }, []);

  // Active ringing loop when alert is shown
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (kitchenAlert?.visible) {
      // Play immediately
      notificationService.playCallServerSound('1');
      // Then loop every 2.5s until dismissed
      interval = setInterval(() => {
        notificationService.playCallServerSound('1');
      }, 2500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [kitchenAlert?.visible]);

  // Sync URL with View
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/quan-ly-thuc-don')) setView('menu-management');
    else if (path.includes('/bep')) setView('kitchen');
    else if (path.includes('/thuc-don')) setView('menu');
    else if (path.includes('/dat-ban')) setView('bookings');
    else if (path.includes('/dao-tao')) setView('training');
    else if (path.includes('/khach-hang')) setView('crm');
    else if (path.includes('/cau-hinh')) setView('settings');
    else if (path.includes('/bao-cao')) setView('reports');
    else if (path.includes('/so-do-nha-hang') || path === '/') setView('tables');
  }, [location.pathname]);

  const handleSetView = (newView: ViewState) => {
    setView(newView);
    switch (newView) {
      case 'tables': navigate('/so-do-nha-hang'); break;
      case 'menu': navigate('/thuc-don'); break;
      case 'bookings': navigate('/dat-ban'); break;
      case 'training': navigate('/dao-tao'); break;
      case 'crm': navigate('/khach-hang'); break;
      case 'settings': navigate('/cau-hinh'); break;
      case 'reports': navigate('/bao-cao'); break;
      case 'menu-management': navigate('/quan-ly-thuc-don'); break;
      case 'kitchen': navigate('/bep'); break;
      case 'more':
      case 'cart':
      case 'success':
        break;
    }
  };

  // --- Helpers ---
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied':
      case 'in-use':
        return 'bg-green-100 border-green-500 text-green-700';
      case 'reserved': return 'bg-yellow-50 border-yellow-400 text-yellow-700';
      default: return 'bg-white border-gray-200 text-gray-500';
    }
  };

  const filteredMenu = menuItemsList.filter(item =>
    (activeCategory === 'All' || item.categoryId === activeCategory) &&
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (item: MenuItem) => {
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
      setCart(cart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      const catName = menuCategories.find(c => c.id === item.categoryId)?.name || 'Khác';
      setCart([...cart, { ...item, quantity: 1, category: catName }]);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map(i => {
      if (i.id === id) {
        return { ...i, quantity: Math.max(0, i.quantity + delta) };
      }
      return i;
    }).filter(i => i.quantity > 0));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const [isSendingOrder, setIsSendingOrder] = useState(false);

  const handleSendOrder = async () => {
    if (!selectedTable || cart.length === 0) return;

    setIsSendingOrder(true);
    try {
      const items = cart.map(item => ({
        id: Math.random().toString(36).substr(2, 9),
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        category: item.category || 'Khác',
        status: 'pending' as const,
        notes: item.notes ? [item.notes] : undefined
      }));

      await orderService.createOrder(
        selectedTable.name,
        items,
        selectedTable.id,
        (selectedTable as any).bookingId
      );

      handleSetView('success');
      setTimeout(() => {
        setCart([]);
        setSelectedTable(null);
        handleSetView('tables');
      }, 2000);
    } catch (err) {
      console.error('Failed to send order', err);
      alert('Lỗi: Không thể gửi order xuống bếp.');
    } finally {
      setIsSendingOrder(false);
    }
  };

  const renderTables = () => (
    <div className="h-full flex flex-col pb-24 bg-gray-50">
      {/* Zone Selector */}
      <div className="bg-white p-2 shadow-sm flex gap-2 overflow-x-auto no-scrollbar sticky top-0 z-10">
        <button
          onClick={() => setActiveZone('T1')}
          className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm whitespace-nowrap transition-colors ${activeZone === 'T1' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}
        >
          Tầng 1 (Sảnh)
        </button>
        <button
          onClick={() => setActiveZone('T2')}
          className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm whitespace-nowrap transition-colors ${activeZone === 'T2' ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}
        >
          Tầng 2 (VIP)
        </button>
        <button
          onClick={() => setActiveZone('T3')}
          className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm whitespace-nowrap transition-colors ${activeZone === 'T3' ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}
        >
          Tầng 3 (Sự kiện)
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeZone === 'T1' && (
          <div className="grid grid-cols-3 gap-4">
            {tablesL1.map(table => (
              <div
                key={table.id}
                onClick={() => {
                  if (table.status === 'occupied') {
                    setTableActionTarget(table);
                  } else {
                    setSelectedTable(table);
                    handleSetView('menu');
                  }
                }}
                className={`
                  relative p-2 rounded-2xl border-2 shadow-sm flex flex-col items-center justify-center aspect-square active:scale-95 transition-transform
                  ${getStatusColor(table.status)}
                  ${table.type === 'circle' ? 'rounded-full' : 'rounded-2xl'}
                `}
              >
                <span className="text-lg font-bold mb-1">{table.name.replace('Bàn ', '')}</span>
                <div className="flex items-center gap-1 text-[10px] font-medium opacity-80">
                  <Users className="w-3 h-3" /> {table.pax}
                </div>
                {table.status === 'occupied' && (
                  <div className="absolute -top-2 -right-2 bg-white border border-green-200 px-1.5 py-0.5 rounded-full text-[10px] font-bold flex items-center shadow-sm text-green-700 z-10">
                    {table.duration}
                  </div>
                )}
                {table.status === 'reserved' && (
                  <div className="absolute -top-2 -right-2 bg-white border border-yellow-200 px-1.5 py-0.5 rounded-full text-[10px] font-bold flex items-center shadow-sm text-yellow-700 z-10">
                    {table.time}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeZone === 'T2' && (
          <div className="grid grid-cols-2 gap-4">
            {vipRoomsList.map(room => (
              <div
                key={room.id}
                onClick={() => {
                  if (room.status === 'in-use') {
                    setTableActionTarget(room);
                  } else {
                    setSelectedTable(room);
                    handleSetView('menu');
                  }
                }}
                className={`
                  relative p-4 rounded-2xl border-2 shadow-sm flex flex-col justify-between h-32 active:scale-95 transition-transform
                  ${getStatusColor(room.status)}
                `}
              >
                <div>
                  <span className="text-lg font-bold block">{room.name.split('(')[0]}</span>
                  <span className="text-xs opacity-70 block">{room.name.split('(')[1]?.replace(')', '')}</span>
                </div>

                <div className="flex justify-between items-end mt-2">
                  <div className="flex items-center gap-1 text-xs font-medium opacity-80">
                    <Users className="w-3 h-3" /> {room.capacity}
                  </div>
                  {room.status === 'in-use' && (
                    <div className="bg-white/80 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {room.time}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeZone === 'T3' && (
          <div className="grid grid-cols-3 gap-4">
            {tablesL3.map(table => (
              <div
                key={table.id}
                onClick={() => {
                  if (table.status === 'occupied') {
                    setTableActionTarget(table);
                  } else {
                    setSelectedTable(table);
                    handleSetView('menu');
                  }
                }}
                className={`
                  relative p-2 rounded-2xl border-2 shadow-sm flex flex-col items-center justify-center aspect-square active:scale-95 transition-transform
                  ${getStatusColor(table.status)}
                  ${table.type === 'circle' ? 'rounded-full' : 'rounded-2xl'}
                `}
              >
                <div className="text-center">
                  <span className="text-base font-bold block">{table.name.replace('Bàn ', '')}</span>
                  <div className="flex items-center justify-center gap-1 text-[10px] font-medium opacity-80">
                    <Users className="w-3 h-3" /> {table.pax}
                  </div>
                  {table.status === 'occupied' && (
                    <div className="text-[9px] mt-1 font-bold text-green-700 bg-white/50 px-1 rounded">
                      {table.duration}
                    </div>
                  )}
                  {table.status === 'reserved' && (
                    <div className="text-[9px] mt-1 font-bold text-yellow-700 bg-white/50 px-1 rounded">
                      {table.time}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderMenu = () => (
    <div className="flex flex-col h-full pb-24">
      {/* Search & Filter */}
      <div className="p-4 bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="relative mb-3">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm món..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-xl border-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setActiveCategory('All')}
            className={`
              px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors shadow-sm
              ${activeCategory === 'All' ? 'bg-teal-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}
            `}
          >
            Tất cả
          </button>

          {/* Degustation Tabs */}
          <button
            onClick={() => setActiveCategory('set-2-4')}
            className={`
              px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors shadow-sm border
              ${activeCategory === 'set-2-4' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}
            `}
          >
            Dégustation (2-4 Món)
          </button>
          <button
            onClick={() => setActiveCategory('set-4-7')}
            className={`
              px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors shadow-sm border
              ${activeCategory === 'set-4-7' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}
            `}
          >
            Dégustation (4-7 Món)
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1 self-center shrink-0"></div>

          {menuCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`
                px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors shadow-sm border
                ${activeCategory === cat.id ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}
              `}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">

        {activeCategory.startsWith('set-') ? (
          // Render Set Menus (Premium UI)
          setMenusList
            .filter(set => {
              if (activeCategory === 'set-2-4') return set.courses.length <= 4;
              if (activeCategory === 'set-4-7') return set.courses.length > 4;
              return false;
            })
            .map(set => {
              const inCart = cart.find(i => i.id === set.id);
              return (
                <div key={set.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow relative">

                  <div className="p-4 relative z-10">
                    <div className="flex justify-between items-start mb-3 gap-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">{set.name}</h3>
                        <p className="text-gray-500 text-xs font-medium">{set.courses.length} Khóa (Courses)</p>
                      </div>
                      <span className="font-bold text-teal-600 shrink-0">
                        {set.price.toLocaleString()}đ
                      </span>
                    </div>

                    <div className="space-y-3 my-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      {set.courses.map((course, idx) => (
                        <div key={idx} className="border-l-2 border-teal-500/30 pl-3 py-0.5">
                          <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{course.title}</h4>
                          <p className="text-sm text-gray-800 mt-0.5 font-medium leading-snug">
                            {course.options.map(opt => opt.nameVn).join(' / ')}
                          </p>
                        </div>
                      ))}
                    </div>

                    {set.includedDrink && (
                      <div className="text-xs font-medium text-teal-700 bg-teal-50 border border-teal-100 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg mb-4">
                        🍷 {set.includedDrink}
                      </div>
                    )}

                    <div className="pt-3 border-t border-gray-100 flex justify-end">
                      {inCart ? (
                        <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-1 border border-gray-200">
                          <button onClick={() => updateQuantity(set.id, -1)} className="w-10 h-10 flex items-center justify-center bg-white rounded-lg text-red-500 shadow-sm transition-colors hover:bg-gray-50">
                            <Minus className="w-5 h-5" />
                          </button>
                          <span className="font-bold text-gray-800 w-6 text-center text-lg">{inCart.quantity}</span>
                          <button onClick={() => updateQuantity(set.id, 1)} className="w-10 h-10 flex items-center justify-center bg-white rounded-lg text-teal-600 shadow-sm transition-colors hover:bg-gray-50">
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart({ ...set, categoryId: 'Set Menu' } as any)}
                          className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
                        >
                          <ShoppingBag className="w-5 h-5" />
                          Thêm vào Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
        ) : (
          // Render A La Carte Items
          filteredMenu.map(item => {
            const inCart = cart.find(i => i.id === item.id);
            return (
              <div key={item.id} className="flex justify-between items-center p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg shadow-sm shrink-0" />
                  )}
                  <div>
                    <h4 className="font-bold text-gray-800 line-clamp-2">{item.name}</h4>
                    <p className="text-sm text-teal-600 font-medium">{item.price.toLocaleString()}đ</p>
                  </div>
                </div>
                {inCart ? (
                  <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1 shrink-0 ml-2">
                    <button title="Giảm số lượng" onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm text-red-500">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-bold w-4 text-center">{inCart.quantity}</span>
                    <button title="Tăng số lượng" onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm text-teal-600">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    title="Thêm vào giỏ hàng"
                    onClick={() => addToCart(item)}
                    className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center hover:bg-teal-100 shrink-0 ml-2"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  const renderCart = () => (
    <div className="flex flex-col h-full pb-24 p-4">
      {cart.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
          <ShoppingBag className="w-16 h-16 opacity-20 mb-4" />
          <p>Chưa có món nào</p>
          <button onClick={() => handleSetView('menu')} className="mt-4 text-teal-600 font-bold">
            + Thêm món
          </button>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto space-y-3">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div>
                  <h4 className="font-bold text-gray-800">{item.name}</h4>
                  <p className="text-sm text-gray-500">{(item.price * item.quantity).toLocaleString()}đ</p>
                </div>
                <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1">
                  <button title="Giảm số lượng" onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm text-red-500">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-bold w-4 text-center">{item.quantity}</span>
                  <button title="Tăng số lượng" onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm text-teal-600">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-500 font-medium">Tổng cộng</span>
              <span className="text-2xl font-bold text-teal-600">{totalAmount.toLocaleString()}đ</span>
            </div>
            <button
              onClick={handleSendOrder}
              disabled={isSendingOrder}
              className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold shadow-lg shadow-teal-200 active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSendingOrder ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Gửi Bếp
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );

  const renderSuccess = () => (
    <div className="flex flex-col items-center justify-center h-full pb-20 animate-in zoom-in duration-300">
      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
        <CheckCircle className="w-10 h-10" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Đã gửi đơn!</h2>
      <p className="text-gray-500">Đang chuyển về danh sách bàn...</p>
    </div>
  );

  const renderMoreMenu = () => (
    <div className="p-4 grid grid-cols-2 gap-4 pb-24">
      <button
        onClick={() => handleSetView('menu-management')}
        className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm active:scale-95 transition-transform h-40"
      >
        <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-3">
          <Utensils className="w-7 h-7" />
        </div>
        <span className="font-bold text-gray-800">Quản lý thực đơn</span>
      </button>

      <button
        onClick={() => handleSetView('kitchen')}
        className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm active:scale-95 transition-transform h-40"
      >
        <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-3">
          <ChefHat className="w-7 h-7" />
        </div>
        <span className="font-bold text-gray-800">Bếp (KDS)</span>
      </button>

      <button
        onClick={() => handleSetView('training')}
        className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm active:scale-95 transition-transform h-40"
      >
        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
          <BookOpen className="w-7 h-7" />
        </div>
        <span className="font-bold text-gray-800">Đào tạo nội bộ</span>
      </button>

      <button
        onClick={() => handleSetView('crm')}
        className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm active:scale-95 transition-transform h-40"
      >
        <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-3">
          <Users className="w-7 h-7" />
        </div>
        <span className="font-bold text-gray-800">Khách hàng CRM</span>
      </button>

      <button
        onClick={() => handleSetView('settings')}
        className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm active:scale-95 transition-transform h-40"
      >
        <div className="w-14 h-14 bg-gray-50 text-gray-600 rounded-full flex items-center justify-center mb-3">
          <SettingsIcon className="w-7 h-7" />
        </div>
        <span className="font-bold text-gray-800">Cấu hình</span>
      </button>

      <button
        onClick={() => handleSetView('reports')}
        className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm active:scale-95 transition-transform h-40"
      >
        <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mb-3">
          <BarChart3 className="w-7 h-7" />
        </div>
        <span className="font-bold text-gray-800">Báo cáo nhanh</span>
      </button>

      <button
        onClick={() => handleSetView('order-history')}
        className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm active:scale-95 transition-transform h-40"
      >
        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-3">
          <Receipt className="w-7 h-7" />
        </div>
        <span className="font-bold text-gray-800">Lịch sử đơn</span>
      </button>

      <button
        onClick={onLogout}
        className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm active:scale-95 transition-transform h-40 col-span-2"
      >
        <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-3">
          <LogOut className="w-7 h-7" />
        </div>
        <span className="font-bold text-gray-800">Đăng xuất</span>
      </button>
    </div>
  );

  const isFullScreenView = ['training', 'crm', 'settings', 'reports', 'menu-management', 'kitchen'].includes(view);

  return (
    <div className="h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      {!isFullScreenView && view !== 'bookings' && (
        <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center justify-between z-20 shrink-0">
          <div className="flex items-center gap-3">
            {view !== 'tables' && view !== 'success' && view !== 'more' && (
              <button
                onClick={() => {
                  if (view === 'order-history') handleSetView('more');
                  else handleSetView('tables');
                }}
                className="p-1 -ml-2 text-gray-500"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            <div>
              <h1 className="font-bold text-lg text-gray-800">
                {view === 'tables' ? 'Sơ đồ nhà hàng' :
                  view === 'more' ? 'Tiện ích mở rộng' :
                    view === 'order-history' ? 'Lịch sử Hoá đơn' :
                      selectedTable?.name}
              </h1>
              {selectedTable && view !== 'tables' && view !== 'more' && view !== 'order-history' && (
                <p className="text-xs text-gray-500">
                  {selectedTable.pax || selectedTable.capacity} khách • {
                    ['occupied', 'in-use'].includes(selectedTable.status) ? 'Đang phục vụ' :
                      selectedTable.status === 'reserved' ? 'Đã đặt' : 'Mới'
                  }
                </p>
              )}
            </div>
          </div>
          <div className="relative">
            <Bell className="w-6 h-6 text-gray-400" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative">
        {/* Full-screen Kitchen Call Alert */}
        {kitchenAlert?.visible && (
          <div className="absolute inset-0 z-[200] bg-red-600 flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <ChefHat className="w-12 h-12 text-white" />
            </div>

            <h2 className="text-3xl font-black text-white mb-2 text-center drop-shadow-md tracking-wider">
              MÓN ĐÃ XONG!
            </h2>

            <div className="text-xl font-medium text-white/90 text-center mb-4 bg-black/20 px-6 py-3 rounded-2xl w-full">
              Bàn: <span className="font-bold text-2xl text-yellow-300">{kitchenAlert.tables.join(', ')}</span>
            </div>

            {kitchenAlert.readyItems && kitchenAlert.readyItems.length > 0 && (
              <div className="w-full mb-6 bg-white/15 rounded-xl px-5 py-3">
                {kitchenAlert.readyItems.map((item, idx) => (
                  <div key={idx} className="text-lg font-bold text-white py-1 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-yellow-300 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setKitchenAlert(null)}
              className="w-full py-5 bg-white text-red-600 text-xl flex items-center gap-3 justify-center rounded-2xl font-black shadow-[0_8px_30px_rgb(0,0,0,0.2)] active:scale-95 transition-transform"
            >
              <CheckCircle className="w-8 h-8" />
              ĐÃ HIỂU & BƯNG MÓN
            </button>
          </div>
        )}

        {view === 'tables' && renderTables()}
        {view === 'menu' && renderMenu()}
        {view === 'cart' && renderCart()}
        {view === 'success' && renderSuccess()}
        {view === 'bookings' && <BookingKanban />}
        {view === 'more' && (
          <div className="h-full overflow-y-auto pb-6">
            {renderMoreMenu()}
          </div>
        )}
        {view === 'training' && (
          <div className="h-full flex flex-col pb-24">
            <div className="bg-white border-b px-4 py-3 flex items-center gap-2 flex-shrink-0">
              <button title="Đóng" onClick={() => handleSetView('more')}><ChevronLeft /></button>
              <h2 className="font-bold">Đào tạo nội bộ</h2>
            </div>
            <div className="flex-1 min-h-0">
              <TrainingPortal />
            </div>
          </div>
        )}
        {view === 'crm' && (
          <div className="h-full flex flex-col pb-24">
            <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-2">
              <button title="Quay lại" onClick={() => handleSetView('more')}><ChevronLeft /></button>
              <h2 className="font-bold">Quản lý Khách hàng</h2>
            </div>
            <div className="flex-1 min-h-0">
              <CustomerCRM />
            </div>
          </div>
        )}
        {view === 'settings' && (
          <div className="h-full overflow-y-auto pb-24">
            <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-2">
              <button title="Quay lại" onClick={() => handleSetView('more')}><ChevronLeft /></button>
              <h2 className="font-bold">Cấu hình</h2>
            </div>
            <Settings />
          </div>
        )}
        {view === 'reports' && (
          <div className="h-full flex flex-col pb-24">
            <div className="bg-white border-b px-4 py-3 flex items-center gap-2 flex-shrink-0">
              <button title="Quay lại" onClick={() => handleSetView('more')}><ChevronLeft /></button>
              <h2 className="font-bold">Báo cáo</h2>
            </div>
            <div className="flex-1 min-h-0">
              <AdvancedAnalytics />
            </div>
          </div>
        )}
        {view === 'menu-management' && (
          <div className="h-full flex flex-col pb-24">
            <div className="bg-white border-b px-4 py-3 flex items-center gap-2 flex-shrink-0">
              <button title="Quay lại" onClick={() => handleSetView('more')}><ChevronLeft /></button>
              <h2 className="font-bold">Quản lý thực đơn</h2>
            </div>
            <div className="flex-1 min-h-0">
              <MenuManagement />
            </div>
          </div>
        )}
        {view === 'kitchen' && (
          <div className="h-full flex flex-col pb-24">
            <div className="bg-white border-b px-4 py-3 flex items-center gap-2 flex-shrink-0">
              <button title="Quay lại" onClick={() => handleSetView('more')}><ChevronLeft /></button>
              <h2 className="font-bold">Màn hình Bếp</h2>
            </div>
            <div className="flex-1 min-h-0">
              <KitchenDisplay />
            </div>
          </div>
        )}
        {view === 'order-history' && (
          <div className="h-full flex flex-col pb-24">
            <div className="flex-1 min-h-0">
              <OrderHistory />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      {view !== 'success' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-3 flex justify-between items-center z-30 pb-safe">
          <button
            onClick={() => handleSetView('tables')}
            className={`flex flex-col items-center gap-1 w-1/5 ${view === 'tables' ? 'text-teal-600' : 'text-gray-400'}`}
          >
            <LayoutGrid className="w-6 h-6" />
            <span className="text-[10px] font-bold">Bàn</span>
          </button>

          <button
            onClick={() => {
              if (selectedTable) handleSetView('menu');
              else if (view === 'tables') alert('Vui lòng chọn bàn trước!');
              else handleSetView('tables'); // Fallback to tables if not selected
            }}
            className={`flex flex-col items-center gap-1 w-1/5 ${view === 'menu' ? 'text-teal-600' : 'text-gray-400'}`}
          >
            <Utensils className="w-6 h-6" />
            <span className="text-[10px] font-bold">Thực đơn</span>
          </button>

          <button
            onClick={() => handleSetView('bookings')}
            className={`flex flex-col items-center gap-1 w-1/5 ${view === 'bookings' ? 'text-teal-600' : 'text-gray-400'}`}
          >
            <CalendarDays className="w-6 h-6" />
            <span className="text-[10px] font-bold">Lịch đặt</span>
          </button>

          <button
            onClick={() => {
              if (selectedTable) handleSetView('cart');
              else if (view === 'tables') alert('Vui lòng chọn bàn trước!');
              else handleSetView('tables');
            }}
            className={`relative flex flex-col items-center gap-1 w-1/5 ${view === 'cart' ? 'text-teal-600' : 'text-gray-400'}`}
          >
            <div className="relative">
              <ShoppingBag className="w-6 h-6" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold">Đơn hàng</span>
          </button>

          <button
            onClick={() => handleSetView('more')}
            className={`flex flex-col items-center gap-1 w-1/5 ${['more', 'training', 'crm', 'settings', 'reports', 'menu-management', 'kitchen'].includes(view) ? 'text-teal-600' : 'text-gray-400'}`}
          >
            <MoreHorizontal className="w-6 h-6" />
            <span className="text-[10px] font-bold">Thêm</span>
          </button>
        </div>
      )}

      {/* Table Action Modal for Occupied Tables */}
      {tableActionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">{tableActionTarget.name.replace('Bàn ', 'Bàn ')}</h3>
                <p className="text-sm text-gray-500">{tableActionTarget.customerName || 'Khách vãng lai'}</p>
              </div>
              <button title="Đóng" onClick={() => setTableActionTarget(null)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 grid grid-cols-1 gap-3">
              <button
                onClick={() => {
                  setSelectedTable(tableActionTarget);
                  setTableActionTarget(null);
                  handleSetView('menu');
                }}
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700 transition"
              >
                <Utensils className="w-5 h-5" />
                Gọi thêm món
              </button>
              <button
                onClick={() => {
                  setTableCheckoutId(tableActionTarget.id);
                  setTableActionTarget(null);
                }}
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-teal-600 text-white rounded-xl font-bold shadow-md hover:bg-teal-700 transition"
              >
                <Receipt className="w-5 h-5" />
                Thanh toán
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {tableCheckoutId && (
        <CheckoutModal
          table={
            tablesL1.find(t => t.id === tableCheckoutId) ||
            vipRoomsList.find(v => v.id === tableCheckoutId) as any ||
            tablesL3.find(t => t.id === tableCheckoutId)
          }
          onClose={() => setTableCheckoutId(null)}
          onSuccess={() => {
            setTableCheckoutId(null);
            fetchTables();
            handleSetView('tables');
          }}
        />
      )}

    </div>
  );
}
