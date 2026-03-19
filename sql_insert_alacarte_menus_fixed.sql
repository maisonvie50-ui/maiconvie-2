DO $$
DECLARE
    cid_khaivi UUID;
    cid_monchinh UUID;
    cid_trangmieng UUID;
    cid_douong UUID;
    cid_ruouvang UUID;
    cid_thuvi UUID;
BEGIN
    -- 1. DỌN DẸP DỮ LIỆU CŨ BỊ LỖI
    -- Bằng cách tìm ID các danh mục có chứa "|" (Ví dụ: MEAT | CÁC MÓN THỊT)
    -- sau đó xoá tất cả items bên trong nó và xoá luôn cả danh mục sai đó.
    DELETE FROM public.menu_items WHERE category_id IN (
        SELECT id FROM public.menu_categories WHERE name LIKE '%|%' OR name ILIKE '%THỰC ĐƠN THỬ VỊ%'
    );
    DELETE FROM public.menu_categories WHERE name LIKE '%|%' OR name ILIKE '%THỰC ĐƠN THỬ VỊ%';


    -- 2. TÌM VÀ ÁNH XẠ ĐÚNG VÀO CÁC DANH MỤC ĐÃ CÓ TRONG HỆ THỐNG
    -- Chỉ sử dụng lệnh ILIKE để tìm danh mục theo từ khoá, nếu chưa có thì mới tạo.

    -- a. Món Khai Vị
    SELECT id INTO cid_khaivi FROM public.menu_categories WHERE name ILIKE '%Khai vị%' LIMIT 1;
    IF cid_khaivi IS NULL THEN
        INSERT INTO public.menu_categories (name, sort_order) VALUES ('Khai vị', 10) RETURNING id INTO cid_khaivi;
    END IF;

    -- b. Món Chính
    SELECT id INTO cid_monchinh FROM public.menu_categories WHERE name ILIKE '%Món chính%' LIMIT 1;
    IF cid_monchinh IS NULL THEN
        INSERT INTO public.menu_categories (name, sort_order) VALUES ('Món chính', 20) RETURNING id INTO cid_monchinh;
    END IF;

    -- c. Tráng Miệng
    SELECT id INTO cid_trangmieng FROM public.menu_categories WHERE name ILIKE '%Tráng miệng%' LIMIT 1;
    IF cid_trangmieng IS NULL THEN
        INSERT INTO public.menu_categories (name, sort_order) VALUES ('Tráng miệng', 30) RETURNING id INTO cid_trangmieng;
    END IF;

    -- d. Đồ Uống
    SELECT id INTO cid_douong FROM public.menu_categories WHERE name ILIKE '%Đồ uống%' LIMIT 1;
    IF cid_douong IS NULL THEN
        INSERT INTO public.menu_categories (name, sort_order) VALUES ('Đồ uống', 40) RETURNING id INTO cid_douong;
    END IF;

    -- e. Rượu Vang
    SELECT id INTO cid_ruouvang FROM public.menu_categories WHERE name ILIKE '%Rượu vang%' LIMIT 1;
    IF cid_ruouvang IS NULL THEN
        INSERT INTO public.menu_categories (name, sort_order) VALUES ('Rượu vang', 50) RETURNING id INTO cid_ruouvang;
    END IF;

    -- f. Thực Đơn Thử Vị (Mới - Tạo riêng một danh mục ở cuối)
    SELECT id INTO cid_thuvi FROM public.menu_categories WHERE name ILIKE '%Thử vị%' LIMIT 1;
    IF cid_thuvi IS NULL THEN
        INSERT INTO public.menu_categories (name, sort_order) VALUES ('Thực đơn Thử vị', 60) RETURNING id INTO cid_thuvi;
    END IF;


    -- ==========================================
    -- 3. BẮT ĐẦU CHÈN MÓN MỚI (A LA CARTE)
    -- ==========================================

    -- === DANH MỤC: KHAI VỊ (Gọi chung cho Soups & Starters) ===
    INSERT INTO public.menu_items (category_id, name, description, price, in_stock, tags) VALUES
    (cid_khaivi, 'Soupe à l''Oignon', 'French onion soup with organic Emmental cheese and organic butter. Ingredients: Onions, organic Emmental cheese, beef broth, bread, organic butter, salt, pepper.', 155000, true, ARRAY['Soup']),
    (cid_khaivi, 'Velouté de Potiron', 'Creamy pumpkin soup with nutmeg and organic butter. Ingredients: Pumpkin, cream, ginger, nutmeg, onion, garlic, organic butter, vegetable broth, salt, pepper.', 90000, true, ARRAY['Soup', 'Vegetarian']),
    (cid_khaivi, 'Velouté de Champignons', 'Wild mushroom cream soup with organic extra virgin olive oil. Ingredients: Wild mushrooms, potato cream, organic extra virgin olive oil, garlic, onion, chicken broth, salt, pepper.', 135000, true, ARRAY['Soup']),
    (cid_khaivi, 'Escargots de Bourgogne', 'Burgundy snails with garlic butter. Ingredients: Snails, garlic, butter, parsley, salt, pepper.', 220000, true, ARRAY['Starter']),
    (cid_khaivi, 'Carpaccio de Thon', 'Tuna carpaccio with quail egg, caviar, organic extra virgin olive oil. Ingredients: Tuna, quail egg, organic extra virgin olive oil, lemon juice, salt, pepper, microgreens, fennel, arugula.', 290000, true, ARRAY['Starter', 'Seafood']),
    (cid_khaivi, 'Foie gras poêlé au Calvados', 'Pan-seared foie gras with Calvados, brioche. Ingredients: Foie gras, Calvados, brioche, apple, butter, salt, pepper.', 435000, true, ARRAY['Starter']),
    (cid_khaivi, 'Salade de Homard et Mangue', 'Lobster salad with mango, avocado, and passion fruit dressing. Ingredients: Lobster, mango, avocado, passion fruit, mixed greens, organic extra virgin olive oil, salt, pepper.', 595000, true, ARRAY['Starter', 'Seafood', 'Salad']);


    -- === DANH MỤC: MÓN CHÍNH (Gồm Meat, Seafood, Pasta/Veg) ===
    INSERT INTO public.menu_items (category_id, name, description, price, in_stock, tags) VALUES
    (cid_monchinh, 'Filet de Buffle Vietnamien 150gr (Signature)', 'Vietnamese buffalo fillet with pink peppercorn sauce. Ingredients: Buffalo fillet, pink peppercorn, cream, organic butter, garlic, salt, pepper, seasonal vegetables.', 455000, true, ARRAY['Signature', 'Beef']),
    (cid_monchinh, 'Ribeye Wagyu MBS6+ (150gr)', 'Wagyu ribeye with truffle mushrooms sauce and potatoes. Ingredients: Wagyu ribeye, truffle oil, mushrooms, potatoes, seasonal vegetables, cream, garlic, salt, pepper.', 1295000, true, ARRAY['Premium', 'Beef']),
    (cid_monchinh, 'Filet de Bœuf AUS (150gr)', 'AUS beef tenderloin with green peppercorn sauce and mashed potatoes. Ingredients: AUS beef tenderloin, green peppercorn, seasonal vegetables, cream, organic butter, garlic, salt, pepper, potatoes.', 535000, true, ARRAY['Beef']),
    (cid_monchinh, 'Ribeye Black Angus (150gr)', 'Black Angus ribeye with Béarnaise sauce and potatoes. Ingredients: Black Angus ribeye, seasonal vegetables, egg yolks, organic butter, white wine vinegar, shallots, tarragon, potatoes, salt, pepper.', 535000, true, ARRAY['Beef']),
    (cid_monchinh, 'Bœuf Wellington', 'Beef Wellington with Madeira sauce. Ingredients: Beef tenderloin, mushrooms, seasonal vegetables, puff pastry, prosciutto, mustard, Madeira, salt, pepper.', 595000, true, ARRAY['Beef', 'Classic']),
    (cid_monchinh, 'Bœuf Bourguignon', 'Burgundy-style beef stew with red wine, with organic noodles and mushrooms. Ingredients: Beef, red wine, mushrooms, pearl onions, bacon, garlic, organic tagliatelle, organic butter, salt, pepper, thyme, bay leaf.', 395000, true, ARRAY['Beef', 'Stew']),
    (cid_monchinh, 'Poulet Provençal', 'Chicken à la Provençale with mashed potatoes. Ingredients: Chicken thigh, seasonal vegetables, tomatoes, olives, herbs, potatoes, organic butter, garlic, salt, pepper.', 395000, true, ARRAY['Chicken']),
    (cid_monchinh, 'Magret de Canard aux Mûres', 'Seared French duck breast with blackberry sauce and vegetables. Ingredients: French duck breast, blackberries, honey, carrots, sprouts, organic butter, garlic, salt, pepper.', 455000, true, ARRAY['Duck']),
    (cid_monchinh, 'Carré d’Agneau aux Herbes de Provence (3 chops)', 'Herb-crusted AUS lamb rack with organic extra virgin olive oil and asparagus. Ingredients: Lamb rack, rosemary, thyme, garlic, asparagus, organic extra virgin olive oil, salt, pepper.', 595000, true, ARRAY['Lamb']),
    (cid_monchinh, 'Souris d''Agneau aux haricots blancs', 'Braised AUS lamb shank with white broad beans. Ingredients: AUS lamb shank, white beans, tomatoes, garlic, onions, olive oil, thyme, bay leaves, salt, pepper.', 495000, true, ARRAY['Lamb', 'Stew']),
    (cid_monchinh, 'Filet de Porc aux Pommes (Iberico 150gr)', 'Roast Iberico pork tenderloin with apple Calvados sauce and sweet potatoes. Ingredients: Iberico pork tenderloin, apples, seasonal vegetables, Calvados, organic butter, sweet potatoes, garlic, cream, salt, pepper.', 495000, true, ARRAY['Pork', 'Iberico']),
    (cid_monchinh, 'Saint-Jacques au Beurre Blanc', 'Seared Japanese scallops with beurre blanc and caviar. Ingredients: Scallops, seasonal vegetables, butter, white wine, caviar, shallots, lemon, cream, salt, pepper.', 695000, true, ARRAY['Seafood', 'Scallop']),
    (cid_monchinh, 'Saumon Poché au Vin Mousseux avec Caviar', 'Sparkling wine poached Norwegian salmon with caviar. Ingredients: Salmon fillet, fish broth, sparkling wine, seasonal vegetables, shallots, organic butter, caviar, lemon zest, herbs, olive oil, salt, pepper.', 435000, true, ARRAY['Seafood', 'Salmon']),
    (cid_monchinh, 'Black Cod Miso', 'Miso-marinated black cod with asparagus and broccoli. Ingredients: Black cod, miso paste, mirin, sake, asparagus, broccoli, soy sauce, sesame oil, salt, pepper.', 695000, true, ARRAY['Seafood', 'Fish']),
    (cid_monchinh, 'Pâtes aux Sauces au Choix', 'Organic spaghetti, tagliatelle, or penne with your choice of Bolognese, Carbonara, or Gorgonzola sauce. Ingredients: Organic pasta, ground beef (Bolognese), bacon and eggs (Carbonara), Gorgonzola cheese, tomatoes, cream, garlic, olive oil, herbs, salt, pepper.', 210000, true, ARRAY['Pasta']),
    (cid_monchinh, 'Aubergine Farcie aux Lentilles (Vegetarian)', 'Oven-baked stuffed eggplant with lentils and ratatouille. Ingredients: Eggplant, lentils, tomatoes, zucchini, carrots, peppers, onions, garlic, organic extra virgin olive oil, salt, pepper.', 200000, true, ARRAY['Vegetarian']),
    (cid_monchinh, 'Napoléon de Légumes Grillés (Vegetarian)', 'Grilled vegetable Napoleon with red pepper coulis. Ingredients: Zucchini, eggplant, bell peppers, tomatoes, red pepper coulis, organic extra virgin olive oil, salt, pepper.', 200000, true, ARRAY['Vegetarian']);


    -- === DANH MỤC: TRÁNG MIỆNG (Desserts) ===
    INSERT INTO public.menu_items (category_id, name, description, price, in_stock, tags) VALUES
    (cid_trangmieng, 'Crème Brûlée à la Vanille', 'Madagascar vanilla crème brûlée with vanilla.', 135000, true, ARRAY['Dessert']),
    (cid_trangmieng, 'Mousse au Chocolat', 'Chocolate mousse with organic dark cocoa.', 125000, true, ARRAY['Dessert', 'Chocolate']),
    (cid_trangmieng, 'Soufflé au Grand Marnier', 'Grand Marnier soufflé with vanilla ice cream.', 235000, true, ARRAY['Dessert']),
    (cid_trangmieng, 'Tarte Tatin aux Pommes', 'Caramelized apple tart and vanilla ice cream.', 155000, true, ARRAY['Dessert']),
    (cid_trangmieng, 'Profiteroles au Chocolat', 'Cream puffs with vanilla ice cream and chocolate sauce.', 155000, true, ARRAY['Dessert', 'Chocolate']),
    (cid_trangmieng, 'Assortiment de Fromages', 'Selection of French cheeses with cinnamon bread.', 390000, true, ARRAY['Cheese']),
    (cid_trangmieng, 'Assiette de Fruits Frais', 'Plate of seasonal fresh fruits.', 195000, true, ARRAY['Fruit', 'Dessert']);

    
    -- === DANH MỤC: RƯỢU VANG (Riêng với danh mục chứa Rượu vang) ===
    INSERT INTO public.menu_items (category_id, name, description, price, in_stock, tags) VALUES
    (cid_ruouvang, 'Frontera, Concha Y Toro | Cabernet Sauvignon | Chile', 'WINE BY GLASS', 140000, true, ARRAY['Beverage', 'Wine', 'Red Wine']),
    (cid_ruouvang, 'Chantecaille, Bordeaux | Merlot & Cabernet Sauvignon Blend | France', 'WINE BY GLASS', 140000, true, ARRAY['Beverage', 'Wine', 'Red Wine']),
    (cid_ruouvang, 'Frontera, Concha Y Toro | Sauvignon Blanc | Chile', 'WINE BY GLASS', 140000, true, ARRAY['Beverage', 'Wine', 'White Wine']),
    (cid_ruouvang, 'Chantecaille, Bordeaux | Sauvignon Blanc & Semillon Blend | France', 'WINE BY GLASS', 140000, true, ARRAY['Beverage', 'Wine', 'White Wine']),
    (cid_ruouvang, 'Dufouleur Monopole | Maison Dufouleur Père et Fils - Rose | France', 'WINE BY GLASS', 150000, true, ARRAY['Beverage', 'Wine', 'Rose Wine']),
    (cid_ruouvang, 'Pierre Larousse | Chardonnay, Sparking | France', 'WINE BY GLASS', 255000, true, ARRAY['Beverage', 'Wine', 'Sparkling Wine']),
    (cid_ruouvang, 'Dalat Vietnam | Mixed Grape, Red - White', 'WINE BY GLASS', 80000, true, ARRAY['Beverage', 'Wine']);


    -- === DANH MỤC: ĐỒ UỐNG (Các loại đồ uống thông thường, Apéritif, Bia...) ===
    INSERT INTO public.menu_items (category_id, name, description, price, in_stock, tags) VALUES
    (cid_douong, 'Campari / Ricard / Porto / Martini Rosso, Bianco, Dry', 'APÉRITIF / LIQUEUR', 90000, true, ARRAY['Beverage', 'Aperitif']),
    (cid_douong, 'Cointreau / Bailey’s / Grand Marnier', 'APÉRITIF / LIQUEUR', 100000, true, ARRAY['Beverage', 'Liqueur']),
    (cid_douong, 'Gordon’s Gin / Russian Vodka / Bacardi white', 'SPIRITS', 90000, true, ARRAY['Beverage', 'Spirits']),
    (cid_douong, 'Chivas Regal / Johnnie Walker red label', 'SPIRITS', 110000, true, ARRAY['Beverage', 'Spirits', 'Whisky']),
    (cid_douong, 'Hennessy V.S.O.P / Remy Martin V.S.O.P', 'BRANDY – EAU DE VIE', 160000, true, ARRAY['Beverage', 'Brandy']),
    (cid_douong, 'Hennessy X.O / Armagnac', 'BRANDY – EAU DE VIE', 220000, true, ARRAY['Beverage', 'Brandy']),
    (cid_douong, 'Framboise / Poire William', 'BRANDY – EAU DE VIE', 220000, true, ARRAY['Beverage', 'Eau de Vie']),
    (cid_douong, 'Sapporo draught (glass 33cl)', 'BEERS', 45000, true, ARRAY['Beverage', 'Beer']),
    (cid_douong, 'Hanoi / Saigon / 333 (33cl)', 'BEERS', 30000, true, ARRAY['Beverage', 'Beer']),
    (cid_douong, 'Tiger / Heineken (33cl)', 'BEERS', 45000, true, ARRAY['Beverage', 'Beer']),
    (cid_douong, 'Leffe Blond | Belgium (33cl)', 'BEERS', 90000, true, ARRAY['Beverage', 'Beer']),
    (cid_douong, 'Coke / Soda / Tonic / Sprite / Diet Coke', 'SOFT DRINK', 30000, true, ARRAY['Beverage', 'Soft Drink']),
    (cid_douong, 'Maison Vie mineral water (0,5L)', 'SOFT DRINK', 20000, true, ARRAY['Beverage', 'Water']),
    (cid_douong, 'La Vie, mineral water (1,5 L)', 'SOFT DRINK', 40000, true, ARRAY['Beverage', 'Water']),
    (cid_douong, 'Perrier, Sparkling water (0.25L | France)', 'SOFT DRINK', 85000, true, ARRAY['Beverage', 'Water']),
    (cid_douong, 'S.Pellegrino, Sparkling water (0.5L | Italy)', 'SOFT DRINK', 125000, true, ARRAY['Beverage', 'Water']),
    (cid_douong, 'Orange / Mango / Pomelo / Pineapple', 'FRESH FRUIT JUICE', 100000, true, ARRAY['Beverage', 'Juice']),
    (cid_douong, 'Lemon / Water melon / Passion', 'FRESH FRUIT JUICE', 60000, true, ARRAY['Beverage', 'Juice']),
    (cid_douong, 'Kombucha Dragon fruit / Peach', 'FRESH FRUIT JUICE', 90000, true, ARRAY['Beverage', 'Juice']),
    (cid_douong, 'Gin & Tonic / Whiskey & Soda or Coke', 'MIXED DRINK', 125000, true, ARRAY['Beverage']),
    (cid_douong, 'Campari & Orange Juice / Campari & Soda', 'MIXED DRINK', 125000, true, ARRAY['Beverage']),
    (cid_douong, 'Sangria / Pina Colada / Margarita / Whisky Sour', 'COCKTAIL', 150000, true, ARRAY['Beverage', 'Cocktail']),
    (cid_douong, 'Long Island Iced Tea / Singapore Sling / Daiquiri', 'COCKTAIL', 150000, true, ARRAY['Beverage', 'Cocktail']),
    (cid_douong, 'Black Russian / Tequila Sunrise / Tom Collins', 'COCKTAIL', 150000, true, ARRAY['Beverage', 'Cocktail']),
    (cid_douong, 'Oolong tea (Small Pot)', 'TEA – COFFEE', 40000, true, ARRAY['Beverage', 'Tea']),
    (cid_douong, 'Earl grey tea', 'TEA – COFFEE', 50000, true, ARRAY['Beverage', 'Tea']),
    (cid_douong, 'Vietnamese tea / Vietnamese ice tea', 'TEA – COFFEE', 25000, true, ARRAY['Beverage', 'Tea']),
    (cid_douong, 'Lipton tea / Ice Lipton Tea', 'TEA – COFFEE', 35000, true, ARRAY['Beverage', 'Tea']),
    (cid_douong, 'Espresso single / Latte', 'TEA – COFFEE', 50000, true, ARRAY['Beverage', 'Coffee']),
    (cid_douong, 'Americano / Cappuccino', 'TEA – COFFEE', 50000, true, ARRAY['Beverage', 'Coffee']),
    (cid_douong, 'Regular coffee / Ice coffee', 'TEA – COFFEE', 35000, true, ARRAY['Beverage', 'Coffee']);


    -- === DANH MỤC: THỰC ĐƠN THỬ VỊ (Dégustation Set Menu) ===
    INSERT INTO public.menu_items (category_id, name, description, price, in_stock, tags) VALUES
    (cid_thuvi, 'MENU DÉGUSTATION (2 À 4 PLATS)', '4 Plats | 4 Courses | 4 Món. Bao gồm lựa chọn 1 Khai vị, 1 Súp, 1 Món chính, 1 Tráng miệng.', 550000, true, ARRAY['Set Menu', 'Degustation']),
    (cid_thuvi, 'Entrée | Starter (Option)', 'Lựa chọn món khai vị trong Set 4 món', 165000, true, ARRAY['Set Menu', 'Degustation']),
    (cid_thuvi, 'Soupe | Soup (Option)', 'Lựa chọn món súp trong Set 4 món', 90000, true, ARRAY['Set Menu', 'Degustation']),
    (cid_thuvi, 'Plat Principal | Main course (Option)', 'Lựa chọn món chính trong Set 4 món', 200000, true, ARRAY['Set Menu', 'Degustation']),
    (cid_thuvi, 'Dessert (Option)', 'Lựa chọn món tráng miệng trong Set 4 món', 105000, true, ARRAY['Set Menu', 'Degustation']),
    (cid_thuvi, 'MENU DÉGUSTATION (4 À 7 PLATS) - 7 Courses', '7 Plats | 7 Courses | 7 Món', 1199000, true, ARRAY['Set Menu', 'Degustation']),
    (cid_thuvi, 'MENU DÉGUSTATION - Appetizer, Soup, Fish, Meat, Dessert', '5 Courses', 1125000, true, ARRAY['Set Menu', 'Degustation']),
    (cid_thuvi, 'MENU DÉGUSTATION - Soup, Fish, Meat, Dessert', '4 Courses', 915000, true, ARRAY['Set Menu', 'Degustation']),
    (cid_thuvi, 'MENU DÉGUSTATION - Amuse-Bouche, Appetizer, Soup, Fish, Dessert', '5 Courses', 860000, true, ARRAY['Set Menu', 'Degustation']),
    (cid_thuvi, 'MENU DÉGUSTATION - Amuse-Bouche, Appetizer, Soup, Meat, Dessert', '5 Courses', 880000, true, ARRAY['Set Menu', 'Degustation']),
    (cid_thuvi, 'MENU DÉGUSTATION - Amuse-Bouche, Fish, Meat, Dessert', '4 Courses', 880000, true, ARRAY['Set Menu', 'Degustation']),
    (cid_thuvi, 'MENU DÉGUSTATION - Amuse-Bouche, Soup, Fish, Dessert', '4 Courses', 650000, true, ARRAY['Set Menu', 'Degustation']),
    (cid_thuvi, 'MENU DÉGUSTATION - Appetizer, Soup, Meat, Dessert', '4 Courses', 795000, true, ARRAY['Set Menu', 'Degustation']);

END $$;
