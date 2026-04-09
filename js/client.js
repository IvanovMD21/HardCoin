// Модуль личного кабинета клиента

function initClientDashboard() {
  const user = getCurrentUser();
  if (!user || user.role !== 'client') return;

  // Отрисовка меню клиента
  renderClientMenu();
  
  // Загружаем главную страницу клиента
  renderClientHome();
}

function renderClientMenu() {
  const menu = document.getElementById('sidebarMenu');
  menu.innerHTML = `
    <li class="menu-item active" data-panel="clientHome">
      <span class="icon">🏠</span> Главная
    </li>
    <li class="menu-item" data-panel="clientBooking">
      <span class="icon">📅</span> Записаться
    </li>
    <li class="menu-item" data-panel="clientAppointments">
      <span class="icon">📋</span> Мои записи
    </li>
    <li class="menu-item" data-panel="clientBarbers">
      <span class="icon">💈</span> Барберы и отзывы
    </li>
    <li class="menu-item" data-panel="clientProfile">
      <span class="icon">⚙️</span> Редактировать профиль
    </li>
  `;

  // Обработчики меню
  menu.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => {
      menu.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      
      const panel = item.dataset.panel;
      switch(panel) {
        case 'clientHome': renderClientHome(); break;
        case 'clientBooking': renderClientBooking(); break;
        case 'clientAppointments': renderClientAppointments(); break;
        case 'clientBarbers': renderClientBarbers(); break;
        case 'clientProfile': renderClientProfile(); break;
      }
    });
  });
}

function renderClientHome() {
  const content = document.getElementById('dashboardContent');
  const user = getCurrentUser();
  
  content.innerHTML = `
    <div class="content-header">
      <h1>Добро пожаловать, ${user.firstName}!</h1>
    </div>
    
    <div class="welcome-section">
      <div class="welcome-card">
        <h3>Ваш профиль</h3>
        <p><strong>Имя:</strong> ${user.firstName} ${user.lastName || ''}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Телефон:</strong> ${user.phone || 'Не указан'}</p>
        <p><strong>Дата регистрации:</strong> ${formatDate(user.createdAt)}</p>
      </div>
      
      <div class="quick-actions">
        <h3>Быстрые действия</h3>
        <div class="action-buttons">
          <button class="btn-primary" onclick="document.querySelector('[data-panel=clientBooking]').click()">
            📅 Записаться на стрижку
          </button>
          <button class="btn-primary" onclick="document.querySelector('[data-panel=clientBarbers]').click()">
            💈 Посмотреть барберов
          </button>
          <button class="btn-primary" onclick="document.querySelector('[data-panel=clientAppointments]').click()">
            📋 Мои записи
          </button>
        </div>
      </div>
    </div>
    
    <style>
      .welcome-section {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
        margin-top: 1rem;
      }
      
      .welcome-card, .quick-actions {
        background: var(--dark-gray);
        border: 1px solid var(--gold);
        border-radius: 12px;
        padding: 1.5rem;
      }
      
      .welcome-card h3, .quick-actions h3 {
        color: var(--gold);
        margin-bottom: 1rem;
      }
      
      .welcome-card p {
        margin: 0.5rem 0;
      }
      
      .action-buttons {
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
      }
      
      .action-buttons .btn-primary {
        width: 100%;
      }
      
      @media (max-width: 768px) {
        .welcome-section {
          grid-template-columns: 1fr;
        }
      }
    </style>
  `;
}

function renderClientBooking() {
  const content = document.getElementById('dashboardContent');
  const params = getUrlParams();
  const preselectedService = params.service;
  
  const users = getData('users');
  const services = getData('services');
  const masters = users.filter(u => u.role === 'master' || (u.role === 'admin' && u.specialization));
  
  content.innerHTML = `
    <div class="content-header">
      <h1>Запись на услугу</h1>
    </div>
    
    <div class="booking-form-container">
      <form class="dashboard-form" id="clientBookingForm">
        <div class="form-group">
          <label>Выберите услугу <span class="required">*</span></label>
          <select id="bookingService" required>
            <option value="">Выберите услугу</option>
            ${services.map(s => `
              <option value="${s.id}" ${preselectedService === s.name ? 'selected' : ''}>
                ${s.name} - ${s.price}₽ (${s.duration} мин)
              </option>
            `).join('')}
          </select>
        </div>
        
        <div class="form-group">
          <label>Выберите барбера <span class="required">*</span></label>
          <select id="bookingMaster" required>
            <option value="">Выберите барбера</option>
            ${masters.map(m => `
              <option value="${m.id}">${m.firstName} ${m.lastName || ''} (⭐ ${m.rating || '4.5'})</option>
            `).join('')}
          </select>
        </div>
        
        <div class="form-group">
          <label>Выберите дату <span class="required">*</span></label>
          <input type="date" id="bookingDate" required min="${new Date().toISOString().split('T')[0]}" class="date-input">
        </div>
        
        <div class="form-group">
          <label>Выберите время <span class="required">*</span></label>
          <select id="bookingTime" required>
            <option value="">Сначала заполните остальное</option>
          </select>
        </div>
        
        <button type="submit" class="btn-primary">Записаться</button>
      </form>
      
      <div class="booking-info">
        <h4>Информация</h4>
        <p>Выберите услугу, барбера, дату и удобное время. После записи вы получите подтверждение.</p>
        <p>Рабочее время барберов: с 10:00 до 20:00.</p>
      </div>
    </div>
    
    <style>
      .booking-form-container {
        display: grid;
        grid-template-columns: 1fr 300px;
        gap: 2rem;
      }
      
      .booking-info {
        background: var(--dark-gray);
        border: 1px solid var(--gold);
        border-radius: 12px;
        padding: 1.5rem;
        height: fit-content;
      }
      
      .booking-info h4 {
        color: var(--gold);
        margin-bottom: 1rem;
      }
      
      .booking-info p {
        margin-bottom: 0.8rem;
        color: var(--light-text);
      }
      
      @media (max-width: 768px) {
        .booking-form-container {
          grid-template-columns: 1fr;
        }
      }
    </style>
  `;
  
  // Обработчик выбора даты
  document.getElementById('bookingDate').addEventListener('change', (e) => {
    const masterId = document.getElementById('bookingMaster').value;
    const date = e.target.value;
    if (masterId && date) {
      loadAvailableTimes(masterId, date);
    }
  });
  
  document.getElementById('bookingMaster').addEventListener('change', (e) => {
    const masterId = e.target.value;
    const date = document.getElementById('bookingDate').value;
    if (masterId && date) {
      loadAvailableTimes(masterId, date);
    }
  });
  
  // Обработчик формы
  document.getElementById('clientBookingForm').addEventListener('submit', handleClientBooking);
}

function loadAvailableTimes(masterId, date) {
  const timeSelect = document.getElementById('bookingTime');
  const appointments = getData('appointments');
  
  // Получаем все записи мастера на выбранную дату
  const masterAppointments = appointments.filter(a => 
    a.masterId === masterId && 
    a.date === date && 
    a.status !== 'cancelled'
  );
  
  const bookedTimes = masterAppointments.map(a => a.time);
  
  // Доступное время с 10:00 до 20:00 с интервалом 1 час
  const availableTimes = [];
  for (let hour = 10; hour <= 20; hour++) {
    const time = `${hour.toString().padStart(2, '0')}:00`;
    if (!bookedTimes.includes(time)) {
      availableTimes.push(time);
    }
  }
  
  if (availableTimes.length === 0) {
    timeSelect.innerHTML = '<option value="">Нет свободного времени</option>';
  } else {
    timeSelect.innerHTML = '<option value="">Выберите время</option>' +
      availableTimes.map(t => `<option value="${t}">${t}</option>`).join('');
  }
}

function handleClientBooking(e) {
  e.preventDefault();
  
  const user = getCurrentUser();
  const serviceId = document.getElementById('bookingService').value;
  const masterId = document.getElementById('bookingMaster').value;
  const date = document.getElementById('bookingDate').value;
  const time = document.getElementById('bookingTime').value;
  
  if (!serviceId || !masterId || !date || !time) {
    showNotification('Заполните все поля', 'error');
    return;
  }
  
  const services = getData('services');
  const users = getData('users');
  const service = services.find(s => s.id === serviceId);
  const master = users.find(u => u.id === masterId);
  
  const appointments = getData('appointments');
  
  // Создаем новую запись
  const newAppointment = {
    id: generateId(),
    clientId: user.id,
    clientName: `${user.firstName} ${user.lastName || ''}`.trim(),
    clientPhone: user.phone || '',
    masterId: masterId,
    masterName: `${master.firstName} ${master.lastName || ''}`.trim(),
    serviceId: serviceId,
    serviceName: service.name,
    price: service.price,
    date: date,
    time: time,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  appointments.push(newAppointment);
  saveData('appointments', appointments);
  
  showNotification('Запись успешно создана!', 'success');
  
  // Переходим на страницу записей
  setTimeout(() => {
    document.querySelector('[data-panel="clientAppointments"]').click();
  }, 500);
}

function renderClientAppointments() {
  const content = document.getElementById('dashboardContent');
  const user = getCurrentUser();
  const appointments = getData('appointments');
  
  const myAppointments = appointments
    .filter(a => a.clientId === user.id)
    .sort((a, b) => {
      const dateA = new Date(a.date + 'T' + a.time);
      const dateB = new Date(b.date + 'T' + b.time);
      return dateB - dateA;
    });
  
  content.innerHTML = `
    <div class="content-header">
      <h1>Мои записи</h1>
    </div>
    
    ${myAppointments.length > 0 ? `
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Услуга</th>
              <th>Барбер</th>
              <th>Дата</th>
              <th>Время</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            ${myAppointments.map(app => `
              <tr>
                <td>${sanitizeInput(app.serviceName)}</td>
                <td>${sanitizeInput(app.masterName)}</td>
                <td>${formatDate(app.date)}</td>
                <td>${app.time}</td>
                <td>
                  <span class="status-badge ${app.status}">
                    ${getStatusText(app.status)}
                  </span>
                </td>
                <td>
                  ${app.status === 'pending' ? `
                    <button class="btn-action danger" onclick="cancelAppointment('${app.id}')">
                      Отменить
                    </button>
                  ` : ''}
                  ${app.status === 'completed' && !hasReview(app.id) ? `
                    <button class="btn-action success" onclick="showReviewForm('${app.id}')">
                      Оставить отзыв
                    </button>
                  ` : ''}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    ` : `
      <div class="no-data">
        <p>У вас пока нет записей</p>
        <button class="btn-primary" onclick="document.querySelector('[data-panel=clientBooking]').click()">
          Записаться на услугу
        </button>
      </div>
    `}
  `;
}


function getStatusText(status) {
  const statuses = {
    'pending': 'Ожидается',
    'completed': 'Выполнена',
    'cancelled': 'Отменена'
  };
  return statuses[status] || status;
}

function hasReview(appointmentId) {
  const reviews = getData('reviews');
  return reviews.some(r => r.appointmentId === appointmentId);
}

async function cancelAppointment(appointmentId) {
  const result = await confirmAsync('Вы уверены, что хотите отменить запись?');
  if (!result) return;
  
  const appointments = getData('appointments');
  const appointment = appointments.find(a => a.id === appointmentId);
  if (appointment) {
    appointment.status = 'cancelled';
    saveData('appointments', appointments);
    showNotification('Запись отменена', 'success');
    renderClientAppointments();
  }
}

function showReviewForm(appointmentId) {
  const appointments = getData('appointments');
  const appointment = appointments.find(a => a.id === appointmentId);
  
  const modal = document.getElementById('editModal');
  const modalBody = document.getElementById('editModalBody');
  const modalTitle = document.getElementById('editModalTitle');
  
  modalTitle.textContent = 'Оставить отзыв';
  modalBody.innerHTML = `
    <form id="reviewForm">
      <p><strong>Барбер:</strong> ${appointment.masterName}</p>
      <p><strong>Услуга:</strong> ${appointment.serviceName}</p>
      
      <div class="form-group">
        <label>Оценка</label>
        <div class="stars-select" id="starsSelect">
          ${[1,2,3,4,5].map(i => `
            <span class="star-option" data-rating="${i}">☆</span>
          `).join('')}
        </div>
        <input type="hidden" id="reviewRating" value="0">
      </div>
      
      <div class="form-group">
        <label>Комментарий</label>
        <textarea id="reviewComment" rows="4" placeholder="Напишите ваш отзыв..."></textarea>
      </div>
      
      <button type="submit" class="btn-primary">Отправить отзыв</button>
    </form>
    
    <style>
      .stars-select {
        display: flex;
        gap: 0.5rem;
        font-size: 2rem;
      }
      .star-option {
        cursor: pointer;
        color: #666;
        transition: color 0.3s;
      }
      .star-option:hover,
      .star-option.active {
        color: var(--gold);
      }
    </style>
  `;
  
  // Обработчик звезд
  const stars = modalBody.querySelectorAll('.star-option');
  const ratingInput = modalBody.querySelector('#reviewRating');
  
  stars.forEach((star, index) => {
    star.addEventListener('click', () => {
      const rating = index + 1;
      ratingInput.value = rating;
      stars.forEach((s, i) => {
        s.textContent = i < rating ? '★' : '☆';
        s.classList.toggle('active', i < rating);
      });
    });
    
    star.addEventListener('mouseover', () => {
      const rating = index + 1;
      stars.forEach((s, i) => {
        s.textContent = i < rating ? '★' : '☆';
      });
    });
  });
  
  modalBody.querySelector('#reviewForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const rating = parseInt(ratingInput.value);
    const comment = modalBody.querySelector('#reviewComment').value.trim();
    
    if (rating === 0) {
      showNotification('Поставьте оценку', 'error');
      return;
    }
    
    const reviews = getData('reviews');
    const user = getCurrentUser();
    
    const newReview = {
      id: generateId(),
      appointmentId: appointmentId,
      masterId: appointment.masterId,
      clientId: user.id,
      clientName: `${user.firstName} ${user.lastName || ''}`.trim(),
      rating: rating,
      comment: comment,
      date: new Date().toISOString().split('T')[0]
    };
    
    reviews.push(newReview);
    saveData('reviews', reviews);
    
    // Обновляем рейтинг мастера
    updateMasterRating(appointment.masterId);
    
    closeModal('editModal');
    showNotification('Спасибо за отзыв!', 'success');
    renderClientAppointments();
  });
  
  openModal('editModal');
}

function updateMasterRating(masterId) {
  const users = getData('users');
  const reviews = getData('reviews');
  const master = users.find(u => u.id === masterId);
  
  if (master) {
    const masterReviews = reviews.filter(r => r.masterId === masterId);
    if (masterReviews.length > 0) {
      const avgRating = masterReviews.reduce((sum, r) => sum + r.rating, 0) / masterReviews.length;
      master.rating = Math.round(avgRating * 10) / 10;
    } else {
      master.rating = 4.5;
    }
    saveData('users', users);
  }
}

function renderClientBarbers() {
  const content = document.getElementById('dashboardContent');
  
  content.innerHTML = `
    <div class="content-header">
      <h1>Наши барберы и отзывы</h1>
    </div>
    <div id="barbersReviewsContainer">Загрузка...</div>
  `;
  
  // Используем тот же код, что и на странице barbers-reviews.html
  const container = document.getElementById('barbersReviewsContainer');
  const users = getData('users');
  const reviews = getData('reviews');
  const masters = users.filter(u => u.role === 'master' || (u.role === 'admin' && u.specialization));
  
  container.innerHTML = '';
  
  masters.forEach(barber => {
    const barberReviews = reviews.filter(r => r.masterId === barber.id);
    const avgRating = barberReviews.length > 0 
      ? (barberReviews.reduce((sum, r) => sum + r.rating, 0) / barberReviews.length).toFixed(1)
      : barber.rating || '—';
    
    const barberCard = document.createElement('div');
    barberCard.className = 'barber-full-card';
    barberCard.innerHTML = `
      <div class="barber-header">
        <img src="${barber.avatar || 'https://via.placeholder.com/150'}" alt="${barber.firstName}" class="barber-avatar-large">
        <div class="barber-info-large">
          <h3>${barber.firstName} ${barber.lastName || ''}</h3>
          <div class="barber-specialization">${barber.specialization || 'Барбер'}</div>
          <p>Стаж: ${barber.experience || 'не указан'}</p>
          <div class="barber-stats">
            <div class="stat-item">
              <div class="stat-value">${avgRating}</div>
              <div class="stat-label">Рейтинг</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${barberReviews.length}</div>
              <div class="stat-label">Отзывов</div>
            </div>
          </div>
          <button class="btn-primary" style="margin-top: 1rem;" onclick="document.querySelector('[data-panel=clientBooking]').click(); document.getElementById('bookingMaster').value='${barber.id}'">
            Записаться к этому барберу
          </button>
        </div>
      </div>
      
      <div class="reviews-section">
        <h4>Отзывы клиентов</h4>
        <div class="reviews-list">
          ${barberReviews.length > 0 ? barberReviews.map(review => `
            <div class="review-card">
              <div class="review-header">
                <span class="review-author">${review.clientName}</span>
                <span class="review-rating">${'★'.repeat(Math.floor(review.rating))}${review.rating % 1 ? '½' : ''}</span>
              </div>
              <div class="review-date">${formatDate(review.date)}</div>
              <div class="review-comment">${review.comment}</div>
            </div>
          `).join('') : '<div class="no-reviews">Пока нет отзывов</div>'}
        </div>
      </div>
    `;
    
    container.appendChild(barberCard);
  });
  
  // Добавляем стили
  const style = document.createElement('style');
  style.textContent = `
    .barber-full-card {
      background: var(--dark-gray);
      border: 1px solid var(--gold);
      border-radius: 16px;
      padding: 2rem;
      margin-bottom: 2rem;
    }
    
    .barber-header {
      display: flex;
      gap: 2rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }
    
    .barber-avatar-large {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      border: 3px solid var(--gold);
      object-fit: cover;
    }
    
    .barber-info-large {
      flex: 1;
    }
    
    .barber-info-large h3 {
      color: var(--gold);
      font-size: 1.8rem;
      margin-bottom: 0.5rem;
    }
    
    .barber-specialization {
      color: var(--light-text);
      font-size: 1.1rem;
      margin-bottom: 1rem;
    }
    
    .barber-stats {
      display: flex;
      gap: 2rem;
      margin-top: 1rem;
    }
    
    .stat-item {
      text-align: center;
    }
    
    .stat-value {
      color: var(--gold);
      font-size: 1.5rem;
      font-weight: bold;
    }
    
    .stat-label {
      color: var(--light-text);
      font-size: 0.9rem;
    }
    
    .reviews-section {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #333;
    }
    
    .reviews-section h4 {
      color: var(--gold);
      margin-bottom: 1.5rem;
      font-size: 1.3rem;
    }
    
    .review-card {
      background: var(--black);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1rem;
      border-left: 3px solid var(--gold);
    }
    
    .review-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.8rem;
    }
    
    .review-author {
      color: var(--gold);
      font-weight: 600;
    }
    
    .review-rating {
      color: var(--gold);
    }
    
    .review-date {
      color: var(--light-text);
      font-size: 0.85rem;
    }
    
    .review-comment {
      color: var(--text);
      line-height: 1.6;
    }
    
    .no-reviews {
      text-align: center;
      color: var(--light-text);
      padding: 2rem;
      font-style: italic;
    }
    
    @media (max-width: 768px) {
      .barber-header {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
      
      .barber-stats {
        justify-content: center;
      }
    }
  `;
  document.head.appendChild(style);
}

function renderClientProfile() {
  const content = document.getElementById('dashboardContent');
  const user = getCurrentUser();
  
  content.innerHTML = `
    <div class="content-header">
      <h1>Редактирование профиля</h1>
    </div>
    
    <form class="dashboard-form" id="clientProfileForm">
      <div class="form-group">
        <label>Имя <span class="required">*</span></label>
        <input type="text" id="editFirstName" value="${user.firstName || ''}" required>
      </div>
      
      <div class="form-group">
        <label>Фамилия</label>
        <input type="text" id="editLastName" value="${user.lastName || ''}">
      </div>
      
      <div class="form-group">
        <label>Email <span class="required">*</span></label>
        <input type="email" id="editEmail" value="${user.email || ''}" required>
      </div>
      
      <div class="form-group">
        <label>Телефон</label>
        <input type="tel" id="editPhone" value="${user.phone || ''}" placeholder="+7 (999) 123-45-67">
      </div>
      
      <div class="form-group">
        <label>Новый пароль (оставьте пустым, если не хотите менять)</label>
        <input type="password" id="editPassword" placeholder="••••••••">
      </div>
      
      <div class="form-group">
        <label>Подтвердите новый пароль</label>
        <input type="password" id="editConfirmPassword" placeholder="••••••••">
      </div>
      
      <button type="submit" class="btn-primary">Сохранить изменения</button>
    </form>
  `;
  
  document.getElementById('clientProfileForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const firstName = document.getElementById('editFirstName').value.trim();
    const lastName = document.getElementById('editLastName').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const phone = document.getElementById('editPhone').value.trim();
    const password = document.getElementById('editPassword').value;
    const confirmPassword = document.getElementById('editConfirmPassword').value;
    
    if (!firstName || !email) {
      showNotification('Имя и Email обязательны', 'error');
      return;
    }
    
    if (!validateEmail(email)) {
      showNotification('Введите корректный email', 'error');
      return;
    }
    
    if (password && password !== confirmPassword) {
      showNotification('Пароли не совпадают', 'error');
      return;
    }
    
    const users = getData('users');
    const userIndex = users.findIndex(u => u.id === user.id);
    
    if (userIndex !== -1) {
      users[userIndex].firstName = firstName;
      users[userIndex].lastName = lastName;
      users[userIndex].email = email;
      users[userIndex].phone = phone;
      
      if (password) {
        users[userIndex].password = password;
      }
      
      saveData('users', users);
      setCurrentUser(users[userIndex]);
      
      showNotification('Профиль успешно обновлен', 'success');
      
      setTimeout(() => {
        renderClientHome();
        document.getElementById('userName').textContent = `${firstName} ${lastName || ''}`;
        document.getElementById('userAvatar').textContent = firstName.charAt(0);
      }, 500);
    }
  });
}