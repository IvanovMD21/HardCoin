// Утилиты для работы с localStorage и общие функции

// Безопасное сохранение текущего пользователя
function setCurrentUser(user) {
  const safeUser = { ...user };
  delete safeUser.password;
  localStorage.setItem('currentUser', JSON.stringify(safeUser));
}

// Получение текущего пользователя
function getCurrentUser() {
  try {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  } catch (e) {
    console.error('Ошибка чтения currentUser:', e);
    return null;
  }
}

function logout() {
  localStorage.removeItem('currentUser');
  sessionStorage.clear();
  
  // Определяем, где мы находимся
  const path = window.location.pathname;
  
  if (path.includes('/pages/')) {
    // Если мы в папке pages, поднимаемся на уровень выше
    window.location.href = '../index.html';
  } else {
    // Если мы уже в корне
    window.location.href = 'index.html';
  }
}

// Проверка авторизации
function checkAuth() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'auth.html';
    return null;
  }
  return user;
}

// Проверка роли
function checkRole(allowedRoles) {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'auth.html';
    return false;
  }
  if (!allowedRoles.includes(user.role)) {
    showNotification('У вас нет доступа к этой странице', 'error');
    window.location.href = 'dashboard.html';
    return false;
  }
  return true;
}

// Безопасное получение данных из localStorage
function getData(key) {
  try {
    const data = localStorage.getItem(key);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error(`Ошибка чтения ${key}:`, e);
    return [];
  }
}

// Безопасное сохранение данных в localStorage
function saveData(key, data) {
  try {
    let safeData = data;
    if (key === 'users') {
      safeData = data.map(user => ({ ...user }));
    }
    localStorage.setItem(key, JSON.stringify(safeData));
    return true;
  } catch (e) {
    console.error(`Ошибка сохранения ${key}:`, e);
    showNotification('Ошибка сохранения данных', 'error');
    return false;
  }
}

// Генерация безопасного ID
function generateId() {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substr(2, 9);
  return `${timestamp}-${randomPart}`;
}

// Форматирование даты
function formatDate(dateString) {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (e) {
    return '—';
  }
}

// Форматирование даты для input
function formatDateForInput(dateString) {
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch (e) {
    return '';
  }
}

// Получение дней в месяце
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

// Получение первого дня месяца (Пн = 0)
function getFirstDayOfMonth(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  return firstDay === 0 ? 6 : firstDay - 1;
}

// Получение названия месяца
function getMonthName(month) {
  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];
  return months[month] || '';
}

// Показать уведомление
function showNotification(message, type = 'info') {
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(n => n.remove());
  
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  const colors = {
    success: '#4CAF50',
    error: '#f44336',
    warning: '#FF9800',
    info: '#2196F3'
  };
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    background: var(--dark-gray);
    border: 1px solid ${colors[type] || 'var(--gold)'};
    border-radius: 8px;
    color: var(--text);
    z-index: 10000;
    animation: slideIn 0.3s ease;
    max-width: 300px;
    word-wrap: break-word;
  `;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }, 3000);
}

// Валидация email
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Валидация телефона
function validatePhone(phone) {
  if (!phone) return true;
  const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return re.test(phone.replace(/\s/g, ''));
}

// Получение параметров из URL
function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
}

// Санитизация ввода (защита от XSS)
function sanitizeInput(input) {
  if (!input) return '';
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

// ==================== КАСТОМНОЕ МОДАЛЬНОЕ ОКНО ПОДТВЕРЖДЕНИЯ ====================

// Флаг для отслеживания, используется ли кастомный confirm
let useCustomConfirm = true;

// Кастомное модальное окно подтверждения
function showConfirm(title, message, onConfirm, onCancel) {
  // Удаляем предыдущее окно подтверждения
  const existingConfirm = document.querySelector('.custom-confirm-overlay');
  if (existingConfirm) existingConfirm.remove();
  
  const overlay = document.createElement('div');
  overlay.className = 'custom-confirm-overlay';
  
  overlay.innerHTML = `
    <div class="custom-confirm-modal">
      <div class="custom-confirm-header">
        <h3>${title || 'Подтверждение'}</h3>
      </div>
      <div class="custom-confirm-body">
        <p>${message}</p>
      </div>
      <div class="custom-confirm-actions">
        <button class="custom-confirm-btn cancel">Отмена</button>
        <button class="custom-confirm-btn confirm">Подтвердить</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  const closeModal = (confirmed) => {
    overlay.style.animation = 'fadeOut 0.2s ease';
    setTimeout(() => {
      overlay.remove();
      if (confirmed && onConfirm) onConfirm();
      if (!confirmed && onCancel) onCancel();
    }, 200);
  };
  
  overlay.querySelector('.confirm').addEventListener('click', () => closeModal(true));
  overlay.querySelector('.cancel').addEventListener('click', () => closeModal(false));
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal(false);
  });
  
  const handleEsc = (e) => {
    if (e.key === 'Escape') {
      closeModal(false);
      document.removeEventListener('keydown', handleEsc);
    }
  };
  document.addEventListener('keydown', handleEsc);
}

// Асинхронная версия confirm
function confirmAsync(message) {
  return new Promise((resolve) => {
    showConfirm('Подтверждение', message, 
      () => resolve(true),
      () => resolve(false)
    );
  });
}

// Заменяем стандартный confirm только на страницах сайта
const originalConfirm = window.confirm;
window.confirm = function(message) {
  // Проверяем, находимся ли мы на страницах сайта
  const isOurSite = document.querySelector('.header, .dashboard, .auth-container, .main');
  
  if (isOurSite && useCustomConfirm) {
    // Для синхронного кода используем оригинальный confirm как fallback,
    // но показываем уведомление о необходимости использовать async версию
    console.warn('Используйте confirmAsync() вместо confirm() для кастомного окна');
    return originalConfirm.call(window, message);
  }
  
  return originalConfirm.call(window, message);
};

// Функция для включения/отключения кастомного confirm
function setCustomConfirm(enabled) {
  useCustomConfirm = enabled;
}

// Добавление стилей
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(100px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes slideOut {
    from { opacity: 1; transform: translateX(0); }
    to { opacity: 0; transform: translateX(100px); }
  }
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
  
  .custom-confirm-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(5px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10001;
    animation: fadeIn 0.2s ease;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  .custom-confirm-modal {
    background: var(--dark-gray);
    border: 1px solid var(--gold);
    border-radius: 16px;
    padding: 1.5rem;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    animation: modalSlideIn 0.3s ease;
  }
  
  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: translateY(-30px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  .custom-confirm-header {
    margin-bottom: 1rem;
  }
  
  .custom-confirm-header h3 {
    color: var(--gold);
    font-size: 1.3rem;
    margin: 0;
  }
  
  .custom-confirm-body {
    margin-bottom: 1.5rem;
  }
  
  .custom-confirm-body p {
    color: var(--text);
    line-height: 1.5;
    margin: 0;
  }
  
  .custom-confirm-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
  }
  
  .custom-confirm-btn {
    padding: 0.7rem 1.5rem;
    border-radius: 25px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    border: none;
    font-size: 0.95rem;
  }
  
  .custom-confirm-btn.cancel {
    background: transparent;
    border: 1px solid var(--gold);
    color: var(--text);
  }
  
  .custom-confirm-btn.cancel:hover {
    background: rgba(212, 175, 55, 0.1);
  }
  
  .custom-confirm-btn.confirm {
    background: var(--gold);
    color: var(--black);
  }
  
  .custom-confirm-btn.confirm:hover {
    background: #f0c35c;
    transform: scale(1.05);
  }
`;
document.head.appendChild(notificationStyles);
