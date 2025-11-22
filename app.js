// Базовые функции приложения
class CourierApp {
    constructor() {
        this.currentPage = 'login';
        this.currentCourier = null;
        this.orders = [];
        this.currentMapOrder = null;
        this.init();
    }

    async init() {
        await this.loadData();
        this.setupEventListeners();
        this.renderOrders();
        this.updateStats();
    }

    async loadData() {
        try {
            const response = await fetch('data.json');
            const data = await response.json();
            this.orders = data.orders;
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            // Запасные данные на случай ошибки
            this.orders = [
                {
                    id: 1,
                    address: "ул. Ленина, 15, кв. 42",
                    client_name: "Анна Сидорова",
                    client_phone: "+79123456780",
                    status: "completed",
                    notes: "Код домофона 42К#",
                    sequence: 1,
                    coordinates: { lat: 55.7558, lng: 37.6173 }
                },
                {
                    id: 2,
                    address: "пр. Мира, 28, офис 305",
                    client_name: "Петр Иванов",
                    client_phone: "+79123456781",
                    status: "pending",
                    notes: "Вход через бизнес-центр",
                    sequence: 2,
                    coordinates: { lat: 55.7604, lng: 37.6184 }
                },
                {
                    id: 3,
                    address: "ул. Садовая, 7, подъезд 2",
                    client_name: "Мария Петрова",
                    client_phone: "+79123456782",
                    status: "pending",
                    notes: "Звонок за 15 минут",
                    sequence: 3,
                    coordinates: { lat: 55.7649, lng: 37.6223 }
                }
            ];
        }
    }

    setupEventListeners() {
        // Обработчик формы входа
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Обработчик меню профиля
        document.querySelector('.profile-menu').addEventListener('click', (e) => {
            this.showProfileMenu();
        });
    }

    handleLogin() {
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('errorMessage');

        // Простая валидация для демонстрации
        if (phone === '+79123456789' && password === '123456') {
            this.currentCourier = {
                id: 1,
                phone: "+79123456789",
                name: "Иван Курьеров",
                vehicle: "car"
            };
            this.showPage('main');
            errorMessage.style.display = 'none';
        } else {
            errorMessage.style.display = 'block';
        }
    }

    showPage(pageName) {
        // Скрываем все страницы
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Показываем нужную страницу
        document.getElementById(pageName + 'Page').classList.add('active');
        this.currentPage = pageName;

        // Если переходим на главную страницу, обновляем данные
        if (pageName === 'main') {
            this.renderOrders();
            this.updateStats();
        }
    }

    renderOrders() {
        const orderList = document.getElementById('orderList');
        orderList.innerHTML = '';

        this.orders.forEach(order => {
            const orderElement = document.createElement('div');
            orderElement.className = `order-card ${order.status === 'completed' ? 'completed' : ''}`;
            orderElement.innerHTML = `
                <div class="order-header">
                    <div class="order-address">${order.sequence}. ${order.address}</div>
                    <div class="order-status status-${order.status}">
                        ${order.status === 'completed' ? 'Доставлен' : 'В процессе'}
                    </div>
                </div>
                <div class="order-client">${order.client_name} • ${order.client_phone}</div>
                ${order.notes ? `<div class="order-notes">${order.notes}</div>` : ''}
                <div class="order-actions">
                    ${order.status !== 'completed' ? `
                        <button class="btn-small btn-success" onclick="app.markAsDelivered(${order.id})">
                            ✅ Доставлено
                        </button>
                    ` : ''}
                    <button class="btn-small btn-outline" onclick="app.showOrderDetails(${order.id})">
                        ℹ️ Подробнее
                    </button>
                    <button class="btn-small btn-map" onclick="app.showOrderMap(${order.id})">
                        🗺️ Карта
                    </button>
                </div>
            `;
            orderList.appendChild(orderElement);
        });
    }

    updateStats() {
        const totalOrders = this.orders.length;
        const completedOrders = this.orders.filter(order => order.status === 'completed').length;

        document.getElementById('totalOrders').textContent = totalOrders;
        document.getElementById('completedOrders').textContent = completedOrders;
        
        if (this.currentCourier) {
            document.getElementById('courierName').textContent = this.currentCourier.name;
        }
    }

    markAsDelivered(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            order.status = 'completed';
            this.renderOrders();
            this.updateStats();
            
            // В реальном приложении здесь был бы запрос к серверу
            console.log(`Заказ ${orderId} отмечен как доставленный`);
            
            // Показываем уведомление
            this.showNotification(`Заказ №${orderId} отмечен как доставленный`);
        }
    }

    showOrderDetails(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            alert(`Детали заказа:\n\nАдрес: ${order.address}\nКлиент: ${order.client_name}\nТелефон: ${order.client_phone}\nЗаметки: ${order.notes || 'нет'}`);
        }
    }

    showOrderMap(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            this.currentMapOrder = order;
            
            // Обновляем информацию на странице карты
            document.getElementById('mapOrderAddress').textContent = order.address;
            document.getElementById('mapClientName').textContent = order.client_name;
            document.getElementById('mapClientPhone').textContent = order.client_phone;
            document.getElementById('mapOrderNotes').textContent = order.notes || 'Нет заметок';
            
            // Показываем страницу карты
            this.showPage('map');
            
            // В реальном приложении здесь была бы инициализация карты
            this.initMap(order);
        }
    }

    initMap(order) {
        ymaps.ready(() => {
    const map = new ymaps.Map('orderMap', {
        center: [order.coordinates.lat, order.coordinates.lng],
        zoom: 15
    });
    
    const placemark = new ymaps.Placemark([order.coordinates.lat, order.coordinates.lng], {
        hintContent: order.address,
        balloonContent: order.client_name
    });
    
    map.geoObjects.add(placemark);
});
    }

    markCurrentMapOrderDelivered() {
        if (this.currentMapOrder) {
            this.markAsDelivered(this.currentMapOrder.id);
            this.showPage('main');
        }
    }

    showRouteToOrder() {
        if (this.currentMapOrder) {
            // В реальном приложении здесь был бы запуск навигации
            alert(`Запуск навигации до: ${this.currentMapOrder.address}`);
            
            // Эмуляция открытия карт
            const address = encodeURIComponent(this.currentMapOrder.address);
            const mapsUrl = `https://yandex.ru/maps/?text=${address}`;
            
            // Открываем в новом окне (в реальном приложении лучше использовать deep link)
            window.open(mapsUrl, '_blank');
        }
    }

    showProfileMenu() {
        // Простое меню профиля
        const action = confirm('Действия профиля:\n\n- Посмотреть статистику\n- Выйти из системы\n\nНажмите OK для выхода');
        if (action) {
            this.logout();
        }
    }

    logout() {
        this.currentCourier = null;
        this.showPage('login');
        document.getElementById('phone').value = '';
        document.getElementById('password').value = '';
    }

    showNotification(message) {
        // Простое уведомление
        alert(message);
    }
}

// Инициализация приложения
const app = new CourierApp();