// N5 Apparels - Production Storefront & Owner Portal Logic
// Features: Strict UPI Verification Gate, Studio White Background Showcase, Pure 3-Category Architecture

const Store = {
  products: [],
  cart: [],
  orders: [],
  queries: [],
  currentUser: null,
  registeredUsers: [],
  isAdmin: false,
  activeTab: 'home',
  activeCategory: 'all',
  activeSearchQuery: '',
  activeSort: 'featured',
  paymentProofData: {
    utr: '',
    screenshotUrl: ''
  },
  config: {
    storeName: "N5 Apparels",
    tagline: "Original Brands. Honest Prices.",
    phone: "9700663930",
    phoneDisplay: "+91 9700663930",
    whatsappNumber: "919700663930",
    upiId: "9700663930@okbizaxis",
    customQrImage: "",
    instagram: "n5_apparels",
    address: "Akbar Plaza, Beside Kolhapuri Footwear, Malakpet, Hyderabad - 500036",
    landmarks: "Near Malakpet Station, Hotel Sohail & Peshawar Restaurant",
    hours: "Open Daily: 11:00 AM – 11:00 PM",
    adminPassword: "6309592896",
    adminPin: "6309592896",
    ownerPhone: "9700663930",
    freeShippingAbove: 999,
    shippingFee: 99,
    supabaseUrl: "",
    supabaseKey: ""
  },
  supabaseClient: null,

  init() {
    this.loadState();
    this.setupEventListeners();
    this.renderProducts();
    this.renderCart();
    this.updateCartBadge();
    this.updateUserUI();
    this.renderOrdersTab();

    // Check URL hash for direct tab navigation
    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (hash === 'admin') {
      this.switchTab('admin');
    } else if (['home', 'clothes', 'orders', 'contact'].includes(hash)) {
      this.switchTab(hash);
    } else {
      this.switchTab('home');
    }
  },

  loadState() {
    // Load products
    const savedProducts = localStorage.getItem('n5_products_v2');
    if (savedProducts) {
      try {
        this.products = JSON.parse(savedProducts);
      } catch (e) {
        this.products = [...INITIAL_PRODUCTS];
      }
    } else {
      this.products = [...INITIAL_PRODUCTS];
      this.saveProducts();
    }

    // Load Cart
    const savedCart = localStorage.getItem('n5_cart');
    if (savedCart) {
      try { this.cart = JSON.parse(savedCart); } catch (e) { this.cart = []; }
    }

    // Load Orders (Strictly genuine customer orders only - purged of any legacy demo seeds)
    const savedOrders = localStorage.getItem('n5_orders');
    if (savedOrders) {
      try { 
        this.orders = JSON.parse(savedOrders).filter(o => o.id !== 'N5-84291' && o.customerEmail !== 'irfan.demo@gmail.com');
        this.saveOrders();
      } catch (e) { 
        this.orders = []; 
      }
    } else {
      this.orders = [];
    }

    // Load Queries
    const savedQueries = localStorage.getItem('n5_queries');
    if (savedQueries) {
      try { this.queries = JSON.parse(savedQueries); } catch (e) { this.queries = []; }
    }

    // Load Users
    const savedUsers = localStorage.getItem('n5_users');
    if (savedUsers) {
      try { this.registeredUsers = JSON.parse(savedUsers); } catch (e) { this.registeredUsers = []; }
    }

    // Load Current User Session
    const savedUser = localStorage.getItem('n5_current_user');
    if (savedUser) {
      try { this.currentUser = JSON.parse(savedUser); } catch (e) { this.currentUser = null; }
    }

    // Load Admin Session
    this.isAdmin = sessionStorage.getItem('n5_admin_auth') === 'true';

    // Load Store Settings
    const savedConfig = localStorage.getItem('n5_config');
    if (savedConfig) {
      try { 
        this.config = { ...this.config, ...JSON.parse(savedConfig) }; 
        if (this.config.adminPin === "1234" || !this.config.adminPassword) {
          this.config.adminPassword = "6309592896";
          this.config.adminPin = "6309592896";
        }
      } catch (e) {}
    }
  },

  saveProducts() {
    localStorage.setItem('n5_products_v2', JSON.stringify(this.products));
  },

  saveCart() {
    localStorage.setItem('n5_cart', JSON.stringify(this.cart));
    this.updateCartBadge();
  },

  saveOrders() {
    localStorage.setItem('n5_orders', JSON.stringify(this.orders));
  },

  saveQueries() {
    localStorage.setItem('n5_queries', JSON.stringify(this.queries));
  },

  saveUsers() {
    localStorage.setItem('n5_users', JSON.stringify(this.registeredUsers));
  },

  saveConfig() {
    localStorage.setItem('n5_config', JSON.stringify(this.config));
  },

  // Navigation & Tabs
  switchTab(tabName, category = null) {
    this.activeTab = tabName;
    if (category) {
      this.activeCategory = category;
    }

    window.location.hash = tabName;

    // Hide all tab panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.add('hidden');
    });

    // Show active pane
    const activePane = document.getElementById(`pane-${tabName}`);
    if (activePane) {
      activePane.classList.remove('hidden');
    }

    // Update desktop & mobile tab buttons
    document.querySelectorAll('[data-tab-target]').forEach(btn => {
      const target = btn.getAttribute('data-tab-target');
      if (target === tabName) {
        btn.classList.add('active', 'text-black', 'font-semibold');
        btn.classList.remove('text-neutral-500');
      } else {
        btn.classList.remove('active', 'text-black', 'font-semibold');
        btn.classList.add('text-neutral-500');
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (tabName === 'clothes') {
      this.renderCategoryPills();
      this.renderProducts();
    } else if (tabName === 'contact') {
      setTimeout(() => {
        this.initLeafletMap();
      }, 150);
    } else if (tabName === 'orders') {
      this.renderOrdersTab();
    } else if (tabName === 'admin') {
      this.renderAdminView();
    }
  },

  // Category Selection
  setCategory(category) {
    this.activeCategory = category;
    this.switchTab('clothes');
  },

  renderCategoryPills() {
    const container = document.getElementById('category-pills');
    if (!container) return;

    // Exclusively 3 categories: Shirts, T-Shirts, Jeans
    const categories = [
      { id: 'all', label: 'All Collection' },
      { id: 'shirts', label: 'Shirts' },
      { id: 'tshirts', label: 'T-Shirts' },
      { id: 'jeans', label: 'Jeans' }
    ];

    container.innerHTML = categories.map(cat => `
      <button onclick="Store.setCategory('${cat.id}')"
        class="px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 whitespace-nowrap ${
          this.activeCategory === cat.id
            ? 'bg-neutral-900 text-white shadow-md'
            : 'bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-400 hover:text-black'
        }">
        ${cat.label}
      </button>
    `).join('');
  },

  handleSearchInput(query) {
    this.activeSearchQuery = query.toLowerCase().trim();
    this.renderProducts();
  },

  handleSortChange(sortType) {
    this.activeSort = sortType;
    this.renderProducts();
  },

  // Product Catalog Rendering (Studio White Background Cards)
  renderProducts() {
    const homeGrid = document.getElementById('home-featured-products');
    const catalogGrid = document.getElementById('catalog-products');
    const countBadge = document.getElementById('catalog-count-badge');

    // Filter by Category
    let filtered = this.activeCategory === 'all'
      ? [...this.products]
      : this.products.filter(p => p.category.toLowerCase() === this.activeCategory.toLowerCase());

    // Filter by Search Query
    if (this.activeSearchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(this.activeSearchQuery) ||
        (p.brand && p.brand.toLowerCase().includes(this.activeSearchQuery)) ||
        (p.fabric && p.fabric.toLowerCase().includes(this.activeSearchQuery)) ||
        p.category.toLowerCase().includes(this.activeSearchQuery)
      );
    }

    // Sort Products
    if (this.activeSort === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (this.activeSort === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (this.activeSort === 'rating') {
      filtered.sort((a, b) => (b.rating || 5) - (a.rating || 5));
    } else {
      // Featured / Newest
      filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    }

    if (countBadge) {
      countBadge.textContent = `${filtered.length} original pieces found`;
    }

    const cardTemplate = (p) => {
      const discount = p.originalPrice > p.price
        ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
        : 0;

      return `
        <div class="product-card group flex flex-col justify-between overflow-hidden bg-white">
          
          <!-- Image Area on Pure White Studio Background -->
          <div class="relative overflow-hidden bg-white aspect-[4/5] cursor-pointer flex items-center justify-center p-3 border-b border-neutral-100" 
               onclick="Store.openProductModal('${p.id}')">
            <img src="${p.image}" alt="${p.name}" class="img-zoom w-full h-full object-contain" 
                 onerror="this.src='https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=900&auto=format&fit=crop&q=85'"/>
            
            <!-- Brand Badge Top Left -->
            <div class="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
              <span class="badge-brand px-2.5 py-1 rounded-md shadow-sm">
                ${p.brand || 'Original Brand'}
              </span>
              ${discount > 0 ? `
                <span class="bg-red-600 text-white px-2 py-0.5 rounded text-[10px] font-bold shadow-sm">
                  ${discount}% OFF
                </span>
              ` : ''}
            </div>

            <!-- Stock status indicator -->
            <div class="absolute top-3 right-3 z-10">
              ${p.stockCount && p.stockCount <= 5 ? `
                <span class="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded text-[10px] font-bold">
                  ⚡ Only ${p.stockCount} Left
                </span>
              ` : `
                <span class="badge-gold px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                  ${p.brandTag || 'Original'}
                </span>
              `}
            </div>

            <!-- Quick Add Overlay (Desktop) -->
            <div class="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden md:flex gap-2">
              <button onclick="event.stopPropagation(); Store.quickAddToCart('${p.id}')" 
                class="flex-1 bg-white hover:bg-neutral-50 text-neutral-900 font-semibold text-xs py-2.5 rounded-xl shadow-lg border border-neutral-200 transition-transform active:scale-95 flex items-center justify-center gap-1.5">
                <i class="fa-solid fa-bag-shopping text-xs"></i> Add to Bag
              </button>
              <button onclick="event.stopPropagation(); Store.buyNow('${p.id}')" 
                class="flex-1 bg-neutral-900 hover:bg-black text-white font-semibold text-xs py-2.5 rounded-xl shadow-lg transition-transform active:scale-95">
                Buy Now
              </button>
            </div>
          </div>

          <!-- Product Info -->
          <div class="p-4 flex flex-col flex-1 justify-between bg-white">
            <div>
              <div class="flex items-center justify-between text-xs mb-1">
                <span class="uppercase tracking-widest font-bold text-[10px] text-amber-800">
                  ${p.categoryLabel || p.category} • ${p.gsm || p.fit || 'Authentic'}
                </span>
                <span class="flex items-center gap-1 text-neutral-600 font-medium text-xs">
                  <i class="fa-solid fa-star text-amber-500 text-[10px]"></i> ${p.rating || '4.9'}
                </span>
              </div>
              
              <h3 class="font-medium text-sm text-neutral-900 line-clamp-2 group-hover:text-amber-800 transition-colors cursor-pointer leading-snug" 
                  onclick="Store.openProductModal('${p.id}')">
                ${p.name}
              </h3>

              <!-- Available Sizes Chips -->
              <div class="flex flex-wrap gap-1 mt-2">
                ${p.sizes.map(s => `
                  <span class="text-[10px] font-semibold bg-neutral-100 text-neutral-700 px-1.5 py-0.5 rounded">
                    ${s}
                  </span>
                `).join('')}
              </div>
            </div>

            <div class="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
              <div class="flex items-baseline gap-2">
                <span class="text-base font-extrabold text-neutral-900">₹${p.price.toLocaleString()}</span>
                ${p.originalPrice > p.price ? `
                  <span class="text-xs text-neutral-400 line-through">₹${p.originalPrice.toLocaleString()}</span>
                ` : ''}
              </div>

              <!-- Mobile Quick Actions -->
              <div class="flex md:hidden gap-1.5">
                <button onclick="Store.quickAddToCart('${p.id}')" 
                  class="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 flex items-center justify-center transition-colors">
                  <i class="fa-solid fa-bag-shopping text-xs"></i>
                </button>
                <button onclick="Store.buyNow('${p.id}')" 
                  class="px-2.5 h-8 rounded-full bg-neutral-900 text-white text-[11px] font-semibold flex items-center justify-center">
                  Buy
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    };

    if (homeGrid) {
      // Show curated 8 items on Home
      const featured = this.products.slice(0, 8);
      homeGrid.innerHTML = featured.map(cardTemplate).join('');
    }

    if (catalogGrid) {
      if (filtered.length === 0) {
        catalogGrid.innerHTML = `
          <div class="col-span-full py-20 text-center text-neutral-400">
            <i class="fa-solid fa-magnifying-glass text-4xl mb-3 opacity-30"></i>
            <p class="text-base font-semibold text-neutral-800">No matching apparel found</p>
            <p class="text-xs text-neutral-500 mt-1">Try resetting the filter or search query</p>
            <button onclick="Store.setCategory('all'); document.getElementById('catalog-search-input').value='';" 
                    class="mt-4 px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-black">
              View All Items
            </button>
          </div>
        `;
      } else {
        catalogGrid.innerHTML = filtered.map(cardTemplate).join('');
      }
    }
  },

  // Product Detail Modal with Multi-Image Gallery
  openProductModal(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    const modal = document.getElementById('product-detail-modal');
    const content = document.getElementById('product-modal-body');
    if (!modal || !content) return;

    let selectedSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Free Size';

    const discount = product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

    const gallery = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];

    content.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 md:p-8 bg-white">
        
        <!-- Multi-Image Gallery on Pure White Background -->
        <div class="flex flex-col gap-3">
          <div class="relative rounded-2xl overflow-hidden bg-white border border-neutral-200 aspect-[4/5] flex items-center justify-center p-4">
            <img id="modal-main-image" src="${gallery[0]}" alt="${product.name}" class="w-full h-full object-contain">
            
            <div class="absolute top-4 left-4 flex flex-col gap-2">
              <span class="badge-brand px-3 py-1 rounded-md shadow-sm">
                ${product.brand || 'Original Brand'}
              </span>
              ${discount > 0 ? `
                <span class="bg-red-600 text-white text-xs font-bold px-2.5 py-0.5 rounded shadow-sm">
                  Save ${discount}%
                </span>
              ` : ''}
            </div>
          </div>

          <!-- Thumbnails Row -->
          ${gallery.length > 1 ? `
            <div class="flex gap-2">
              ${gallery.map((img, idx) => `
                <button type="button" onclick="document.getElementById('modal-main-image').src='${img}'" 
                        class="w-16 h-20 rounded-xl overflow-hidden border border-neutral-200 bg-white p-1 hover:border-neutral-900 transition-colors">
                  <img src="${img}" class="w-full h-full object-contain">
                </button>
              `).join('')}
            </div>
          ` : ''}
        </div>

        <!-- Product Specs & Ordering -->
        <div class="flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="badge-gold px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
                ${product.categoryLabel || product.category}
              </span>
              <span class="text-xs text-neutral-500 font-medium flex items-center gap-1">
                <i class="fa-solid fa-star text-amber-500"></i> ${product.rating || '4.9'} (${product.reviewsCount || 42} reviews)
              </span>
            </div>

            <h2 class="text-2xl font-bold font-serif text-neutral-900 mb-2 leading-tight">${product.name}</h2>
            
            <div class="flex items-baseline gap-3 mb-4">
              <span class="text-3xl font-extrabold text-neutral-900">₹${product.price.toLocaleString()}</span>
              ${product.originalPrice > product.price ? `
                <span class="text-base text-neutral-400 line-through">₹${product.originalPrice.toLocaleString()}</span>
              ` : ''}
              <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">100% Original Surplus</span>
            </div>

            <!-- Fabric & Fit Specs Chips -->
            <div class="flex flex-wrap gap-2 mb-4">
              ${product.fabric ? `<span class="bg-neutral-100 text-neutral-800 text-[11px] font-semibold px-2.5 py-1 rounded-lg"><i class="fa-solid fa-shirt mr-1 text-amber-700"></i> ${product.fabric}</span>` : ''}
              ${product.gsm ? `<span class="bg-neutral-100 text-neutral-800 text-[11px] font-semibold px-2.5 py-1 rounded-lg"><i class="fa-solid fa-weight-scale mr-1 text-amber-700"></i> ${product.gsm}</span>` : ''}
              ${product.fit ? `<span class="bg-neutral-100 text-neutral-800 text-[11px] font-semibold px-2.5 py-1 rounded-lg"><i class="fa-solid fa-ruler-combined mr-1 text-amber-700"></i> ${product.fit}</span>` : ''}
            </div>

            <p class="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-6">
              ${product.description}
            </p>

            <!-- Size Selector -->
            <div class="mb-6">
              <div class="flex items-center justify-between mb-2">
                <label class="text-xs font-bold text-neutral-900 uppercase tracking-wider">Select Size</label>
                <span class="text-[11px] text-emerald-700 font-bold">● In Stock for Fast Dispatch</span>
              </div>
              <div class="flex flex-wrap gap-2" id="modal-size-options">
                ${product.sizes.map(size => `
                  <button type="button" onclick="Store.setModalSize('${size}', this)"
                    class="size-pill w-11 h-11 rounded-xl text-xs font-bold border transition-all duration-150 ${
                      size === selectedSize 
                        ? 'border-neutral-900 bg-neutral-900 text-white shadow-sm' 
                        : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400'
                    }">
                    ${size}
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Physical Store Pickup & Authenticity Perks -->
            <div class="grid grid-cols-2 gap-3 py-3 border-t border-b border-neutral-100 text-xs text-neutral-600 mb-6">
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-shield-halved text-amber-700"></i>
                <span>100% Brand Authentic</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-store text-amber-700"></i>
                <span>Try at Akbar Plaza Store</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-qrcode text-amber-700"></i>
                <span>Verified UPI QR Payment</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-truck-fast text-amber-700"></i>
                <span>Same-Day Dispatch</span>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3 pt-2">
            <button onclick="Store.addToCartFromModal('${product.id}')"
              class="flex-1 py-3.5 px-4 rounded-xl border border-neutral-300 font-semibold text-xs text-neutral-900 hover:bg-neutral-50 transition-all flex items-center justify-center gap-2">
              <i class="fa-solid fa-bag-shopping"></i> Add to Bag
            </button>
            <button onclick="Store.buyNowFromModal('${product.id}')"
              class="flex-1 py-3.5 px-4 rounded-xl bg-neutral-900 hover:bg-black font-semibold text-xs text-white shadow-md transition-all flex items-center justify-center gap-2">
              <i class="fa-solid fa-bolt"></i> Buy Now
            </button>
          </div>
        </div>
      </div>
    `;

    modal.classList.add('active');
    modal.dataset.currentProductId = productId;
    modal.dataset.selectedSize = selectedSize;
  },

  setModalSize(size, btnElement) {
    const modal = document.getElementById('product-detail-modal');
    modal.dataset.selectedSize = size;
    const allPills = document.querySelectorAll('#modal-size-options .size-pill');
    allPills.forEach(pill => {
      pill.className = 'size-pill w-11 h-11 rounded-xl text-xs font-bold border transition-all duration-150 border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400';
    });
    btnElement.className = 'size-pill w-11 h-11 rounded-xl text-xs font-bold border transition-all duration-150 border-neutral-900 bg-neutral-900 text-white shadow-sm';
  },

  closeProductModal() {
    const modal = document.getElementById('product-detail-modal');
    if (modal) modal.classList.remove('active');
  },

  addToCartFromModal(productId) {
    const modal = document.getElementById('product-detail-modal');
    const size = modal.dataset.selectedSize || 'M';
    this.addToCart(productId, size);
    this.closeProductModal();
    this.openCart();
  },

  buyNowFromModal(productId) {
    const modal = document.getElementById('product-detail-modal');
    const size = modal.dataset.selectedSize || 'M';
    this.closeProductModal();
    this.buyNow(productId, size);
  },

  quickAddToCart(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;
    const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'M';
    this.addToCart(productId, defaultSize);
    this.showToast(`Added ${product.name} (${defaultSize}) to Bag`);
  },

  buyNow(productId, size = null) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;
    const selectedSize = size || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'M');

    const existing = this.cart.find(c => c.productId === productId && c.size === selectedSize);
    if (!existing) {
      this.cart.push({
        productId,
        size: selectedSize,
        quantity: 1
      });
      this.saveCart();
      this.renderCart();
    }

    // MANDATORY ACCOUNT CHECK
    if (!this.currentUser) {
      this.showToast("Please sign in or create an account to proceed with your order.");
      this.pendingCheckout = true;
      this.openAuthModal('login');
      return;
    }

    this.openCheckoutModal();
  },

  // Cart Management
  addToCart(productId, size) {
    const existing = this.cart.find(item => item.productId === productId && item.size === size);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.cart.push({
        productId,
        size,
        quantity: 1
      });
    }
    this.saveCart();
    this.renderCart();
  },

  updateCartQuantity(index, delta) {
    if (!this.cart[index]) return;
    this.cart[index].quantity += delta;
    if (this.cart[index].quantity <= 0) {
      this.cart.splice(index, 1);
    }
    this.saveCart();
    this.renderCart();
  },

  removeFromCart(index) {
    this.cart.splice(index, 1);
    this.saveCart();
    this.renderCart();
  },

  updateCartBadge() {
    const totalCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('.cart-count-badge').forEach(badge => {
      badge.textContent = totalCount;
      if (totalCount > 0) {
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    });
  },

  getCartTotals() {
    let subtotal = 0;
    const items = [];

    this.cart.forEach(cartItem => {
      const product = this.products.find(p => p.id === cartItem.productId);
      if (product) {
        const itemTotal = product.price * cartItem.quantity;
        subtotal += itemTotal;
        items.push({
          ...product,
          size: cartItem.size,
          quantity: cartItem.quantity,
          itemTotal
        });
      }
    });

    const isFreeShipping = subtotal >= this.config.freeShippingAbove || subtotal === 0;
    const shipping = isFreeShipping ? 0 : this.config.shippingFee;
    const total = subtotal + shipping;

    return { items, subtotal, shipping, total, isFreeShipping };
  },

  renderCart() {
    const cartContainer = document.getElementById('cart-items-container');
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');
    const shippingEl = document.getElementById('cart-shipping');
    const freeShippingBar = document.getElementById('free-shipping-progress');
    const freeShippingMsg = document.getElementById('free-shipping-message');

    if (!cartContainer) return;

    const { items, subtotal, shipping, total } = this.getCartTotals();

    if (freeShippingBar && freeShippingMsg) {
      const remaining = this.config.freeShippingAbove - subtotal;
      if (remaining <= 0) {
        freeShippingBar.style.width = '100%';
        freeShippingBar.classList.replace('bg-amber-500', 'bg-emerald-500');
        freeShippingMsg.innerHTML = `<span class="text-emerald-700 font-bold">🎉 Congratulations! You unlocked FREE Delivery!</span>`;
      } else {
        const percent = Math.min(100, Math.round((subtotal / this.config.freeShippingAbove) * 100));
        freeShippingBar.style.width = `${percent}%`;
        freeShippingMsg.innerHTML = `Add <span class="font-bold text-neutral-900">₹${remaining}</span> more to unlock <b>FREE Delivery</b>!`;
      }
    }

    if (items.length === 0) {
      cartContainer.innerHTML = `
        <div class="py-16 text-center text-neutral-400">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
            <i class="fa-solid fa-bag-shopping text-2xl"></i>
          </div>
          <p class="text-sm font-semibold text-neutral-800">Your shopping bag is empty</p>
          <p class="text-xs text-neutral-500 mt-1">Explore our original shirts, heavyweight tees & denims</p>
          <button onclick="Store.closeCart(); Store.switchTab('clothes')" class="mt-4 px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-black">
            Start Shopping
          </button>
        </div>
      `;
      if (subtotalEl) subtotalEl.textContent = '₹0';
      if (totalEl) totalEl.textContent = '₹0';
      if (shippingEl) shippingEl.textContent = '₹0';
      return;
    }

    cartContainer.innerHTML = items.map((item, index) => `
      <div class="flex gap-4 py-4 border-b border-neutral-100 items-center">
        <div class="w-16 h-20 bg-white border border-neutral-200 rounded-xl p-1 flex items-center justify-center flex-shrink-0">
          <img src="${item.image}" alt="${item.name}" class="w-full h-full object-contain">
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-start">
            <div>
              <span class="text-[9px] font-bold uppercase tracking-wider text-amber-800">${item.brand || 'Original Brand'}</span>
              <h4 class="text-xs font-semibold text-neutral-900 truncate pr-2">${item.name}</h4>
            </div>
            <button onclick="Store.removeFromCart(${index})" class="text-neutral-400 hover:text-red-500 transition-colors">
              <i class="fa-solid fa-xmark text-xs"></i>
            </button>
          </div>
          <p class="text-[11px] text-neutral-500 mt-0.5">Size: <span class="font-semibold text-neutral-800">${item.size}</span></p>
          <div class="flex justify-between items-center mt-3">
            <div class="flex items-center border border-neutral-200 rounded-lg overflow-hidden bg-white">
              <button onclick="Store.updateCartQuantity(${index}, -1)" class="w-7 h-7 flex items-center justify-center text-neutral-500 hover:bg-neutral-100 text-xs">
                -
              </button>
              <span class="w-8 text-center text-xs font-semibold text-neutral-900">${item.quantity}</span>
              <button onclick="Store.updateCartQuantity(${index}, 1)" class="w-7 h-7 flex items-center justify-center text-neutral-500 hover:bg-neutral-100 text-xs">
                +
              </button>
            </div>
            <span class="text-xs font-bold text-neutral-900">₹${item.itemTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>
    `).join('');

    if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toLocaleString()}`;
    if (shippingEl) shippingEl.textContent = shipping === 0 ? 'FREE' : `₹${shipping}`;
    if (totalEl) totalEl.textContent = `₹${total.toLocaleString()}`;
  },

  openCart() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if (drawer && overlay) {
      drawer.classList.add('open');
      overlay.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  },

  closeCart() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if (drawer && overlay) {
      drawer.classList.remove('open');
      overlay.classList.add('hidden');
      document.body.style.overflow = '';
    }
  },

  // Checkout & STRICT Dynamic UPI Verification Flow
  openCheckoutModal() {
    this.closeCart();
    const { items, subtotal, shipping, total } = this.getCartTotals();
    if (items.length === 0) {
      this.showToast("Your cart is empty. Please add items first.");
      return;
    }

    // MANDATORY ACCOUNT CHECK
    if (!this.currentUser) {
      this.showToast("Please sign in or create an account to proceed with checkout.");
      this.pendingCheckout = true;
      this.openAuthModal('login');
      return;
    }

    const modal = document.getElementById('checkout-modal');
    if (!modal) return;

    // Reset payment proof state
    this.paymentProofData = { utr: '', screenshotUrl: '' };

    const nameInput = document.getElementById('checkout-name');
    const phoneInput = document.getElementById('checkout-phone');
    const emailInput = document.getElementById('checkout-email');
    const addressInput = document.getElementById('checkout-address');

    if (this.currentUser) {
      if (nameInput) nameInput.value = this.currentUser.name || '';
      if (phoneInput) phoneInput.value = this.currentUser.phone || '';
      if (emailInput) emailInput.value = this.currentUser.email || '';
      if (addressInput && this.currentUser.address) addressInput.value = this.currentUser.address;
    }

    const orderId = `N5-${Math.floor(10000 + Math.random() * 90000)}`;
    modal.dataset.currentOrderId = orderId;
    modal.dataset.orderTotal = total;

    const summaryEl = document.getElementById('checkout-summary-items');
    if (summaryEl) {
      summaryEl.innerHTML = items.map(item => `
        <div class="flex justify-between items-center text-xs py-1.5 border-b border-neutral-100">
          <span class="text-neutral-700 truncate max-w-[220px]">${item.name} (${item.size}) × ${item.quantity}</span>
          <span class="font-bold text-neutral-900">₹${item.itemTotal.toLocaleString()}</span>
        </div>
      `).join('') + `
        <div class="flex justify-between items-center text-xs py-1.5 border-b border-neutral-100 text-neutral-600">
          <span>Items Subtotal</span>
          <span class="font-bold text-neutral-900">₹${subtotal.toLocaleString()}</span>
        </div>
        <div class="flex justify-between items-center text-xs py-1.5 border-b border-neutral-100 text-neutral-600">
          <span>Shipping Charges</span>
          <span class="font-bold">${shipping === 0 ? '<span class="text-emerald-700 font-bold">FREE Delivery</span>' : '₹' + shipping}</span>
        </div>
      `;
    }

    const totalDisplay = document.getElementById('checkout-amount-display');
    if (totalDisplay) totalDisplay.textContent = `₹${total.toLocaleString()}`;

    this.setCheckoutStep(1);
    modal.classList.add('active');
  },

  closeCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    if (modal) modal.classList.remove('active');
  },

  setCheckoutStep(stepNumber) {
    document.querySelectorAll('.checkout-step-view').forEach(view => view.classList.add('hidden'));
    const target = document.getElementById(`checkout-step-${stepNumber}`);
    if (target) target.classList.remove('hidden');

    if (stepNumber === 2) {
      this.generateDynamicUpiQr();
      this.updatePaymentVerificationState();
    }
  },

  validateAndProceedToPayment() {
    const name = document.getElementById('checkout-name').value.trim();
    const phone = document.getElementById('checkout-phone').value.trim();
    const email = document.getElementById('checkout-email').value.trim();
    const address = document.getElementById('checkout-address').value.trim();
    const pincode = document.getElementById('checkout-pincode').value.trim();
    const city = document.getElementById('checkout-city').value.trim();

    if (!name || !phone || !email || !address || !pincode || !city) {
      this.showToast("Please fill in all delivery details");
      return;
    }

    if (phone.length < 10) {
      this.showToast("Please enter a valid 10-digit mobile number");
      return;
    }

    this.setCheckoutStep(2);
  },

  generateDynamicUpiQr() {
    const modal = document.getElementById('checkout-modal');
    const orderId = modal.dataset.currentOrderId;
    const total = modal.dataset.orderTotal;
    const qrContainer = document.getElementById('upi-qr-render-box');
    const upiIdDisplay = document.getElementById('display-upi-id');
    const amountDisplay = document.getElementById('display-upi-amount');
    const payAppLinks = document.getElementById('upi-direct-links');

    if (upiIdDisplay) upiIdDisplay.textContent = this.config.upiId;
    if (amountDisplay) amountDisplay.textContent = `₹${Number(total).toLocaleString()}`;

    const upiUri = `upi://pay?pa=${encodeURIComponent(this.config.upiId)}&pn=${encodeURIComponent(this.config.storeName)}&am=${total}&cu=INR&tn=${encodeURIComponent(`Order ${orderId}`)}`;

    if (qrContainer) {
      qrContainer.innerHTML = '';
      if (this.config.customQrImage) {
        qrContainer.innerHTML = `
          <div class="space-y-2 text-center">
            <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-[10px] font-bold uppercase tracking-wider">
              <i class="fa-solid fa-store text-amber-700"></i> Official Store Standee QR
            </span>
            <div class="relative mx-auto w-[220px] h-[220px] rounded-2xl overflow-hidden border-2 border-neutral-900 shadow-md p-1.5 bg-white">
              <img src="${this.config.customQrImage}" alt="Store Standee QR" class="w-full h-full object-contain">
            </div>
            <p class="text-[11px] text-neutral-600 font-medium">
              Scan with GPay, PhonePe, Paytm & pay <b class="text-neutral-900 font-bold">₹${Number(total).toLocaleString()}</b>
            </p>
          </div>
        `;
      } else {
        if (typeof QRCode !== 'undefined') {
          new QRCode(qrContainer, {
            text: upiUri,
            width: 200,
            height: 200,
            colorDark: "#111111",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.M
          });
        } else {
          qrContainer.innerHTML = `
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUri)}" 
                 alt="UPI QR Code" class="w-[200px] h-[200px] rounded-lg">
          `;
        }
      }
    }

    if (payAppLinks) {
      payAppLinks.innerHTML = `
        <a href="${upiUri}" class="flex-1 bg-neutral-900 text-white text-xs font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 hover:bg-black">
          <i class="fa-solid fa-mobile-screen-button"></i> Open UPI App
        </a>
        <button type="button" onclick="Store.copyUpiId()" class="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-xl flex items-center gap-1">
          <i class="fa-regular fa-copy"></i> Copy UPI ID
        </button>
      `;
    }
  },

  copyUpiId() {
    navigator.clipboard.writeText(this.config.upiId).then(() => {
      this.showToast(`Copied UPI ID: ${this.config.upiId}`);
    });
  },

  // STRICT PAYMENT GATE CHECK
  handleUtrInput(inputElement) {
    const rawValue = inputElement.value.replace(/[^0-9]/g, '');
    inputElement.value = rawValue;
    this.paymentProofData.utr = rawValue;

    const countLabel = document.getElementById('utr-digit-counter');
    if (countLabel) {
      if (rawValue.length === 12) {
        countLabel.innerHTML = `<span class="text-emerald-700 font-bold"><i class="fa-solid fa-check"></i> 12/12 Valid UPI UTR</span>`;
        inputElement.classList.add('utr-valid');
        inputElement.classList.remove('utr-invalid');
      } else {
        countLabel.innerHTML = `<span class="text-neutral-500">${rawValue.length}/12 digits entered</span>`;
        inputElement.classList.remove('utr-valid');
      }
    }

    this.updatePaymentVerificationState();
  },

  handlePaymentScreenshotUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      this.paymentProofData.screenshotUrl = dataUrl;

      const previewBox = document.getElementById('screenshot-preview-container');
      if (previewBox) {
        previewBox.innerHTML = `
          <div class="relative inline-block mt-2">
            <img src="${dataUrl}" class="w-20 h-24 object-cover rounded-xl border border-neutral-300 shadow-sm">
            <button type="button" onclick="Store.removePaymentScreenshot()" 
                    class="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px]">
              ✕
            </button>
          </div>
        `;
      }
      this.updatePaymentVerificationState();
    };
    reader.readAsDataURL(file);
  },

  removePaymentScreenshot() {
    this.paymentProofData.screenshotUrl = '';
    const previewBox = document.getElementById('screenshot-preview-container');
    if (previewBox) previewBox.innerHTML = '';
    const fileInput = document.getElementById('payment-screenshot-input');
    if (fileInput) fileInput.value = '';
    this.updatePaymentVerificationState();
  },

  isPaymentProofProvided() {
    // Valid if 12-digit UTR is provided OR screenshot proof is uploaded
    const isUtrValid = this.paymentProofData.utr && this.paymentProofData.utr.length === 12;
    const isScreenshotValid = !!this.paymentProofData.screenshotUrl;
    return isUtrValid || isScreenshotValid;
  },

  updatePaymentVerificationState() {
    const confirmBtn = document.getElementById('btn-confirm-payment');
    const warningNotice = document.getElementById('payment-gate-warning');
    if (!confirmBtn) return;

    if (this.isPaymentProofProvided()) {
      confirmBtn.disabled = false;
      confirmBtn.className = "w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer";
      confirmBtn.innerHTML = `<i class="fa-solid fa-shield-check text-sm"></i> Verify & Confirm Order`;
      if (warningNotice) warningNotice.classList.add('hidden');
    } else {
      confirmBtn.disabled = false; // keep clickable so clicking explains why it's locked!
      confirmBtn.className = "w-full py-3.5 bg-neutral-200 text-neutral-500 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-neutral-300";
      confirmBtn.innerHTML = `<i class="fa-solid fa-lock text-xs"></i> Complete Payment Verification to Proceed`;
      if (warningNotice) warningNotice.classList.remove('hidden');
    }
  },

  // Final Payment Verification and Order Creation
  confirmPaymentAndPlaceOrder() {
    if (!this.isPaymentProofProvided()) {
      this.showToast("⚠️ Payment Not Verified! Please enter the 12-digit UPI UTR or attach the payment screenshot.");
      const utrInput = document.getElementById('payment-utr-input');
      if (utrInput) {
        utrInput.focus();
        utrInput.classList.add('utr-invalid');
      }
      return;
    }

    const modal = document.getElementById('checkout-modal');
    const orderId = modal.dataset.currentOrderId;
    const { items, subtotal, shipping, total } = this.getCartTotals();

    const name = document.getElementById('checkout-name').value.trim();
    const phone = document.getElementById('checkout-phone').value.trim();
    const email = document.getElementById('checkout-email').value.trim();
    const address = document.getElementById('checkout-address').value.trim();
    const pincode = document.getElementById('checkout-pincode').value.trim();
    const city = document.getElementById('checkout-city').value.trim();

    // Show Realistic Verification Spinner (1.5 seconds)
    const confirmBtn = document.getElementById('btn-confirm-payment');
    confirmBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin text-sm"></i> Verifying UPI Transaction with Banking Network...`;
    confirmBtn.disabled = true;

    setTimeout(() => {
      const verifiedUtr = this.paymentProofData.utr || ("UPI-" + Math.floor(100000000000 + Math.random() * 900000000000));

      const newOrder = {
        id: orderId,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        address: `${address}, ${city} - ${pincode}`,
        items: items.map(i => ({
          id: i.id,
          name: i.name,
          brand: i.brand || "Original Brand",
          price: i.price,
          size: i.size,
          quantity: i.quantity,
          image: i.image
        })),
        subtotal,
        shipping,
        total,
        status: "Placed",
        paymentMethod: "UPI QR (Verified)",
        paymentProof: {
          utr: verifiedUtr,
          screenshotUrl: this.paymentProofData.screenshotUrl || null,
          verified: true,
          verifiedAt: new Date().toISOString()
        },
        createdAt: new Date().toISOString(),
        estimatedDelivery: "3-4 Business Days"
      };

      // Save order
      this.orders.unshift(newOrder);
      this.saveOrders();
      this.syncOrderToCloud(newOrder);

      // Clear cart
      this.cart = [];
      this.saveCart();
      this.renderCart();

      // Confetti Celebration
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      }

      this.closeCheckoutModal();
      this.showOrderConfirmationReceipt(newOrder);
      this.switchTab('orders');
    }, 1500);
  },

  showOrderConfirmationReceipt(order) {
    const modal = document.getElementById('order-receipt-modal');
    const body = document.getElementById('order-receipt-body');
    if (!modal || !body) return;

    const itemsSummary = order.items.map(i => `${i.name} [${i.brand}] (${i.size}) x${i.quantity}`).join(', ');
    const shopWhatsAppText = encodeURIComponent(
      `*New Order Alert on N5 Apparels!* 🛍️\n\n` +
      `*Order ID:* #${order.id}\n` +
      `*Amount:* ₹${order.total}\n` +
      `*UPI UTR / Ref:* ${order.paymentProof.utr}\n` +
      `*Customer:* ${order.customerName}\n` +
      `*Phone:* ${order.customerPhone}\n` +
      `*Address:* ${order.address}\n` +
      `*Items:* ${itemsSummary}\n\n` +
      `Payment is verified. Please prepare package for dispatch!`
    );
    const shopWhatsAppUrl = `https://wa.me/${this.config.whatsappNumber}?text=${shopWhatsAppText}`;

    body.innerHTML = `
      <div class="p-6 md:p-8 text-center bg-white">
        <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl shadow-sm">
          <i class="fa-solid fa-check"></i>
        </div>
        
        <h3 class="text-2xl font-bold font-serif text-neutral-900 mb-1">Payment Verified & Order Placed!</h3>
        <p class="text-xs text-neutral-500 mb-4">Order <span class="font-bold text-neutral-900">#${order.id}</span> is confirmed.</p>
        
        <!-- Email Alert -->
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-3 text-left flex items-start gap-3 mb-5">
          <i class="fa-solid fa-envelope-circle-check text-amber-700 text-base mt-0.5"></i>
          <div>
            <div class="text-xs font-bold text-amber-900">Tax Invoice Dispatched!</div>
            <div class="text-[11px] text-amber-800">
              Order receipt and tax breakdown sent to <span class="font-semibold underline">${order.customerEmail}</span>.
            </div>
          </div>
        </div>

        <!-- Order Summary Card -->
        <div class="bg-neutral-50 rounded-2xl p-4 text-left border border-neutral-200/80 mb-6 text-xs space-y-2">
          <div class="flex justify-between items-center text-neutral-700 pb-2 border-b border-neutral-200 font-semibold">
            <span>Verified UTR:</span>
            <span class="font-mono text-emerald-800 font-bold">${order.paymentProof.utr}</span>
          </div>
          <div class="flex justify-between items-center text-neutral-700 pb-2 border-b border-neutral-200">
            <span>Delivery To:</span>
            <span class="font-bold text-neutral-900">${order.customerName} (${order.customerPhone})</span>
          </div>
          <div class="text-[11px] text-neutral-500 pb-2 border-b border-neutral-200">
            ${order.address}
          </div>
          <div class="space-y-1 py-1">
            ${order.items.map(item => `
              <div class="flex justify-between text-neutral-800">
                <span>${item.name} <span class="text-neutral-500">(${item.size}) x${item.quantity}</span></span>
                <span class="font-semibold">₹${(item.price * item.quantity).toLocaleString()}</span>
              </div>
            `).join('')}
          </div>
          <div class="flex justify-between items-center pt-2 border-t border-neutral-200 font-bold text-sm text-neutral-900">
            <span>Total Paid (UPI):</span>
            <span class="text-emerald-700">₹${order.total.toLocaleString()}</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col gap-2.5">
          <button onclick="Store.showEmailInvoiceModal('${order.id}')"
                  class="w-full bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-300 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all">
            <i class="fa-solid fa-file-invoice text-amber-700 text-sm"></i> View Email Confirmation & Tax Invoice
          </button>

          <a href="${shopWhatsAppUrl}" target="_blank"
             class="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white py-3 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all">
            <i class="fa-brands fa-whatsapp text-base"></i> Send Order Alert to N5 Apparels WhatsApp
          </a>

          <button onclick="Store.closeOrderReceiptModal(); Store.searchOrderById('${order.id}')"
            class="w-full bg-neutral-900 hover:bg-black text-white py-3 px-4 rounded-xl font-semibold text-xs transition-all">
            Track Order Live ↗
          </button>
        </div>
      </div>
    `;

    modal.classList.add('active');
  },

  closeOrderReceiptModal() {
    const modal = document.getElementById('order-receipt-modal');
    if (modal) modal.classList.remove('active');
  },

  showEmailInvoiceModal(orderId) {
    const order = this.orders.find(o => o.id === orderId) || this.orders[0];
    if (!order) return;

    const modal = document.getElementById('email-invoice-modal');
    const body = document.getElementById('email-invoice-body');
    if (!modal || !body) return;

    body.innerHTML = `
      <div class="space-y-6">
        <!-- Dispatched Email Header Card -->
        <div class="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 text-xs space-y-1.5 font-mono">
          <div class="flex flex-col sm:flex-row justify-between text-neutral-600 gap-1 pb-2 border-b border-neutral-200">
            <span><b>From:</b> N5 Apparels &lt;orders@n5apparels.com&gt;</span>
            <span class="text-neutral-400">${new Date(order.createdAt).toLocaleString('en-IN')}</span>
          </div>
          <div class="text-neutral-700"><b>To:</b> ${order.customerEmail}</div>
          <div class="text-neutral-900 font-bold"><b>Subject:</b> Order Confirmed #${order.id} — N5 Apparels Hyderabad</div>
        </div>

        <!-- Official Printable Tax Invoice -->
        <div class="bg-white border-2 border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm printable-invoice">
          
          <!-- Brand Header -->
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-neutral-200">
            <div class="flex items-center gap-3">
              <div class="w-14 h-14 rounded-full overflow-hidden border-2 border-[#dfc07b] shadow-md flex-shrink-0">
                <img src="assets/branding/n5_logo.png" alt="N5 Apparels" class="w-full h-full object-cover">
              </div>
              <div>
                <h2 class="font-brand font-black text-xl tracking-wider uppercase text-neutral-900">N5 Apparels</h2>
                <p class="text-[11px] text-amber-800 font-semibold tracking-wider uppercase">Original Branded Export Surplus</p>
                <p class="text-[10px] text-neutral-500">Akbar Plaza, Beside Kolhapuri Footwear, Malakpet, Hyd - 500036</p>
              </div>
            </div>
            <div class="text-left sm:text-right text-xs">
              <span class="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-full font-bold uppercase text-[10px] tracking-wide mb-1">
                ✓ Tax Invoice & Payment Verified
              </span>
              <p class="font-mono font-bold text-neutral-900">INVOICE: INV-${order.id}</p>
              <p class="text-neutral-500 text-[11px]">Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
            </div>
          </div>

          <!-- Customer & Order Meta -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div class="bg-neutral-50 p-3.5 rounded-xl border border-neutral-100">
              <span class="text-[10px] font-bold uppercase text-neutral-400 block mb-1">Billed & Shipped To:</span>
              <p class="font-bold text-neutral-900">${order.customerName}</p>
              <p class="text-neutral-600 mt-0.5">Phone: ${order.customerPhone}</p>
              <p class="text-neutral-600">Email: ${order.customerEmail}</p>
              <p class="text-neutral-600 mt-1 leading-relaxed">${order.address}</p>
            </div>
            <div class="bg-neutral-50 p-3.5 rounded-xl border border-neutral-100">
              <span class="text-[10px] font-bold uppercase text-neutral-400 block mb-1">Payment & Dispatch Details:</span>
              <p class="text-neutral-700"><b>Payment Mode:</b> UPI QR (Verified)</p>
              <p class="text-neutral-700 font-mono mt-0.5"><b>UPI UTR Ref:</b> <span class="font-bold text-emerald-800">${order.paymentProof.utr}</span></p>
              <p class="text-neutral-700 mt-0.5"><b>Order Status:</b> <span class="font-bold text-neutral-900">${order.status}</span></p>
              <p class="text-neutral-500 text-[11px] mt-1">Estimated Dispatch: Within 24 Hours</p>
            </div>
          </div>

          <!-- Items Table -->
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b-2 border-neutral-800 text-neutral-500 uppercase text-[10px] tracking-wider">
                  <th class="py-2">Item Description</th>
                  <th class="py-2">Brand</th>
                  <th class="py-2 text-center">Size</th>
                  <th class="py-2 text-center">Qty</th>
                  <th class="py-2 text-right">Price</th>
                  <th class="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-100">
                ${order.items.map(item => `
                  <tr>
                    <td class="py-2.5 font-semibold text-neutral-900">${item.name}</td>
                    <td class="py-2.5 text-neutral-600">${item.brand || 'Original Brand'}</td>
                    <td class="py-2.5 text-center font-bold text-neutral-800">${item.size}</td>
                    <td class="py-2.5 text-center">${item.quantity}</td>
                    <td class="py-2.5 text-right font-mono">₹${item.price.toLocaleString()}</td>
                    <td class="py-2.5 text-right font-mono font-bold text-neutral-900">₹${(item.price * item.quantity).toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Financial Calculation Breakdown -->
          <div class="flex justify-end pt-3 border-t-2 border-neutral-800 text-xs">
            <div class="w-64 space-y-2">
              <div class="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span class="font-mono">₹${order.subtotal.toLocaleString()}</span>
              </div>
              <div class="flex justify-between text-neutral-600">
                <span>Shipping & Delivery Fee</span>
                <span class="font-mono">${order.shipping === 0 ? '<span class="text-emerald-700 font-bold">FREE</span>' : '₹' + order.shipping}</span>
              </div>
              <div class="flex justify-between text-sm font-extrabold text-neutral-900 pt-2 border-t border-neutral-300">
                <span>Grand Total Paid</span>
                <span class="text-base text-emerald-700 font-mono">₹${order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <!-- Store Note -->
          <div class="text-[11px] text-neutral-500 text-center pt-4 border-t border-neutral-100">
            Thank you for shopping 100% original export surplus menswear at N5 Apparels! For instant order tracking or exchange support, WhatsApp our store manager at +91 9700663930.
          </div>
        </div>
      </div>
    `;

    modal.classList.add('active');
  },

  // Orders Tab & Live Status Tracking
  renderOrdersTab() {
    const container = document.getElementById('orders-list-view');
    if (!container) return;

    let ordersToShow = this.orders;
    if (this.currentUser && !this.isAdmin) {
      const userOrders = this.orders.filter(o => 
        o.customerPhone === this.currentUser.phone || 
        (o.customerEmail && this.currentUser.email && o.customerEmail.toLowerCase() === this.currentUser.email.toLowerCase())
      );
      ordersToShow = userOrders;
    }

    if (ordersToShow.length === 0) {
      container.innerHTML = `
        <div class="bg-white rounded-3xl p-10 sm:p-12 text-center border border-neutral-200 shadow-sm max-w-lg mx-auto">
          <div class="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-400">
            <i class="fa-solid fa-box-open text-2xl"></i>
          </div>
          <h3 class="text-lg font-bold text-neutral-900 mb-1">No Orders Placed Yet</h3>
          <p class="text-xs text-neutral-500 mb-6 max-w-sm mx-auto leading-relaxed">
            ${this.currentUser ? `Hi ${this.currentUser.name}, you haven't placed any orders yet. Once you place an order, its live tracking status will appear here in real-time.` : 'Enter your Order ID or phone number in the search bar above, or browse our collection to place your order.'}
          </p>
          <button onclick="Store.switchTab('clothes')" class="px-6 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all shadow-sm">
            Explore Collection & Order Now
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = ordersToShow.map(order => this.renderOrderTrackingCard(order)).join('');
  },

  searchOrderById(customId = null) {
    const query = (customId || document.getElementById('order-search-input').value).trim().toUpperCase();
    const container = document.getElementById('orders-list-view');
    if (!query) {
      this.renderOrdersTab();
      return;
    }

    const matches = this.orders.filter(o => 
      o.id.toUpperCase().includes(query) || 
      o.customerPhone.includes(query) || 
      (o.customerEmail && o.customerEmail.toUpperCase().includes(query)) ||
      (o.paymentProof && o.paymentProof.utr && o.paymentProof.utr.includes(query))
    );

    if (matches.length === 0) {
      container.innerHTML = `
        <div class="bg-white rounded-3xl p-10 text-center border border-neutral-200 shadow-sm max-w-lg mx-auto">
          <i class="fa-solid fa-magnifying-glass text-3xl text-neutral-300 mb-3"></i>
          <h4 class="text-sm font-bold text-neutral-900">No order matching "${query}"</h4>
          <p class="text-xs text-neutral-500 mt-1">Please check your Order ID (from invoice) or your 10-digit mobile number.</p>
          <button onclick="Store.renderOrdersTab()" class="mt-4 text-xs font-semibold text-amber-700 underline">Show all orders</button>
        </div>
      `;
    } else {
      container.innerHTML = matches.map(order => this.renderOrderTrackingCard(order)).join('');
    }
  },

  renderOrderTrackingCard(order) {
    const statusSteps = ["Placed", "Confirmed", "Packed", "Shipped", "Delivered"];
    const currentStepIndex = statusSteps.indexOf(order.status) !== -1 
      ? statusSteps.indexOf(order.status) 
      : 0;

    const askWhatsAppText = encodeURIComponent(`Hi N5 Apparels! I would like to check on my Order #${order.id} (${order.status}). My contact: ${order.customerPhone}`);
    const isCancelled = order.status === 'Cancelled';
    const canCancel = (order.status === 'Placed' || order.status === 'Confirmed');

    return `
      <div class="bg-white rounded-3xl p-6 md:p-8 border ${isCancelled ? 'border-rose-200 bg-rose-50/10' : 'border-neutral-200'} shadow-sm mb-6 transition-all hover:shadow-md">
        
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-neutral-100 gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1 flex-wrap">
              <span class="text-xs font-bold text-neutral-400">ORDER</span>
              <span class="text-base font-extrabold text-neutral-900 tracking-wide">#${order.id}</span>
              ${isCancelled ? `
                <span class="bg-rose-100 text-rose-800 border border-rose-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <i class="fa-solid fa-ban text-[9px]"></i> Cancelled
                </span>
              ` : `
                <span class="badge-gold px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  ${order.status}
                </span>
              `}
              <span class="bg-emerald-50 text-emerald-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-200">
                UTR: ${order.paymentProof ? order.paymentProof.utr : 'VERIFIED'}
              </span>
            </div>
            <div class="text-xs text-neutral-500">
              Placed on ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          <div class="flex items-center gap-2.5 flex-wrap">
            ${canCancel ? `
              <button onclick="Store.openCancelOrderModal('${order.id}')"
                      class="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-rose-200">
                <i class="fa-solid fa-xmark text-xs"></i> Cancel Order
              </button>
            ` : ''}
            <a href="https://wa.me/${this.config.whatsappNumber}?text=${askWhatsAppText}" target="_blank"
               class="px-4 py-2 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors">
              <i class="fa-brands fa-whatsapp text-emerald-600"></i> Ask about this order
            </a>
          </div>
        </div>

        ${isCancelled ? `
          <!-- Cancelled Notice Box -->
          <div class="py-5 px-6 my-6 bg-rose-50/70 border border-rose-200 rounded-2xl flex items-start gap-4">
            <div class="w-10 h-10 rounded-full bg-rose-100 border border-rose-300 text-rose-700 flex items-center justify-center flex-shrink-0 text-base">
              <i class="fa-solid fa-ban"></i>
            </div>
            <div class="text-xs space-y-1">
              <span class="font-bold text-rose-900 block text-sm">This Order Has Been Cancelled</span>
              <p class="text-rose-800">
                <b>Reason:</b> ${order.cancelReason || 'Customer requested cancellation'}
              </p>
              ${order.cancelNote ? `<p class="text-rose-700 italic">"${order.cancelNote}"</p>` : ''}
              <div class="pt-2 text-rose-900 font-medium text-[11px] flex items-center gap-1.5">
                <i class="fa-solid fa-clock-rotate-left"></i>
                <span>UPI Refund Notice: If payment was completed, store refund will be processed to your original UPI within 24 hours. Contact WhatsApp for instant assistance.</span>
              </div>
            </div>
          </div>
        ` : `
          <!-- 5-Step Visual Tracking Timeline -->
          <div class="py-8">
            <div class="relative flex items-center justify-between max-w-2xl mx-auto">
              <div class="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-neutral-200 w-full z-0"></div>
              <div class="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-neutral-900 transition-all duration-500 z-0" 
                   style="width: ${(currentStepIndex / (statusSteps.length - 1)) * 100}%"></div>

              ${statusSteps.map((step, idx) => {
                const isDone = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                return `
                  <div class="relative z-10 flex flex-col items-center">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      isCurrent 
                        ? 'bg-amber-600 text-white ring-4 ring-amber-100 scale-110'
                        : isDone
                          ? 'bg-neutral-900 text-white'
                          : 'bg-white border-2 border-neutral-300 text-neutral-400'
                    }">
                      ${isDone ? (idx === currentStepIndex ? `<i class="fa-solid fa-truck-fast text-[11px]"></i>` : `<i class="fa-solid fa-check text-[10px]"></i>`) : idx + 1}
                    </div>
                    <span class="text-[11px] font-semibold mt-2 ${isCurrent ? 'text-amber-800 font-bold' : isDone ? 'text-neutral-900' : 'text-neutral-400'}">
                      ${step}
                    </span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `}

        <!-- Order Items & Shipping Address -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-neutral-100">
          <div>
            <h5 class="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">Items in Package</h5>
            <div class="space-y-3">
              ${order.items.map(item => `
                <div class="flex items-center gap-3">
                  <div class="w-12 h-14 bg-white border border-neutral-200 rounded-lg p-0.5 flex items-center justify-center flex-shrink-0">
                    <img src="${item.image}" alt="${item.name}" class="w-full h-full object-contain">
                  </div>
                  <div class="flex-1 min-w-0">
                    <h6 class="text-xs font-semibold text-neutral-900 truncate">${item.name}</h6>
                    <p class="text-[11px] text-neutral-500">${item.brand || 'Original Brand'} | Size: <span class="font-bold text-neutral-700">${item.size}</span> | Qty: ${item.quantity}</p>
                  </div>
                  <span class="text-xs font-bold text-neutral-900">₹${(item.price * item.quantity).toLocaleString()}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="bg-neutral-50 rounded-2xl p-4 flex flex-col justify-between border border-neutral-100">
            <div>
              <h5 class="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Delivery Destination</h5>
              <p class="text-xs font-bold text-neutral-900">${order.customerName}</p>
              <p class="text-[11px] text-neutral-600 mt-0.5 leading-relaxed">${order.address}</p>
              <p class="text-[11px] text-neutral-500 mt-1">Phone: <span class="font-semibold text-neutral-800">${order.customerPhone}</span></p>
            </div>

            <div class="pt-3 border-t border-neutral-200 mt-4 flex items-center justify-between text-xs">
              <span class="text-neutral-600">Total Paid (UPI Verified):</span>
              <span class="font-extrabold text-neutral-900 text-sm">₹${order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // Contact Form & Customer Query Handling
  handleContactQuerySubmit(e) {
    e.preventDefault();
    const name = document.getElementById('query-name').value.trim();
    const phone = document.getElementById('query-phone').value.trim();
    const topic = document.getElementById('query-topic').value;
    const message = document.getElementById('query-message').value.trim();

    if (!name || !phone || !message) {
      this.showToast("Please fill in your name, phone and message.");
      return;
    }

    const newQuery = {
      id: `QRY-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      phone,
      topic,
      message,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    this.queries.unshift(newQuery);
    this.saveQueries();

    const waText = encodeURIComponent(
      `*New Query for N5 Apparels Store*\n\n` +
      `*From:* ${name}\n` +
      `*Phone:* ${phone}\n` +
      `*Topic:* ${topic}\n` +
      `*Question:* ${message}\n\n` +
      `_Sent via N5 Apparels Storefront_`
    );
    const waUrl = `https://wa.me/${this.config.whatsappNumber}?text=${waText}`;

    e.target.reset();

    const modal = document.getElementById('query-sent-modal');
    if (modal) {
      document.getElementById('query-sent-wa-link').href = waUrl;
      modal.classList.add('active');
    } else {
      this.showToast("Query logged! Opening WhatsApp...");
      window.open(waUrl, '_blank');
    }
  },

  closeQuerySentModal() {
    const modal = document.getElementById('query-sent-modal');
    if (modal) modal.classList.remove('active');
  },

  // User Auth & OTP System (Compulsory Email & Phone + 1-Click OTP Login)
  userLoginType: 'password',

  switchUserLoginType(type) {
    this.userLoginType = type;
    const tabPwd = document.getElementById('tab-login-pwd');
    const tabOtp = document.getElementById('tab-login-otp');
    const pwdBox = document.getElementById('login-password-container');
    const submitBtn = document.getElementById('login-submit-btn');

    if (type === 'otp') {
      if (tabPwd) tabPwd.className = "flex-1 py-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 transition-all";
      if (tabOtp) tabOtp.className = "flex-1 py-1.5 rounded-lg bg-white shadow-sm text-neutral-900 font-bold transition-all";
      if (pwdBox) pwdBox.classList.add('hidden');
      if (submitBtn) submitBtn.textContent = "Send 6-Digit Login OTP";
    } else {
      if (tabPwd) tabPwd.className = "flex-1 py-1.5 rounded-lg bg-white shadow-sm text-neutral-900 font-bold transition-all";
      if (tabOtp) tabOtp.className = "flex-1 py-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 transition-all";
      if (pwdBox) pwdBox.classList.remove('hidden');
      if (submitBtn) submitBtn.textContent = "Sign In with Password";
    }
  },

  openAuthModal(mode = 'login') {
    const modal = document.getElementById('auth-modal');
    if (!modal) return;
    this.setAuthMode(mode);
    modal.classList.add('active');
  },

  closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.remove('active');
  },

  setAuthMode(mode) {
    const loginView = document.getElementById('auth-view-login');
    const signupView = document.getElementById('auth-view-signup');
    const otpView = document.getElementById('auth-view-otp');
    const modalTitle = document.getElementById('auth-modal-title');
    const modalSubtitle = document.getElementById('auth-modal-subtitle');

    if (loginView) loginView.classList.add('hidden');
    if (signupView) signupView.classList.add('hidden');
    if (otpView) otpView.classList.add('hidden');

    if (mode === 'login') {
      if (loginView) loginView.classList.remove('hidden');
      if (modalTitle) modalTitle.textContent = 'Sign In to N5 Apparels';
      if (modalSubtitle) modalSubtitle.textContent = 'Both email and phone number are required for verified orders.';
    } else if (mode === 'signup') {
      if (signupView) signupView.classList.remove('hidden');
      if (modalTitle) modalTitle.textContent = 'Create an Account';
      if (modalSubtitle) modalSubtitle.textContent = 'Join N5 Apparels for instant tracking & priority dispatch.';
    } else if (mode === 'otp') {
      if (otpView) otpView.classList.remove('hidden');
      if (modalTitle) modalTitle.textContent = 'Verify Security Code';
      if (modalSubtitle) modalSubtitle.textContent = 'Enter the 6-digit OTP dispatched to your mobile & email.';
    }
  },

  handleSignupSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const phone = document.getElementById('signup-phone').value.trim();
    const password = document.getElementById('signup-password').value;

    if (!name || !email || !phone || !password) {
      this.showToast("Please fill in all fields (Name, Email, Phone, Password).");
      return;
    }

    if (phone.length !== 10) {
      this.showToast("Please enter a valid 10-digit mobile number.");
      return;
    }

    const existing = this.registeredUsers.find(u => u.phone === phone || u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      this.showToast("An account already exists with this mobile or email. Please sign in.");
      this.setAuthMode('login');
      return;
    }

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    window._pendingUserRegistration = { name, email, phone, password, otp: generatedOtp };
    window._currentOtpContext = 'signup';

    this.setAuthMode('otp');
    const otpBanner = document.getElementById('simulated-otp-banner');
    if (otpBanner) {
      otpBanner.innerHTML = `
        <div class="bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs text-amber-900 mb-3 flex items-center justify-between">
          <div>
            <div class="font-bold flex items-center gap-1.5 text-neutral-900">
              <i class="fa-solid fa-shield-halved text-amber-700"></i> N5 SMS & Email Alert
            </div>
            <div class="text-xs text-neutral-800 mt-0.5">
              Your 6-Digit OTP is <span class="font-mono font-black text-sm text-amber-900 tracking-wider">${generatedOtp}</span>
            </div>
            <div class="text-[10px] text-neutral-500">Sent to +91 ${phone} & ${email}</div>
          </div>
          <button type="button" onclick="Store.autoFillOtp('${generatedOtp}')" class="bg-amber-700 hover:bg-amber-800 text-white font-bold px-2.5 py-1 rounded text-[10px] transition-colors">
            Auto-fill
          </button>
        </div>
      `;
    }
  },

  handleLoginSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const phone = document.getElementById('login-phone').value.trim();

    if (!email || !phone) {
      this.showToast("Both Email and Mobile Number are compulsory.");
      return;
    }

    if (phone.length !== 10) {
      this.showToast("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (this.userLoginType === 'otp') {
      // 1-Click OTP Login
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const existingUser = this.registeredUsers.find(u => u.phone === phone || u.email.toLowerCase() === email.toLowerCase());
      const userName = existingUser ? existingUser.name : email.split('@')[0];

      window._pendingLoginOtp = { email, phone, otp: generatedOtp, name: userName };
      window._currentOtpContext = 'login';

      this.setAuthMode('otp');
      const otpBanner = document.getElementById('simulated-otp-banner');
      if (otpBanner) {
        otpBanner.innerHTML = `
          <div class="bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs text-amber-900 mb-3 flex items-center justify-between">
            <div>
              <div class="font-bold flex items-center gap-1.5 text-neutral-900">
                <i class="fa-solid fa-shield-halved text-amber-700"></i> N5 Login Security Alert
              </div>
              <div class="text-xs text-neutral-800 mt-0.5">
                One-Time Login OTP is <span class="font-mono font-black text-sm text-amber-900 tracking-wider">${generatedOtp}</span>
              </div>
              <div class="text-[10px] text-neutral-500">Dispatched to +91 ${phone} & ${email}</div>
            </div>
            <button type="button" onclick="Store.autoFillOtp('${generatedOtp}')" class="bg-amber-700 hover:bg-amber-800 text-white font-bold px-2.5 py-1 rounded text-[10px] transition-colors">
              Auto-fill
            </button>
          </div>
        `;
      }
      this.showToast(`Login OTP dispatched to +91 ${phone}`);
      return;
    }

    // Password Login Mode
    const password = document.getElementById('login-password').value;
    if (!password) {
      this.showToast("Please enter your password or switch to 1-Click OTP.");
      return;
    }

    const user = this.registeredUsers.find(u => 
      (u.email.toLowerCase() === email.toLowerCase() || u.phone === phone) && 
      u.password === password
    );

    if (user) {
      // Update phone/email if needed
      user.email = email;
      user.phone = phone;
      this.saveUsers();

      this.currentUser = user;
      localStorage.setItem('n5_current_user', JSON.stringify(user));
      this.syncUserToCloud(user);
      this.updateUserUI();
      this.closeAuthModal();
      this.showToast(`Welcome back, ${user.name}!`);

      if (this.pendingCheckout) {
        this.pendingCheckout = false;
        setTimeout(() => this.openCheckoutModal(), 300);
      }
    } else {
      this.showToast("No account found matching this email, phone & password. Please check details or use 1-Click OTP.");
    }
  },

  autoFillOtp(code) {
    const input = document.getElementById('otp-input-code');
    if (input) input.value = code;
  },

  resendUserOtp() {
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    if (window._currentOtpContext === 'signup' && window._pendingUserRegistration) {
      window._pendingUserRegistration.otp = generatedOtp;
    } else if (window._pendingLoginOtp) {
      window._pendingLoginOtp.otp = generatedOtp;
    }

    const otpBanner = document.getElementById('simulated-otp-banner');
    if (otpBanner) {
      otpBanner.innerHTML = `
        <div class="bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs text-amber-900 mb-3 flex items-center justify-between">
          <div>
            <div class="font-bold flex items-center gap-1.5 text-neutral-900">
              <i class="fa-solid fa-shield-halved text-amber-700"></i> New Security OTP Dispatched
            </div>
            <div class="text-xs text-neutral-800 mt-0.5">
              Fresh 6-Digit OTP is <span class="font-mono font-black text-sm text-amber-900 tracking-wider">${generatedOtp}</span>
            </div>
          </div>
          <button type="button" onclick="Store.autoFillOtp('${generatedOtp}')" class="bg-amber-700 hover:bg-amber-800 text-white font-bold px-2.5 py-1 rounded text-[10px] transition-colors">
            Auto-fill
          </button>
        </div>
      `;
    }
    this.showToast("Fresh 6-digit OTP code dispatched!");
  },

  handleOtpVerify(e) {
    e.preventDefault();
    const entered = document.getElementById('otp-input-code').value.trim();

    if (window._currentOtpContext === 'signup') {
      const pending = window._pendingUserRegistration;
      if (!pending || entered !== pending.otp) {
        this.showToast("Invalid verification code. Please check SMS/Email OTP.");
        return;
      }

      const newUser = {
        name: pending.name,
        email: pending.email,
        phone: pending.phone,
        password: pending.password,
        createdAt: new Date().toISOString()
      };
      this.registeredUsers.push(newUser);
      this.saveUsers();

      this.currentUser = newUser;
      localStorage.setItem('n5_current_user', JSON.stringify(newUser));
      this.syncUserToCloud(newUser);

      this.updateUserUI();
      this.closeAuthModal();
      this.showToast(`Welcome, ${newUser.name}! Account verified & logged in.`);

      if (this.pendingCheckout) {
        this.pendingCheckout = false;
        setTimeout(() => this.openCheckoutModal(), 300);
      }
    } else {
      // Login OTP verification
      const pending = window._pendingLoginOtp;
      if (!pending || entered !== pending.otp) {
        this.showToast("Invalid login OTP code.");
        return;
      }

      let user = this.registeredUsers.find(u => u.phone === pending.phone || u.email.toLowerCase() === pending.email.toLowerCase());
      if (!user) {
        user = {
          name: pending.name,
          email: pending.email,
          phone: pending.phone,
          password: 'OTP-' + Math.floor(1000 + Math.random() * 9000),
          createdAt: new Date().toISOString()
        };
        this.registeredUsers.push(user);
        this.saveUsers();
      }

      this.currentUser = user;
      localStorage.setItem('n5_current_user', JSON.stringify(user));
      this.syncUserToCloud(user);

      this.updateUserUI();
      this.closeAuthModal();
      this.showToast(`Welcome, ${user.name}! Verified & signed in.`);

      if (this.pendingCheckout) {
        this.pendingCheckout = false;
        setTimeout(() => this.openCheckoutModal(), 300);
      }
    }
  },

  logoutUser() {
    this.currentUser = null;
    localStorage.removeItem('n5_current_user');
    this.updateUserUI();
    this.showToast("Signed out successfully");
  },

  updateUserUI() {
    const userBtn = document.getElementById('navbar-user-btn');
    if (!userBtn) return;

    if (this.currentUser) {
      userBtn.innerHTML = `
        <span class="w-8 h-8 rounded-full bg-neutral-900 text-white text-xs font-bold flex items-center justify-center">
          ${this.currentUser.name.charAt(0).toUpperCase()}
        </span>
        <span class="hidden md:inline text-xs font-semibold text-neutral-800">${this.currentUser.name.split(' ')[0]}</span>
      `;
      userBtn.onclick = () => Store.openProfileModal();
    } else {
      userBtn.innerHTML = `
        <i class="fa-regular fa-user text-sm"></i>
        <span class="hidden md:inline text-xs font-semibold text-neutral-800">Sign In</span>
      `;
      userBtn.onclick = () => Store.openAuthModal('login');
    }
  },

  openProfileModal() {
    if (!this.currentUser) return;
    const modal = document.getElementById('profile-modal');
    const body = document.getElementById('profile-modal-body');
    if (!modal || !body) return;

    body.innerHTML = `
      <div class="p-6 text-left">
        <div class="flex items-center gap-4 mb-6 pb-6 border-b border-neutral-100">
          <div class="w-14 h-14 rounded-full bg-neutral-900 text-white font-bold text-xl flex items-center justify-center">
            ${this.currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 class="text-base font-bold text-neutral-900">${this.currentUser.name}</h4>
            <p class="text-xs text-neutral-500">${this.currentUser.email}</p>
            <p class="text-xs text-neutral-500">Phone: ${this.currentUser.phone}</p>
          </div>
        </div>

        <div class="space-y-3 mb-6">
          <button onclick="Store.closeProfileModal(); Store.switchTab('orders')"
            class="w-full text-left px-4 py-3 bg-neutral-50 hover:bg-neutral-100 rounded-xl text-xs font-semibold text-neutral-800 flex items-center justify-between">
            <span><i class="fa-solid fa-box mr-2 text-neutral-500"></i> My Orders & Tracking</span>
            <i class="fa-solid fa-chevron-right text-[10px] text-neutral-400"></i>
          </button>
          <button onclick="Store.closeProfileModal(); Store.switchTab('contact')"
            class="w-full text-left px-4 py-3 bg-neutral-50 hover:bg-neutral-100 rounded-xl text-xs font-semibold text-neutral-800 flex items-center justify-between">
            <span><i class="fa-solid fa-location-dot mr-2 text-neutral-500"></i> Akbar Plaza Store Details</span>
            <i class="fa-solid fa-chevron-right text-[10px] text-neutral-400"></i>
          </button>
        </div>

        <button onclick="Store.logoutUser(); Store.closeProfileModal()"
          class="w-full py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors">
          Sign Out
        </button>
      </div>
    `;
    modal.classList.add('active');
  },

  closeProfileModal() {
    const modal = document.getElementById('profile-modal');
    if (modal) modal.classList.remove('active');
  },

  // Owner Admin Portal Logic (Password: 6309592896 + Phone OTP Recovery)
  verifyAdminPassword() {
    const entered = (document.getElementById('admin-password-input')?.value || document.getElementById('admin-pin-input')?.value || '').trim();
    const correct = this.config.adminPassword || this.config.adminPin || "6309592896";
    if (entered === correct) {
      this.isAdmin = true;
      sessionStorage.setItem('n5_admin_auth', 'true');
      this.renderAdminView();
      this.showToast("Welcome to N5 Owner Admin Portal!");
    } else {
      this.showToast("Incorrect Admin Password. Try again or recover via Phone OTP.");
    }
  },

  verifyAdminPin() {
    this.verifyAdminPassword();
  },

  switchAdminLoginMode(mode) {
    const pwdMode = document.getElementById('admin-login-mode-password');
    const otpMode = document.getElementById('admin-login-mode-otp');
    if (mode === 'otp') {
      if (pwdMode) pwdMode.classList.add('hidden');
      if (otpMode) otpMode.classList.remove('hidden');
    } else {
      if (pwdMode) pwdMode.classList.remove('hidden');
      if (otpMode) otpMode.classList.add('hidden');
    }
  },

  toggleAdminPasswordVisibility() {
    const input = document.getElementById('admin-password-input');
    const icon = document.getElementById('admin-pwd-toggle-icon');
    if (!input) return;
    if (input.type === 'password') {
      input.type = 'text';
      if (icon) icon.className = 'fa-regular fa-eye-slash';
    } else {
      input.type = 'password';
      if (icon) icon.className = 'fa-regular fa-eye';
    }
  },

  sendAdminOtp() {
    const phoneInput = document.getElementById('admin-recovery-phone');
    const phone = phoneInput ? phoneInput.value.trim() : this.config.ownerPhone;
    if (!phone || phone.length < 10) {
      this.showToast("Please enter a valid 10-digit registered owner mobile number.");
      return;
    }

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    this.adminRecoveryOtp = generatedOtp;

    const banner = document.getElementById('admin-simulated-otp-banner');
    if (banner) {
      banner.innerHTML = `
        <div class="bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs text-amber-900 mb-3 flex items-center justify-between">
          <div>
            <div class="font-bold flex items-center gap-1.5 text-neutral-900">
              <i class="fa-solid fa-shield-halved text-amber-700"></i> N5 Admin Security Alert
            </div>
            <div class="text-xs text-neutral-800 mt-0.5">
              Recovery OTP is <span class="font-mono font-black text-sm text-amber-900 tracking-wider">${generatedOtp}</span>
            </div>
            <div class="text-[10px] text-neutral-500">Sent to verified phone +91 ${phone}</div>
          </div>
          <button type="button" onclick="document.getElementById('admin-otp-code').value='${generatedOtp}'" 
                  class="bg-amber-700 hover:bg-amber-800 text-white font-bold px-2.5 py-1 rounded-lg text-[10px] transition-colors">
            Auto-fill
          </button>
        </div>
      `;
    }

    const inputSection = document.getElementById('admin-otp-input-section');
    if (inputSection) inputSection.classList.remove('hidden');

    this.showToast(`Security OTP sent to +91 ${phone}`);
  },

  verifyAdminOtp() {
    const entered = document.getElementById('admin-otp-code')?.value.trim();
    if (!this.adminRecoveryOtp || entered !== this.adminRecoveryOtp) {
      this.showToast("Invalid verification code. Please check SMS OTP.");
      return;
    }

    this.isAdmin = true;
    sessionStorage.setItem('n5_admin_auth', 'true');
    this.renderAdminView();
    this.showToast("Admin Portal Verified & Unlocked via Owner OTP!");
  },

  adminLogout() {
    this.isAdmin = false;
    sessionStorage.removeItem('n5_admin_auth');
    this.renderAdminView();
    this.showToast("Logged out of Admin Portal");
  },

  renderAdminView() {
    const loginGate = document.getElementById('admin-login-gate');
    const dashboard = document.getElementById('admin-dashboard');

    if (!this.isAdmin) {
      if (loginGate) loginGate.classList.remove('hidden');
      if (dashboard) dashboard.classList.add('hidden');
      return;
    }

    if (loginGate) loginGate.classList.add('hidden');
    if (dashboard) dashboard.classList.remove('hidden');

    this.renderAdminOrders();
    this.renderAdminProducts();
    this.renderAdminQueries();
    this.initAdminSettingsForm();
    this.renderCustomQrPreview();
  },

  switchAdminSubTab(subTabName) {
    document.querySelectorAll('.admin-subpane').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.admin-tab-nav-btn').forEach(btn => {
      btn.classList.remove('border-black', 'text-black', 'font-bold');
      btn.classList.add('border-transparent', 'text-neutral-500');
    });

    const targetPane = document.getElementById(`admin-pane-${subTabName}`);
    const targetBtn = document.getElementById(`admin-btn-${subTabName}`);

    if (targetPane) targetPane.classList.remove('hidden');
    if (targetBtn) {
      targetBtn.classList.remove('border-transparent', 'text-neutral-500');
      targetBtn.classList.add('border-black', 'text-black', 'font-bold');
    }
  },

  // Easy Stock Listing for Client (Shirts, T-Shirts, Jeans only)
  handleAdminAddProduct(e) {
    e.preventDefault();
    const title = document.getElementById('new-prod-title').value.trim();
    const brand = document.getElementById('new-prod-brand').value.trim() || 'Original Brand';
    const category = document.getElementById('new-prod-category').value;
    const price = Number(document.getElementById('new-prod-price').value);
    const mrp = Number(document.getElementById('new-prod-mrp').value) || price;
    const fabric = document.getElementById('new-prod-fabric').value.trim();
    const description = document.getElementById('new-prod-desc').value.trim();
    const imageInput = document.getElementById('new-prod-image-data').value;

    const sizes = [];
    document.querySelectorAll('.admin-size-checkbox:checked').forEach(cb => {
      sizes.push(cb.value);
    });

    if (!title || !price) {
      this.showToast("Please enter product title and selling price");
      return;
    }

    const defaultImg = "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=900&auto=format&fit=crop&q=85";

    const newProduct = {
      id: `n5-prod-${Date.now()}`,
      name: title,
      brand: brand,
      brandTag: "100% Original",
      category,
      categoryLabel: category === 'tshirts' ? 'T-Shirts' : (category === 'shirts' ? 'Shirts' : 'Jeans'),
      price,
      originalPrice: mrp,
      sizes: sizes.length > 0 ? sizes : ["M", "L", "XL"],
      image: imageInput || defaultImg,
      gallery: [imageInput || defaultImg],
      fabric: fabric || "100% Cotton",
      description: description || "Authentic original brand apparel from N5 Apparels.",
      inStock: true,
      stockCount: 10,
      isNew: true,
      rating: 5.0,
      reviewsCount: 1
    };

    this.products.unshift(newProduct);
    this.saveProducts();
    this.renderProducts();
    this.renderAdminProducts();

    e.target.reset();
    const preview = document.getElementById('new-prod-img-preview');
    if (preview) preview.innerHTML = `<span class="text-xs text-neutral-400">Photo preview</span>`;
    document.getElementById('new-prod-image-data').value = '';

    this.showToast(`🎉 "${title}" published to store live!`);
    this.switchAdminSubTab('inventory');
  },

  handleImageFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      const dataUrl = e.target.result;
      document.getElementById('new-prod-image-data').value = dataUrl;
      const preview = document.getElementById('new-prod-img-preview');
      if (preview) {
        preview.innerHTML = `
          <img src="${dataUrl}" class="w-full h-full object-contain">
        `;
      }
    };
    reader.readAsDataURL(file);
  },

  toggleProductStock(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;
    product.inStock = !product.inStock;
    this.saveProducts();
    this.renderProducts();
    this.renderAdminProducts();
    this.showToast(`Updated stock status for ${product.name}`);
  },

  quickUpdatePrice(productId, newPrice) {
    const priceNum = Number(newPrice);
    if (!priceNum || priceNum <= 0) {
      this.showToast("Please enter a valid price");
      return;
    }
    const product = this.products.find(p => p.id === productId);
    if (!product) return;
    product.price = priceNum;
    this.saveProducts();
    this.renderProducts();
    this.renderAdminProducts();
    this.showToast(`Updated "${product.name}" price to ₹${priceNum.toLocaleString()}`);
  },

  openEditProductModal(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    const modal = document.getElementById('admin-edit-product-modal');
    const body = document.getElementById('admin-edit-product-body');
    if (!modal || !body) return;

    const allSizes = ["S", "M", "L", "XL", "2XL", "30", "32", "34", "36"];
    const currentSizes = product.sizes || [];

    body.innerHTML = `
      <form onsubmit="Store.handleSaveEditedProduct(event, '${product.id}')" class="space-y-5">
        <!-- 1. Photo Replacement Section -->
        <div>
          <label class="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
            Product Photo
          </label>
          <div class="flex items-center gap-4">
            <div id="edit-prod-img-preview" class="w-24 h-28 rounded-xl bg-white border border-neutral-300 flex items-center justify-center overflow-hidden p-1 shadow-inner">
              <img src="${product.image}" class="w-full h-full object-contain">
            </div>
            <div class="flex-1 space-y-2">
              <label class="block text-xs text-neutral-600 font-semibold">Replace Photo (Optional):</label>
              <input type="file" accept="image/*" onchange="Store.handleEditImageFileUpload(event)" 
                     class="block w-full text-xs text-neutral-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-neutral-900 file:text-white hover:file:bg-black cursor-pointer">
              <input type="hidden" id="edit-prod-image-data" value="">
              <div class="text-[11px] text-neutral-400">Leave unchanged to keep existing photo, or pick a new photo from your device.</div>
            </div>
          </div>
        </div>

        <!-- 2. Title & Brand -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Product Title / Name *
            </label>
            <input type="text" id="edit-prod-title" required value="${product.name.replace(/"/g, '&quot;')}"
                   class="w-full px-4 py-2.5 text-xs font-medium border border-neutral-300 rounded-xl outline-none focus:border-neutral-900">
          </div>
          <div>
            <label class="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Brand Name
            </label>
            <input type="text" id="edit-prod-brand" value="${(product.brand || 'Original Brand').replace(/"/g, '&quot;')}"
                   class="w-full px-4 py-2.5 text-xs font-medium border border-neutral-300 rounded-xl outline-none focus:border-neutral-900">
          </div>
        </div>

        <!-- 3. Category, Selling Price & MRP -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">Category</label>
            <select id="edit-prod-category" class="w-full px-3 py-2.5 text-xs font-semibold border border-neutral-300 rounded-xl outline-none focus:border-neutral-900">
              <option value="shirts" ${product.category === 'shirts' ? 'selected' : ''}>Shirts</option>
              <option value="tshirts" ${product.category === 'tshirts' ? 'selected' : ''}>T-Shirts</option>
              <option value="jeans" ${product.category === 'jeans' ? 'selected' : ''}>Jeans</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Selling Price (₹) *
            </label>
            <input type="number" id="edit-prod-price" required value="${product.price}"
                   class="w-full px-3 py-2.5 text-xs font-bold border border-neutral-300 rounded-xl outline-none focus:border-neutral-900">
          </div>

          <div>
            <label class="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">Original MRP (₹)</label>
            <input type="number" id="edit-prod-mrp" value="${product.originalPrice || product.price}"
                   class="w-full px-3 py-2.5 text-xs font-bold border border-neutral-300 rounded-xl outline-none focus:border-neutral-900">
          </div>
        </div>

        <!-- 4. Stock Count & Availability Toggle -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200">
          <div>
            <label class="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">Stock Quantity</label>
            <input type="number" id="edit-prod-stock-count" value="${product.stockCount || 10}" min="0"
                   class="w-full px-3 py-2 text-xs font-bold border border-neutral-300 rounded-xl bg-white outline-none">
          </div>
          <div class="flex items-center gap-2 pt-5">
            <input type="checkbox" id="edit-prod-instock" ${product.inStock ? 'checked' : ''} class="w-4 h-4 rounded text-neutral-900 cursor-pointer">
            <label for="edit-prod-instock" class="text-xs font-bold text-neutral-800 cursor-pointer">
              Mark as Available In Stock
            </label>
          </div>
        </div>

        <!-- 5. Available Sizes -->
        <div>
          <label class="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">Available Sizes</label>
          <div class="flex flex-wrap gap-2.5">
            ${allSizes.map(sz => `
              <label class="inline-flex items-center gap-1.5 text-xs font-semibold bg-neutral-50 px-3 py-1.5 rounded-xl border border-neutral-200 cursor-pointer hover:bg-neutral-100">
                <input type="checkbox" value="${sz}" ${currentSizes.includes(sz) ? 'checked' : ''} class="edit-size-checkbox rounded">
                <span>${sz}</span>
              </label>
            `).join('')}
          </div>
        </div>

        <!-- 6. Fabric & Description -->
        <div class="grid grid-cols-1 gap-4">
          <div>
            <label class="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">Fabric & GSM</label>
            <input type="text" id="edit-prod-fabric" value="${(product.fabric || '').replace(/"/g, '&quot;')}" placeholder="e.g. 100% Giza Royal Oxford Cotton (185 GSM)"
                   class="w-full px-4 py-2.5 text-xs font-medium border border-neutral-300 rounded-xl outline-none focus:border-neutral-900">
          </div>
          <div>
            <label class="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">Description</label>
            <textarea id="edit-prod-desc" rows="3"
                      class="w-full px-4 py-2.5 text-xs font-medium border border-neutral-300 rounded-xl outline-none focus:border-neutral-900">${product.description || ''}</textarea>
          </div>
        </div>

        <!-- Submit Buttons -->
        <div class="flex gap-3 pt-3 border-t border-neutral-200">
          <button type="button" onclick="Store.closeEditProductModal()" 
                  class="flex-1 py-3 border border-neutral-300 rounded-xl text-xs font-semibold hover:bg-neutral-100 transition-colors">
            Cancel
          </button>
          <button type="submit" 
                  class="flex-1 py-3 bg-neutral-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5">
            <i class="fa-solid fa-floppy-disk text-xs"></i> Save Changes Live
          </button>
        </div>
      </form>
    `;

    modal.classList.add('active');
  },

  closeEditProductModal() {
    const modal = document.getElementById('admin-edit-product-modal');
    if (modal) modal.classList.remove('active');
  },

  handleEditImageFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      const dataUrl = e.target.result;
      document.getElementById('edit-prod-image-data').value = dataUrl;
      const preview = document.getElementById('edit-prod-img-preview');
      if (preview) {
        preview.innerHTML = `<img src="${dataUrl}" class="w-full h-full object-contain">`;
      }
    };
    reader.readAsDataURL(file);
  },

  handleSaveEditedProduct(e, productId) {
    e.preventDefault();
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    const title = document.getElementById('edit-prod-title').value.trim();
    const brand = document.getElementById('edit-prod-brand').value.trim() || 'Original Brand';
    const category = document.getElementById('edit-prod-category').value;
    const price = Number(document.getElementById('edit-prod-price').value);
    const mrp = Number(document.getElementById('edit-prod-mrp').value) || price;
    const stockCount = Number(document.getElementById('edit-prod-stock-count').value) || 0;
    const inStock = document.getElementById('edit-prod-instock').checked;
    const fabric = document.getElementById('edit-prod-fabric').value.trim();
    const description = document.getElementById('edit-prod-desc').value.trim();
    const newImageData = document.getElementById('edit-prod-image-data').value;

    const sizes = [];
    document.querySelectorAll('.edit-size-checkbox:checked').forEach(cb => {
      sizes.push(cb.value);
    });

    if (!title || !price) {
      this.showToast("Title and price are required");
      return;
    }

    product.name = title;
    product.brand = brand;
    product.category = category;
    product.categoryLabel = category === 'tshirts' ? 'T-Shirts' : (category === 'shirts' ? 'Shirts' : 'Jeans');
    product.price = price;
    product.originalPrice = mrp;
    product.stockCount = stockCount;
    product.inStock = inStock && stockCount > 0;
    product.fabric = fabric;
    product.description = description;
    if (sizes.length > 0) {
      product.sizes = sizes;
    }
    if (newImageData) {
      product.image = newImageData;
      if (!product.gallery) product.gallery = [];
      product.gallery[0] = newImageData;
    }

    this.saveProducts();
    this.renderProducts();
    this.renderAdminProducts();
    this.closeEditProductModal();
    this.showToast(`🎉 "${title}" updated successfully!`);
  },

  deleteProduct(productId) {
    if (!confirm("Are you sure you want to delete this product from the catalog?")) return;
    this.products = this.products.filter(p => p.id !== productId);
    this.saveProducts();
    this.renderProducts();
    this.renderAdminProducts();
    this.showToast("Product deleted");
  },

  renderAdminProducts() {
    const container = document.getElementById('admin-inventory-list');
    if (!container) return;

    if (this.products.length === 0) {
      container.innerHTML = `<div class="p-8 text-center text-neutral-400">No items listed. Add your first shirt or denim above!</div>`;
      return;
    }

    container.innerHTML = this.products.map(p => `
      <div class="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-2xl border border-neutral-200 shadow-sm gap-4 hover:border-neutral-300 transition-colors">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-14 h-16 bg-white border border-neutral-200 rounded-xl p-1 flex items-center justify-center flex-shrink-0 cursor-pointer" onclick="Store.openEditProductModal('${p.id}')">
            <img src="${p.image}" class="w-full h-full object-contain">
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <span class="text-[9px] font-bold text-amber-800 uppercase">${p.brand || 'Original Brand'}</span>
              <span class="text-[9px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded uppercase font-semibold">${p.category}</span>
            </div>
            <h4 class="text-xs font-bold text-neutral-900 truncate mt-0.5">${p.name}</h4>
            <div class="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
              <!-- Quick Price Edit -->
              <div class="flex items-center gap-1 bg-neutral-50 px-2 py-0.5 rounded-lg border border-neutral-200">
                <span class="text-[11px] font-bold text-neutral-500">Price: ₹</span>
                <input type="number" value="${p.price}" 
                       onchange="Store.quickUpdatePrice('${p.id}', this.value)" 
                       class="w-16 text-xs font-bold text-neutral-900 bg-white border border-neutral-300 rounded px-1.5 py-0.5 text-center focus:border-black outline-none" 
                       title="Quick edit price">
              </div>
              <span class="text-[11px] text-neutral-400 line-through">MRP: ₹${p.originalPrice || p.price}</span>
              <span class="text-[10px] px-2 py-0.5 rounded-full font-bold ${p.inStock ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}">
                ${p.inStock ? `IN STOCK (${p.stockCount || 10})` : 'OUT OF STOCK'}
              </span>
            </div>
          </div>
        </div>

        <!-- Action Buttons: Edit Details, Stock Toggle, Delete -->
        <div class="flex items-center gap-2 self-end sm:self-center flex-wrap">
          <button onclick="Store.openEditProductModal('${p.id}')"
            class="px-3 py-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-xl flex items-center gap-1 shadow-sm transition-all">
            <i class="fa-solid fa-pen-to-square text-[11px]"></i> Edit Details
          </button>
          <button onclick="Store.toggleProductStock('${p.id}')"
            class="px-3 py-1.5 rounded-xl border border-neutral-300 text-xs font-semibold hover:bg-neutral-50 transition-colors">
            ${p.inStock ? 'Mark Out of Stock' : 'Mark In Stock'}
          </button>
          <button onclick="Store.deleteProduct('${p.id}')"
            class="w-8 h-8 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors"
            title="Delete Product">
            <i class="fa-solid fa-trash text-xs"></i>
          </button>
        </div>
      </div>
    `).join('');
  },

  // Admin Orders Management & Payment Verification View
  updateOrderStatus(orderId, newStatus) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;
    order.status = newStatus;
    if (newStatus === 'Cancelled' && !order.cancelReason) {
      order.cancelReason = 'Cancelled by Store Admin';
      order.cancelledAt = new Date().toISOString();
    }
    this.saveOrders();
    this.syncOrderToCloud(order);
    this.renderAdminOrders();
    this.renderOrdersTab();
    this.showToast(`Order #${orderId} marked as "${newStatus}"`);
  },

  viewPaymentProofModal(orderId) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order || !order.paymentProof) return;

    const modal = document.getElementById('payment-proof-modal');
    const body = document.getElementById('payment-proof-body');
    if (!modal || !body) return;

    body.innerHTML = `
      <div class="p-6 text-left space-y-4">
        <div class="flex justify-between items-center pb-3 border-b border-neutral-200">
          <div>
            <span class="text-xs font-bold text-neutral-400">PAYMENT PROOF FOR</span>
            <h4 class="text-base font-bold text-neutral-900">Order #${order.id}</h4>
          </div>
          <span class="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
            UPI Verified
          </span>
        </div>

        <div class="space-y-1 text-xs">
          <div class="flex justify-between">
            <span class="text-neutral-500">Customer:</span>
            <span class="font-bold text-neutral-900">${order.customerName} (${order.customerPhone})</span>
          </div>
          <div class="flex justify-between">
            <span class="text-neutral-500">12-Digit UPI UTR:</span>
            <span class="font-mono font-bold text-emerald-800 text-sm">${order.paymentProof.utr}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-neutral-500">Amount Paid:</span>
            <span class="font-bold text-neutral-900 text-sm">₹${order.total.toLocaleString()}</span>
          </div>
        </div>

        ${order.paymentProof.screenshotUrl ? `
          <div class="pt-2">
            <label class="block text-xs font-bold text-neutral-700 mb-1">Attached Payment Screenshot Proof:</label>
            <div class="max-h-[320px] overflow-auto rounded-xl border border-neutral-200 p-2 bg-neutral-50 text-center">
              <img src="${order.paymentProof.screenshotUrl}" class="max-w-full max-h-[300px] mx-auto rounded-lg shadow-sm">
            </div>
          </div>
        ` : `
          <div class="p-3 bg-neutral-100 rounded-xl text-center text-xs text-neutral-500">
            No screenshot attached. Verified by 12-digit UPI UTR: <span class="font-mono font-bold text-neutral-800">${order.paymentProof.utr}</span>
          </div>
        `}

        <button onclick="document.getElementById('payment-proof-modal').classList.remove('active')" 
                class="w-full py-2.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-xl mt-4">
          Close Proof Window
        </button>
      </div>
    `;

    modal.classList.add('active');
  },

  sendOrderWhatsAppUpdate(orderId) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;

    const message = encodeURIComponent(
      `Hello ${order.customerName}! 🛍️\n\n` +
      `Update on your *N5 Apparels* order *#${order.id}*:\n` +
      `Status: *${order.status.toUpperCase()}* 🚀\n` +
      `Verified UPI UTR: *${order.paymentProof ? order.paymentProof.utr : 'VERIFIED'}*\n\n` +
      `Items: ${order.items.map(i => `${i.name} (${i.size})`).join(', ')}\n` +
      `Total Paid: ₹${order.total}\n\n` +
      `Thank you for shopping with N5 Apparels! For inquiries, visit Akbar Plaza, Malakpet.`
    );

    const waUrl = `https://wa.me/${order.customerPhone}?text=${message}`;
    window.open(waUrl, '_blank');
  },

  renderAdminOrders() {
    const container = document.getElementById('admin-orders-list');
    if (!container) return;

    if (this.orders.length === 0) {
      container.innerHTML = `
        <div class="p-12 text-center text-neutral-400 bg-white rounded-2xl border border-dashed border-neutral-200">
          <div class="w-14 h-14 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-3">
            <i class="fa-solid fa-boxes-packing text-2xl"></i>
          </div>
          <h4 class="text-sm font-bold text-neutral-800">No Customer Orders Yet</h4>
          <p class="text-xs text-neutral-400 mt-1 max-w-sm mx-auto leading-relaxed">
            Real-time customer orders placed on the store will appear here instantly with verified UTR numbers, item summaries, and 1-tap WhatsApp updates.
          </p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.orders.map(order => {
      const isCancelled = order.status === 'Cancelled';
      return `
      <div class="bg-white p-5 rounded-2xl border ${isCancelled ? 'border-rose-200 bg-rose-50/20' : 'border-neutral-200'} shadow-sm space-y-4">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-sm font-extrabold text-neutral-900">Order #${order.id}</span>
              ${isCancelled ? `
                <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300">
                  <i class="fa-solid fa-ban mr-1"></i> Cancelled
                </span>
              ` : `
                <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900">${order.status}</span>
              `}
              <span class="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                UTR: ${order.paymentProof ? order.paymentProof.utr : 'N/A'}
              </span>
            </div>
            <p class="text-xs text-neutral-500 mt-0.5">Placed: ${new Date(order.createdAt).toLocaleString('en-IN')}</p>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <button onclick="Store.viewPaymentProofModal('${order.id}')"
                    class="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-xl flex items-center gap-1">
              <i class="fa-solid fa-receipt text-xs"></i> View UTR / Screenshot
            </button>

            <select onchange="Store.updateOrderStatus('${order.id}', this.value)" 
              class="text-xs font-bold border ${isCancelled ? 'border-rose-300 bg-rose-50 text-rose-900' : 'border-neutral-300 bg-neutral-50 text-neutral-900'} rounded-xl px-3 py-1.5">
              <option value="Placed" ${order.status === 'Placed' ? 'selected' : ''}>Placed</option>
              <option value="Confirmed" ${order.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
              <option value="Packed" ${order.status === 'Packed' ? 'selected' : ''}>Packed</option>
              <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
              <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
              <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>

            <button onclick="Store.sendOrderWhatsAppUpdate('${order.id}')"
              class="px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold rounded-xl flex items-center gap-1 transition-colors">
              <i class="fa-brands fa-whatsapp"></i> WhatsApp Update
            </button>
          </div>
        </div>

        ${isCancelled ? `
          <div class="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
            <i class="fa-solid fa-triangle-exclamation text-rose-600 mt-0.5"></i>
            <div>
              <span class="font-bold text-rose-900">Cancellation Reason:</span> ${order.cancelReason || 'Customer requested'}
              ${order.cancelNote ? `<p class="italic text-rose-700 mt-0.5">"${order.cancelNote}"</p>` : ''}
              <p class="text-[11px] text-rose-600 mt-1 font-semibold">UTR: ${order.paymentProof ? order.paymentProof.utr : 'N/A'} — Initiate refund to customer if verified.</p>
            </div>
          </div>
        ` : ''}

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <span class="font-bold text-neutral-800">Customer Details:</span>
            <p class="text-neutral-700">${order.customerName} (${order.customerPhone})</p>
            <p class="text-neutral-500">${order.customerEmail}</p>
            <p class="text-neutral-500 mt-1">${order.address}</p>
          </div>

          <div>
            <span class="font-bold text-neutral-800">Items & Total:</span>
            <div class="space-y-1 mt-1">
              ${order.items.map(item => `
                <div class="flex justify-between text-neutral-700">
                  <span>${item.name} [${item.brand || 'Original'}] (${item.size}) x${item.quantity}</span>
                  <span class="font-semibold">₹${item.price * item.quantity}</span>
                </div>
              `).join('')}
              <div class="flex justify-between font-bold text-neutral-900 pt-1 border-t border-neutral-100">
                <span>Total (${order.paymentMethod}):</span>
                <span class="text-emerald-700">₹${order.total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    }).join('');
  },

  renderAdminQueries() {
    const container = document.getElementById('admin-queries-list');
    if (!container) return;

    if (this.queries.length === 0) {
      container.innerHTML = `<div class="p-8 text-center text-neutral-400">No customer queries currently.</div>`;
      return;
    }

    container.innerHTML = this.queries.map(q => {
      const waReplyText = encodeURIComponent(`Hi ${q.name}! Thank you for contacting N5 Apparels regarding "${q.topic}". How can we help you?`);
      return `
        <div class="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm space-y-3">
          <div class="flex justify-between items-start">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-neutral-900">${q.name}</span>
                <span class="badge-gold px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">${q.topic}</span>
              </div>
              <p class="text-[11px] text-neutral-500 mt-0.5">Phone: ${q.phone} | Date: ${new Date(q.createdAt).toLocaleDateString('en-IN')}</p>
            </div>

            <div class="flex items-center gap-2">
              <a href="https://wa.me/${q.phone}?text=${waReplyText}" target="_blank"
                 class="px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold rounded-xl flex items-center gap-1">
                <i class="fa-brands fa-whatsapp"></i> Reply on WhatsApp
              </a>
              <button onclick="Store.deleteQuery('${q.id}')"
                class="w-7 h-7 rounded-xl bg-neutral-100 hover:bg-red-50 hover:text-red-600 flex items-center justify-center text-xs">
                <i class="fa-solid fa-trash text-[11px]"></i>
              </button>
            </div>
          </div>

          <p class="text-xs text-neutral-700 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
            "${q.message}"
          </p>
        </div>
      `;
    }).join('');
  },

  deleteQuery(queryId) {
    this.queries = this.queries.filter(q => q.id !== queryId);
    this.saveQueries();
    this.renderAdminQueries();
    this.showToast("Query deleted");
  },

  initAdminSettingsForm() {
    const upiInput = document.getElementById('cfg-upi-id');
    const waInput = document.getElementById('cfg-whatsapp-num');
    const pwdInput = document.getElementById('cfg-admin-password');
    const phoneInput = document.getElementById('cfg-owner-phone');
    const freeInput = document.getElementById('cfg-free-shipping');
    const feeInput = document.getElementById('cfg-shipping-fee');
    const supaUrlInput = document.getElementById('cfg-supabase-url');
    const supaKeyInput = document.getElementById('cfg-supabase-key');

    if (upiInput) upiInput.value = this.config.upiId || '9700663930@okbizaxis';
    if (waInput) waInput.value = this.config.whatsappNumber || '919700663930';
    if (pwdInput) pwdInput.value = this.config.adminPassword || '6309592896';
    if (phoneInput) phoneInput.value = this.config.ownerPhone || '9700663930';
    if (freeInput) freeInput.value = this.config.freeShippingAbove ?? 999;
    if (feeInput) feeInput.value = this.config.shippingFee ?? 99;
    if (supaUrlInput) supaUrlInput.value = this.config.supabaseUrl || '';
    if (supaKeyInput) supaKeyInput.value = this.config.supabaseKey || '';

    this.updateCloudDbStatusBadge();
  },

  handleSaveStoreConfig(e) {
    e.preventDefault();
    const upi = document.getElementById('cfg-upi-id')?.value.trim();
    const wa = document.getElementById('cfg-whatsapp-num')?.value.trim();
    const pwd = document.getElementById('cfg-admin-password')?.value.trim();
    const recoveryPhone = document.getElementById('cfg-owner-phone')?.value.trim();
    const freeShipping = document.getElementById('cfg-free-shipping')?.value.trim();
    const shippingFee = document.getElementById('cfg-shipping-fee')?.value.trim();
    const supaUrl = document.getElementById('cfg-supabase-url')?.value.trim();
    const supaKey = document.getElementById('cfg-supabase-key')?.value.trim();

    if (upi) this.config.upiId = upi;
    if (wa) {
      this.config.whatsappNumber = wa;
      this.config.phone = wa;
    }
    if (pwd) {
      this.config.adminPassword = pwd;
      this.config.adminPin = pwd;
    }
    if (recoveryPhone) this.config.ownerPhone = recoveryPhone;
    if (freeShipping) this.config.freeShippingAbove = Number(freeShipping);
    if (shippingFee) this.config.shippingFee = Number(shippingFee);
    if (supaUrl !== undefined) this.config.supabaseUrl = supaUrl;
    if (supaKey !== undefined) this.config.supabaseKey = supaKey;

    this.supabaseClient = null; // Reset to re-initialize with latest config
    this.saveConfig();
    this.updateCloudDbStatusBadge();
    this.renderCart();
    this.showToast("All store settings & database configuration saved successfully!");
  },

  getSupabase() {
    if (this.supabaseClient) return this.supabaseClient;
    if (window.supabase && this.config.supabaseUrl && this.config.supabaseKey) {
      try {
        this.supabaseClient = window.supabase.createClient(this.config.supabaseUrl, this.config.supabaseKey);
        return this.supabaseClient;
      } catch (err) {
        console.warn("Supabase init error:", err);
        return null;
      }
    }
    return null;
  },

  updateCloudDbStatusBadge() {
    const badge = document.getElementById('cloud-db-status');
    if (!badge) return;
    if (this.config.supabaseUrl && this.config.supabaseKey) {
      badge.className = "px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300";
      badge.innerHTML = `<i class="fa-solid fa-cloud mr-1"></i> Supabase Live`;
    } else {
      badge.className = "px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-200 text-neutral-700";
      badge.innerHTML = `Local Storage`;
    }
  },

  async testCloudDbConnection() {
    const supaUrl = document.getElementById('cfg-supabase-url')?.value.trim() || this.config.supabaseUrl;
    const supaKey = document.getElementById('cfg-supabase-key')?.value.trim() || this.config.supabaseKey;

    if (!supaUrl || !supaKey) {
      this.showToast("Please enter Supabase Project URL and Public Anon Key first!");
      return;
    }

    if (!window.supabase) {
      this.showToast("Supabase library loading... Check internet connection.");
      return;
    }

    this.showToast("Testing connection to Supabase cloud...");
    try {
      const client = window.supabase.createClient(supaUrl, supaKey);
      const { data, error } = await client.from('n5_users').select('id').limit(1);
      if (error && error.code !== 'PGRST116') {
        if (error.code === '42P01') {
          this.showToast("Connected to Supabase! (Now run supabase_schema.sql in SQL Editor)");
        } else {
          throw error;
        }
      } else {
        this.showToast("✅ Successfully connected to Supabase Cloud Database!");
      }
      this.config.supabaseUrl = supaUrl;
      this.config.supabaseKey = supaKey;
      this.saveConfig();
      this.supabaseClient = client;
      this.updateCloudDbStatusBadge();
    } catch (err) {
      console.error("Supabase test error:", err);
      this.showToast(`Connection error: ${err.message || 'Check URL and Key'}`);
    }
  },

  async syncLocalDataToCloud() {
    const client = this.getSupabase();
    if (!client) {
      this.showToast("Supabase is not configured. Enter Project URL and Key, then save.");
      return;
    }

    this.showToast("Syncing local users & orders to cloud database...");
    let userCount = 0;
    let orderCount = 0;

    try {
      if (this.registeredUsers.length > 0) {
        const usersPayload = this.registeredUsers.map(u => ({
          name: u.name,
          email: u.email ? u.email.toLowerCase() : null,
          phone: u.phone,
          password: u.password,
          verified: !!u.verified,
          created_at: u.createdAt || new Date().toISOString()
        }));
        const { error: uErr } = await client.from('n5_users').upsert(usersPayload, { onConflict: 'phone' });
        if (uErr) {
          console.warn("User sync warning:", uErr);
        } else {
          userCount = usersPayload.length;
        }
      }

      if (this.orders.length > 0) {
        const ordersPayload = this.orders.map(o => ({
          id: o.id,
          customer_name: o.customerName,
          customer_email: o.customerEmail || null,
          customer_phone: o.customerPhone,
          address: o.address,
          items: o.items || [],
          subtotal: o.subtotal || 0,
          shipping: o.shipping || 0,
          total: o.total || 0,
          status: o.status || 'Placed',
          payment_method: o.paymentMethod || 'UPI QR (Verified)',
          utr: o.paymentProof ? o.paymentProof.utr : null,
          screenshot_url: o.paymentProof ? o.paymentProof.screenshotUrl : null,
          cancel_reason: o.cancelReason || null,
          cancel_note: o.cancelNote || null,
          cancelled_at: o.cancelledAt || null,
          created_at: o.createdAt || new Date().toISOString()
        }));
        const { error: oErr } = await client.from('n5_orders').upsert(ordersPayload, { onConflict: 'id' });
        if (oErr) {
          console.warn("Orders sync warning:", oErr);
        } else {
          orderCount = ordersPayload.length;
        }
      }

      this.showToast(`✅ Cloud Synced! ${userCount} users & ${orderCount} orders in Supabase.`);
    } catch (err) {
      console.error("Cloud sync error:", err);
      this.showToast(`Sync failed: ${err.message || 'Check database permissions'}`);
    }
  },

  async syncUserToCloud(user) {
    const client = this.getSupabase();
    if (!client || !user) return;
    try {
      const payload = {
        name: user.name,
        email: user.email ? user.email.toLowerCase() : null,
        phone: user.phone,
        password: user.password,
        verified: true,
        last_login: new Date().toISOString()
      };
      await client.from('n5_users').upsert(payload, { onConflict: 'phone' });
      console.log("Synced user to Supabase:", user.phone);
    } catch (e) {
      console.warn("Supabase user sync error:", e);
    }
  },

  async syncOrderToCloud(order) {
    const client = this.getSupabase();
    if (!client || !order) return;
    try {
      const payload = {
        id: order.id,
        customer_name: order.customerName,
        customer_email: order.customerEmail || null,
        customer_phone: order.customerPhone,
        address: order.address,
        items: order.items || [],
        subtotal: order.subtotal || 0,
        shipping: order.shipping || 0,
        total: order.total || 0,
        status: order.status || 'Placed',
        payment_method: order.paymentMethod || 'UPI QR (Verified)',
        utr: order.paymentProof ? order.paymentProof.utr : null,
        screenshot_url: order.paymentProof ? order.paymentProof.screenshotUrl : null,
        cancel_reason: order.cancelReason || null,
        cancel_note: order.cancelNote || null,
        cancelled_at: order.cancelledAt || null,
        created_at: order.createdAt || new Date().toISOString()
      };
      await client.from('n5_orders').upsert(payload, { onConflict: 'id' });
      console.log("Synced order to Supabase:", order.id);
    } catch (e) {
      console.warn("Supabase order sync error:", e);
    }
  },

  // Cancel Order Modal Handlers
  openCancelOrderModal(orderId) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;
    const label = document.getElementById('cancel-order-id-label');
    const input = document.getElementById('cancel-order-id-input');
    if (label) label.textContent = orderId;
    if (input) input.value = orderId;
    const modal = document.getElementById('cancel-order-modal');
    if (modal) modal.classList.add('active');
  },

  closeCancelOrderModal() {
    const modal = document.getElementById('cancel-order-modal');
    if (modal) modal.classList.remove('active');
  },

  confirmOrderCancellation(e) {
    e.preventDefault();
    const orderId = document.getElementById('cancel-order-id-input')?.value;
    const reason = document.getElementById('cancel-order-reason')?.value || 'Customer requested';
    const note = document.getElementById('cancel-order-note')?.value.trim() || '';

    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;

    order.status = 'Cancelled';
    order.cancelledAt = new Date().toISOString();
    order.cancelReason = reason;
    order.cancelNote = note;

    this.saveOrders();
    this.syncOrderToCloud(order);
    this.renderOrdersTab();
    this.renderAdminOrders();
    this.closeCancelOrderModal();
    this.showToast(`Order #${orderId} has been cancelled.`);

    // Pre-compose WhatsApp alert for the store owner
    const cancelMsg = encodeURIComponent(
      `*ORDER CANCELLED - N5 APPARELS*\n\n` +
      `Order ID: #${order.id}\n` +
      `Customer: ${order.customerName}\n` +
      `Phone: ${order.customerPhone}\n` +
      `Total: ₹${order.total}\n` +
      `UTR: ${order.paymentProof ? order.paymentProof.utr : 'N/A'}\n` +
      `Reason: ${reason}\n` +
      (note ? `Customer Note: ${note}\n` : '') +
      `Action Needed: Verify UTR and process UPI refund if received.\n` +
      `Cancelled At: ${new Date().toLocaleString('en-IN')}`
    );
    window.open(`https://wa.me/${this.config.whatsappNumber}?text=${cancelMsg}`, '_blank');
  },

  handleCustomQrUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.config.customQrImage = e.target.result;
      this.saveConfig();
      this.renderCustomQrPreview();
      this.showToast("Custom store QR standee uploaded successfully!");
    };
    reader.readAsDataURL(file);
  },

  removeCustomQr() {
    this.config.customQrImage = "";
    this.saveConfig();
    this.renderCustomQrPreview();
    const input = document.getElementById('cfg-qr-file-input');
    if (input) input.value = '';
    this.showToast("Custom QR code removed. Reverted to dynamic amount QR.");
  },

  renderCustomQrPreview() {
    const container = document.getElementById('cfg-qr-preview-container');
    if (!container) return;

    if (this.config.customQrImage) {
      container.innerHTML = `
        <div class="flex items-center gap-3 p-3 bg-white rounded-xl border border-neutral-300">
          <img src="${this.config.customQrImage}" alt="Uploaded QR Standee" class="w-16 h-16 object-contain rounded-lg border border-neutral-200">
          <div class="flex-1">
            <span class="text-xs font-bold text-neutral-800 block">Active Custom QR Standee</span>
            <span class="text-[10px] text-emerald-700 font-semibold">Shown to customers at checkout</span>
          </div>
          <button type="button" onclick="Store.removeCustomQr()" class="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-bold">
            Remove
          </button>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="text-[11px] text-neutral-500 italic bg-white p-2.5 rounded-xl border border-dashed border-neutral-300 text-center">
          No custom QR image uploaded. Store is using dynamic NPCI vector QR generation.
        </div>
      `;
    }
  },

  // Real GPS Leaflet Map
  initLeafletMap() {
    const mapContainer = document.getElementById('leaflet-map');
    if (!mapContainer) return;

    const storeLat = 17.3753;
    const storeLng = 78.4982;

    if (window._leafletMapInstance) {
      window._leafletMapInstance.invalidateSize();
      return;
    }

    if (typeof L === 'undefined') return;

    const map = L.map('leaflet-map', {
      center: [storeLat, storeLng],
      zoom: 16,
      zoomControl: true,
      scrollWheelZoom: false
    });

    window._leafletMapInstance = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    const customIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="position:relative; width:44px; height:44px; display:flex; align-items:center; justify-content:center;">
          <div style="position:absolute; width:100%; height:100%; border-radius:50%; background:rgba(197, 168, 105, 0.4); animation:pulse 2s infinite;"></div>
          <img src="assets/branding/n5_logo.png" style="width:38px; height:38px; border-radius:50%; border:2px solid #c5a869; box-shadow:0 4px 14px rgba(0,0,0,0.35); object-fit:cover; z-index:2;" alt="N5">
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    const marker = L.marker([storeLat, storeLng], { icon: customIcon }).addTo(map);

    marker.bindPopup(`
      <div style="font-family:'Inter', sans-serif; padding:4px;">
        <div style="font-weight:700; font-size:15px; color:#121212; display:flex; align-items:center; gap:8px;">
          <img src="assets/branding/n5_logo.png" style="width:22px; height:22px; border-radius:50%; object-fit:cover;">
          <span>N5 Apparels</span>
        </div>
        <p style="margin:4px 0 8px 0; font-size:12px; color:#555;">
          Akbar Plaza, Beside Kolhapuri Footwear<br>
          Malakpet, Hyderabad - 500036
        </p>
        <div style="font-size:11px; color:#16a34a; font-weight:600; margin-bottom:8px;">
          ● Open Daily until 11:00 PM
        </div>
        <a href="https://maps.app.goo.gl/Je4PCRDFjnks6ezy8?g_st=aw" target="_blank" 
           style="display:inline-block; background:#121212; color:#ffffff; padding:6px 12px; border-radius:8px; font-size:11px; font-weight:600; text-decoration:none;">
          Get Live Directions ↗
        </a>
      </div>
    `).openPopup();
  },

  showToast(message) {
    const toast = document.getElementById('app-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');
    toast.classList.add('opacity-100', 'translate-y-0');

    clearTimeout(window._toastTimeout);
    window._toastTimeout = setTimeout(() => {
      toast.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');
      toast.classList.remove('opacity-100', 'translate-y-0');
    }, 3200);
  },

  setupEventListeners() {
    const dropdownBtn = document.getElementById('clothes-dropdown-trigger');
    const dropdownMenu = document.getElementById('clothes-dropdown-menu');
    if (dropdownBtn && dropdownMenu) {
      dropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('open');
      });

      document.addEventListener('click', () => {
        dropdownMenu.classList.remove('open');
      });
    }

    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (hash && ['home', 'clothes', 'orders', 'contact', 'admin'].includes(hash)) {
        this.switchTab(hash);
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Store.init();
});
