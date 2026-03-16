-- 1. XÓA CÁC MÓN DÉGUSTATION CŨ TRONG A LA CARTE (Bảng menu_items)
-- Xóa các món thuộc danh mục "Thực đơn Thử vị" (Dégustation)
DELETE FROM public.menu_items
WHERE category_id IN (
    SELECT id FROM public.menu_categories 
    WHERE name ILIKE '%Thử vị%' OR name ILIKE '%Thực đơn%' OR name ILIKE '%Dégustation%'
);

-- Xóa luôn danh mục "Thực đơn thử vị" nếu có
DELETE FROM public.menu_categories
WHERE name ILIKE '%Thử vị%' OR name ILIKE '%Thực đơn%' OR name ILIKE '%Dégustation%';


-- 2. CHÈN CÁC SET MENU DÉGUSTATION MỚI VÀO BẢNG set_menus
-- Cấu trúc: 2-4 Món và 4-7 Món

INSERT INTO public.set_menus (name, price, status, included_drink, courses)
VALUES 
-- SET 1: 4 Món (Thuộc nhóm 2-4 món)
(
    'MENU DÉGUSTATION (4 PLATS)',
    550000,
    'available',
    NULL,
    '[
        {
            "title": "Entrée / Khai vị",
            "options": [
                {
                    "id": "deg_ent_1",
                    "nameVn": "Salade cá hồi hun khói Maison Vie",
                    "nameEn": "Maison Vie smoked salmon salad"
                },
                {
                    "id": "deg_ent_2",
                    "nameVn": "Thịt nguội vịt áp chảo & lườn ngỗng phi lê",
                    "nameEn": "Pan-seared duck mortadella & goose breast fillet"
                },
                {
                    "id": "deg_ent_3",
                    "nameVn": "Gan ngỗng áp chảo với táo nướng caramel",
                    "nameEn": "Pan seared Foie Gras with caramelized baked Apple (+165,000 VND)"
                }
            ]
        },
        {
            "title": "Soupe / Súp",
            "options": [
                {
                    "id": "deg_soup_1",
                    "nameVn": "Súp hành tây bông cải kiểu Pháp",
                    "nameEn": "French onion broccoli soup"
                },
                {
                    "id": "deg_soup_2",
                    "nameVn": "Súp nấm cục Truffles đặc biệt",
                    "nameEn": "Special truffles mushroom soup (+90,000 VND)"
                }
            ]
        },
        {
            "title": "Plat Principal / Món chính",
            "options": [
                {
                    "id": "deg_main_1",
                    "nameVn": "Phi lê cá Tuyết nướng bơ tỏi",
                    "nameEn": "Garlic butter roasted cod fish fillet"
                },
                {
                    "id": "deg_main_2",
                    "nameVn": "Đùi vịt hầm kiểu Pháp với bắp cải tím",
                    "nameEn": "French duck leg stew with purple cabbage"
                },
                {
                    "id": "deg_main_3",
                    "nameVn": "Thăn nội Bò Úc Black Angus nướng than đá",
                    "nameEn": "Charcoal grilled Australian Black Angus beef tenderloin (+200,000 VND)"
                }
            ]
        },
        {
            "title": "Dessert / Tráng miệng",
            "options": [
                {
                    "id": "deg_dessert_1",
                    "nameVn": "Bánh Lava Chocolate với kem Vanilla",
                    "nameEn": "Chocolate lava cake with vanilla ice cream"
                },
                {
                    "id": "deg_dessert_2",
                    "nameVn": "Bánh Crème Brûlée kinh điển",
                    "nameEn": "Classic Crème Brûlée"
                }
            ]
        }
    ]'::jsonb
),

-- SET 2: 5 Món (Thuộc nhóm 4-7 món)
(
    'MENU DÉGUSTATION EXCEPTIONNEL (5 PLATS)',
    1125000,
    'available',
    'Tặng kèm 1 ly Champagne khai vị',
    '[
        {
            "title": "Amuse-Bouche / Món khai vị nhỏ",
            "options": [
                {
                    "id": "deg5_amuse_1",
                    "nameVn": "Sò điệp Hokkaido áp chảo sốt bơ chanh",
                    "nameEn": "Pan-seared Hokkaido scallop with lemon butter sauce"
                }
            ]
        },
        {
            "title": "Entrée Froide / Khai vị lạnh",
            "options": [
                {
                    "id": "deg5_ent_1",
                    "nameVn": "Thăn bò Wagyu Carpaccio với nấm Truffle đen",
                    "nameEn": "Wagyu beef Carpaccio with black Truffle"
                }
            ]
        },
        {
            "title": "Soupe / Súp",
            "options": [
                {
                    "id": "deg5_soup_1",
                    "nameVn": "Súp tôm hùm thượng hạng",
                    "nameEn": "Premium lobster bisque"
                }
            ]
        },
        {
            "title": "Plat Principal / Món chính",
            "options": [
                {
                    "id": "deg5_main_1",
                    "nameVn": "Thăn ngoại Bò Wagyu A5 nướng đá muối núi lửa",
                    "nameEn": "Volcanic salt stone grilled Wagyu A5 Striploin"
                },
                {
                    "id": "deg5_main_2",
                    "nameVn": "Cá bơn Chile bỏ lò sốt vang trắng",
                    "nameEn": "Baked Chilean seabass with white wine sauce"
                }
            ]
        },
        {
            "title": "Dessert / Tráng miệng",
            "options": [
                {
                    "id": "deg5_dessert_1",
                    "nameVn": "Tuyển tập bánh ngọt Pháp mini (Petit Fours)",
                    "nameEn": "Assorted French mini pastries (Petit Fours)"
                }
            ]
        }
    ]'::jsonb
),

-- SET 3: 7 Món (Thuộc nhóm 4-7 món, the ultimate experience)
(
    'MENU DÉGUSTATION PRESTIGE (7 PLATS)',
    1850000,
    'available',
    'Wine Pairing kèm theo mỗi món (+ 850,000 VND)',
    '[
        {
            "title": "Amuse-Bouche / Khai vị nhỏ khơi gợi vị giác",
            "options": [
                {
                    "id": "deg7_amuse_1",
                    "nameVn": "Hàu fine de claire với trứng cá tầm Caviar",
                    "nameEn": "Fine de claire oyster with Caviar"
                }
            ]
        },
        {
            "title": "Entrée Froide / Khai vị lạnh",
            "options": [
                {
                    "id": "deg7_entfroide_1",
                    "nameVn": "Gan ngỗng Pháp Terrine mứt vả",
                    "nameEn": "French Foie Gras Terrine with fig jam"
                }
            ]
        },
        {
            "title": "Entrée Chaude / Khai vị nóng",
            "options": [
                {
                    "id": "deg7_entchaude_1",
                    "nameVn": "Sò điệp Hokkaido nướng mỡ hành",
                    "nameEn": "Baked Hokkaido scallop with scallion oil"
                }
            ]
        },
        {
            "title": "Trou Normand / Làm sạch vị giác",
            "options": [
                {
                    "id": "deg7_trou_1",
                    "nameVn": "Kem tuyết chanh vàng Sorbet",
                    "nameEn": "Lemon Sorbet"
                }
            ]
        },
        {
            "title": "Plat de Poisson / Món Cá",
            "options": [
                {
                    "id": "deg7_fish_1",
                    "nameVn": "Tôm hùm Canada nướng phô mai Gruyère",
                    "nameEn": "Baked Canadian lobster with Gruyère cheese"
                }
            ]
        },
        {
            "title": "Plat de Viande / Món Thịt",
            "options": [
                {
                    "id": "deg7_meat_1",
                    "nameVn": "Thăn nội Bò Wagyu A5 sốt nấm Truffle",
                    "nameEn": "Wagyu A5 beef tenderloin with Truffle sauce"
                }
            ]
        },
        {
            "title": "Dessert / Tráng miệng",
            "options": [
                {
                    "id": "deg7_dessert_1",
                    "nameVn": "Bánh Soufflé Grand Marnier truyền thống",
                    "nameEn": "Traditional Grand Marnier Soufflé"
                }
            ]
        }
    ]'::jsonb
);
