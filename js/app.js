// Главный файл приложения для index.html
document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  loadBarbers();
  initBookingButtons();
  initAnimations();
  checkUserStatus();
});

// Мобильное меню
function initMobileMenu() {
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      mainNav.classList.toggle('active');
    });
  }

  document.querySelectorAll('.nav a').forEach(link => {
    link.addEventListener('click', () => {
      if (mainNav) {
        mainNav.classList.remove('active');
      }
    });
  });
}

// Загрузка барберов на главную
function loadBarbers() {
  const barbersList = document.getElementById('barbersList');
  if (!barbersList) return;

  const users = getData('users');
  const masters = users.filter(u => u.role === 'master' || (u.role === 'admin' && u.specialization));
  
  const barbers = masters.filter(m => m.specialization || m.role === 'master');
  
  if (barbers.length === 0) return;

  barbersList.innerHTML = barbers.map(barber => {
    const rating = barber.rating || 4.5;
    return `
      <div class="barber" data-barber-id="${barber.id}">
        <img src="${barber.avatar || 'https://via.placeholder.com/100'}" alt="${barber.firstName}" class="barber-img">
        <h3>${barber.firstName} ${barber.lastName || ''}</h3>
        <p>${barber.specialization || 'Барбер'}</p>
        <p>Стаж: ${barber.experience || 'не указан'}</p>
        <div class="barber-rating">
          <span class="stars-container">${getStarRating(rating)}</span>
          <span>${rating.toFixed(1)}</span>
        </div>
        <button class="btn-view" data-barber-id="${barber.id}">Подробнее</button>
      </div>
    `;
  }).join('');

  document.querySelectorAll('.btn-view').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const barberId = e.target.dataset.barberId;
      window.location.href = `pages/barbers-reviews.html?barber=${barberId}`;
    });
  });
}

// ИСПРАВЛЕННАЯ функция генерации звезд
function getStarRating(rating) {
  // Округляем до ближайшей половины
  const roundedRating = Math.round(rating * 2) / 2;
  const fullStars = Math.floor(roundedRating);
  const hasHalfStar = roundedRating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  let stars = '';
  
  // Полные золотые звезды
  for (let i = 0; i < fullStars; i++) {
    stars += '<span class="star-full">★</span>';
  }
  
  // Половинчатая звезда (золотая половина, серая половина)
  if (hasHalfStar) {
    stars += '<span class="star-half"></span>';
  }
  
  // Пустые серые звезды
  for (let i = 0; i < emptyStars; i++) {
    stars += '<span class="star-empty">☆</span>';
  }
  
  return stars;
}

// Инициализация кнопок записи
function initBookingButtons() {
  document.querySelectorAll('.btn-book').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const service = e.target.dataset.service;
      const currentUser = getCurrentUser();
      
      if (!currentUser) {
        window.location.href = `pages/auth.html?mode=register&service=${encodeURIComponent(service)}`;
      } else {
        window.location.href = `pages/dashboard.html#booking?service=${encodeURIComponent(service)}`;
      }
    });
  });
}

// Анимация появления элементов
function initAnimations() {
  const animateOnScroll = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.card, .barber').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    animateOnScroll.observe(el);
  });
}

// Проверка статуса пользователя
function checkUserStatus() {
  const currentUser = getCurrentUser();
  const nav = document.getElementById('mainNav');
  
  if (!nav) return;
  
  if (currentUser) {
    nav.innerHTML = `
      <a href="pages/dashboard.html" class="btn-nav">Личный кабинет</a>
      <button class="btn-nav" id="logoutBtn">Выйти</button>
    `;
    
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
      logout();
    });
  } else {
    nav.innerHTML = `
      <a href="pages/auth.html?mode=register" class="btn-nav">Регистрация</a>
      <a href="pages/auth.html?mode=login" class="btn-nav">Войти</a>
    `;
  }
}

// Плавный скролл
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});