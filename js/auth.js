// Модуль авторизации и регистрации
document.addEventListener('DOMContentLoaded', () => {
  const params = getUrlParams();
  const mode = params.mode || 'login';
  
  initAuthPage(mode);
});

function initAuthPage(mode) {
  const container = document.querySelector('.auth-container');
  if (!container) return;
  
  if (mode === 'register') {
    renderRegisterForm(container);
  } else if (mode === 'forgot') {
    renderForgotPasswordForm(container);
  } else {
    renderLoginForm(container);
  }
}

// Форма входа
function renderLoginForm(container) {
  container.innerHTML = `
    <div class="auth-card">
      <h2>Вход в Hard Coin</h2>
      <form class="auth-form" id="loginForm">
        <div class="form-group">
          <label>Почта <span class="required">*</span></label>
          <input type="email" id="loginEmail" placeholder="example@mail.com" required>
          <div class="error-message" id="loginEmailError"></div>
        </div>
        <div class="form-group">
          <label>Пароль <span class="required">*</span></label>
          <input type="password" id="loginPassword" placeholder="••••••••" required>
          <div class="error-message" id="loginPasswordError"></div>
        </div>
        <div class="forgot-password">
          <a class="auth-link" onclick="showForgotPasswordModal()">Забыли пароль?</a>
        </div>
        <button type="submit" class="btn-auth">Войти</button>
      </form>
      <div class="auth-footer">
        Нет аккаунта? <a href="auth.html?mode=register" class="auth-link">Зарегистрироваться</a>
      </div>
    </div>
    
    <!-- Модальное окно восстановления пароля -->
    <div class="modal-overlay" id="forgotPasswordModal">
      <div class="modal-content">
        <h3>Восстановление пароля</h3>
        <form id="forgotPasswordForm">
          <div class="form-group">
            <label>Введите вашу почту</label>
            <input type="email" id="forgotEmail" placeholder="example@mail.com" required>
          </div>
          <div class="form-group">
            <label>Новый пароль</label>
            <input type="password" id="newPassword" placeholder="••••••••" required>
          </div>
          <div class="form-group">
            <label>Подтвердите пароль</label>
            <input type="password" id="confirmNewPassword" placeholder="••••••••" required>
          </div>
          <button type="submit" class="btn-auth">Сменить пароль</button>
        </form>
        <button class="modal-close" onclick="closeForgotPasswordModal()">&times;</button>
      </div>
    </div>
  `;
  
  // Обработчик формы входа
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
}

// Форма регистрации
function renderRegisterForm(container) {
  container.innerHTML = `
    <div class="auth-card">
      <h2>Регистрация</h2>
      <form class="auth-form" id="registerForm">
        <div class="form-group">
          <label>Фамилия Имя <span class="required">*</span></label>
          <input type="text" id="fullName" placeholder="Иванов Иван" required>
          <div class="error-message" id="fullNameError"></div>
        </div>
        <div class="form-group">
          <label>Почта <span class="required">*</span></label>
          <input type="email" id="registerEmail" placeholder="example@mail.com" required>
          <div class="error-message" id="registerEmailError"></div>
        </div>
        <div class="form-group">
          <label>Номер телефона <span class="optional-badge">необязательно</span></label>
          <input type="tel" id="registerPhone" placeholder="+7 (999) 123-45-67">
          <div class="error-message" id="registerPhoneError"></div>
        </div>
        <div class="form-group">
          <label>Пароль <span class="required">*</span></label>
          <input type="password" id="registerPassword" placeholder="••••••••" required>
          <div class="error-message" id="registerPasswordError"></div>
        </div>
        <div class="form-group">
          <label>Подтвердите пароль <span class="required">*</span></label>
          <input type="password" id="confirmPassword" placeholder="••••••••" required>
          <div class="error-message" id="confirmPasswordError"></div>
        </div>
        <button type="submit" class="btn-auth">Зарегистрироваться</button>
      </form>
      <div class="auth-footer">
        Уже есть аккаунт? <a href="auth.html?mode=login" class="auth-link">Войти</a>
      </div>
    </div>
  `;
  
  // Обработчик формы регистрации
  document.getElementById('registerForm').addEventListener('submit', handleRegister);
}

// Обработка входа
function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  
  // Валидация
  let hasError = false;
  
  if (!validateEmail(email)) {
    document.getElementById('loginEmailError').textContent = 'Введите корректный email';
    hasError = true;
  }
  
  if (password.length < 3) {
    document.getElementById('loginPasswordError').textContent = 'Пароль должен быть не менее 3 символов';
    hasError = true;
  }
  
  if (hasError) return;
  
  // Поиск пользователя
  const users = getData('users');
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    showNotification('Неверная почта или пароль', 'error');
    return;
  }
  
  // Сохраняем текущего пользователя
  setCurrentUser(user);
  showNotification('Вход выполнен успешно!', 'success');
  
  // Перенаправляем в личный кабинет
  setTimeout(() => {
    const path = window.location.pathname;
    if (path.includes('/pages/')) {
      window.location.href = 'dashboard.html';
    } else {
      window.location.href = 'pages/dashboard.html';
    }
  }, 500);
}

// Обработка регистрации
function handleRegister(e) {
  e.preventDefault();
  
  const fullName = document.getElementById('fullName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const phone = document.getElementById('registerPhone').value.trim();
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  // Валидация
  let hasError = false;
  
  if (fullName.length < 3) {
    document.getElementById('fullNameError').textContent = 'Введите полное имя';
    hasError = true;
  }
  
  if (!validateEmail(email)) {
    document.getElementById('registerEmailError').textContent = 'Введите корректный email';
    hasError = true;
  }
  
  if (phone && !validatePhone(phone)) {
    document.getElementById('registerPhoneError').textContent = 'Введите корректный телефон';
    hasError = true;
  }
  
  if (password.length < 3) {
    document.getElementById('registerPasswordError').textContent = 'Пароль должен быть не менее 3 символов';
    hasError = true;
  }
  
  if (password !== confirmPassword) {
    document.getElementById('confirmPasswordError').textContent = 'Пароли не совпадают';
    hasError = true;
  }
  
  if (hasError) return;
  
  // Проверка существования пользователя
  const users = getData('users');
  const existingUser = users.find(u => u.email === email);
  
  if (existingUser) {
    document.getElementById('registerEmailError').textContent = 'Пользователь с такой почтой уже существует';
    return;
  }
  
  // Создание нового клиента
  const [lastName, firstName] = fullName.split(' ');
  const newUser = {
    id: generateId(),
    email: email,
    password: password,
    firstName: firstName || fullName,
    lastName: lastName || '',
    phone: phone || '',
    role: 'client',
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  saveData('users', users);
  
  // Автоматический вход
  setCurrentUser(newUser);
  showNotification('Регистрация успешна! Добро пожаловать в Hard Coin!', 'success');
  
  // После успешного входа
  setTimeout(() => {
    const path = window.location.pathname;
    if (path.includes('/pages/')) {
      window.location.href = 'dashboard.html';
    } else {
      window.location.href = 'pages/dashboard.html';
    }
  }, 500);
}

// Показать модальное окно восстановления пароля
function showForgotPasswordModal() {
  document.getElementById('forgotPasswordModal').classList.add('active');
  
  document.getElementById('forgotPasswordForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('forgotEmail').value.trim();
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    
    if (!validateEmail(email)) {
      showNotification('Введите корректный email', 'error');
      return;
    }
    
    if (newPassword.length < 3) {
      showNotification('Пароль должен быть не менее 3 символов', 'error');
      return;
    }
    
    if (newPassword !== confirmNewPassword) {
      showNotification('Пароли не совпадают', 'error');
      return;
    }
    
    const users = getData('users');
    const user = users.find(u => u.email === email);
    
    if (!user) {
      showNotification('Пользователь с такой почтой не найден', 'error');
      return;
    }
    
    user.password = newPassword;
    saveData('users', users);
    
    closeForgotPasswordModal();
    showNotification('Пароль успешно изменен!', 'success');
  });
}

function closeForgotPasswordModal() {
  document.getElementById('forgotPasswordModal').classList.remove('active');
}
