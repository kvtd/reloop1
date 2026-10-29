document.addEventListener('DOMContentLoaded', () => {
    // Initialize User
    const user = JSON.parse(localStorage.getItem('reloop_user'));

    // Initialize Cart
    let cart = JSON.parse(localStorage.getItem('reloop_cart')) || [];

    // Fix: Check for invalid/old IDs (timestamp based) which cause DB errors
    const hasInvalidItems = cart.some(item => item.id > 1000000);
    if (hasInvalidItems) {
        console.log('Detected invalid items in cart. Clearing...');
        cart = [];
        localStorage.removeItem('reloop_cart');
        alert('ระบบได้ทำการรีเซ็ตตะกร้าสินค้าเพื่อแก้ไขข้อมูลเก่า กรุณาเลือกสินค้าใหม่อีกครั้ง');
    }

    updateCartCount();

    // API Base URL handling for local file access
    const API_BASE_URL = window.location.protocol === 'file:' ? 'http://localhost:3001' : '';

    // Determine current page and load products
    const path = window.location.pathname;
    if (path.includes('pants.html')) {
        loadProducts('pant');
    } else if (path.includes('shirts.html')) {
        loadProducts('shirt');
    } else if (path.includes('shoes.html')) {
        loadProducts('shoe');
    } else if (path.includes('skirts.html')) {
        loadProducts('skirt');
    } else if (path.includes('bags.html')) {
        loadProducts('bag');
    } else if (path.includes('all-products.html')) {
        loadProducts(); // Load all products
    } else if (path.includes('recommended-products.html')) {
        loadProducts('recommended_full'); // Load full set of recommended products
    } else if (path.endsWith('index.html') || path === '/' || path.endsWith('/reloop/')) {
        loadProducts('recommended');
    }

    // Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-links li a').forEach(link => {
        link.addEventListener('click', () => {
            if (hamburger) hamburger.classList.remove('active');
            if (navLinks) navLinks.classList.remove('active');
        });
    });

    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            } else {
                navbar.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            }
        });
    }

    // Add to Cart Functionality
    function attachAddToCartListeners() {
        const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
        addToCartBtns.forEach((btn) => {
            if (btn.dataset.hasListener) return;
            btn.dataset.hasListener = 'true';

            btn.addEventListener('click', function () {
                const card = this.closest('.product-card');

                // Helper to get correct price
                const getPrice = (card) => {
                    const priceEl = card.querySelector('.price');
                    const clone = priceEl.cloneNode(true);
                    const oldPrice = clone.querySelector('.old-price');
                    if (oldPrice) oldPrice.remove();
                    return parseFloat(clone.innerText.replace(/[^\d.]/g, ''));
                };

                // Get ID from data attribute or fallback (but fallback is bad for DB)
                let productId = card.dataset.id;
                if (!productId) {
                    // Try to find it if it's a static element (unlikely to work well with DB)
                    console.warn('Product ID missing, using random ID. Order may fail.');
                    productId = Date.now();
                } else {
                    productId = parseInt(productId);
                }

                const product = {
                    id: productId,
                    name: card.querySelector('h3').innerText,
                    price: getPrice(card),
                    image: card.querySelector('img') ? card.querySelector('img').src : card.querySelector('.placeholder-img').style.backgroundImage.slice(5, -2),
                    category: card.querySelector('.category').innerText,
                    quantity: 1
                };

                addToCart(product);

                // Animation
                const originalContent = this.innerHTML;
                this.innerHTML = '<i class="fas fa-check"></i>';
                this.style.background = '#43e97b';
                this.style.color = '#fff';

                setTimeout(() => {
                    this.innerHTML = originalContent;
                    this.style.background = '';
                    this.style.color = '';
                }, 1500);

                // Cart shake animation
                const cartIcon = document.querySelector('.cart-icon');
                if (cartIcon) {
                    cartIcon.style.transform = 'scale(1.2)';
                    setTimeout(() => {
                        cartIcon.style.transform = 'scale(1)';
                    }, 200);
                }
            });
        });
    }

    // Initial call for static elements
    attachAddToCartListeners();

    // Dynamic Product Loading
    async function loadProducts(type) {
        let products = [];
        let usedFallback = false;

        // Try fetching from API first
        if (window.location.protocol !== 'file:') {
            try {
                let url = `${API_BASE_URL}/api/products`;
                // Only append type query if it's a specific category, NOT for recommended/recommended_full
                if (type && type !== 'recommended' && type !== 'recommended_full') {
                    url += '?type=' + type;
                }

                const response = await fetch(url);
                if (response.ok) {
                    products = await response.json();
                } else {
                    throw new Error('Network response was not ok');
                }
            } catch (error) {
                console.warn('Error loading products from API, trying fallback:', error);
                usedFallback = true;
            }
        } else {
            usedFallback = true;
        }

        // Fallback to local data if API failed or using file protocol
        if (usedFallback) {
            if (typeof allProducts !== 'undefined') {
                console.log('Using local product data');
                products = [...allProducts]; // Copy array

                // Filter manually if using fallback
                if (type && type !== 'recommended' && type !== 'recommended_full') {
                    products = products.filter(p => p.type === type);
                }
            } else {
                console.error('No local product data found');
                const grid = document.querySelector('.product-grid');
                if (grid) grid.innerHTML = '<p style="text-align:center; color:red;">ไม่สามารถโหลดข้อมูลสินค้าได้ (API Error & No Local Data)</p>';
                return;
            }
        }

        if (products.length === 0) {
            const grid = document.querySelector('.product-grid');
            if (grid) grid.innerHTML = '<p style="text-align:center; color:red;">ไม่พบสินค้าในหมวดหมู่นี้</p>';
            return;
        }

        if (type === 'recommended' || type === 'recommended_full') {
            // Pick 2 items from each category to ensure diversity
            const categories = ['shirt', 'pant', 'shoe', 'skirt', 'bag'];
            let diverseProducts = [];

            categories.forEach(cat => {
                const items = products.filter(p => p.type === cat);
                // Shuffle and take 2
                const selected = items.sort(() => 0.5 - Math.random()).slice(0, 2);
                diverseProducts = diverseProducts.concat(selected);
            });

            // Shuffle the final mix
            products = diverseProducts.sort(() => 0.5 - Math.random());

            // If on homepage (recommended), limit to 4. If on full page (recommended_full), show all 10.
            if (type === 'recommended') {
                products = products.slice(0, 4);
            }
        }

        renderProducts(products);
    }

    function renderProducts(products) {
        const grid = document.querySelector('.product-grid');
        if (!grid) return;

        if (!Array.isArray(products)) {
            console.error('Products is not an array:', products);
            return;
        }

        grid.innerHTML = products.map(product => {
            const isSold = product.status === 'sold';
            const tagHtml = isSold
                ? `<span class="tag" style="background: #e74c3c;">Sold Out</span>`
                : (product.tag ? `<span class="tag ${product.tag === 'New' ? 'new' : 'sale'}">${product.tag}</span>` : '');

            const oldPriceHtml = product.oldPrice ? `<span class="old-price">฿${Number(product.oldPrice).toLocaleString()}</span>` : '';
            const sizeHtml = product.size ? `<span class="size-tag" style="position: absolute; top: 10px; right: 10px; background: rgba(255,255,255,0.9); padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: 600; color: #333; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Size: ${product.size}</span>` : '';

            const btnHtml = isSold
                ? `<button class="add-to-cart-btn" disabled style="background: #ccc; cursor: not-allowed;"><i class="fas fa-times"></i></button>`
                : `<button class="add-to-cart-btn"><i class="fas fa-plus"></i></button>`;

            // Chat Button logic
            const SYSTEM_USER_ID = 999;
            const ADMIN_EMAILS = ['Chayaphat7184@gmail.com', 'jummum128@gmail.com', 'kvtd@gmail.com'];

            // Fix: Treat ID 1 as System ID to prevent conflicts with the first registered user
            let sellerId = product.user_id || SYSTEM_USER_ID;
            if (sellerId === 1) sellerId = SYSTEM_USER_ID;

            const isUserAdmin = user && ADMIN_EMAILS.includes(user.email);

            let showChat = true;

            // 1. Hide if user is the seller
            if (user && user.id === sellerId) {
                showChat = false;
            }

            // 2. Hide if user is Admin and product is owned by System (because Admin receives these chats anyway)
            if (isUserAdmin && sellerId === SYSTEM_USER_ID) {
                showChat = false;
            }

            const chatBtn = showChat
                ? `<button onclick="event.stopPropagation(); checkLoginAndChat(${product.id}, ${sellerId})" class="chat-btn"><i class="fas fa-comment-dots"></i></button>`
                : '';

            return `
            <div class="product-card" data-id="${product.id}">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover; ${isSold ? 'filter: grayscale(100%);' : ''}">
                    ${tagHtml}
                    ${sizeHtml}
                    ${chatBtn}
                    ${btnHtml}
                </div>
                <div class="product-info">
                    <span class="category">${product.category}</span>
                    <h3>${product.name}</h3>
                    <div class="price">
                        ${oldPriceHtml} 
                        ฿${Number(product.price).toLocaleString()}
                    </div>
                </div>
            </div>
            `;
        }).join('');

        // Expose function globally for the onclick handler
        window.checkLoginAndChat = function (productId, sellerId) {
            const user = JSON.parse(localStorage.getItem('reloop_user'));
            if (!user) {
                alert('กรุณาเข้าสู่ระบบเพื่อสอบถามข้อมูลสินค้า');
                window.location.href = 'login.html';
                return;
            }
            window.location.href = `chat.html?productId=${productId}&sellerId=${sellerId}`;
        };

        attachAddToCartListeners();
    }

    function addToCart(product) {
        const existingItem = cart.find(item => item.name === product.name);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push(product);
        }
        saveCart();
        updateCartCount();
    }

    function saveCart() {
        localStorage.setItem('reloop_cart', JSON.stringify(cart));
    }

    function updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
        }
    }

    // Cart Page Logic
    if (window.location.pathname.includes('cart.html')) {
        renderCart();
    }

    function renderCart() {
        const cartItemsContainer = document.querySelector('.cart-items');
        const emptyCartMsg = '<div style="text-align:center; padding: 40px;"><h3>ตะกร้าสินค้าว่างเปล่า</h3><a href="index.html" class="btn btn-primary" style="margin-top:20px;">ไปช้อปเลย</a></div>';

        if (!cartItemsContainer) return;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = emptyCartMsg;
            updateCartTotal();
            return;
        }

        cartItemsContainer.innerHTML = '';
        cart.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.innerHTML = `
                <div class="cart-item-img">
                    ${item.image.includes('http') || item.image.includes('data:') || item.image.includes('file:') ? `<img src="${item.image}" alt="${item.name}" style="width:100%; height:100%; object-fit:cover; border-radius:10px;">` : `<div class="placeholder-img" style="background: ${item.image}"></div>`}
                </div>
                <div class="cart-item-info">
                    <h3>${item.name}</h3>
                    <p class="item-category">${item.category}</p>
                    <div class="item-price">฿${item.price.toLocaleString()}</div>
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-control">
                        <button class="qty-btn minus" data-index="${index}"><i class="fas fa-minus"></i></button>
                        <input type="number" value="${item.quantity}" min="1" readonly>
                        <button class="qty-btn plus" data-index="${index}"><i class="fas fa-plus"></i></button>
                    </div>
                    <button class="remove-btn" data-index="${index}"><i class="fas fa-trash"></i> ลบ</button>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
        });

        attachCartListeners();
        updateCartTotal();
    }

    function attachCartListeners() {
        document.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const index = this.dataset.index;
                if (this.classList.contains('minus')) {
                    if (cart[index].quantity > 1) {
                        cart[index].quantity--;
                    }
                } else {
                    cart[index].quantity++;
                }
                saveCart();
                renderCart();
                updateCartCount();
            });
        });

        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const index = this.dataset.index;
                const item = this.closest('.cart-item');
                item.style.opacity = '0';
                setTimeout(() => {
                    cart.splice(index, 1);
                    saveCart();
                    renderCart();
                    updateCartCount();
                }, 300);
            });
        });
    }

    function updateCartTotal() {
        const summaryRows = document.querySelectorAll('.summary-row');
        if (summaryRows.length < 3) return;

        const subtotalElement = summaryRows[0].querySelector('span:last-child');
        const shippingElement = summaryRows[1].querySelector('span:last-child');
        const totalElement = document.querySelector('.summary-row.total span:last-child');

        if (!subtotalElement || !totalElement) return;

        const subtotal = cart.reduce((sum, item) => {
            const price = Number(item.price) || 0;
            return sum + (price * item.quantity);
        }, 0);

        const shipping = subtotal > 0 ? 50 : 0;
        const total = subtotal + shipping;

        subtotalElement.textContent = `฿${subtotal.toLocaleString()}`;
        if (shippingElement) shippingElement.textContent = `฿${shipping}`;
        totalElement.textContent = `฿${total.toLocaleString()}`;
    }

    // Checkout Button
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', (e) => {
            e.preventDefault();

            if (cart.length === 0) {
                alert('กรุณาเลือกสินค้าก่อนชำระเงิน');
                return;
            }

            // Redirect to address page
            window.location.href = 'checkout-address.html';
        });
    }



    // Image Upload Preview (for Sell Page)
    const imageUploadBox = document.getElementById('imageUploadBox');
    const productImageInput = document.getElementById('productImage');
    const imagePreview = document.getElementById('imagePreview');

    if (imageUploadBox && productImageInput && imagePreview) {
        imageUploadBox.addEventListener('click', () => {
            productImageInput.click();
        });

        productImageInput.addEventListener('change', function () {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    imagePreview.style.backgroundImage = `url(${e.target.result})`;
                    imagePreview.classList.add('active');
                    imageUploadBox.querySelector('i').style.display = 'none';
                    imageUploadBox.querySelector('p').style.display = 'none';
                }
                reader.readAsDataURL(file);
            }
        });
    }

    // Handle Sell Form Submission
    const sellForm = document.getElementById('sellForm');
    if (sellForm) {
        sellForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('productName').value;
            const category = document.getElementById('category').value;
            const price = document.getElementById('price').value;
            const description = document.getElementById('description').value;
            let image = ""; // Default empty

            const submitBtn = sellForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = 'กำลังลงขาย...';
            submitBtn.disabled = true;

            if (imagePreview.style.backgroundImage) {
                // Extract URL from url("...")
                image = imagePreview.style.backgroundImage.slice(5, -2).replace(/["']/g, "");
            }

            if (!image) {
                alert('กรุณาอัปโหลดรูปภาพสินค้า');
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
                return;
            }

            if (!user) {
                alert('กรุณาเข้าสู่ระบบก่อนลงขายสินค้า');
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
                window.location.href = 'login.html';
                return;
            }

            fetch(`${API_BASE_URL}/api/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, category, price, description, image, user_id: user.id })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        alert('ลงขายสินค้าเรียบร้อยแล้ว!');
                        window.location.href = 'index.html';
                    } else {
                        alert('เกิดข้อผิดพลาด: ' + (data.message || 'Unknown error'));
                        submitBtn.innerText = originalBtnText;
                        submitBtn.disabled = false;
                    }
                })
                .catch(err => {
                    console.error(err);
                    alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
                    submitBtn.innerText = originalBtnText;
                    submitBtn.disabled = false;
                });
        });
    }

    // Handle Register Form Submission
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            if (password.length < 8) {
                alert('รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
                return;
            }

            if (password !== confirmPassword) {
                alert('รหัสผ่านไม่ตรงกัน');
                return;
            }

            const submitBtn = registerForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = 'กำลังสมัคร...';
            submitBtn.disabled = true;

            fetch(`${API_BASE_URL}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        alert('สมัครสมาชิกสำเร็จ! ยินดีต้อนรับสู่ Reloop');
                        window.location.href = 'login.html';
                    } else {
                        alert('การสมัครสมาชิกไม่สำเร็จ: ' + data.message);
                        submitBtn.innerText = originalBtnText;
                        submitBtn.disabled = false;
                    }
                })
                .catch(err => {
                    console.error(err);
                    alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
                    submitBtn.innerText = originalBtnText;
                    submitBtn.disabled = false;
                });
        });
    }

    // Handle Login Form Submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = 'กำลังเข้าสู่ระบบ...';
            submitBtn.disabled = true;

            fetch(`${API_BASE_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        alert('เข้าสู่ระบบสำเร็จ!');
                        // Store user info if needed
                        localStorage.setItem('reloop_user', JSON.stringify(data.user));
                        window.location.href = 'profile.html';
                    } else {
                        alert('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
                        submitBtn.innerText = originalBtnText;
                        submitBtn.disabled = false;
                    }
                })
                .catch(err => {
                    console.error(err);
                    alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
                    submitBtn.innerText = originalBtnText;
                    submitBtn.disabled = false;
                });
        });
    }

    // Check User Login State
    // const user = JSON.parse(localStorage.getItem('reloop_user')); // Already initialized at top
    const userLink = document.querySelector('.nav-icons .btn-icon i.fa-user')?.closest('a');

    if (user && userLink) {
        userLink.href = 'profile.html';
    }

    // Profile Page Logic
    if (window.location.pathname.includes('profile.html')) {
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        // Fetch latest user data
        fetch(`${API_BASE_URL}/api/user/${user.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    // Update local storage with latest data
                    localStorage.setItem('reloop_user', JSON.stringify(data.user));

                    // Update UI
                    document.getElementById('profileName').textContent = data.user.username;
                    document.getElementById('profileEmail').textContent = data.user.email;

                    if (data.user.profile_image) {
                        document.getElementById('profileImageDisplay').src = data.user.profile_image;
                    }

                    if (data.user.bio) {
                        document.getElementById('profileBio').value = data.user.bio;
                    }

                    // Check for admin access
                    const adminEmails = ['Chayaphat7184@gmail.com', 'jummum128@gmail.com', 'kvtd@gmail.com'];
                    if (adminEmails.includes(data.user.email)) {
                        const adminBtn = document.getElementById('adminDashboardBtn');
                        if (adminBtn) {
                            adminBtn.style.display = 'block';
                        }
                    }
                }
            })
            .catch(err => console.error('Error fetching user data:', err));

        document.getElementById('profileName').textContent = user.username;
        document.getElementById('profileEmail').textContent = user.email;

        const profileImageDisplay = document.getElementById('profileImageDisplay');
        if (user.profile_image) {
            profileImageDisplay.src = user.profile_image;
        }

        const profileBio = document.getElementById('profileBio');
        if (user.bio) {
            profileBio.value = user.bio;
        }

        const saveBioBtn = document.getElementById('saveBioBtn');
        if (saveBioBtn) {
            saveBioBtn.addEventListener('click', () => {
                console.log('Save button clicked');
                const bioInput = document.getElementById('profileBio');
                const bio = bioInput.value;
                const originalText = saveBioBtn.innerText;

                saveBioBtn.innerText = 'กำลังบันทึก...';
                saveBioBtn.disabled = true;

                fetch(`${API_BASE_URL}/api/user/update`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: user.id, bio: bio })
                })
                    .then(res => res.json())
                    .then(data => {
                        console.log('Save response:', data);
                        if (data.success) {
                            user.bio = bio;
                            localStorage.setItem('reloop_user', JSON.stringify(user));
                            alert('บันทึกข้อมูลเรียบร้อยแล้ว');
                        } else {
                            alert('เกิดข้อผิดพลาดในการบันทึก: ' + (data.message || 'Unknown error'));
                        }
                    })
                    .catch(err => {
                        console.error('Save error:', err);
                        alert('เกิดข้อผิดพลาดในการเชื่อมต่อ: ' + err.message);
                    })
                    .finally(() => {
                        saveBioBtn.innerText = originalText;
                        saveBioBtn.disabled = false;
                    });
            });
        }

        // Fetch Order History
        // Fetch Order History and Setup Filtering
        let allOrders = [];

        window.filterOrders = function (status) {
            // Update active tab
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
                btn.style.borderBottom = 'none';
                btn.style.color = '#999';
            });
            const activeBtn = document.querySelector(`button[onclick="filterOrders('${status}')"]`);
            if (activeBtn) {
                activeBtn.classList.add('active');
                activeBtn.style.borderBottom = '2px solid #6c5ce7';
                activeBtn.style.color = '#6c5ce7';
            }

            const orderList = document.getElementById('orderList');
            const filteredOrders = allOrders.filter(order => order.status === status);

            if (filteredOrders.length > 0) {
                orderList.innerHTML = filteredOrders.map(order => {
                    let statusText = order.status;
                    if (order.status === 'preparing') statusText = 'กำลังเตรียมสินค้า';
                    else if (order.status === 'picked_up') statusText = 'เข้ารับพัสดุแล้ว';
                    else if (order.status === 'shipping') statusText = 'อยู่ระหว่างการจัดส่ง';

                    return `
                        <div class="order-card" style="border: 1px solid #eee; padding: 15px; border-radius: 10px; margin-bottom: 15px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-weight: bold;">
                                <span>Order #${order.id}</span>
                                <span>฿${Number(order.total_amount).toLocaleString()}</span>
                            </div>
                            <div style="font-size: 0.9rem; color: #777; margin-bottom: 10px;">
                                <div>สั่งซื้อเมื่อ: ${new Date(order.created_at).toLocaleString('th-TH')}</div>
                                <div style="color: #0984e3; font-weight: 600; margin-top: 5px;">
                                    สถานะ: ${statusText}
                                </div>
                                ${order.estimated_delivery ? `
                                <div style="color: #00b894; margin-top: 2px;">
                                    จะถึงประมาณ: ${new Date(order.estimated_delivery).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })} (ใช้เวลาจัดส่งประมาณ 2-3 วัน)
                                </div>` : ''}
                            </div>
                            <div class="order-items">
                                ${order.items.map(item => `
                                    <div style="display: flex; align-items: center; margin-top: 5px;">
                                        <img src="${item.image}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 5px; margin-right: 10px;">
                                        <div>
                                            <div style="font-size: 0.9rem;">${item.name}</div>
                                            <div style="font-size: 0.8rem; color: #999;">x${item.quantity}</div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }).join('');
            } else {
                orderList.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">ไม่มีรายการในสถานะนี้</p>';
            }
        };

        fetch(`${API_BASE_URL}/api/orders/user/${user.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    allOrders = data.orders;
                    // Default to 'preparing' tab
                    filterOrders('preparing');
                } else {
                    document.getElementById('orderList').innerHTML = '<p style="text-align: center; color: #999;">ยังไม่มีประวัติการสั่งซื้อ</p>';
                }

                // Auto-scroll to order history if URL has hash #orders
                if (window.location.hash === '#orders') {
                    setTimeout(() => {
                        const orderHistorySection = document.querySelector('.order-history');
                        if (orderHistorySection) {
                            orderHistorySection.scrollIntoView({ behavior: 'smooth' });
                        }
                    }, 500);
                }
            })
            .catch(err => {
                console.error(err);
                const orderList = document.getElementById('orderList');
                if (orderList) orderList.innerHTML = '<p style="text-align: center; color: red;">ไม่สามารถโหลดข้อมูลได้</p>';
            });

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('reloop_user');
                window.location.href = 'index.html';
            });
        }

        // Profile Image Upload
        const profileUpload = document.getElementById('profileUpload');
        if (profileUpload) {
            profileUpload.addEventListener('change', function () {
                const file = this.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        const img = new Image();
                        img.src = e.target.result;

                        img.onload = function () {
                            // Resize image
                            const canvas = document.createElement('canvas');
                            const MAX_WIDTH = 400;
                            const MAX_HEIGHT = 400;
                            let width = img.width;
                            let height = img.height;

                            if (width > height) {
                                if (width > MAX_WIDTH) {
                                    height *= MAX_WIDTH / width;
                                    width = MAX_WIDTH;
                                }
                            } else {
                                if (height > MAX_HEIGHT) {
                                    width *= MAX_HEIGHT / height;
                                    height = MAX_HEIGHT;
                                }
                            }

                            canvas.width = width;
                            canvas.height = height;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0, width, height);

                            // Get compressed data URL
                            const imageData = canvas.toDataURL('image/jpeg', 0.7);
                            profileImageDisplay.src = imageData;

                            // Update on server
                            fetch(`${API_BASE_URL}/api/user/update`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ id: user.id, profile_image: imageData })
                            })
                                .then(res => res.json())
                                .then(data => {
                                    if (data.success) {
                                        // Update local storage
                                        user.profile_image = imageData;
                                        localStorage.setItem('reloop_user', JSON.stringify(user));
                                        alert('อัปเดตโปรไฟล์เรียบร้อยแล้ว');
                                    } else {
                                        alert('เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์');
                                    }
                                })
                                .catch(err => console.error(err));
                        };
                    }
                    reader.readAsDataURL(file);
                }
            });
        }
    }
});


