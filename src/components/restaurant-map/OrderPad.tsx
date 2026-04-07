import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Search, ShoppingBag, Send, SplitSquareHorizontal, CheckCircle, ArrowRightLeft, Users, ChevronRight } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { menuService } from '../../services/menuService';
import { tableService } from '../../services/tableService';

interface OrderPadProps {
  table: any;
  onClose: () => void;
}

export default function OrderPad({ table, onClose }: OrderPadProps) {
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSplitMergeOpen, setIsSplitMergeOpen] = useState(false);
  const [isOrderSent, setIsOrderSent] = useState(false);
  const [mergeTarget, setMergeTarget] = useState('');
  
  const [existingOrder, setExistingOrder] = useState<any>(null);
  const [isSplitting, setIsSplitting] = useState(false);
  const [splitSelections, setSplitSelections] = useState<Record<string, number>>({});
  const [splitTargetTableName, setSplitTargetTableName] = useState('');

  const [activeTab, setActiveTab] = useState<'alacarte' | 'set'>('alacarte');
  const [selectedSet, setSelectedSet] = useState<any>(null);
  const [setSelections, setSetSelections] = useState<Record<string, any>>({});

  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [setMenus, setSetMenus] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [fetchedCategories, fetchedItems, fetchedSets, fetchedTables] = await Promise.all([
          menuService.getCategories(),
          menuService.getMenuItems(),
          menuService.getSetMenus(),
          tableService.getTables()
        ]);
        if (mounted) {
          setCategories(fetchedCategories);
          setMenuItems(fetchedItems.filter(i => i.inStock));
          setSetMenus(fetchedSets.filter(s => s.status === 'available'));
          setTables(fetchedTables);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (isSplitMergeOpen && table?.id) {
      orderService.getOrdersByTableId(table.id).then(orders => {
        if (orders.length > 0) setExistingOrder(orders[0]);
      });
    }
  }, [isSplitMergeOpen, table]);

  const handleMerge = async () => {
    if (!existingOrder || !mergeTarget) return;
    try {
      const targetTable = tables.find(t => t.id === mergeTarget);
      if (!targetTable) return;
      const targetOrders = await orderService.getOrdersByTableId(targetTable.id);
      let targetOrderId = targetOrders.length > 0 ? targetOrders[0].id : null;
      if (!targetOrderId) {
        const newOrder = await orderService.createOrder(targetTable.name, [], targetTable.id);
        targetOrderId = newOrder.id;
      }
      await orderService.mergeOrders(existingOrder.id, targetOrderId);
      alert('Đã gộp bàn thành công!');
      onClose();
    } catch (e) {
      alert('Lỗi gộp bàn!');
    }
  };

  const handleSplit = async () => {
    if (!existingOrder) return;
    const itemsToMove = Object.keys(splitSelections).map(itemId => {
       const qty = splitSelections[itemId];
       const item = existingOrder.items.find((i:any) => i.id === itemId);
       return qty > 0 && item ? { id: item.id, quantity: qty, price: item.price, category: item.category, name: item.name } : null;
    }).filter(Boolean) as any[];
    
    if (itemsToMove.length === 0) return alert('Chưa chọn món nào để tách!');
    try {
       await orderService.splitOrder(existingOrder.id, itemsToMove, splitTargetTableName || table.name, undefined);
       alert('Đã tách sang hóa đơn mới!');
       onClose();
    } catch (e) {
       alert('Lỗi tách đơn');
    }
  };

  const handleOpenSetMenu = (setMenu: any) => {
    setSelectedSet(setMenu);
    const initialSelections: Record<string, any> = {};
    if (setMenu.courses) {
      setMenu.courses.forEach((course: any, index: number) => {
        if (course.options && course.options.length > 0) {
          initialSelections[`course_${index}`] = course.options[0];
        }
      });
    }
    setSetSelections(initialSelections);
  };

  const handleSelectSetOption = (courseIndex: number, option: any) => {
    setSetSelections(prev => ({
      ...prev,
      [`course_${courseIndex}`]: option
    }));
  };

  const addSetMenuToOrder = () => {
    if (!selectedSet) return;
    const uid = `SM_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const compositeItem = {
      id: uid,
      name: selectedSet.name,
      price: selectedSet.price,
      isSetMenu: true,
      selections: selectedSet.courses ? selectedSet.courses.map((course: any, idx: number) => ({
        courseTitle: course.title,
        option: setSelections[`course_${idx}`]
      })) : []
    };

    setOrderItems([...orderItems, { ...compositeItem, quantity: 1 }]);
    setSelectedSet(null);
  };

  const filteredMenu = menuItems
    .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .map(item => ({
      ...item,
      category: categories.find(c => c.id === item.categoryId)?.name || 'Khác'
    }));

  const addItem = (item: any) => {
    const existing = orderItems.find(i => i.id === item.id);
    if (existing) {
      setOrderItems(orderItems.map(i =>
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setOrderItems([...orderItems, { ...item, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setOrderItems(orderItems.map(i => {
      if (i.id === id) {
        const newQ = i.quantity + delta;
        return newQ > 0 ? { ...i, quantity: newQ } : i;
      }
      return i;
    }).filter(i => i.quantity > 0));
  };

  const handleSendOrder = async () => {
    if (orderItems.length === 0) return;
    setIsOrderSent(true);

    try {
      const itemsToCreate = orderItems.flatMap(item => {
        let finalCategory = item.category || 'Món chính';
        if (finalCategory === 'Rượu vang' || finalCategory.toLowerCase().includes('uống') || finalCategory.toLowerCase().includes('nước')) {
          finalCategory = 'Đồ uống';
        } else if (!['Khai vị', 'Món chính', 'Tráng miệng', 'Đồ uống', 'Combo'].includes(finalCategory)) {
          finalCategory = 'Món chính'; // Fallback to avoid constraint error
        }

        if (item.isSetMenu && item.selections) {
          // 1. The parent Combo item for billing
          const comboItem = {
            name: item.name,
            quantity: item.quantity,
            price: item.price || 0,
            notes: [],
            category: 'Combo'
          };

          // 2. The individual course items for the kitchen
          const courseItems = item.selections.map((sel: any) => {
            const titleLower = sel.courseTitle.toLowerCase();
            let courseCat = 'Món chính';
            if (titleLower.includes('starter') || titleLower.includes('soup') || titleLower.includes('appetizer') || titleLower.includes('khai vị') || titleLower.includes('salad') || titleLower.includes('súp')) {
              courseCat = 'Khai vị';
            } else if (titleLower.includes('dessert') || titleLower.includes('tráng miệng')) {
              courseCat = 'Tráng miệng';
            }

            const courseName = sel.option?.nameVn || sel.option?.nameEn || sel.courseTitle.split('|')[0].trim();

            return {
              name: courseName,
              quantity: item.quantity,
              price: 0, // 0 price because the set is billed on the Combo parent
              notes: [`Thuộc ${item.name}`],
              category: courseCat
            };
          });

          return [comboItem, ...courseItems];
        }

        return [{
          name: item.name,
          quantity: item.quantity,
          price: item.price || 0,
          notes: [...(item.notes || [])],
          category: finalCategory
        }];
      });

      await orderService.createOrder(
        table.name,
        itemsToCreate,
        table.id
      );

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Lỗi khi gửi đơn:', error);
      alert('Không thể gửi đơn xuống bếp. Vui lòng thử lại!');
      setIsOrderSent(false); // Reset to try again
    }
  };

  const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (isOrderSent) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Đã gửi đơn thành công!</h3>
          <p className="text-gray-500">Đơn hàng đã được chuyển xuống bếp.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex md:items-center justify-center bg-black/50 backdrop-blur-sm md:p-4">
      <div className="bg-white w-full h-full md:h-[85vh] md:max-w-5xl md:rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in slide-in-from-bottom-full md:slide-in-from-bottom-0 md:zoom-in-95 duration-300 relative">

        {/* Split/Merge Modal Overlay */}
        {isSplitMergeOpen && (
          <div className="absolute inset-0 z-10 bg-white/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-200 overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                  <SplitSquareHorizontal className="w-5 h-5 text-teal-600" />
                  Tách / Gộp Bàn
                </h3>
                <button onClick={() => setIsSplitMergeOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Merge Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gộp bàn hiện tại vào:</label>
                  <div className="flex gap-2">
                    <select
                      value={mergeTarget}
                      onChange={(e) => setMergeTarget(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value="">-- Chọn bàn --</option>
                      {tables.filter(t => t.name !== table.name).map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                    <button
                      disabled={!mergeTarget || !existingOrder}
                      onClick={handleMerge}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowRightLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Hoặc</span>
                  </div>
                </div>

                {/* Split Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tách hóa đơn:</label>
                  <button onClick={() => setIsSplitting(true)} className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-medium hover:border-teal-500 hover:text-teal-600 transition-colors flex items-center justify-center gap-2">
                    <Users className="w-4 h-4" />
                    Chọn món để tách sang đơn mới
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Split Details Modal Overlay */}
        {isSplitting && (
          <div className="absolute inset-0 z-20 bg-white/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">Tách hóa đơn</h3>
                <button onClick={() => setIsSplitting(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto space-y-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách / Bàn tách mới:</label>
                   <input type="text" value={splitTargetTableName} onChange={e => setSplitTargetTableName(e.target.value)} placeholder="VD: Anh Hải bàn 1" className="w-full px-3 py-2 border rounded text-sm"/>
                 </div>
                 <div className="space-y-2 mt-4">
                    {!existingOrder?.items?.length && <p className="text-sm text-gray-500">Chưa có món nào đã order để tách.</p>}
                    {existingOrder?.items?.map((item: any) => (
                       <div key={item.id} className="flex justify-between items-center border p-2 rounded">
                          <div className="text-sm font-medium">{item.name} (Tối đa: {item.quantity})</div>
                          <div className="flex items-center gap-2">
                             <button onClick={() => setSplitSelections(p => ({...p, [item.id]: Math.max(0, (p[item.id] || 0) - 1)}))} className="px-2 py-0.5 bg-gray-100 rounded">-</button>
                             <span className="w-4 text-center font-bold">{splitSelections[item.id] || 0}</span>
                             <button onClick={() => setSplitSelections(p => ({...p, [item.id]: Math.min(item.quantity, (p[item.id] || 0) + 1)}))} className="px-2 py-0.5 bg-gray-100 rounded">+</button>
                          </div>
                       </div>
                    ))}
                 </div>
                 <button onClick={handleSplit} className="w-full py-3 mt-4 bg-teal-600 text-white font-bold rounded hover:bg-teal-700">Xác nhận tách Hóa đơn</button>
              </div>
            </div>
          </div>
        )}

        {/* Set Menu Selection Modal */}
        {selectedSet && (
          <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl max-h-full rounded-2xl shadow-2xl border border-gray-200 flex flex-col animate-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl shrink-0">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">Tùy chọn: {selectedSet.name}</h3>
                  <p className="text-sm text-teal-600 font-medium">{selectedSet.price.toLocaleString('vi-VN')}đ</p>
                </div>
                <button onClick={() => setSelectedSet(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto flex-1 space-y-6">
                {selectedSet.courses?.map((course: any, idx: number) => (
                  <div key={idx} className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                    <h4 className="font-bold text-gray-700 mb-3 text-sm flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-xs">{idx + 1}</span>
                      {course.title}
                    </h4>
                    <div className="space-y-2">
                      {course.options.map((opt: any) => {
                        const courseKey = `course_${idx}`;
                        const isSelected = setSelections[courseKey]?.id === opt.id;
                        return (
                          <label key={opt.id} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${isSelected ? 'border-teal-500 bg-teal-50 border-2' : 'border-gray-200 bg-white hover:border-teal-300'}`}>
                            <input
                              type="radio"
                              name={courseKey}
                              className="mt-1 w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                              checked={isSelected}
                              onChange={() => handleSelectSetOption(idx, opt)}
                            />
                            <div>
                              <div className="font-medium text-gray-800 text-sm">{opt.nameVn || opt.nameEn}</div>
                              {(opt.descriptionVn || opt.descriptionEn) && (
                                <div className="text-xs text-gray-500 mt-1 leading-relaxed">
                                  {(opt.descriptionVn || opt.descriptionEn).replace(/<[^>]*>?/gm, '')}
                                </div>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-gray-100 bg-white shrink-0 rounded-b-2xl">
                <button
                  onClick={addSetMenuToOrder}
                  className="w-full py-3.5 bg-teal-600 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 hover:bg-teal-700 active:scale-[0.98] transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Thêm vào Hóa Đơn ({selectedSet.price.toLocaleString('vi-VN')}đ)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Left Side: Menu Selection */}
        <div className="flex-1 flex flex-col bg-gray-50 border-r border-gray-200">
          <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">Thực đơn</h2>
            <button onClick={onClose} className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-full">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm món ăn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-transparent rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-white shrink-0">
            <button
              className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'alacarte' ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('alacarte')}
            >
              Gọi Món Lẻ
            </button>
            <button
              className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'set' ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('set')}
            >
              Set Menu
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'alacarte' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {filteredMenu.map(item => (
                  <button
                    key={item.id}
                    onClick={() => addItem(item)}
                    className="flex flex-col text-left p-3 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-teal-500 hover:shadow-md transition-all active:scale-95"
                  >
                    <span className="text-xs font-medium text-teal-600 mb-1">{item.category}</span>
                    <span className="font-bold text-gray-800 mb-2 line-clamp-2">{item.name}</span>
                    <span className="text-sm font-semibold text-gray-500 mt-auto">
                      {item.price.toLocaleString('vi-VN')}đ
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {setMenus
                  .filter(set => set.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(set => (
                    <button
                      key={set.id}
                      onClick={() => handleOpenSetMenu(set)}
                      className="w-full text-left p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-teal-500 hover:shadow-md transition-all flex items-center justify-between group active:scale-[0.99]"
                    >
                      <div className="flex flex-col gap-1 pr-4 border-r border-gray-100 flex-1">
                        <span className="font-bold text-lg text-gray-800 group-hover:text-teal-700 transition-colors">{set.name}</span>
                        {set.courses && (
                          <div className="text-sm text-gray-500 line-clamp-2 mt-1 pr-2">
                            Gồm {set.courses.length} món: {set.courses.map(c => c.title.split('|')[0].trim()).join(', ')}
                          </div>
                        )}
                      </div>
                      <div className="pl-4 flex flex-col items-end shrink-0 gap-2">
                        <span className="text-lg font-bold text-teal-600">{set.price.toLocaleString('vi-VN')}đ</span>
                        <div className="flex items-center text-xs font-medium text-gray-400 group-hover:text-teal-600 transition-colors">
                          Tùy chọn <ChevronRight className="w-4 h-4 ml-1" />
                        </div>
                      </div>
                    </button>
                  ))}
                {setMenus.filter(set => set.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                  <div className="text-center p-8 text-gray-400">Không tìm thấy Set Menu phù hợp.</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Order Ticket */}
        <div className="w-full md:w-96 flex flex-col bg-white h-[50vh] md:h-auto border-t md:border-t-0 border-gray-200">
          <div className="p-4 border-b border-gray-200 bg-gray-900 text-white flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                Order: {table.name}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Khách: {table.customerName || 'Khách lẻ'}</p>
            </div>
            <button onClick={onClose} className="hidden md:block p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {orderItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3">
                <ShoppingBag className="w-12 h-12 opacity-20" />
                <p className="text-sm font-medium">Chưa có món nào được chọn</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orderItems.map(item => (
                  <div key={item.id} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-800 truncate">{item.name}</div>
                      {item.isSetMenu && item.selections && (
                        <div className="mt-1.5 mb-2 pl-2.5 py-0.5 border-l-2 border-teal-200 space-y-1">
                          {item.selections.map((sel: any, sIdx: number) => (
                            <div key={sIdx} className="text-xs text-gray-500 flex items-start leading-tight">
                              <span className="font-semibold text-gray-600 mr-1.5 shrink-0 whitespace-nowrap">{sel.courseTitle.split('|')[0].trim()}:</span>
                              <span className="line-clamp-2">{sel.option?.nameVn || sel.option?.nameEn}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="text-sm text-gray-500 font-medium">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</div>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-red-600"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-bold w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-teal-600"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-500 font-medium">Tổng cộng</span>
              <span className="text-2xl font-bold text-teal-600">{total.toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setIsSplitMergeOpen(true)}
                className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <SplitSquareHorizontal className="w-5 h-5" />
                Tách/Gộp
              </button>
              <button
                onClick={handleSendOrder}
                disabled={orderItems.length === 0}
                className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <Send className="w-5 h-5" />
                Gửi Bếp
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
