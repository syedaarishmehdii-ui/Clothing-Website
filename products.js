// N5 Apparels - 100% Original Brand Stock Catalog
// Directly based on N5 Apparels' actual in-store stock photos
// Categories: Exclusively Shirts, T-Shirts, and Jeans

const INITIAL_PRODUCTS = [
  // ========================================================
  // 1. ORIGINAL BRAND SHIRTS
  // ========================================================
  {
    id: "n5-shirt-polo-ralph",
    name: "Custom Fit Bengal Pinstripe Oxford Cotton Shirt",
    brand: "Polo Ralph Lauren",
    brandTag: "100% Original Brand",
    category: "shirts",
    categoryLabel: "Shirts",
    price: 1499,
    originalPrice: 4999,
    sizes: ["M", "L", "XL", "2XL"],
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=900&auto=format&fit=crop&q=85",
    realStockImage: "assets/stock/real_shirts_polo_banana_levis.png",
    gallery: [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=900&auto=format&fit=crop&q=85",
      "assets/stock/real_shirts_polo_banana_levis.png"
    ],
    fabric: "100% Long-Staple Royal Oxford Cotton",
    gsm: "185 GSM",
    fit: "Custom Fit (Available in Big Sizes)",
    description: "Authentic Polo Ralph Lauren Custom Fit oxford shirt in sky-blue & white candy Bengal pinstripes. Features rolled buttoned collar, signature pony embroidery, and mother-of-pearl buttons. Verified store surplus with genuine collar tags.",
    inStock: true,
    stockCount: 6,
    isNew: true,
    rating: 5.0,
    reviewsCount: 58
  },
  {
    id: "n5-shirt-snitch-shacket",
    name: "Military Cargo Utility Shacket (Field Overshirt)",
    brand: "Snitch",
    brandTag: "Original Snitch (M)",
    category: "shirts",
    categoryLabel: "Shirts",
    price: 1399,
    originalPrice: 2999,
    sizes: ["M"],
    image: "https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=900&auto=format&fit=crop&q=85",
    realStockImage: "assets/stock/real_snitch_shackets.png",
    gallery: [
      "https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=900&auto=format&fit=crop&q=85",
      "assets/stock/real_snitch_shackets.png"
    ],
    fabric: "100% Heavy Twill Cotton",
    gsm: "240 GSM Structured",
    fit: "Regular Utility Fit (Medium)",
    description: "Original Snitch military utility shacket with structured shoulder epaulettes, dual flap chest pockets, and durable button placket. Available in Khaki Tan, Obsidian Black, and Natural Off-White. Limited single-size stock.",
    inStock: true,
    stockCount: 5,
    isNew: true,
    rating: 4.9,
    reviewsCount: 34
  },
  {
    id: "n5-shirt-levis-gingham",
    name: "Heritage Micro-Gingham Check Button-Down Shirt",
    brand: "Levi's",
    brandTag: "Original with Tags",
    category: "shirts",
    categoryLabel: "Shirts",
    price: 1299,
    originalPrice: 3299,
    sizes: ["M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1622445268121-ac3045797e4e?w=900&auto=format&fit=crop&q=85",
    realStockImage: "assets/stock/real_shirts_levis_jackjones.png",
    gallery: [
      "https://images.unsplash.com/photo-1622445268121-ac3045797e4e?w=900&auto=format&fit=crop&q=85",
      "assets/stock/real_shirts_levis_jackjones.png"
    ],
    fabric: "100% Combed Compact Cotton Poplin",
    gsm: "160 GSM",
    fit: "Standard Slim Fit",
    description: "Genuine Levi Strauss & Co. button-down shirt featuring black & white micro-gingham checks. Complete with yellow factory retail price tags attached, chest pocket red tab branding, and curved hemline.",
    inStock: true,
    stockCount: 9,
    isNew: true,
    rating: 4.9,
    reviewsCount: 47
  },
  {
    id: "n5-shirt-banana-republic",
    name: "Earthy Tartan Plaid Flannel Casual Shirt",
    brand: "Banana Republic",
    brandTag: "100% Original",
    category: "shirts",
    categoryLabel: "Shirts",
    price: 1399,
    originalPrice: 3499,
    sizes: ["M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=900&auto=format&fit=crop&q=85",
    realStockImage: "assets/stock/real_shirts_polo_banana_levis.png",
    gallery: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=900&auto=format&fit=crop&q=85",
      "assets/stock/real_shirts_polo_banana_levis.png"
    ],
    fabric: "100% Soft-Brushed Organic Cotton",
    gsm: "190 GSM",
    fit: "Classic Tailored Fit",
    description: "Banana Republic authentic olive green and khaki brown tartan plaid shirt. Brushed for peach-soft touch against the skin, button-down collar points, and reinforced seam stitching.",
    inStock: true,
    stockCount: 7,
    isNew: false,
    rating: 4.8,
    reviewsCount: 39
  },
  {
    id: "n5-shirt-mufti-solid",
    name: "Artisanal Textured Pure Cotton Casual Shirt",
    brand: "Mufti",
    brandTag: "100% Original",
    category: "shirts",
    categoryLabel: "Shirts",
    price: 1199,
    originalPrice: 2899,
    sizes: ["M", "L", "XL", "XXL"],
    image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=900&auto=format&fit=crop&q=85",
    realStockImage: "assets/stock/real_shirts_mufti_ca.png",
    gallery: [
      "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=900&auto=format&fit=crop&q=85",
      "assets/stock/real_shirts_mufti_ca.png"
    ],
    fabric: "100% Slub Textured Cotton",
    gsm: "170 GSM",
    fit: "Slim Casual Fit",
    description: "Mufti signature solid casual shirt in deep midnight navy and sunset terracotta. Features subtle slub weave texture, structured point collar, and custom Mufti embossed pearl buttons.",
    inStock: true,
    stockCount: 11,
    isNew: true,
    rating: 4.8,
    reviewsCount: 52
  },
  {
    id: "n5-shirt-gant-poplin",
    name: "Regular Fit Pure White Broadcloth Poplin Shirt",
    brand: "Gant",
    brandTag: "Big Sizes Available",
    category: "shirts",
    categoryLabel: "Shirts",
    price: 1499,
    originalPrice: 3899,
    sizes: ["L", "XL", "2XL", "3XL"],
    image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=900&auto=format&fit=crop&q=85",
    realStockImage: "assets/stock/real_shirts_gant_nautica_chaps.png",
    gallery: [
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=900&auto=format&fit=crop&q=85",
      "assets/stock/real_shirts_gant_nautica_chaps.png"
    ],
    fabric: "100% Two-Ply Combed Broadcloth Poplin",
    gsm: "165 GSM",
    fit: "Regular Roomy Fit (Special in Big Sizes)",
    description: "Original Gant classic white poplin button-down shirt. Features the iconic Gant box pleat and locker loop on the back yoke for timeless prep elegance and generous comfort in large sizes.",
    inStock: true,
    stockCount: 8,
    isNew: true,
    rating: 5.0,
    reviewsCount: 41
  },
  {
    id: "n5-shirt-jackjones-stripe",
    name: "Resort Cuban Collar Vertical Striped Shirt",
    brand: "Jack & Jones",
    brandTag: "Original Brand",
    category: "shirts",
    categoryLabel: "Shirts",
    price: 1099,
    originalPrice: 2499,
    sizes: ["M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1550995694-3f5f4a7e1bd2?w=900&auto=format&fit=crop&q=85",
    realStockImage: "assets/stock/real_shirts_levis_jackjones.png",
    gallery: [
      "https://images.unsplash.com/photo-1550995694-3f5f4a7e1bd2?w=900&auto=format&fit=crop&q=85",
      "assets/stock/real_shirts_levis_jackjones.png"
    ],
    fabric: "100% Viscose Rayon Linen Drape",
    gsm: "150 GSM",
    fit: "Relaxed Camp Collar Fit",
    description: "Jack & Jones vintage forest green & white vertical stripe open-collar resort shirt. Lightweight, breathable drape that pairs naturally with light wash denims and chinos.",
    inStock: true,
    stockCount: 6,
    isNew: false,
    rating: 4.7,
    reviewsCount: 31
  },

  // ========================================================
  // 2. ORIGINAL BRAND T-SHIRTS & POLOS
  // ========================================================
  {
    id: "n5-tee-uspa-polo",
    name: "Heritage Pique Embroidered Classic Polo Shirt",
    brand: "U.S. Polo Assn.",
    brandTag: "USPA 100% Original",
    category: "tshirts",
    categoryLabel: "T-Shirts",
    price: 999,
    originalPrice: 2299,
    sizes: ["M", "L", "XL", "XXL"],
    image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=900&auto=format&fit=crop&q=85",
    realStockImage: "assets/stock/real_shirts_uspa_flannel.png",
    gallery: [
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=900&auto=format&fit=crop&q=85",
      "assets/stock/real_shirts_uspa_flannel.png"
    ],
    fabric: "100% Honeycomb Cotton Pique",
    gsm: "230 GSM",
    fit: "Classic Athletic Fit",
    description: "Authentic U.S. Polo Assn. classic white pique polo with signature bold USPA Since 1890 chest embroidery and contrast sleeve piping. No-curl ribbed collar and two-button placket.",
    inStock: true,
    stockCount: 14,
    isNew: true,
    rating: 4.9,
    reviewsCount: 64
  },
  {
    id: "n5-tee-acid-heavyweight",
    name: "280 GSM Mineral Acid Wash Heavyweight Oversized Tee",
    brand: "Fear of God Essentials",
    brandTag: "Streetwear Drop",
    category: "tshirts",
    categoryLabel: "T-Shirts",
    price: 899,
    originalPrice: 1999,
    sizes: ["S", "M", "L", "XL", "XXL"],
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=900&auto=format&fit=crop&q=85",
    realStockImage: "assets/stock/real_shirts_uspa_flannel.png",
    gallery: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=900&auto=format&fit=crop&q=85"
    ],
    fabric: "100% French Terry Ring-Spun Cotton",
    gsm: "280 GSM Heavyweight",
    fit: "Drop-Shoulder Boxy Fit",
    description: "Heavyweight 280 GSM streetwear tee with vintage acid wash mineral treatment. Thick 1.25-inch ribbed crewneck collar, dropped shoulders, and durable reinforced hem.",
    inStock: true,
    stockCount: 18,
    isNew: true,
    rating: 5.0,
    reviewsCount: 92
  },
  {
    id: "n5-tee-zara-minimalist",
    name: "Structured Sand Beige Heavy Jersey Oversized Tee",
    brand: "Zara Man",
    brandTag: "100% Original",
    category: "tshirts",
    categoryLabel: "T-Shirts",
    price: 849,
    originalPrice: 1799,
    sizes: ["S", "M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=900&auto=format&fit=crop&q=85",
    realStockImage: "assets/stock/real_shirts_mufti_ca.png",
    gallery: [
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=900&auto=format&fit=crop&q=85"
    ],
    fabric: "100% Organic Cotton Heavy Single Jersey",
    gsm: "250 GSM",
    fit: "Relaxed Boxy Fit",
    description: "Zara Man clean minimalist streetwear t-shirt in warm sand beige. Clean-cut seamless neckline, pre-shrunk heavyweight fabric that holds a structured boxy drape.",
    inStock: true,
    stockCount: 12,
    isNew: true,
    rating: 4.8,
    reviewsCount: 43
  },

  // ========================================================
  // 3. ORIGINAL BRAND JEANS & PANTS
  // ========================================================
  {
    id: "n5-jean-levis-501",
    name: "501 Original Fit Straight Leg Selvedge Jeans",
    brand: "Levi's",
    brandTag: "Two-Horse Red Tab",
    category: "jeans",
    categoryLabel: "Jeans",
    price: 1899,
    originalPrice: 4499,
    sizes: ["30", "32", "34", "36"],
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=900&auto=format&fit=crop&q=85",
    realStockImage: "assets/stock/real_pants_gstar_levis.png",
    gallery: [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=900&auto=format&fit=crop&q=85",
      "assets/stock/real_pants_gstar_levis.png",
      "assets/stock/real_jeans_hm_bigstar_levis.png"
    ],
    fabric: "100% Cotton 14.5oz Raw Ring-Spun Denim",
    gsm: "14.5 oz Rigid",
    fit: "Original Straight Leg",
    description: "Authentic Levi's 501 classic straight-leg denim with signature copper shank button fly, Two Horse leather back patch, and Red Tab on the rear pocket. Available in deep indigo and classic stone wash.",
    inStock: true,
    stockCount: 10,
    isNew: true,
    rating: 5.0,
    reviewsCount: 88
  },
  {
    id: "n5-jean-bigstar-vintage",
    name: "Light Stone Wash Vintage Straight Relaxed Jeans",
    brand: "Big Star",
    brandTag: "Original Brand",
    category: "jeans",
    categoryLabel: "Jeans",
    price: 1699,
    originalPrice: 3899,
    sizes: ["30", "32", "34", "36"],
    image: "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=900&auto=format&fit=crop&q=85",
    realStockImage: "assets/stock/real_jeans_hm_bigstar_levis.png",
    gallery: [
      "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=900&auto=format&fit=crop&q=85",
      "assets/stock/real_jeans_hm_bigstar_levis.png"
    ],
    fabric: "100% Ring-Spun Heritage Denim",
    gsm: "13.8 oz",
    fit: "Relaxed Straight Fit",
    description: "Big Star authentic light stone wash denim with signature tan waist leather patch and red rear pocket embroidery. Relaxed straight leg that drapes perfectly over sneakers.",
    inStock: true,
    stockCount: 7,
    isNew: true,
    rating: 4.8,
    reviewsCount: 54
  },
  {
    id: "n5-jean-gstar-acid",
    name: "Black Mineral Acid Wash Raw Tapered Denim",
    brand: "G-Star Raw",
    brandTag: "100% Original",
    category: "jeans",
    categoryLabel: "Jeans",
    price: 1999,
    originalPrice: 4899,
    sizes: ["30", "32", "34", "36"],
    image: "https://images.unsplash.com/photo-1542272604-780c96856592?w=900&auto=format&fit=crop&q=85",
    realStockImage: "assets/stock/real_pants_gstar_levis.png",
    gallery: [
      "https://images.unsplash.com/photo-1542272604-780c96856592?w=900&auto=format&fit=crop&q=85",
      "assets/stock/real_pants_gstar_levis.png"
    ],
    fabric: "98% Cotton, 2% Elastane Mineral Wash",
    gsm: "14 oz",
    fit: "3D Tapered Ergonomic Cut",
    description: "G-Star Raw authentic 3D tapered denim in dark charcoal acid wash. Features sculpted knee panels, branded leather waistband tag, and heavy reinforced pockets.",
    inStock: true,
    stockCount: 5,
    isNew: true,
    rating: 4.9,
    reviewsCount: 46
  },
  {
    id: "n5-jean-levis-terracotta",
    name: "Heritage Two-Horse Twill Chino Trousers",
    brand: "Levi's / Next",
    brandTag: "Original Brand",
    category: "jeans",
    categoryLabel: "Jeans",
    price: 1599,
    originalPrice: 3499,
    sizes: ["30", "32", "34", "36"],
    image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=900&auto=format&fit=crop&q=85",
    realStockImage: "assets/stock/real_pants_gstar_levis.png",
    gallery: [
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=900&auto=format&fit=crop&q=85",
      "assets/stock/real_pants_gstar_levis.png"
    ],
    fabric: "100% Heavy Peached Cotton Twill",
    gsm: "220 GSM",
    fit: "Straight Chino Fit",
    description: "Authentic Levi Strauss & Co. Two-Horse twill pants in terracotta brick-red and sand beige chinos. Tailored casual straight leg with welt back pockets and reinforced belt loops.",
    inStock: true,
    stockCount: 8,
    isNew: false,
    rating: 4.7,
    reviewsCount: 38
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { INITIAL_PRODUCTS };
}
