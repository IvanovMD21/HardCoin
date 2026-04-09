// Модуль личного кабинета мастера

let currentMasterDate = new Date();
let selectedMasterDate = null;

function initMasterDashboard() {
  const user = getCurrentUser();
  if (!user || user.role !== 'master') return;

  // Отрисовка меню мастера
  renderMasterMenu();
  
  // Загружаем календарь мастера
  renderMasterCalendar();
}

function renderMasterMenu() {
  const menu = document.getElementById('sidebarMenu');
  menu.innerHTML = `
    <li class="menu-item active" data-panel="masterCalendar">
      <span class="icon">📅</span> Мой календарь
    </li>
    <li class="menu-item" data-panel="masterProfile">
      <span class="icon">⚙️</span> Мой профиль
    </li>
  `;

  // Обработчики меню
  menu.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => {
      menu.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      
      const panel = item.dataset.panel;
      switch(panel) {
        case 'masterCalendar': renderMasterCalendar(); break;
        case 'masterProfile': renderMasterProfile(); break;
      }
    });
  });
}

function renderMasterCalendar() {
  const content = document.getElementById('dashboardContent');
  const user = getCurrentUser();
  
  content.innerHTML = `
    <div class="content-header">
      <h1>Мой календарь работы</h1>
    </div>
    
    <div class="calendar-container">
      <div class="calendar-header">
        <div class="calendar-title" id="calendarMonthYear"></div>
        <div class="calendar-nav">
          <button class="calendar-nav-btn" onclick="changeMasterMonth(-1)">←</button>
          <button class="calendar-nav-btn" onclick="changeMasterMonth(1)">→</button>
          <button class="calendar-nav-btn today-btn" onclick="goToMasterToday()">Сегодня</button>
        </div>
      </div>
      
      <div class="calendar-weekdays">
        <div class="weekday">Пн</div>
        <div class="weekday">Вт</div>
        <div class="weekday">Ср</div>
        <div class="weekday">Чт</div>
        <div class="weekday">Пт</div>
        <div class="weekday">Сб</div>
        <div class="weekday">Вс</div>
      </div>
      
      <div class="calendar-days" id="masterCalendarDays"></div>
      
      <div class="appointments-section" id="masterAppointmentsSection">
        <div class="appointments-header">
          <h4>Записи на выбранный день</h4>
          <span class="selected-date" id="selectedMasterDate"></span>
        </div>
        <div class="appointments-list" id="masterAppointmentsList">
          <div class="no-appointments">Выберите день для просмотра записей</div>
        </div>
      </div>
    </div>
  `;
  
  renderMasterCalendarDays();
}

function renderMasterCalendarDays() {
  const user = getCurrentUser();
  const year = currentMasterDate.getFullYear();
  const month = currentMasterDate.getMonth();
  
  document.getElementById('calendarMonthYear').textContent = 
    `${getMonthName(month)} ${year}`;
  
  const firstDay = getFirstDayOfMonth(year, month);
  const daysInMonth = getDaysInMonth(year, month);
  const daysInPrevMonth = getDaysInMonth(year, month - 1);
  
  const calendarDays = document.getElementById('masterCalendarDays');
  calendarDays.innerHTML = '';
  
  const appointments = getData('appointments');
  const masterAppointments = appointments.filter(a => 
    a.masterId === user.id && a.status !== 'cancelled'
  );
  
  // Дни предыдущего месяца
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const dayElement = createMasterCalendarDay(day, 'other-month', null);
    calendarDays.appendChild(dayElement);
  }
  
  // Дни текущего месяца
  const today = new Date();
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayAppointments = masterAppointments.filter(a => a.date === dateStr);
    
    let classes = '';
    if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
      classes += 'today';
    }
    if (dayAppointments.length > 0) {
      classes += ' has-appointments';
      if (dayAppointments.length > 1) classes += ' has-multiple';
    }
    
    const dayElement = createMasterCalendarDay(day, classes, dayAppointments.length);
    dayElement.dataset.date = dateStr;
    
    dayElement.addEventListener('click', () => {
      document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
      dayElement.classList.add('selected');
      selectedMasterDate = dateStr;
      showMasterAppointmentsForDate(dateStr);
    });
    
    calendarDays.appendChild(dayElement);
  }
  
  // Дни следующего месяца
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  const nextMonthDays = totalCells - (firstDay + daysInMonth);
  for (let day = 1; day <= nextMonthDays; day++) {
    const dayElement = createMasterCalendarDay(day, 'other-month', null);
    calendarDays.appendChild(dayElement);
  }
  
  // Если есть выбранная дата, показываем записи
  if (selectedMasterDate) {
    showMasterAppointmentsForDate(selectedMasterDate);
  }
}

function createMasterCalendarDay(day, className, appointmentsCount) {
  const div = document.createElement('div');
  div.className = `calendar-day ${className}`;
  div.innerHTML = `
    <span class="day-number">${day}</span>
    ${appointmentsCount && appointmentsCount > 0 ? 
      `<span class="appointments-count">${appointmentsCount}</span>` : ''}
  `;
  return div;
}

function showMasterAppointmentsForDate(dateStr) {
  const user = getCurrentUser();
  const appointments = getData('appointments');
  
  const dayAppointments = appointments.filter(a => 
    a.masterId === user.id && 
    a.date === dateStr
  ).sort((a, b) => a.time.localeCompare(b.time));
  
  document.getElementById('selectedMasterDate').textContent = formatDate(dateStr);
  
  const listContainer = document.getElementById('masterAppointmentsList');
  
  if (dayAppointments.length === 0) {
    listContainer.innerHTML = '<div class="no-appointments">Нет записей на этот день</div>';
    return;
  }
  
  listContainer.innerHTML = dayAppointments.map(app => `
    <div class="appointment-item ${app.status}">
      <div class="appointment-info">
        <div class="appointment-time">${app.time}</div>
        <div class="appointment-client">${app.clientName || 'Клиент'}</div>
        <div class="appointment-service">${app.serviceName}</div>
        ${app.clientPhone ? `<div class="appointment-contact">📞 ${app.clientPhone}</div>` : ''}
        <span class="appointment-status ${app.status}">${getMasterStatusText(app.status)}</span>
      </div>
      <div class="appointment-actions">
        ${app.status === 'pending' ? `
          <button class="btn-icon success" onclick="completeMasterAppointment('${app.id}')" title="Выполнено">✓</button>
        ` : ''}
        <button class="btn-icon" onclick="viewMasterAppointmentDetails('${app.id}')" title="Подробнее">👁</button>
      </div>
    </div>
  `).join('');
}

function getMasterStatusText(status) {
  const statuses = {
    'pending': 'Ожидается',
    'completed': 'Выполнена',
    'cancelled': 'Отменена'
  };
  return statuses[status] || status;
}

function changeMasterMonth(delta) {
  currentMasterDate.setMonth(currentMasterDate.getMonth() + delta);
  renderMasterCalendarDays();
}

function goToMasterToday() {
  currentMasterDate = new Date();
  renderMasterCalendarDays();
}

async function completeMasterAppointment(appointmentId) {
  const result = await confirmAsync('Отметить запись как выполненную?');
  if (!result) return;
  
  const appointments = getData('appointments');
  const appointment = appointments.find(a => a.id === appointmentId);
  
  if (appointment) {
    appointment.status = 'completed';
    saveData('appointments', appointments);
    showNotification('Запись отмечена как выполненная', 'success');
    renderMasterCalendarDays();
  }
}

function viewMasterAppointmentDetails(appointmentId) {
  const appointments = getData('appointments');
  const appointment = appointments.find(a => a.id === appointmentId);
  
  if (!appointment) return;
  
  const modal = document.getElementById('appointmentModal');
  const modalBody = document.getElementById('modalBody');
  const modalTitle = document.getElementById('modalTitle');
  
  modalTitle.textContent = 'Детали записи';
  modalBody.innerHTML = `
    <div class="appointment-detail-item">
      <span class="appointment-detail-label">Клиент:</span>
      <span class="appointment-detail-value">${appointment.clientName || 'Не указано'}</span>
    </div>
    <div class="appointment-detail-item">
      <span class="appointment-detail-label">Телефон:</span>
      <span class="appointment-detail-value">${appointment.clientPhone || 'Не указан'}</span>
    </div>
    <div class="appointment-detail-item">
      <span class="appointment-detail-label">Услуга:</span>
      <span class="appointment-detail-value">${appointment.serviceName}</span>
    </div>
    <div class="appointment-detail-item">
      <span class="appointment-detail-label">Стоимость:</span>
      <span class="appointment-detail-value">${appointment.price || '—'} ₽</span>
    </div>
    <div class="appointment-detail-item">
      <span class="appointment-detail-label">Дата и время:</span>
      <span class="appointment-detail-value">${formatDate(appointment.date)} в ${appointment.time}</span>
    </div>
    <div class="appointment-detail-item">
      <span class="appointment-detail-label">Статус:</span>
      <span class="appointment-detail-value">
        <span class="status-badge ${appointment.status}">${getMasterStatusText(appointment.status)}</span>
      </span>
    </div>
    <div class="appointment-detail-item">
      <span class="appointment-detail-label">Создана:</span>
      <span class="appointment-detail-value">${formatDate(appointment.createdAt)}</span>
    </div>
    
    <style>
      .appointment-detail-item {
        display: flex;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #333;
      }
      .appointment-detail-label {
        width: 120px;
        color: var(--gold);
        font-weight: 600;
      }
      .appointment-detail-value {
        flex: 1;
        color: var(--text);
      }
    </style>
  `;
  
  openModal('appointmentModal');
}

function renderMasterProfile() {
  const content = document.getElementById('dashboardContent');
  const user = getCurrentUser();
  
  content.innerHTML = `
    <div class="content-header">
      <h1>Мой профиль</h1>
    </div>
    
    <div class="profile-container">
      <div class="profile-card-large">
        <div class="profile-avatar-section">
          <img src="${user.avatar || 'https://via.placeholder.com/150'}" alt="${user.firstName}" class="profile-avatar-large">
          <h3>${user.firstName} ${user.lastName || ''}</h3>
          <p class="profile-specialization">${user.specialization || 'Барбер'}</p>
          <p class="profile-rating">⭐ ${user.rating || '4.5'} (${getMasterReviewsCount(user.id)} отзывов)</p>
        </div>
        
        <div class="profile-info-section">
          <div class="info-item">
            <span class="info-label">Стаж:</span>
            <span class="info-value">${user.experience || 'Не указан'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Email:</span>
            <span class="info-value">${user.email}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Телефон:</span>
            <span class="info-value">${user.phone || 'Не указан'}</span>
          </div>
          
          <button class="btn-primary" onclick="showMasterEditProfile()">Редактировать профиль</button>
        </div>
      </div>
      
      <div class="profile-stats">
        <h4>Статистика</h4>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number" id="totalAppointments">0</div>
            <div class="stat-label">Всего записей</div>
          </div>
          <div class="stat-card">
            <div class="stat-number" id="completedAppointments">0</div>
            <div class="stat-label">Выполнено</div>
          </div>
          <div class="stat-card">
            <div class="stat-number" id="pendingAppointments">0</div>
            <div class="stat-label">Ожидается</div>
          </div>
        </div>
      </div>
    </div>
    
    <style>
      .profile-container {
        display: grid;
        grid-template-columns: 1fr 300px;
        gap: 2rem;
      }
      
      .profile-card-large {
        background: var(--dark-gray);
        border: 1px solid var(--gold);
        border-radius: 16px;
        padding: 2rem;
        display: flex;
        gap: 2rem;
        flex-wrap: wrap;
      }
      
      .profile-avatar-section {
        text-align: center;
      }
      
      .profile-avatar-large {
        width: 150px;
        height: 150px;
        border-radius: 50%;
        border: 3px solid var(--gold);
        object-fit: cover;
        margin-bottom: 1rem;
      }
      
      .profile-avatar-section h3 {
        color: var(--gold);
        margin-bottom: 0.3rem;
      }
      
      .profile-specialization {
        color: var(--light-text);
        margin-bottom: 0.5rem;
      }
      
      .profile-rating {
        color: var(--gold);
      }
      
      .profile-info-section {
        flex: 1;
      }
      
      .info-item {
        display: flex;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #333;
      }
      
      .info-label {
        width: 80px;
        color: var(--gold);
        font-weight: 600;
      }
      
      .info-value {
        flex: 1;
        color: var(--text);
      }
      
      .profile-stats {
        background: var(--dark-gray);
        border: 1px solid var(--gold);
        border-radius: 16px;
        padding: 1.5rem;
      }
      
      .profile-stats h4 {
        color: var(--gold);
        margin-bottom: 1.5rem;
        text-align: center;
      }
      
      .stats-grid {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      
      .stat-card {
        background: var(--black);
        border-radius: 12px;
        padding: 1rem;
        text-align: center;
      }
      
      .stat-number {
        color: var(--gold);
        font-size: 2rem;
        font-weight: bold;
      }
      
      .stat-label {
        color: var(--light-text);
        font-size: 0.9rem;
      }
      
      @media (max-width: 768px) {
        .profile-container {
          grid-template-columns: 1fr;
        }
        
        .profile-card-large {
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
      }
    </style>
  `;
  
  // Загружаем статистику
  loadMasterStats(user.id);
}

function getMasterReviewsCount(masterId) {
  const reviews = getData('reviews');
  return reviews.filter(r => r.masterId === masterId).length;
}

function loadMasterStats(masterId) {
  const appointments = getData('appointments');
  const masterAppointments = appointments.filter(a => a.masterId === masterId);
  
  const total = masterAppointments.length;
  const completed = masterAppointments.filter(a => a.status === 'completed').length;
  const pending = masterAppointments.filter(a => a.status === 'pending').length;
  
  document.getElementById('totalAppointments').textContent = total;
  document.getElementById('completedAppointments').textContent = completed;
  document.getElementById('pendingAppointments').textContent = pending;
}

function showMasterEditProfile() {
  const user = getCurrentUser();
  const modal = document.getElementById('editModal');
  const modalBody = document.getElementById('editModalBody');
  const modalTitle = document.getElementById('editModalTitle');
  
  modalTitle.textContent = 'Редактирование профиля';
  modalBody.innerHTML = `
    <form id="masterEditForm">
      <div class="form-group">
        <label>Имя</label>
        <input type="text" id="editMasterFirstName" value="${user.firstName || ''}" required>
      </div>
      
      <div class="form-group">
        <label>Фамилия</label>
        <input type="text" id="editMasterLastName" value="${user.lastName || ''}">
      </div>
      
      <div class="form-group">
        <label>Специализация</label>
        <input type="text" id="editMasterSpecialization" value="${user.specialization || ''}">
      </div>
      
      <div class="form-group">
        <label>Стаж</label>
        <input type="text" id="editMasterExperience" value="${user.experience || ''}" placeholder="например: 5 лет">
      </div>
      
      <div class="form-group">
        <label>Email</label>
        <input type="email" id="editMasterEmail" value="${user.email || ''}" required>
      </div>
      
      <div class="form-group">
        <label>Телефон</label>
        <input type="tel" id="editMasterPhone" value="${user.phone || ''}">
      </div>
      
      <div class="form-group">
        <label>Ссылка на аватар</label>
        <input type="text" id="editMasterAvatar" value="${user.avatar || ''}" placeholder="https://...">
      </div>
      
      <div class="form-group">
        <label>Новый пароль (оставьте пустым, если не хотите менять)</label>
        <input type="password" id="editMasterPassword" placeholder="••••••••">
      </div>
      
      <button type="submit" class="btn-primary">Сохранить</button>
    </form>
  `;
  
  document.getElementById('masterEditForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const users = getData('users');
    const userIndex = users.findIndex(u => u.id === user.id);
    
    if (userIndex !== -1) {
      users[userIndex].firstName = document.getElementById('editMasterFirstName').value.trim();
      users[userIndex].lastName = document.getElementById('editMasterLastName').value.trim();
      users[userIndex].specialization = document.getElementById('editMasterSpecialization').value.trim();
      users[userIndex].experience = document.getElementById('editMasterExperience').value.trim();
      users[userIndex].email = document.getElementById('editMasterEmail').value.trim();
      users[userIndex].phone = document.getElementById('editMasterPhone').value.trim();
      users[userIndex].avatar = document.getElementById('editMasterAvatar').value.trim();
      
      const password = document.getElementById('editMasterPassword').value;
      if (password) {
        users[userIndex].password = password;
      }
      
      saveData('users', users);
      setCurrentUser(users[userIndex]);
      
      closeModal('editModal');
      showNotification('Профиль обновлен', 'success');
      renderMasterProfile();
    }
  });
  
  openModal('editModal');
}

// Делаем функции глобально доступными
window.changeMasterMonth = changeMasterMonth;
window.goToMasterToday = goToMasterToday;
window.completeMasterAppointment = completeMasterAppointment;
window.viewMasterAppointmentDetails = viewMasterAppointmentDetails;
window.showMasterEditProfile = showMasterEditProfile;