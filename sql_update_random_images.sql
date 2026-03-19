-- ========================================================
-- CẬP NHẬT ẢNH MẪU CHO DANH SÁCH MÓN A LA CARTE HIỆN TẠI
-- ========================================================

DO $$
BEGIN
    -- 1. Món Khai Vị (Soups & Starters -> Hình ảnh Súp/Salad)
    UPDATE public.menu_items
    SET image = 'https://images.unsplash.com/photo-1547496502-affa22d38842?w=800&q=80' -- Hình đĩa salad đẹp
    WHERE category_id IN (SELECT id FROM public.menu_categories WHERE name ILIKE '%Khai vị%')
      AND (image IS NULL OR image = '');

    -- Món súp cụ thể thì đổi sang hình súp
    UPDATE public.menu_items
    SET image = 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80' -- Hình bát súp hành
    WHERE name ILIKE '%Soup%' OR name ILIKE '%Súp%' OR name ILIKE '%Velouté%';


    -- 2. Món Chính (Meat, Seafood, Pasta)
    
    -- Thịt & Bò (Hình Steak chung)
    UPDATE public.menu_items
    SET image = 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80' -- Hình đĩa bíp tết
    WHERE category_id IN (SELECT id FROM public.menu_categories WHERE name ILIKE '%Món chính%')
      AND (name ILIKE '%Bœuf%' OR name ILIKE '%Ribeye%' OR name ILIKE '%Buffle%' OR name ILIKE '%Steak%');

    -- Gà / Vịt 
    UPDATE public.menu_items
    SET image = 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&q=80' -- Hình Gà nướng
    WHERE category_id IN (SELECT id FROM public.menu_categories WHERE name ILIKE '%Món chính%')
      AND (name ILIKE '%Poulet%' OR name ILIKE '%Canard%');
      
    -- Cừu / Heo
    UPDATE public.menu_items
    SET image = 'https://images.unsplash.com/photo-1514516871321-f09b552ff991?w=800&q=80' -- Hình sườn cừu
    WHERE category_id IN (SELECT id FROM public.menu_categories WHERE name ILIKE '%Món chính%')
      AND (name ILIKE '%Agneau%' OR name ILIKE '%Porc%');

    -- Hải sản (Cá, Sò điệp)
    UPDATE public.menu_items
    SET image = 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80' -- Hình đĩa cá hồi
    WHERE category_id IN (SELECT id FROM public.menu_categories WHERE name ILIKE '%Món chính%')
      AND (name ILIKE '%Saumon%' OR name ILIKE '%Cod%' OR name ILIKE '%Saint-Jacques%');

    -- Mì Ý & Chay (Pasta, Vegetarian)
    UPDATE public.menu_items
    SET image = 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80' -- Hình đĩa Mỳ Ý
    WHERE category_id IN (SELECT id FROM public.menu_categories WHERE name ILIKE '%Món chính%')
      AND (name ILIKE '%Pâtes%' OR name ILIKE '%Aubergine%' OR name ILIKE '%Légumes%');


    -- 3. Tráng Miệng (Desserts)
    UPDATE public.menu_items
    SET image = 'https://images.unsplash.com/photo-1472555694391-399ea1aa3104?w=800&q=80' -- Hình bánh ngọt / Tart
    WHERE category_id IN (SELECT id FROM public.menu_categories WHERE name ILIKE '%Tráng miệng%');


    -- 4. Rượu Vang (Wine)
    UPDATE public.menu_items
    SET image = 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80' -- Hình ly rượu vang
    WHERE category_id IN (SELECT id FROM public.menu_categories WHERE name ILIKE '%Rượu vang%');


    -- 5. Đồ Uống (Beverages)
    UPDATE public.menu_items
    SET image = 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80' -- Hình ly cocktail / cà phê
    WHERE category_id IN (SELECT id FROM public.menu_categories WHERE name ILIKE '%Đồ uống%')
      AND (image IS NULL OR image = '');


    -- 6. Thực Đơn Thử Vị (Dégustation Set Menu)
    UPDATE public.menu_items
    SET image = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80' -- Hình set menu bàn tiệc
    WHERE category_id IN (SELECT id FROM public.menu_categories WHERE name ILIKE '%Thử vị%')
      AND (image IS NULL OR image = '');

END $$;
