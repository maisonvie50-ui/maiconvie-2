import React, { useState } from 'react';
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  Edit,
  Trash2,
  Tag,
  GripVertical,
  X,
  Save,
  Image as ImageIcon,
  UtensilsCrossed,
  Minus,
  PackageOpen
} from 'lucide-react';
import { mockSetMenus } from '../../data/mockMenu';
import type { SetMenu } from '../../types';

interface Category {
  id: string;
  name: string;
  count: number;
}

interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  inStock: boolean;
  tags: string[];
  variants?: string[];
}

const mockCategories: Category[] = [
  { id: 'c1', name: 'Khai vị', count: 8 },
  { id: 'c2', name: 'Món chính', count: 24 },
  { id: 'c3', name: 'Tráng miệng', count: 12 },
  { id: 'c4', name: 'Đồ uống', count: 18 },
  { id: 'c5', name: 'Rượu vang', count: 35 },
];

const mockItems: MenuItem[] = [
  {
    id: 'm1',
    categoryId: 'c2',
    name: 'Bò Wagyu A5 áp chảo',
    description: 'Thăn bò Wagyu thượng hạng mềm tan trong miệng, quyện cùng sốt tiêu đen nồng nàn và măng tây nướng.',
    price: 1250000,
    image: 'https://picsum.photos/seed/wagyu/400/300',
    inStock: true,
    tags: ["Chef's Choice", 'Best Seller'],
    variants: ['Rare', 'Medium Rare', 'Well Done']
  },
  {
    id: 'm2',
    categoryId: 'c2',
    name: 'Cá hồi Na Uy sốt chanh dây',
    description: 'Cá hồi tươi nướng da giòn, dùng kèm sốt chanh dây chua ngọt và khoai tây nghiền.',
    price: 450000,
    image: 'https://picsum.photos/seed/salmon/400/300',
    inStock: false,
    tags: ['New'],
    variants: ['Sốt chanh dây', 'Sốt bơ tỏi']
  },
  {
    id: 'm3',
    categoryId: 'c1',
    name: 'Súp bí đỏ nấm truffle',
    description: 'Súp bí đỏ kem tươi mịn màng, điểm xuyết hương nấm truffle đặc trưng.',
    price: 180000,
    image: 'https://picsum.photos/seed/soup/400/300',
    inStock: true,
    tags: ['Vegetarian'],
  },
  {
    id: 'm4',
    categoryId: 'c5',
    name: 'Château Margaux 2015',
    description: 'Vang đỏ Pháp thượng hạng với hương thơm phức hợp của trái cây đen, gỗ sồi và vanilla.',
    price: 8500000,
    image: 'https://picsum.photos/seed/wine/400/300',
    inStock: true,
    tags: ['Premium'],
    variants: ['Ly (150ml)', 'Chai (750ml)']
  },
  {
    id: 'm5',
    categoryId: 'c2',
    name: 'Mỳ Ý Hải Sản (Seafood Pasta)',
    description: 'Mỳ Ý sợi dẹt xào cùng tôm sú, mực ống, vẹm xanh và sốt cà chua cay nhẹ.',
    price: 320000,
    image: 'https://picsum.photos/seed/pasta/400/300',
    inStock: true,
    tags: ['Spicy', 'Best Seller'],
  }
];

export default function MenuManagement() {
  const [menuType, setMenuType] = useState<'alacarte' | 'set'>('alacarte');
  const [activeCategory, setActiveCategory] = useState<string>('c2');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [items, setItems] = useState<MenuItem[]>(mockItems);
  const [setMenus, setSetMenus] = useState<SetMenu[]>(mockSetMenus);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    name: '',
    price: 0,
    description: '',
    categoryId: 'c2',
    tags: [],
    inStock: true,
    image: ''
  });

  // Set Menu Modal State
  const [isSetMenuModalOpen, setIsSetMenuModalOpen] = useState(false);
  const [editingSetMenuId, setEditingSetMenuId] = useState<string | null>(null);
  const [newSetMenu, setNewSetMenu] = useState<Partial<SetMenu>>({
    name: '',
    price: 0,
    status: 'available',
    courses: [],
    includedDrink: ''
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const toggleStock = (id: string) => {
    setItems(items.map(item => item.id === id ? { ...item, inStock: !item.inStock } : item));
  };



  const handleSaveItem = () => {
    if (!newItem.name || !newItem.price) return;

    if (editingId) {
      // Update existing item
      setItems(items.map(item => item.id === editingId ? {
        ...item,
        categoryId: newItem.categoryId || item.categoryId,
        name: newItem.name!,
        description: newItem.description || '',
        price: newItem.price!,
        image: newItem.image || item.image,
        tags: newItem.tags || item.tags,
        variants: newItem.variants || item.variants
      } : item));
    } else {
      // Add new item
      const item: MenuItem = {
        id: `m${Date.now()}`,
        categoryId: newItem.categoryId || activeCategory,
        name: newItem.name!,
        description: newItem.description || '',
        price: newItem.price!,
        image: newItem.image || `https://picsum.photos/seed/${Date.now()}/400/300`,
        inStock: true,
        tags: newItem.tags || [],
        variants: newItem.variants || []
      };
      setItems([item, ...items]);
    }

    setIsModalOpen(false);
    setEditingId(null);
    setNewItem({
      name: '',
      price: 0,
      description: '',
      categoryId: activeCategory,
      tags: [],
      inStock: true,
      image: ''
    });
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingId(item.id);
    setNewItem({
      name: item.name,
      price: item.price,
      description: item.description,
      categoryId: item.categoryId,
      tags: item.tags,
      inStock: item.inStock,
      image: item.image,
      variants: item.variants
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setNewItem({
      name: '',
      price: 0,
      description: '',
      categoryId: activeCategory,
      tags: [],
      inStock: true,
      image: ''
    });
  };

  // Set Menu Handlers
  const handleEditSetMenu = (setMenu: SetMenu) => {
    setEditingSetMenuId(setMenu.id);
    setNewSetMenu({
      name: setMenu.name,
      price: setMenu.price,
      status: setMenu.status,
      courses: [...setMenu.courses],
      includedDrink: setMenu.includedDrink || ''
    });
    setIsSetMenuModalOpen(true);
  };

  const handleCloseSetMenuModal = () => {
    setIsSetMenuModalOpen(false);
    setEditingSetMenuId(null);
    setNewSetMenu({ name: '', price: 0, status: 'available', courses: [], includedDrink: '' });
  };

  const handleSaveSetMenu = () => {
    if (!newSetMenu.name || !newSetMenu.price) return;

    if (editingSetMenuId) {
      setSetMenus(setMenus.map(set => set.id === editingSetMenuId ? {
        ...set,
        name: newSetMenu.name!,
        price: newSetMenu.price!,
        status: newSetMenu.status as any,
        courses: newSetMenu.courses || [],
        includedDrink: newSetMenu.includedDrink
      } : set));
    } else {
      setSetMenus([{
        id: `set${Date.now()}`,
        name: newSetMenu.name!,
        price: newSetMenu.price!,
        status: newSetMenu.status as any || 'available',
        courses: newSetMenu.courses || [],
        includedDrink: newSetMenu.includedDrink
      }, ...setMenus]);
    }
    handleCloseSetMenuModal();
  };

  const handleDeleteSetMenu = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa Set Menu này?')) {
      setSetMenus(setMenus.filter(set => set.id !== id));
    }
  };

  const handleAddCourse = () => {
    setNewSetMenu(prev => ({
      ...prev,
      courses: [...(prev.courses || []), { title: '', options: [] }]
    }));
  };

  const handleUpdateCourseTitle = (courseIndex: number, title: string) => {
    const updatedCourses = [...(newSetMenu.courses || [])];
    updatedCourses[courseIndex].title = title;
    setNewSetMenu({ ...newSetMenu, courses: updatedCourses });
  };

  const handleDeleteCourse = (courseIndex: number) => {
    const updatedCourses = (newSetMenu.courses || []).filter((_, i) => i !== courseIndex);
    setNewSetMenu({ ...newSetMenu, courses: updatedCourses });
  };

  const handleAddOptionToCourse = (courseIndex: number) => {
    const updatedCourses = [...(newSetMenu.courses || [])];
    updatedCourses[courseIndex].options.push({
      id: `opt${Date.now()}`,
      nameVn: '',
      nameEn: '',
      descriptionEn: ''
    });
    setNewSetMenu({ ...newSetMenu, courses: updatedCourses });
  };

  const handleUpdateOption = (courseIndex: number, optionIndex: number, field: keyof typeof newSetMenu.courses[0]['options'][0], value: string) => {
    const updatedCourses = [...(newSetMenu.courses || [])];
    updatedCourses[courseIndex].options[optionIndex] = {
      ...updatedCourses[courseIndex].options[optionIndex],
      [field]: value
    };
    setNewSetMenu({ ...newSetMenu, courses: updatedCourses });
  };

  const handleDeleteOption = (courseIndex: number, optionIndex: number) => {
    const updatedCourses = [...(newSetMenu.courses || [])];
    updatedCourses[courseIndex].options = updatedCourses[courseIndex].options.filter((_, i) => i !== optionIndex);
    setNewSetMenu({ ...newSetMenu, courses: updatedCourses });
  };

  const filteredItems = items.filter(item => item.categoryId === activeCategory);

  const getTagColor = (tag: string) => {
    switch (tag) {
      case "Chef's Choice": return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Best Seller': return 'bg-red-100 text-red-700 border-red-200';
      case 'New': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Vegetarian': return 'bg-green-100 text-green-700 border-green-200';
      case 'Spicy': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 relative">

      {/* Top Menu Type Bar */}
      <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center justify-between z-10 flex-shrink-0">
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setMenuType('alacarte')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${menuType === 'alacarte' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Món Lẻ (A La Carte)
          </button>
          <button
            onClick={() => setMenuType('set')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${menuType === 'set' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            Thực đơn theo Set
          </button>
        </div>
      </div>

      {menuType === 'alacarte' ? (
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Left Sidebar: Categories (Desktop) */}
          <div className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col flex-shrink-0">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">Danh mục món</h3>
              <button className="p-1 hover:bg-gray-100 rounded text-gray-500 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {mockCategories.map(cat => {
                const count = items.filter(i => i.categoryId === cat.id).length;
                return (
                  <div
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors group ${activeCategory === cat.id ? 'bg-teal-50 text-teal-700' : 'hover:bg-gray-50 text-gray-700'} ${count === 0 ? 'opacity-50 grayscale' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 cursor-grab" />
                      <span className="font-medium text-sm">{cat.name}</span>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${activeCategory === cat.id ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                      {count}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Main Content: Items */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Toolbar */}
            <div className="px-4 md:px-6 py-4 bg-white border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 flex-shrink-0">
              <div className="flex flex-col md:flex-row md:items-center gap-4 w-full md:w-auto">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-800">
                    {mockCategories.find(c => c.id === activeCategory)?.name}
                  </h2>
                  {/* Mobile Add Button (visible only on mobile next to title) */}
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="md:hidden flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm
                  </button>
                </div>

                <div className="hidden md:block h-6 w-px bg-gray-200"></div>

                <div className="relative w-full md:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm món ăn..."
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Mobile Categories (Horizontal Scroll) */}
              <div className="md:hidden flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {mockCategories.map(cat => {
                  const count = items.filter(i => i.categoryId === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`
                  px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border
                  ${activeCategory === cat.id ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-200'}
                  ${count === 0 ? 'opacity-60' : ''}
                `}
                    >
                      {cat.name} {count === 0 && '(0)'}
                    </button>
                  )
                })}
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4">
                {/* View Toggle */}
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="hidden md:flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Thêm món mới
                </button>
              </div>
            </div>

            {/* Items Grid/List */}
            <div className="flex-1 overflow-y-auto p-6">
              {filteredItems.length === 0 ? (
                <div className="w-full h-full min-h-[50vh] flex flex-col items-center justify-center text-gray-400">
                  <PackageOpen className="w-16 h-16 mb-4 text-gray-300" />
                  <p className="text-xl font-bold text-gray-500 mb-2">Chưa có món nào</p>
                  <p className="text-sm">Danh mục này hiện đang trống.</p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="mt-6 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95"
                  >
                    <Plus className="w-5 h-5" />
                    Thêm món đầu tiên
                  </button>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredItems.map(item => (
                    <div key={item.id} className={`bg-white rounded-xl border overflow-hidden shadow-sm transition-all hover:shadow-md flex flex-col ${!item.inStock ? 'opacity-75 grayscale-[0.5]' : 'border-gray-200'}`}>
                      {/* Image */}
                      <div className="relative h-48 bg-gray-100">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />

                        {/* Tags as ribbons */}
                        <div className="absolute top-2 left-2 right-2 flex flex-wrap gap-1">
                          {item.tags.map(tag => (
                            <span key={tag} className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wide rounded border shadow-sm backdrop-blur-md bg-white/90 ${getTagColor(tag)}`}>
                              {tag}
                            </span>
                          ))}
                        </div>

                        {!item.inStock && (
                          <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] flex items-center justify-center">
                            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">HẾT HÀNG</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2 gap-2">
                          <h3
                            className="font-bold text-gray-900 leading-tight line-clamp-2 hover:line-clamp-none transition-all cursor-help"
                            title={item.name}
                          >
                            {item.name}
                          </h3>
                          <span className="font-bold text-teal-600 whitespace-nowrap">{formatPrice(item.price)}</span>
                        </div>

                        <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">
                          {item.description}
                        </p>

                        {item.variants && (
                          <div className="mb-4 flex flex-wrap gap-1">
                            {item.variants.map(v => (
                              <span key={v} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded border border-gray-200">
                                {v}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Actions & Toggles */}
                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-600">Còn hàng</span>
                            <div
                              onClick={() => toggleStock(item.id)}
                              className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer transition-colors ${item.inStock ? 'bg-teal-500' : 'bg-gray-300'}`}
                            >
                              <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-sm transform duration-300 ease-in-out ${item.inStock ? 'translate-x-4.5' : ''}`} />
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEditItem(item)}
                              className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Sửa"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                        <th className="px-6 py-4">Món ăn</th>
                        <th className="px-6 py-4">Giá bán</th>
                        <th className="px-6 py-4">Tùy chọn (Variants)</th>
                        <th className="px-6 py-4">Trạng thái</th>
                        <th className="px-6 py-4 text-right">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredItems.map(item => (
                        <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${!item.inStock ? 'bg-gray-50/50' : ''}`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover border border-gray-200" referrerPolicy="no-referrer" />
                              <div>
                                <div className="font-medium text-gray-900">{item.name}</div>
                                <div className="flex gap-1 mt-1">
                                  {item.tags.map(tag => (
                                    <span key={tag} className={`px-1.5 py-0.5 text-[9px] font-bold uppercase rounded border ${getTagColor(tag)}`}>
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-medium text-teal-600">{formatPrice(item.price)}</td>
                          <td className="px-6 py-4">
                            {item.variants ? (
                              <div className="flex flex-wrap gap-1">
                                {item.variants.map(v => (
                                  <span key={v} className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] rounded border border-gray-200">
                                    {v}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div
                              onClick={() => toggleStock(item.id)}
                              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${item.inStock ? 'bg-teal-500' : 'bg-gray-300'}`}
                            >
                              <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform duration-300 ease-in-out ${item.inStock ? 'translate-x-5' : ''}`} />
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditItem(item)}
                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Sửa"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Xóa">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 w-full p-6 overflow-y-auto custom-scrollbar bg-gray-50/50 relative">
          <div className="max-w-7xl mx-auto space-y-6 pb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Quản lý Set Menu</h2>
                <p className="text-sm text-gray-500 mt-1">Các gói thực đơn theo khách lẻ và khách đoàn</p>
              </div>
              <button
                onClick={() => setIsSetMenuModalOpen(true)}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" /> Thêm Set Mới
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
              {setMenus.map(set => (
                <div key={set.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-xs font-bold text-teal-600 mb-1 tracking-wider uppercase">{set.name}</div>
                      <h3 className="text-2xl font-bold text-gray-900">{formatPrice(set.price)}<span className="text-sm font-normal text-gray-500">/pax</span></h3>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${set.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {set.status === 'available' ? 'Đang bán' : 'Ngưng bán'}
                    </span>
                  </div>

                  <div className="flex-1 space-y-4 mb-4 pb-4 border-b border-gray-100 pr-2">
                    {set.courses.map((course, idx) => (
                      <div key={idx}>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 bg-gray-50 py-1 px-2 rounded inline-block">{course.title}</h4>
                        <ul className="space-y-3">
                          {course.options.map(opt => (
                            <li key={opt.id} className="text-sm text-gray-800 pl-4 relative before:content-[''] before:w-1.5 before:h-1.5 before:bg-teal-500 before:rounded-full before:absolute before:left-0 before:top-1.5">
                              <span className="font-semibold block">{opt.nameVn}</span>
                              <span className="text-xs text-gray-500 block italic">{opt.nameEn}</span>
                              {opt.descriptionEn && <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">{opt.descriptionEn}</p>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {set.includedDrink && (
                    <div className="mt-auto mb-4 bg-orange-50 p-3 rounded-lg border border-orange-100">
                      <p className="text-xs text-orange-800 font-medium flex items-start gap-2">
                        <span>⭐</span>
                        <span>Đi kèm: <br /><span className="font-normal italic text-[11px] opacity-80">{set.includedDrink}</span></span>
                      </p>
                    </div>
                  )}

                  <div className="mt-auto pt-4 border-t border-gray-100 flex gap-2">
                    <button
                      onClick={() => handleEditSetMenu(set)}
                      className="flex-1 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" /> Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteSetMenu(set.id)}
                      className="flex-1 py-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div >
        </div >
      )
      }

      {/* Add Item Modal */}
      {
        isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-800">
                  {editingId ? 'Cập nhật món ăn' : 'Thêm món mới'}
                </h3>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên món ăn</label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="VD: Bò bít tết sốt tiêu đen"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                    <select
                      value={newItem.categoryId}
                      onChange={(e) => setNewItem({ ...newItem, categoryId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    >
                      {mockCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán (VNĐ)</label>
                    <input
                      type="number"
                      value={newItem.price}
                      onChange={(e) => setNewItem({ ...newItem, price: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả món ăn</label>
                  <textarea
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    rows={3}
                    placeholder="Mô tả chi tiết về nguyên liệu, hương vị..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh (URL)</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <ImageIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={newItem.image}
                        onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Để trống sẽ sử dụng ảnh ngẫu nhiên.</p>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveItem}
                  className="px-4 py-2 bg-teal-600 text-white hover:bg-teal-700 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingId ? 'Lưu thay đổi' : 'Lưu món mới'}
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Add/Edit Set Menu Modal */}
      {
        isSetMenuModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                  <UtensilsCrossed className="w-5 h-5 text-teal-600" />
                  {editingSetMenuId ? 'Cập nhật Set Menu' : 'Thêm Set Menu mới'}
                </h3>
                <button onClick={handleCloseSetMenuModal} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tên Set Menu</label>
                      <input
                        type="text"
                        value={newSetMenu.name}
                        onChange={(e) => setNewSetMenu({ ...newSetMenu, name: e.target.value })}
                        placeholder="VD: Set Menu Trưa Giới Quản Lý"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán (VNĐ/Pax)</label>
                      <input
                        type="number"
                        value={newSetMenu.price}
                        onChange={(e) => setNewSetMenu({ ...newSetMenu, price: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Đồ uống đi kèm (Không bắt buộc)</label>
                      <input
                        type="text"
                        value={newSetMenu.includedDrink}
                        onChange={(e) => setNewSetMenu({ ...newSetMenu, includedDrink: e.target.value })}
                        placeholder="VD: Welcome Drink / 01 ly vang..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                      <select
                        value={newSetMenu.status}
                        onChange={(e) => setNewSetMenu({ ...newSetMenu, status: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      >
                        <option value="available">Đang bán</option>
                        <option value="out_of_stock">Ngưng bán</option>
                      </select>
                    </div>
                  </div>

                  <hr className="border-gray-200" />

                  {/* Courses Management */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold text-gray-800 text-lg">Danh sách các món (Courses)</h4>
                      <button
                        onClick={handleAddCourse}
                        className="bg-teal-50 text-teal-700 hover:bg-teal-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" /> Thêm Course
                      </button>
                    </div>

                    <div className="space-y-6">
                      {(newSetMenu.courses || []).length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-gray-500 text-sm">
                          Chưa có course nào. Bấm "Thêm Course" để bắt đầu.
                        </div>
                      ) : (
                        (newSetMenu.courses || []).map((course, cIdx) => (
                          <div key={cIdx} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1 max-w-sm">
                                <span className="font-bold text-gray-400">#{cIdx + 1}</span>
                                <input
                                  type="text"
                                  placeholder="Tên Course (VD: Appetizer, Main Course...)"
                                  value={course.title}
                                  onChange={(e) => handleUpdateCourseTitle(cIdx, e.target.value)}
                                  className="w-full px-3 py-1.5 text-sm border-gray-300 rounded-lg shadow-sm focus:border-teal-500 focus:ring-teal-500"
                                />
                              </div>
                              <button
                                onClick={() => handleDeleteCourse(cIdx)}
                                className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"
                                title="Xóa Course"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="p-4 space-y-3">
                              {course.options.map((opt, oIdx) => (
                                <div key={opt.id} className="relative pl-12 pr-12 group">
                                  <div className="absolute left-4 top-2 text-gray-400 font-medium text-xs">Opt {oIdx + 1}</div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                                    <input
                                      type="text"
                                      placeholder="Tên món (Tiếng Việt)"
                                      value={opt.nameVn}
                                      onChange={(e) => handleUpdateOption(cIdx, oIdx, 'nameVn', e.target.value)}
                                      className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 px-3 py-1.5"
                                    />
                                    <input
                                      type="text"
                                      placeholder="Tên món (English)"
                                      value={opt.nameEn}
                                      onChange={(e) => handleUpdateOption(cIdx, oIdx, 'nameEn', e.target.value)}
                                      className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 px-3 py-1.5"
                                    />
                                  </div>
                                  <input
                                    type="text"
                                    placeholder="Mô tả món ăn (English)"
                                    value={opt.descriptionEn || ''}
                                    onChange={(e) => handleUpdateOption(cIdx, oIdx, 'descriptionEn', e.target.value)}
                                    className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 px-3 py-1.5"
                                  />
                                  <button
                                    onClick={() => handleDeleteOption(cIdx, oIdx)}
                                    className="absolute right-2 top-2 text-gray-400 hover:text-red-500 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Xóa Option"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                              <button
                                onClick={() => handleAddOptionToCourse(cIdx)}
                                className="mt-2 text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1 ml-12"
                              >
                                <Plus className="w-3.5 h-3.5" /> Thêm Tùy Chọn (Option)
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 shrink-0">
                <button
                  onClick={handleCloseSetMenuModal}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveSetMenu}
                  className="px-4 py-2 bg-teal-600 text-white hover:bg-teal-700 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingSetMenuId ? 'Cập nhật Set' : 'Lưu Set Menu'}
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}
