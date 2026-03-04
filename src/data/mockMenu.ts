import type { Category, MenuItem, SetMenu } from '../types';

export const categories: Category[] = [
    { id: 'appetizer', name: 'Khai vị', count: 8 },
    { id: 'main', name: 'Món chính', count: 15 },
    { id: 'dessert', name: 'Tráng miệng', count: 6 },
    { id: 'drink', name: 'Đồ uống', count: 12 },
    { id: 'wine', name: 'Rượu vang', count: 8 },
];

export const menuItems: MenuItem[] = [
    { id: '1', categoryId: 'appetizer', name: 'Súp bí đỏ kem tươi', description: 'Súp bí đỏ nấu kem với hạt bí rang', price: 65000, image: '🍜', inStock: true, tags: ['Chef recommend', 'Healthy'] },
    { id: '2', categoryId: 'appetizer', name: 'Salad Caesar', description: 'Rau romaine, phô mai parmesan, crouton', price: 85000, image: '🥗', inStock: true, tags: ['Healthy'] },
    { id: '3', categoryId: 'main', name: 'Bò Wagyu A5', description: 'Bò Wagyu A5 Nhật Bản nướng than hồng kèm rau củ', price: 1200000, image: '🥩', inStock: true, tags: ['Premium', 'Chef recommend'], variants: ['Tái', 'Chín vừa', 'Chín kỹ'] },
    { id: '4', categoryId: 'main', name: 'Cá hồi áp chảo', description: 'Cá hồi Na Uy áp chảo sốt chanh dây', price: 220000, image: '🐟', inStock: true, tags: ['Healthy'] },
    { id: '5', categoryId: 'main', name: 'Mỳ Ý Carbonara', description: 'Spaghetti sốt kem truyền thống với bacon', price: 180000, image: '🍝', inStock: true, tags: [] },
    { id: '6', categoryId: 'main', name: 'Pizza Hải sản', description: 'Pizza đế mỏng với tôm, mực, sò điệp', price: 210000, image: '🍕', inStock: false, tags: ['Popular'] },
    { id: '7', categoryId: 'dessert', name: 'Tiramisu', description: 'Bánh Tiramisu truyền thống Ý', price: 95000, image: '🍰', inStock: true, tags: [] },
    { id: '8', categoryId: 'drink', name: 'Trà đào cam sả', description: 'Trà đào tươi với cam và sả', price: 45000, image: '🍹', inStock: true, tags: ['Popular'] },
    { id: '9', categoryId: 'drink', name: 'Nước suối', description: 'Nước khoáng thiên nhiên', price: 15000, image: '💧', inStock: true, tags: [] },
    { id: '10', categoryId: 'wine', name: 'Rượu vang đỏ Pháp', description: 'Bordeaux 2018 - Château Margaux', price: 850000, image: '🍷', inStock: true, tags: ['Premium'] },
];

// Simplified menu for mobile order pad
export const mobileMenuItems = [
    { id: 'm1', name: 'Bò bít tết', price: 250000, category: 'Món chính' },
    { id: 'm2', name: 'Súp bí đỏ', price: 65000, category: 'Khai vị' },
    { id: 'm3', name: 'Salad Caesar', price: 85000, category: 'Khai vị' },
    { id: 'm4', name: 'Cá hồi áp chảo', price: 220000, category: 'Món chính' },
    { id: 'm5', name: 'Rượu vang đỏ', price: 850000, category: 'Đồ uống' },
    { id: 'm6', name: 'Mỳ Ý Carbonara', price: 180000, category: 'Món chính' },
    { id: 'm7', name: 'Pizza Hải sản', price: 210000, category: 'Món chính' },
    { id: 'm8', name: 'Khoai tây chiên', price: 45000, category: 'Khai vị' },
    { id: 'm9', name: 'Nước suối', price: 15000, category: 'Đồ uống' },
    { id: 'm10', name: 'Trà đào', price: 45000, category: 'Đồ uống' },
];

export const mockSetMenus: SetMenu[] = [
    {
        id: 'sm_350',
        name: 'STANDARD MENU',
        price: 350000,
        status: 'available',
        includedDrink: 'Trà hoặc Cà Phê Việt sau tráng miệng (Regular Vietnamese\'s Coffee or tea)',
        courses: [
            {
                title: 'ONE | SOUP',
                options: [
                    {
                        id: 'sm_350_c1_o1',
                        nameEn: 'POTAGE PARMENTIER',
                        nameVn: 'Súp khoai tây và tỏi tây',
                        descriptionEn: 'Comforting, creamy potato and leek soup, a timeless classic for all.',
                        descriptionVn: ''
                    }
                ]
            },
            {
                title: 'TWO | MAIN-COURSE',
                options: [
                    {
                        id: 'sm_350_c2_o1',
                        nameEn: 'BASA FISH FILLET',
                        nameVn: 'Phi lê cá basa chiên bia, khoai môn chiên giòn, sốt đầu bếp',
                        descriptionEn: 'Crispy Basa fish fillet, perfection in every bite, served with delectable dipping sauce.',
                    },
                    {
                        id: 'sm_350_c2_o2',
                        nameEn: 'STUFFED CHICKEN',
                        nameVn: 'Đùi gà rút xương nhồi nấm và rau xốt tiêu tươi vang đỏ kèm khoai',
                        descriptionEn: 'Savory Maraicher stuffed chicken, red wine pepper sauce, and delectable roasted potatoes.',
                    }
                ]
            },
            {
                title: 'THREE | DESSERT',
                options: [
                    {
                        id: 'sm_350_c3_o1',
                        nameEn: 'FRUIT TART',
                        nameVn: 'Bánh Tart nhân trái cây theo mùa kèm kem',
                        descriptionEn: 'Delight in a seasonal fruit tart accompanied by a scoop of refreshing ice cream.',
                    }
                ]
            }
        ]
    },
    {
        id: 'sm_430',
        name: 'STANDARD MENU',
        price: 430000,
        status: 'available',
        includedDrink: 'Trà mạn hoặc cà phê Việt sau tráng miệng (Regular Vietnamese coffee or green tea)',
        courses: [
            {
                title: 'ONE | STARTER',
                options: [
                    {
                        id: 'sm_430_c1_o1',
                        nameEn: 'CHEESE CROQUETTE',
                        nameVn: 'Gà viên phomai chảy, sốt tương ớt Hà Nội',
                        descriptionEn: 'Chicken and cheese croquette with zesty Hanoi chili aioli dipping sauce',
                    }
                ]
            },
            {
                title: 'TWO | SOUP',
                options: [
                    {
                        id: 'sm_430_c2_o1',
                        nameEn: 'CARROT SOUP',
                        nameVn: 'Súp cà rốt nướng vị gừng dùng kèm bánh mỳ và gà nướng',
                        descriptionEn: 'Creamy roasted carrot soup infused with ginger, a comforting appetizer',
                    }
                ]
            },
            {
                title: 'THREE — CHOICE MAIN-COURSE',
                options: [
                    {
                        id: 'sm_430_c3_o1',
                        nameEn: 'PORK GENEVA',
                        nameVn: 'Thịt lợn hầm kiểu Geneva, kèm rau củ theo mùa',
                        descriptionEn: 'Sautéed pork Geneva with a side of our seasonal culinary creation',
                    },
                    {
                        id: 'sm_430_c3_o2',
                        nameEn: 'SLOW-COOKED CHICKEN',
                        nameVn: 'Gà cuộn nấu chậm nướng, dùng kèm sốt miso',
                        descriptionEn: 'Slow-cooked rolls of chicken served in a delectable miso sauce',
                    }
                ]
            },
            {
                title: 'FOUR | DESSERT',
                options: [
                    {
                        id: 'sm_430_c4_o1',
                        nameEn: 'LIME MERINGUE TART',
                        nameVn: 'Bánh tart chanh kèm kem',
                        descriptionEn: 'Tangy lime meringue tart accompanied by a scoop of ice cream',
                    }
                ]
            }
        ]
    },
    {
        id: 'sm_550',
        name: 'STANDARD MENU',
        price: 550000,
        status: 'available',
        includedDrink: 'Trà hoặc Cà Phê Việt sau tráng miệng (Regular Vietnamese\'s Coffee or tea)',
        courses: [
            {
                title: 'ONE | STARTER',
                options: [
                    {
                        id: 'sm_550_c1_o1',
                        nameEn: 'SALMON BEET TARTAR',
                        nameVn: 'Salad củ dền trộn cùng cá hồi và sốt húng quế Hà Nội',
                        descriptionEn: 'Beet tartar with salmon, drizzled in a fragrant basil dressing',
                    }
                ]
            },
            {
                title: 'TWO | SOUP',
                options: [
                    {
                        id: 'sm_550_c2_o1',
                        nameEn: 'MUSHROOM SOUP',
                        nameVn: 'Súp kem nấm cùng bánh mỳ giòn nướng tỏi',
                        descriptionEn: 'Creamy mushroom soup topped with crispy, golden-brown bread croutons',
                    }
                ]
            },
            {
                title: 'THREE — CHOICE MAIN-COURSE',
                options: [
                    {
                        id: 'sm_550_c3_o1',
                        nameEn: 'DUCK BREAST',
                        nameVn: 'Ức vịt áp chảo dùng kèm, rau củ và sốt gừng',
                        descriptionEn: 'Duck breast served with Da Lat vegetables and aromatic ginger sauce',
                    },
                    {
                        id: 'sm_550_c3_o2',
                        nameEn: 'SLOW-COOKED BEEF',
                        nameVn: 'Má bò hầm vang, rau củ Đà Lạt và bắp nghiền',
                        descriptionEn: 'Tender slow-cooked beef cheek in rich red wine, creamy polenta',
                    }
                ]
            },
            {
                title: 'FOUR | DESSERT',
                options: [
                    {
                        id: 'sm_550_c4_o1',
                        nameEn: 'MANGO TART',
                        nameVn: 'Bánh tart xoài kèm kem',
                        descriptionEn: 'Sweet mango tart, a delightful finale, crowned with creamy ice cream',
                    }
                ]
            }
        ]
    }
];
