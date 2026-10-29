document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('reloop_user'));
    if (!user) {
        alert('กรุณาเข้าสู่ระบบก่อนใช้งานแชท');
        window.location.href = 'login.html';
        return;
    }

    const conversationList = document.getElementById('conversationList');
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatHeader = document.getElementById('chatHeader');
    const chatInputArea = document.getElementById('chatInputArea');
    const chatPartnerName = document.getElementById('chatPartnerName');
    const chatProductName = document.getElementById('chatProductName');
    const chatProductImage = document.getElementById('chatProductImage');

    let currentConversationId = null;
    let pollingInterval = null;
    let conversationsData = [];

    // Check for query params to start new chat
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('productId');
    const sellerId = urlParams.get('sellerId');

    // Determine API Base URL
    const API_BASE_URL = window.location.protocol === 'file:' ? 'http://localhost:3001' : '';

    if (productId && sellerId) {
        startChat(productId, sellerId);
    } else {
        loadConversations();
    }

    function startChat(productId, sellerId) {
        fetch(`${API_BASE_URL}/api/chat/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                product_id: productId,
                buyer_id: user.id,
                seller_id: sellerId
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    currentConversationId = data.conversationId;
                    loadConversations().then(() => {
                        loadMessages(currentConversationId);
                    });
                    // Remove query params from URL without refresh
                    window.history.replaceState({}, document.title, 'chat.html');
                } else {
                    alert('Error starting chat: ' + data.message);
                }
            })
            .catch(err => console.error(err));
    }

    function loadConversations() {
        return fetch(`${API_BASE_URL}/api/chat/user/${user.id}?_=${Date.now()}`)
            .then(res => res.json())
            .then(conversations => {
                conversationsData = conversations;
                conversationList.innerHTML = '';
                conversations.forEach(conv => {
                    const isBuyer = conv.buyer_id === user.id;
                    const partnerName = isBuyer ? conv.seller_name : conv.buyer_name;
                    const item = document.createElement('div');
                    item.className = `conversation-item ${conv.id === currentConversationId ? 'active' : ''}`;
                    item.innerHTML = `
                        <img src="${conv.product_image}" alt="Product">
                        <div class="conversation-info">
                            <h4>${partnerName}</h4>
                            <p>${conv.product_name}</p>
                        </div>
                    `;
                    item.addEventListener('click', () => {
                        currentConversationId = conv.id;
                        loadMessages(conv.id);
                        loadConversations(); // Refresh to update active state
                    });
                    conversationList.appendChild(item);
                });
            });
    }

    function loadMessages(conversationId) {
        // Clear polling if exists
        if (pollingInterval) clearInterval(pollingInterval);

        // UI Updates
        chatHeader.style.display = 'flex';
        chatInputArea.style.display = 'flex';

        // Update Header Info
        // Update Header Info
        const conv = conversationsData.find(c => c.id === conversationId);
        if (conv) {
            const isBuyer = conv.buyer_id === user.id;
            const partnerName = isBuyer ? conv.seller_name : conv.buyer_name;

            if (chatPartnerName) chatPartnerName.textContent = partnerName;
            if (chatProductName) chatProductName.textContent = conv.product_name || 'สินค้า';
            if (chatProductImage) {
                chatProductImage.src = conv.product_image || 'images/no-image.png';
                chatProductImage.onerror = () => { chatProductImage.src = 'https://via.placeholder.com/40'; };
            }

            // Admin Delete Button
            const ADMIN_EMAILS = ['Chayaphat7184@gmail.com', 'jummum128@gmail.com', 'kvtd@gmail.com'];
            const isAdmin = ADMIN_EMAILS.includes(user.email);

            // Remove existing delete button if any
            const existingBtn = document.getElementById('deleteChatBtn');
            if (existingBtn) existingBtn.remove();

            if (isAdmin) {
                const deleteBtn = document.createElement('button');
                deleteBtn.id = 'deleteChatBtn';
                deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
                deleteBtn.style.cssText = 'background: #ff7675; color: white; border: none; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; margin-left: 10px; display: flex; align-items: center; justify-content: center;';
                deleteBtn.title = 'ลบแชทนี้';

                deleteBtn.onclick = () => {
                    if (confirm('คุณแน่ใจหรือไม่ที่จะลบแชทนี้?')) {
                        fetch(`${API_BASE_URL}/api/chat/${conversationId}`, {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ userId: user.id })
                        })
                            .then(res => res.json())
                            .then(data => {
                                if (data.success) {
                                    alert('ลบแชทเรียบร้อยแล้ว / Chat deleted successfully');
                                    window.location.reload(true);
                                } else {
                                    alert('เกิดข้อผิดพลาด / Error: ' + (data.message || data.error));
                                    console.error('Delete failed response:', data);
                                }
                            })
                            .catch(err => console.error(err));
                    }
                };

                // Append to header container (assumes structure)
                const headerRight = chatHeader.querySelector('div:last-child');
                if (headerRight) {
                    headerRight.appendChild(deleteBtn);
                }
            }

        } else {
            console.warn('Conversation not found in data:', conversationId);
        }

        fetchMessages(conversationId);

        // Start polling
        pollingInterval = setInterval(() => {
            fetchMessages(conversationId, false);
        }, 3000);
    }

    function fetchMessages(conversationId, scrollToBottom = true) {
        fetch(`${API_BASE_URL}/api/chat/${conversationId}`)
            .then(res => res.json())
            .then(messages => {
                chatMessages.innerHTML = '';
                messages.forEach(msg => {
                    const div = document.createElement('div');
                    div.className = `message ${msg.sender_id === user.id ? 'sent' : 'received'}`;
                    div.textContent = msg.content;
                    chatMessages.appendChild(div);
                });
                if (scrollToBottom) {
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }
            });
    }

    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    function sendMessage() {
        const content = messageInput.value.trim();
        if (!content) return;

        if (!currentConversationId) {
            console.error('No conversation selected');
            alert('กรุณาเลือกบทสนทนาก่อนส่งข้อความ');
            return;
        }

        console.log('Sending message:', content, 'to conversation:', currentConversationId);

        fetch(`${API_BASE_URL}/api/chat/${currentConversationId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sender_id: user.id,
                content: content
            })
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                if (data.success) {
                    console.log('Message sent successfully');
                    messageInput.value = '';
                    fetchMessages(currentConversationId);
                } else {
                    console.error('Server returned error:', data.error);
                    alert('ส่งข้อความไม่สำเร็จ: ' + (data.error || 'Unknown error'));
                }
            })
            .catch(err => {
                console.error('Fetch error:', err);
                alert('เกิดข้อผิดพลาดในการส่งข้อความ: ' + err.message);
            });
    }
});
