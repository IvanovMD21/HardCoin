// Модуль личного кабинета администратора

let adminCurrentDate = new Date();
let adminSelectedDate = null;
let selectedMasterForCalendar = null;

function initAdminDashboard() {
  const user = getCurrentUser();
  if (!user || user.role !== 'admin') return;

  renderAdminMenu();
  renderAdminMasters();
}

function renderAdminMenu() {
  const menu = document.getElementById('sidebarMenu');
  if (!menu) return;
  
  menu.innerHTML = `
    <li class="menu-item active" data-panel="adminMasters">
      <span class="icon">💈</span> Мастера
    </li>
    <li class="menu-item" data-panel="adminEquipment">
      <span class="icon">🔧</span> Оборудование
    </li>
    <li class="menu-item" data-panel="adminMaterials">
      <span class="icon">🧴</span> Материалы
    </li>
    <li class="menu-item" data-panel="adminAppointments">
      <span class="icon">📋</span> Записи
    </li>
    <li class="menu-item" data-panel="adminClients">
      <span class="icon">👥</span> Клиенты
    </li>
    <li class="menu-item" data-panel="adminStatistics">
      <span class="icon">📊</span> Статистика
    </li>
  `;

  menu.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => {
      menu.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      document.getElementById('sidebarMenu')?.classList.remove('active');
      
      const panel = item.dataset.panel;
      switch(panel) {
        case 'adminMasters': renderAdminMasters(); break;
        case 'adminEquipment': renderAdminEquipment(); break;
        case 'adminMaterials': renderAdminMaterials(); break;
        case 'adminAppointments': renderAdminAppointments(); break;
        case 'adminClients': renderAdminClients(); break;
        case 'adminStatistics': renderAdminStatistics(); break;
      }
    });
  });
}

// ==================== МАСТЕРА ====================

function renderAdminMasters() {
  const content = document.getElementById('dashboardContent');
  if (!content) return;
  
  const users = getData('users');
  const masters = users.filter(u => u.role === 'master' || (u.role === 'admin' && u.specialization));
  
  content.innerHTML = `
    <div class="content-header">
      <h1>Управление мастерами</h1>
      <button class="btn-primary" onclick="showAddMasterForm()">+ Добавить мастера</button>
    </div>
    
    <div class="table-responsive">
      <table class="data-table">
        <thead>
          <tr>
            <th>Фото</th>
            <th>Имя</th>
            <th>Специализация</th>
            <th>Стаж</th>
            <th>Рейтинг</th>
            <th>Роль</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          ${masters.map(master => `
            <tr>
              <td>
                <img src="${master.avatar || 'https://via.placeholder.com/40'}" 
                     alt="${sanitizeInput(master.firstName)}" class="table-avatar">
              </td>
              <td>${sanitizeInput(master.firstName)} ${sanitizeInput(master.lastName || '')}</td>
              <td>${sanitizeInput(master.specialization || '—')}</td>
              <td>${sanitizeInput(master.experience || '—')}</td>
              <td>⭐ ${master.rating || '4.5'}</td>
              <td>
                <span class="status-badge ${master.role === 'admin' ? 'completed' : 'pending'}">
                  ${master.role === 'admin' ? 'Админ' : 'Мастер'}
                </span>
              </td>
              <td>
                <button class="btn-action" onclick="viewMasterCalendar('${master.id}')" title="Календарь">📅</button>
                <button class="btn-action" onclick="editMaster('${master.id}')" title="Редактировать">✏️</button>
                ${master.role !== 'admin' ? `
                  <button class="btn-action success" onclick="promoteToAdmin('${master.id}')" title="Сделать админом">⬆️</button>
                ` : `
                  <button class="btn-action warning" onclick="demoteToMaster('${master.id}')" title="Понизить до мастера">⬇️</button>
                `}
                <button class="btn-action danger" onclick="deleteMaster('${master.id}')" title="Удалить">🗑️</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function viewMasterCalendar(masterId) {
  const users = getData('users');
  const master = users.find(u => u.id === masterId);
  if (!master) return;
  
  selectedMasterForCalendar = masterId;
  adminCurrentDate = new Date();
  adminSelectedDate = null;
  
  const content = document.getElementById('dashboardContent');
  if (!content) return;
  
  content.innerHTML = `
    <div class="content-header">
      <h1>Календарь: ${sanitizeInput(master.firstName)} ${sanitizeInput(master.lastName || '')}</h1>
      <button class="btn-primary" onclick="renderAdminMasters()">← Назад к списку</button>
    </div>
    
    <div class="calendar-container">
      <div class="calendar-header">
        <div class="calendar-title" id="adminCalendarMonthYear"></div>
        <div class="calendar-nav">
          <button class="calendar-nav-btn" onclick="changeAdminMonth(-1)">←</button>
          <button class="calendar-nav-btn" onclick="changeAdminMonth(1)">→</button>
          <button class="calendar-nav-btn today-btn" onclick="goToAdminToday()">Сегодня</button>
        </div>
      </div>
      
      <div class="calendar-weekdays">
        <div class="weekday">Пн</div><div class="weekday">Вт</div><div class="weekday">Ср</div>
        <div class="weekday">Чт</div><div class="weekday">Пт</div><div class="weekday">Сб</div><div class="weekday">Вс</div>
      </div>
      
      <div class="calendar-days" id="adminCalendarDays"></div>
      
      <div class="appointments-section">
        <div class="appointments-header">
          <h4>Записи на выбранный день</h4>
          <span class="selected-date" id="selectedAdminDate">Выберите день</span>
        </div>
        <div class="appointments-list" id="adminAppointmentsList">
          <div class="no-appointments">Выберите день для просмотра записей</div>
        </div>
      </div>
      
      <div class="calendar-actions">
        <button class="calendar-save-btn" onclick="saveMasterSchedule()">💾 Сохранить расписание</button>
        <button class="btn-primary" onclick="editMaster('${masterId}')">✏️ Редактировать данные мастера</button>
        <button class="btn-action danger" onclick="deleteMaster('${masterId}')">🗑️ Удалить мастера</button>
      </div>
    </div>
  `;
  
  renderAdminCalendarDays();
}

function renderAdminCalendarDays() {
  if (!selectedMasterForCalendar) return;
  
  const year = adminCurrentDate.getFullYear();
  const month = adminCurrentDate.getMonth();
  
  const monthYearEl = document.getElementById('adminCalendarMonthYear');
  if (monthYearEl) {
    monthYearEl.textContent = `${getMonthName(month)} ${year}`;
  }
  
  const firstDay = getFirstDayOfMonth(year, month);
  const daysInMonth = getDaysInMonth(year, month);
  const daysInPrevMonth = getDaysInMonth(year, month - 1);
  
  const calendarDays = document.getElementById('adminCalendarDays');
  if (!calendarDays) return;
  
  calendarDays.innerHTML = '';
  
  const appointments = getData('appointments');
  const masterAppointments = appointments.filter(a => 
    a.masterId === selectedMasterForCalendar && a.status !== 'cancelled'
  );
  
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    calendarDays.appendChild(createAdminCalendarDay(day, 'other-month', null));
  }
  
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
    if (adminSelectedDate === dateStr) {
      classes += ' selected';
    }
    
    const dayElement = createAdminCalendarDay(day, classes, dayAppointments.length);
    dayElement.dataset.date = dateStr;
    
    dayElement.addEventListener('click', () => {
      document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
      dayElement.classList.add('selected');
      adminSelectedDate = dateStr;
      showAdminAppointmentsForDate(dateStr);
    });
    
    calendarDays.appendChild(dayElement);
  }
  
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  const nextMonthDays = totalCells - (firstDay + daysInMonth);
  for (let day = 1; day <= nextMonthDays; day++) {
    calendarDays.appendChild(createAdminCalendarDay(day, 'other-month', null));
  }
  
  if (adminSelectedDate) {
    showAdminAppointmentsForDate(adminSelectedDate);
  }
}

function createAdminCalendarDay(day, className, appointmentsCount) {
  const div = document.createElement('div');
  div.className = `calendar-day ${className || ''}`;
  div.innerHTML = `
    <span class="day-number">${day}</span>
    ${appointmentsCount && appointmentsCount > 0 ? `<span class="appointments-count">${appointmentsCount}</span>` : ''}
  `;
  return div;
}

function showAdminAppointmentsForDate(dateStr) {
  if (!selectedMasterForCalendar) return;
  
  const appointments = getData('appointments');
  const dayAppointments = appointments.filter(a => 
    a.masterId === selectedMasterForCalendar && a.date === dateStr
  ).sort((a, b) => a.time.localeCompare(b.time));
  
  const dateElement = document.getElementById('selectedAdminDate');
  if (dateElement) {
    dateElement.textContent = formatDate(dateStr);
  }
  
  const listContainer = document.getElementById('adminAppointmentsList');
  if (!listContainer) return;
  
  if (dayAppointments.length === 0) {
    listContainer.innerHTML = '<div class="no-appointments">Нет записей на этот день</div>';
    return;
  }
  
  listContainer.innerHTML = dayAppointments.map(app => `
    <div class="appointment-item ${app.status}">
      <div class="appointment-info">
        <div class="appointment-time">${app.time}</div>
        <div class="appointment-client">${sanitizeInput(app.clientName || 'Клиент')}</div>
        <div class="appointment-service">${sanitizeInput(app.serviceName)}</div>
        ${app.clientPhone ? `<div class="appointment-contact">📞 ${sanitizeInput(app.clientPhone)}</div>` : ''}
        <span class="appointment-status ${app.status}">${getAdminStatusText(app.status)}</span>
      </div>
      <div class="appointment-actions">
        <button class="btn-icon" onclick="changeAppointmentStatus('${app.id}')" title="Сменить статус">🔄</button>
        <button class="btn-icon" onclick="viewAppointmentDetails('${app.id}')" title="Подробнее">👁</button>
      </div>
    </div>
  `).join('');
}

function getAdminStatusText(status) {
  const statuses = {
    'pending': 'Ожидается',
    'completed': 'Выполнена',
    'cancelled': 'Отменена'
  };
  return statuses[status] || status;
}

function changeAdminMonth(delta) {
  adminCurrentDate.setMonth(adminCurrentDate.getMonth() + delta);
  renderAdminCalendarDays();
}

function goToAdminToday() {
  adminCurrentDate = new Date();
  adminSelectedDate = new Date().toISOString().split('T')[0];
  renderAdminCalendarDays();
}

async function changeAppointmentStatus(appointmentId) {
  const appointments = getData('appointments');
  const appointment = appointments.find(a => a.id === appointmentId);
  if (!appointment) return;
  
  const statuses = ['pending', 'completed', 'cancelled'];
  const currentIndex = statuses.indexOf(appointment.status);
  const nextStatus = statuses[(currentIndex + 1) % statuses.length];
  
  if (nextStatus === 'cancelled') {
    const result = await confirmAsync('Отменить эту запись?');
    if (!result) return;
  }
  
  // Обновляем статус
  appointment.status = nextStatus;
  saveData('appointments', appointments);
  
  showNotification(`Статус изменен на: ${getAdminStatusText(nextStatus)}`, 'success');
  
  // Обновляем отображение в зависимости от контекста
  if (selectedMasterForCalendar && adminSelectedDate) {
    // Если мы в календаре мастера
    showAdminAppointmentsForDate(adminSelectedDate);
    renderAdminCalendarDays();
  } else {
    // Если мы в общем списке записей
    renderAdminAppointments();
  }
}

// Функция для смены статуса из списка записей
function changeAppointmentStatusFromList(appointmentId) {
  changeAppointmentStatus(appointmentId).then(() => {
    // После смены статуса обновляем отображение
    renderAdminAppointments();
  });
}

function viewAppointmentDetails(appointmentId) {
  const appointments = getData('appointments');
  const appointment = appointments.find(a => a.id === appointmentId);
  if (!appointment) return;
  
  const modal = document.getElementById('appointmentModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  
  if (!modal || !modalTitle || !modalBody) return;
  
  modalTitle.textContent = 'Детали записи';
  modalBody.innerHTML = `
    <div class="appointment-detail-item">
      <span class="appointment-detail-label">Клиент:</span>
      <span class="appointment-detail-value">${sanitizeInput(appointment.clientName || 'Не указано')}</span>
    </div>
    <div class="appointment-detail-item">
      <span class="appointment-detail-label">Телефон:</span>
      <span class="appointment-detail-value">${sanitizeInput(appointment.clientPhone || 'Не указан')}</span>
    </div>
    <div class="appointment-detail-item">
      <span class="appointment-detail-label">Услуга:</span>
      <span class="appointment-detail-value">${sanitizeInput(appointment.serviceName)}</span>
    </div>
    <div class="appointment-detail-item">
      <span class="appointment-detail-label">Стоимость:</span>
      <span class="appointment-detail-value">${appointment.price || '—'} ₽</span>
    </div>
    <div class="appointment-detail-item">
      <span class="appointment-detail-label">Мастер:</span>
      <span class="appointment-detail-value">${sanitizeInput(appointment.masterName || '—')}</span>
    </div>
    <div class="appointment-detail-item">
      <span class="appointment-detail-label">Дата и время:</span>
      <span class="appointment-detail-value">${formatDate(appointment.date)} в ${appointment.time}</span>
    </div>
    <div class="appointment-detail-item">
      <span class="appointment-detail-label">Статус:</span>
      <span class="appointment-detail-value">
        <span class="status-badge ${appointment.status}">${getAdminStatusText(appointment.status)}</span>
      </span>
    </div>
    <div class="appointment-detail-item">
      <span class="appointment-detail-label">Создана:</span>
      <span class="appointment-detail-value">${formatDate(appointment.createdAt)}</span>
    </div>
    
    <div class="modal-actions">
      <button class="btn-action" onclick="changeAppointmentStatus('${appointment.id}'); closeModal('appointmentModal');">
        🔄 Сменить статус
      </button>
    </div>
  `;
  
  openModal('appointmentModal');
}

function saveMasterSchedule() {
  showNotification('Расписание сохранено', 'success');
}

function showAddMasterForm() {
  const modal = document.getElementById('editModal');
  const modalTitle = document.getElementById('editModalTitle');
  const modalBody = document.getElementById('editModalBody');
  
  if (!modal || !modalTitle || !modalBody) return;
  
  modalTitle.textContent = 'Добавить мастера';
  modalBody.innerHTML = `
    <form id="addMasterForm">
      <div class="form-row">
        <div class="form-group">
          <label>Имя <span class="required">*</span></label>
          <input type="text" id="newMasterFirstName" required placeholder="Иван">
        </div>
        <div class="form-group">
          <label>Фамилия</label>
          <input type="text" id="newMasterLastName" placeholder="Иванов">
        </div>
      </div>
      <div class="form-group">
        <label>Email <span class="required">*</span></label>
        <input type="email" id="newMasterEmail" required placeholder="master@mail.com">
      </div>
      <div class="form-group">
        <label>Пароль <span class="required">*</span></label>
        <input type="password" id="newMasterPassword" required placeholder="••••••••">
      </div>
      <div class="form-group">
        <label>Специализация</label>
        <input type="text" id="newMasterSpecialization" placeholder="Барбер-стилист">
      </div>
      <div class="form-group">
        <label>Стаж</label>
        <input type="text" id="newMasterExperience" placeholder="5 лет">
      </div>
      <div class="form-group">
        <label>Телефон</label>
        <input type="tel" id="newMasterPhone" placeholder="+7 (999) 123-45-67">
      </div>
      <div class="form-group">
        <label>Ссылка на аватар</label>
        <input type="text" id="newMasterAvatar" placeholder="https://...">
      </div>
      <div class="form-group">
        <label>Рейтинг</label>
        <input type="number" id="newMasterRating" min="0" max="5" step="0.1" value="5.0">
      </div>
      <button type="submit" class="btn-primary">Добавить мастера</button>
    </form>
  `;
  
  document.getElementById('addMasterForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('newMasterEmail').value.trim();
    const users = getData('users');
    
    if (users.find(u => u.email === email)) {
      showNotification('Пользователь с таким email уже существует', 'error');
      return;
    }
    
    const newMaster = {
      id: generateId(),
      firstName: sanitizeInput(document.getElementById('newMasterFirstName').value.trim()),
      lastName: sanitizeInput(document.getElementById('newMasterLastName').value.trim()),
      email: email,
      password: document.getElementById('newMasterPassword').value,
      specialization: sanitizeInput(document.getElementById('newMasterSpecialization').value.trim()),
      experience: sanitizeInput(document.getElementById('newMasterExperience').value.trim()),
      phone: sanitizeInput(document.getElementById('newMasterPhone').value.trim()),
      avatar: document.getElementById('newMasterAvatar').value.trim(),
      rating: parseFloat(document.getElementById('newMasterRating').value) || 5.0,
      role: 'master',
      createdAt: new Date().toISOString()
    };
    
    users.push(newMaster);
    saveData('users', users);
    
    closeModal('editModal');
    showNotification('Мастер успешно добавлен', 'success');
    renderAdminMasters();
  });
  
  openModal('editModal');
}

function editMaster(masterId) {
  const users = getData('users');
  const master = users.find(u => u.id === masterId);
  if (!master) return;
  
  const modal = document.getElementById('editModal');
  const modalTitle = document.getElementById('editModalTitle');
  const modalBody = document.getElementById('editModalBody');
  
  if (!modal || !modalTitle || !modalBody) return;
  
  modalTitle.textContent = 'Редактировать мастера';
  modalBody.innerHTML = `
    <form id="editMasterForm">
      <div class="form-row">
        <div class="form-group">
          <label>Имя</label>
          <input type="text" id="editMasterFirstName" value="${sanitizeInput(master.firstName || '')}" required>
        </div>
        <div class="form-group">
          <label>Фамилия</label>
          <input type="text" id="editMasterLastName" value="${sanitizeInput(master.lastName || '')}">
        </div>
      </div>
      <div class="form-group">
        <label>Email</label>
        <input type="email" id="editMasterEmail" value="${sanitizeInput(master.email || '')}" required>
      </div>
      <div class="form-group">
        <label>Специализация</label>
        <input type="text" id="editMasterSpecialization" value="${sanitizeInput(master.specialization || '')}">
      </div>
      <div class="form-group">
        <label>Стаж</label>
        <input type="text" id="editMasterExperience" value="${sanitizeInput(master.experience || '')}">
      </div>
      <div class="form-group">
        <label>Телефон</label>
        <input type="tel" id="editMasterPhone" value="${sanitizeInput(master.phone || '')}">
      </div>
      <div class="form-group">
        <label>Ссылка на аватар</label>
        <input type="text" id="editMasterAvatar" value="${master.avatar || ''}">
      </div>
      <div class="form-group">
        <label>Рейтинг</label>
        <input type="number" id="editMasterRating" min="0" max="5" step="0.1" value="${master.rating || 5.0}">
      </div>
      <div class="form-group">
        <label>Новый пароль (оставьте пустым)</label>
        <input type="password" id="editMasterPassword" placeholder="••••••••">
      </div>
      <button type="submit" class="btn-primary">Сохранить изменения</button>
    </form>
  `;
  
  document.getElementById('editMasterForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const userIndex = users.findIndex(u => u.id === masterId);
    if (userIndex !== -1) {
      users[userIndex].firstName = sanitizeInput(document.getElementById('editMasterFirstName').value.trim());
      users[userIndex].lastName = sanitizeInput(document.getElementById('editMasterLastName').value.trim());
      users[userIndex].email = document.getElementById('editMasterEmail').value.trim();
      users[userIndex].specialization = sanitizeInput(document.getElementById('editMasterSpecialization').value.trim());
      users[userIndex].experience = sanitizeInput(document.getElementById('editMasterExperience').value.trim());
      users[userIndex].phone = sanitizeInput(document.getElementById('editMasterPhone').value.trim());
      users[userIndex].avatar = document.getElementById('editMasterAvatar').value.trim();
      users[userIndex].rating = parseFloat(document.getElementById('editMasterRating').value) || 5.0;
      
      const password = document.getElementById('editMasterPassword').value;
      if (password) users[userIndex].password = password;
      
      saveData('users', users);
      
      const currentUser = getCurrentUser();
      if (currentUser && currentUser.id === masterId) {
        setCurrentUser(users[userIndex]);
      }
      
      closeModal('editModal');
      showNotification('Данные мастера обновлены', 'success');
      
      if (selectedMasterForCalendar) {
        viewMasterCalendar(masterId);
      } else {
        renderAdminMasters();
      }
    }
  });
  
  openModal('editModal');
}

async function promoteToAdmin(masterId) {
  const result = await confirmAsync('Сделать этого мастера администратором?');
  if (!result) return;
  
  const users = getData('users');
  const master = users.find(u => u.id === masterId);
  if (master) {
    master.role = 'admin';
    saveData('users', users);
    showNotification(`${master.firstName} теперь администратор`, 'success');
    renderAdminMasters();
  }
}

async function demoteToMaster(adminId) {
  const users = getData('users');
  const admins = users.filter(u => u.role === 'admin');
  
  if (admins.length <= 1) {
    showNotification('Нельзя понизить последнего администратора', 'error');
    return;
  }
  
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === adminId) {
    showNotification('Вы не можете понизить самого себя', 'error');
    return;
  }
  
  const result = await confirmAsync('Понизить этого администратора до мастера?');
  if (!result) return;
  
  const admin = users.find(u => u.id === adminId);
  if (admin) {
    admin.role = 'master';
    saveData('users', users);
    showNotification(`${admin.firstName} теперь мастер`, 'success');
    renderAdminMasters();
  }
}

async function deleteMaster(masterId) {
  const users = getData('users');
  const master = users.find(u => u.id === masterId);
  
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === masterId) {
    showNotification('Вы не можете удалить самого себя', 'error');
    return;
  }
  
  if (master && master.role === 'admin') {
    const admins = users.filter(u => u.role === 'admin');
    if (admins.length <= 1) {
      showNotification('Нельзя удалить последнего администратора', 'error');
      return;
    }
  }
  
  const result = await confirmAsync(`Удалить мастера "${master?.firstName} ${master?.lastName || ''}"?`);
  if (!result) return;
  
  const index = users.findIndex(u => u.id === masterId);
  if (index !== -1) {
    users.splice(index, 1);
    saveData('users', users);
    showNotification('Мастер удален', 'success');
    renderAdminMasters();
  }
}

// ==================== ОБОРУДОВАНИЕ ====================

function renderAdminEquipment() {
  const content = document.getElementById('dashboardContent');
  if (!content) return;
  
  const equipment = getData('equipment');
  
  content.innerHTML = `
    <div class="content-header">
      <h1>Управление оборудованием</h1>
      <button class="btn-primary" onclick="showAddEquipmentForm()">+ Добавить оборудование</button>
    </div>
    
    <div class="table-responsive">
      <table class="data-table">
        <thead>
          <tr>
            <th>Название</th><th>Количество</th><th>Состояние</th><th>Действия</th>
          </tr>
        </thead>
        <tbody>
          ${equipment.map(eq => `
            <tr>
              <td>${sanitizeInput(eq.name)}</td>
              <td>${eq.quantity}</td>
              <td>
                <span class="status-badge ${eq.condition === 'Отличное' ? 'completed' : eq.condition === 'Хорошее' ? 'pending' : 'cancelled'}">
                  ${sanitizeInput(eq.condition)}
                </span>
              </td>
              <td>
                <button class="btn-action" onclick="editEquipment('${eq.id}')">✏️</button>
                <button class="btn-action danger" onclick="deleteEquipment('${eq.id}')">🗑️</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function showAddEquipmentForm() {
  const modal = document.getElementById('editModal');
  const modalTitle = document.getElementById('editModalTitle');
  const modalBody = document.getElementById('editModalBody');
  
  if (!modal || !modalTitle || !modalBody) return;
  
  modalTitle.textContent = 'Добавить оборудование';
  modalBody.innerHTML = `
    <form id="addEquipmentForm">
      <div class="form-group">
        <label>Название <span class="required">*</span></label>
        <input type="text" id="eqName" required placeholder="Машинка для стрижки">
      </div>
      <div class="form-group">
        <label>Количество <span class="required">*</span></label>
        <input type="number" id="eqQuantity" min="1" value="1" required>
      </div>
      <div class="form-group">
        <label>Состояние</label>
        <select id="eqCondition">
          <option value="Отличное">Отличное</option>
          <option value="Хорошее">Хорошее</option>
          <option value="Требует замены">Требует замены</option>
        </select>
      </div>
      <button type="submit" class="btn-primary">Добавить</button>
    </form>
  `;
  
  document.getElementById('addEquipmentForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const equipment = getData('equipment');
    equipment.push({
      id: generateId(),
      name: sanitizeInput(document.getElementById('eqName').value.trim()),
      quantity: parseInt(document.getElementById('eqQuantity').value),
      condition: document.getElementById('eqCondition').value
    });
    saveData('equipment', equipment);
    closeModal('editModal');
    showNotification('Оборудование добавлено', 'success');
    renderAdminEquipment();
  });
  
  openModal('editModal');
}

function editEquipment(equipmentId) {
  const equipment = getData('equipment');
  const eq = equipment.find(e => e.id === equipmentId);
  if (!eq) return;
  
  const modal = document.getElementById('editModal');
  const modalTitle = document.getElementById('editModalTitle');
  const modalBody = document.getElementById('editModalBody');
  
  if (!modal || !modalTitle || !modalBody) return;
  
  modalTitle.textContent = 'Редактировать оборудование';
  modalBody.innerHTML = `
    <form id="editEquipmentForm">
      <div class="form-group">
        <label>Название</label>
        <input type="text" id="eqName" value="${sanitizeInput(eq.name)}" required>
      </div>
      <div class="form-group">
        <label>Количество</label>
        <input type="number" id="eqQuantity" min="1" value="${eq.quantity}" required>
      </div>
      <div class="form-group">
        <label>Состояние</label>
        <select id="eqCondition">
          <option value="Отличное" ${eq.condition === 'Отличное' ? 'selected' : ''}>Отличное</option>
          <option value="Хорошее" ${eq.condition === 'Хорошее' ? 'selected' : ''}>Хорошее</option>
          <option value="Требует замены" ${eq.condition === 'Требует замены' ? 'selected' : ''}>Требует замены</option>
        </select>
      </div>
      <button type="submit" class="btn-primary">Сохранить</button>
    </form>
  `;
  
  document.getElementById('editEquipmentForm').addEventListener('submit', (e) => {
    e.preventDefault();
    eq.name = sanitizeInput(document.getElementById('eqName').value.trim());
    eq.quantity = parseInt(document.getElementById('eqQuantity').value);
    eq.condition = document.getElementById('eqCondition').value;
    saveData('equipment', equipment);
    closeModal('editModal');
    showNotification('Оборудование обновлено', 'success');
    renderAdminEquipment();
  });
  
  openModal('editModal');
}

async function deleteEquipment(equipmentId) {
  const result = await confirmAsync('Удалить это оборудование?');
  if (!result) return;
  
  const equipment = getData('equipment');
  const index = equipment.findIndex(e => e.id === equipmentId);
  if (index !== -1) {
    equipment.splice(index, 1);
    saveData('equipment', equipment);
    showNotification('Оборудование удалено', 'success');
    renderAdminEquipment();
  }
}

// ==================== МАТЕРИАЛЫ ====================

function renderAdminMaterials() {
  const content = document.getElementById('dashboardContent');
  if (!content) return;
  
  const materials = getData('materials');
  
  content.innerHTML = `
    <div class="content-header">
      <h1>Управление материалами</h1>
      <button class="btn-primary" onclick="showAddMaterialForm()">+ Добавить материал</button>
    </div>
    
    <div class="table-responsive">
      <table class="data-table">
        <thead>
          <tr>
            <th>Название</th><th>Кол-во</th><th>Ед.</th><th>Мин.</th><th>Статус</th><th>Действия</th>
          </tr>
        </thead>
        <tbody>
          ${materials.map(mat => {
            const isLow = mat.quantity <= mat.minQuantity;
            return `
              <tr>
                <td>${sanitizeInput(mat.name)}</td>
                <td>${mat.quantity}</td>
                <td>${sanitizeInput(mat.unit)}</td>
                <td>${mat.minQuantity}</td>
                <td>
                  <span class="status-badge ${isLow ? 'cancelled' : 'completed'}">
                    ${isLow ? '⚠️ Заканчивается' : '✓ В норме'}
                  </span>
                </td>
                <td>
                  <button class="btn-action" onclick="editMaterial('${mat.id}')">✏️</button>
                  <button class="btn-action danger" onclick="deleteMaterial('${mat.id}')">🗑️</button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function showAddMaterialForm() {
  const modal = document.getElementById('editModal');
  const modalTitle = document.getElementById('editModalTitle');
  const modalBody = document.getElementById('editModalBody');
  
  if (!modal || !modalTitle || !modalBody) return;
  
  modalTitle.textContent = 'Добавить материал';
  modalBody.innerHTML = `
    <form id="addMaterialForm">
      <div class="form-group">
        <label>Название <span class="required">*</span></label>
        <input type="text" id="matName" required placeholder="Шампунь">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Количество</label>
          <input type="number" id="matQuantity" min="0" value="0" required>
        </div>
        <div class="form-group">
          <label>Ед. изм.</label>
          <input type="text" id="matUnit" value="шт" required>
        </div>
      </div>
      <div class="form-group">
        <label>Мин. запас</label>
        <input type="number" id="matMinQuantity" min="0" value="5" required>
      </div>
      <button type="submit" class="btn-primary">Добавить</button>
    </form>
  `;
  
  document.getElementById('addMaterialForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const materials = getData('materials');
    materials.push({
      id: generateId(),
      name: sanitizeInput(document.getElementById('matName').value.trim()),
      quantity: parseInt(document.getElementById('matQuantity').value),
      unit: sanitizeInput(document.getElementById('matUnit').value.trim()),
      minQuantity: parseInt(document.getElementById('matMinQuantity').value)
    });
    saveData('materials', materials);
    closeModal('editModal');
    showNotification('Материал добавлен', 'success');
    renderAdminMaterials();
  });
  
  openModal('editModal');
}

function editMaterial(materialId) {
  const materials = getData('materials');
  const mat = materials.find(m => m.id === materialId);
  if (!mat) return;
  
  const modal = document.getElementById('editModal');
  const modalTitle = document.getElementById('editModalTitle');
  const modalBody = document.getElementById('editModalBody');
  
  if (!modal || !modalTitle || !modalBody) return;
  
  modalTitle.textContent = 'Редактировать материал';
  modalBody.innerHTML = `
    <form id="editMaterialForm">
      <div class="form-group">
        <label>Название</label>
        <input type="text" id="matName" value="${sanitizeInput(mat.name)}" required>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Количество</label>
          <input type="number" id="matQuantity" min="0" value="${mat.quantity}" required>
        </div>
        <div class="form-group">
          <label>Ед. изм.</label>
          <input type="text" id="matUnit" value="${sanitizeInput(mat.unit)}" required>
        </div>
      </div>
      <div class="form-group">
        <label>Мин. запас</label>
        <input type="number" id="matMinQuantity" min="0" value="${mat.minQuantity}" required>
      </div>
      <button type="submit" class="btn-primary">Сохранить</button>
    </form>
  `;
  
  document.getElementById('editMaterialForm').addEventListener('submit', (e) => {
    e.preventDefault();
    mat.name = sanitizeInput(document.getElementById('matName').value.trim());
    mat.quantity = parseInt(document.getElementById('matQuantity').value);
    mat.unit = sanitizeInput(document.getElementById('matUnit').value.trim());
    mat.minQuantity = parseInt(document.getElementById('matMinQuantity').value);
    saveData('materials', materials);
    closeModal('editModal');
    showNotification('Материал обновлен', 'success');
    renderAdminMaterials();
  });
  
  openModal('editModal');
}

async function deleteMaterial(materialId) {
  const result = await confirmAsync('Удалить этот материал?');
  if (!result) return;
  
  const materials = getData('materials');
  const index = materials.findIndex(m => m.id === materialId);
  if (index !== -1) {
    materials.splice(index, 1);
    saveData('materials', materials);
    showNotification('Материал удален', 'success');
    renderAdminMaterials();
  }
}

// ==================== ЗАПИСИ ====================

function renderAdminAppointments() {
  const content = document.getElementById('dashboardContent');
  if (!content) return;
  
  const appointments = getData('appointments');
  
  const sortedAppointments = [...appointments].sort((a, b) => {
    return new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time);
  });
  
  content.innerHTML = `
    <div class="content-header">
      <h1>Все записи</h1>
      <button class="btn-primary" onclick="renderAdminAppointments()">🔄 Обновить</button>
    </div>
    
    <div class="table-responsive">
      <table class="data-table">
        <thead>
          <tr>
            <th>Клиент</th><th>Телефон</th><th>Мастер</th><th>Услуга</th>
            <th>Дата</th><th>Время</th><th>Статус</th><th>Действия</th>
          </tr>
        </thead>
        <tbody>
          ${sortedAppointments.map(app => `
            <tr>
              <td>${sanitizeInput(app.clientName || '—')}</td>
              <td>${sanitizeInput(app.clientPhone || '—')}</td>
              <td>${sanitizeInput(app.masterName || '—')}</td>
              <td>${sanitizeInput(app.serviceName)}</td>
              <td>${formatDate(app.date)}</td>
              <td>${app.time}</td>
              <td>
                <span class="status-badge ${app.status}">
                  ${getAdminStatusText(app.status)}
                </span>
              </td>
              <td>
                <button class="btn-action" onclick="changeAppointmentStatusFromList('${app.id}')">🔄</button>
                <button class="btn-action" onclick="viewAppointmentDetails('${app.id}')">👁</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function changeAppointmentStatusFromList(appointmentId) {
  changeAppointmentStatus(appointmentId);
  setTimeout(() => renderAdminAppointments(), 100);
}

// ==================== КЛИЕНТЫ ====================

function renderAdminClients() {
  const content = document.getElementById('dashboardContent');
  if (!content) return;
  
  const users = getData('users');
  const clients = users.filter(u => u.role === 'client');
  const appointments = getData('appointments');
  
  content.innerHTML = `
    <div class="content-header">
      <h1>Клиенты</h1>
    </div>
    
    <div class="table-responsive">
      <table class="data-table">
        <thead>
          <tr>
            <th>Имя</th><th>Email</th><th>Телефон</th><th>Регистрация</th><th>Записей</th><th>Действия</th>
          </tr>
        </thead>
        <tbody>
          ${clients.map(client => {
            const clientAppointments = appointments.filter(a => a.clientId === client.id);
            const completedCount = clientAppointments.filter(a => a.status === 'completed').length;
            
            return `
              <tr>
                <td>${sanitizeInput(client.firstName)} ${sanitizeInput(client.lastName || '')}</td>
                <td>${sanitizeInput(client.email)}</td>
                <td>${sanitizeInput(client.phone || '—')}</td>
                <td>${formatDate(client.createdAt)}</td>
                <td>${clientAppointments.length} (вып: ${completedCount})</td>
                <td>
                  <button class="btn-action" onclick="viewClientAppointments('${client.id}')">📋</button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function viewClientAppointments(clientId) {
  const users = getData('users');
  const appointments = getData('appointments');
  const client = users.find(u => u.id === clientId);
  if (!client) return;
  
  const clientAppointments = appointments
    .filter(a => a.clientId === clientId)
    .sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time));
  
  const modal = document.getElementById('appointmentModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  
  if (!modal || !modalTitle || !modalBody) return;
  
  modalTitle.textContent = `Записи: ${client.firstName} ${client.lastName || ''}`;
  modalBody.innerHTML = `
    <div class="client-info">
      <p><strong>Email:</strong> ${sanitizeInput(client.email)}</p>
      <p><strong>Телефон:</strong> ${sanitizeInput(client.phone || '—')}</p>
      <p><strong>Всего записей:</strong> ${clientAppointments.length}</p>
    </div>
    
    ${clientAppointments.length > 0 ? `
      <div class="appointments-list">
        ${clientAppointments.map(app => `
          <div class="appointment-item ${app.status}">
            <div class="appointment-info">
              <div class="appointment-time">${formatDate(app.date)} в ${app.time}</div>
              <div class="appointment-service">${sanitizeInput(app.serviceName)}</div>
              <div class="appointment-client">Мастер: ${sanitizeInput(app.masterName || '—')}</div>
              <span class="appointment-status ${app.status}">${getAdminStatusText(app.status)}</span>
            </div>
          </div>
        `).join('')}
      </div>
    ` : '<div class="no-appointments">У клиента пока нет записей</div>'}
  `;
  
  openModal('appointmentModal');
}

// ==================== СТАТИСТИКА ====================

function renderAdminStatistics() {
  const content = document.getElementById('dashboardContent');
  if (!content) return;
  
  const appointments = getData('appointments');
  const users = getData('users');
  const services = getData('services');
  
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const completedAppointments = appointments.filter(a => a.status === 'completed');
  const pendingAppointments = appointments.filter(a => a.status === 'pending');
  const cancelledAppointments = appointments.filter(a => a.status === 'cancelled');
  
  const thisMonthAppointments = completedAppointments.filter(a => {
    const appDate = new Date(a.date);
    return appDate.getMonth() === currentMonth && appDate.getFullYear() === currentYear;
  });
  
  const last30DaysAppointments = completedAppointments.filter(a => {
    const appDate = new Date(a.date);
    return appDate >= thirtyDaysAgo;
  });
  
  const totalRevenue = completedAppointments.reduce((sum, a) => sum + (a.price || 0), 0);
  const thisMonthRevenue = thisMonthAppointments.reduce((sum, a) => sum + (a.price || 0), 0);
  const last30DaysRevenue = last30DaysAppointments.reduce((sum, a) => sum + (a.price || 0), 0);
  
  const masters = users.filter(u => u.role === 'master' || (u.role === 'admin' && u.specialization));
  const masterStats = masters.map(master => {
    const masterCompleted = completedAppointments.filter(a => a.masterId === master.id);
    const masterRevenue = masterCompleted.reduce((sum, a) => sum + (a.price || 0), 0);
    const masterThisMonth = thisMonthAppointments.filter(a => a.masterId === master.id);
    
    return {
      ...master,
      totalAppointments: masterCompleted.length,
      totalRevenue: masterRevenue,
      thisMonthAppointments: masterThisMonth.length,
      thisMonthRevenue: masterThisMonth.reduce((sum, a) => sum + (a.price || 0), 0)
    };
  }).sort((a, b) => b.totalRevenue - a.totalRevenue);
  
  const serviceStats = services.map(service => {
    const serviceCompleted = completedAppointments.filter(a => a.serviceId === service.id);
    
    return {
      ...service,
      totalCount: serviceCompleted.length,
      totalRevenue: serviceCompleted.reduce((sum, a) => sum + (a.price || 0), 0)
    };
  }).sort((a, b) => b.totalCount - a.totalCount);
  
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayAppointments = completedAppointments.filter(a => a.date === dateStr);
    last7Days.push({
      date: dateStr,
      label: date.toLocaleDateString('ru-RU', { weekday: 'short' }),
      count: dayAppointments.length,
      revenue: dayAppointments.reduce((sum, a) => sum + (a.price || 0), 0)
    });
  }
  
  const maxDailyRevenue = Math.max(...last7Days.map(d => d.revenue), 1);
  
  content.innerHTML = `
    <div class="content-header">
      <h1>Финансовая статистика</h1>
      <button class="btn-primary" onclick="renderAdminStatistics()">🔄 Обновить</button>
    </div>
    
    <div class="stats-overview">
      <div class="stat-card-large">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <div class="stat-label">Общая выручка</div>
          <div class="stat-value-large">${formatMoney(totalRevenue)}</div>
          <div class="stat-sub">всего ${completedAppointments.length} заказов</div>
        </div>
      </div>
      
      <div class="stat-card-large">
        <div class="stat-icon">📅</div>
        <div class="stat-content">
          <div class="stat-label">Выручка за месяц</div>
          <div class="stat-value-large">${formatMoney(thisMonthRevenue)}</div>
          <div class="stat-sub">${thisMonthAppointments.length} заказов</div>
        </div>
      </div>
      
      <div class="stat-card-large">
        <div class="stat-icon">📈</div>
        <div class="stat-content">
          <div class="stat-label">За 30 дней</div>
          <div class="stat-value-large">${formatMoney(last30DaysRevenue)}</div>
          <div class="stat-sub">${last30DaysAppointments.length} заказов</div>
        </div>
      </div>
      
      <div class="stat-card-large">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <div class="stat-label">Клиентов</div>
          <div class="stat-value-large">${users.filter(u => u.role === 'client').length}</div>
          <div class="stat-sub">всего зарегистрировано</div>
        </div>
      </div>
    </div>
    
    <div class="stats-chart-container">
      <h3>📊 Выручка за последние 7 дней</h3>
      <div class="chart-bars">
        ${last7Days.map(day => {
          const heightPercent = maxDailyRevenue > 0 ? (day.revenue / maxDailyRevenue * 100) : 0;
          return `
            <div class="chart-bar-wrapper">
              <div class="chart-bar-value">${formatMoney(day.revenue)}</div>
              <div class="chart-bar" style="height: ${Math.max(heightPercent, 4)}%;">
                <span class="chart-bar-label">${day.count}</span>
              </div>
              <div class="chart-bar-date">${day.label}</div>
            </div>
          `;
        }).join('')}
      </div>
      <div class="chart-legend">
        <span>📅 Дни недели</span>
        <span>📦 Количество заказов на столбце</span>
      </div>
    </div>
    
    <div class="stats-two-columns">
      <div class="stats-panel">
        <h3>💈 Выручка по мастерам</h3>
        <div class="stats-table-wrapper">
          <table class="stats-table">
            <thead>
              <tr>
                <th>Мастер</th>
                <th>Заказов</th>
                <th>Выручка</th>
                <th>За месяц</th>
              </tr>
            </thead>
            <tbody>
              ${masterStats.map(m => `
                <tr>
                  <td>
                    <div class="master-cell">
                      <img src="${m.avatar || 'https://via.placeholder.com/30'}" alt="${sanitizeInput(m.firstName)}" class="stats-avatar">
                      <span>${sanitizeInput(m.firstName)}</span>
                    </div>
                  </td>
                  <td>${m.totalAppointments}</td>
                  <td class="money-cell">${formatMoney(m.totalRevenue)}</td>
                  <td class="money-cell">${formatMoney(m.thisMonthRevenue)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
      
      <div class="stats-panel">
        <h3>✂️ Популярность услуг</h3>
        <div class="stats-table-wrapper">
          <table class="stats-table">
            <thead>
              <tr>
                <th>Услуга</th>
                <th>Кол-во</th>
                <th>Выручка</th>
                <th>Доля</th>
              </tr>
            </thead>
            <tbody>
              ${serviceStats.map(s => {
                const percentage = totalRevenue > 0 ? (s.totalRevenue / totalRevenue * 100).toFixed(1) : 0;
                return `
                  <tr>
                    <td>${sanitizeInput(s.name)}</td>
                    <td>${s.totalCount}</td>
                    <td class="money-cell">${formatMoney(s.totalRevenue)}</td>
                    <td>
                      <div class="percentage-bar">
                        <div class="percentage-fill" style="width: ${percentage}%;"></div>
                        <span class="percentage-text">${percentage}%</span>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <div class="stats-summary">
      <div class="summary-item pending">
        <span class="summary-icon">⏳</span>
        <span class="summary-label">Ожидается</span>
        <span class="summary-value">${pendingAppointments.length}</span>
      </div>
      <div class="summary-item completed">
        <span class="summary-icon">✅</span>
        <span class="summary-label">Выполнено</span>
        <span class="summary-value">${completedAppointments.length}</span>
      </div>
      <div class="summary-item cancelled">
        <span class="summary-icon">❌</span>
        <span class="summary-label">Отменено</span>
        <span class="summary-value">${cancelledAppointments.length}</span>
      </div>
      <div class="summary-item total">
        <span class="summary-icon">📋</span>
        <span class="summary-label">Всего записей</span>
        <span class="summary-value">${appointments.length}</span>
      </div>
    </div>
  `;
}

function formatMoney(amount) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount).replace('RUB', '₽');
}

// Экспорт функций
window.viewMasterCalendar = viewMasterCalendar;
window.changeAdminMonth = changeAdminMonth;
window.goToAdminToday = goToAdminToday;
window.changeAppointmentStatus = changeAppointmentStatus;
window.changeAppointmentStatusFromList = changeAppointmentStatusFromList;
window.viewAppointmentDetails = viewAppointmentDetails;
window.saveMasterSchedule = saveMasterSchedule;
window.showAddMasterForm = showAddMasterForm;
window.editMaster = editMaster;
window.promoteToAdmin = promoteToAdmin;
window.demoteToMaster = demoteToMaster;
window.deleteMaster = deleteMaster;
window.showAddEquipmentForm = showAddEquipmentForm;
window.editEquipment = editEquipment;
window.deleteEquipment = deleteEquipment;
window.showAddMaterialForm = showAddMaterialForm;
window.editMaterial = editMaterial;
window.deleteMaterial = deleteMaterial;
window.viewClientAppointments = viewClientAppointments;
window.renderAdminStatistics = renderAdminStatistics;
window.formatMoney = formatMoney;