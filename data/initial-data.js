// Инициализация начальных данных в localStorage
(function() {
  // Проверяем, есть ли уже данные
  if (!localStorage.getItem('appInitialized')) {
    
    // Пользователи (клиенты, мастера, админы)
    const users = [
      {
        id: 'admin1',
        email: 'admin@mail.com',
        password: 'admin',
        firstName: 'Админ',
        lastName: 'Системы',
        phone: '+7 (999) 111-11-11',
        role: 'admin',
        createdAt: new Date().toISOString()
      },
      {
        id: 'master1',
        email: 'master@mail.com',
        password: 'master',
        firstName: 'Алексей',
        lastName: 'Иванов',
        phone: '+7 (999) 222-22-22',
        role: 'master',
        specialization: 'Барбер-стилист',
        experience: '8 лет',
        rating: 4.9,
        avatar: 'https://barber-shop.su/wp-content/uploads/2017/03/Ya-Barbeshop05.jpg',
        createdAt: new Date().toISOString()
      },
      {
        id: 'master2',
        email: 'dmitry@hardcoin.ru',
        password: 'master123',
        firstName: 'Дмитрий',
        lastName: 'Смирнов',
        phone: '+7 (999) 333-33-33',
        role: 'master',
        specialization: 'Барбер',
        experience: '6 лет',
        rating: 4.7,
        avatar: 'https://img.freepik.com/premium-photo/face-barber-man-studio-barber-man-with-scissors-retro-razor-blade_474717-106861.jpg',
        createdAt: new Date().toISOString()
      },
      {
        id: 'master3',
        email: 'maxim@hardcoin.ru',
        password: 'master123',
        firstName: 'Максим',
        lastName: 'Волков',
        phone: '+7 (999) 444-44-44',
        role: 'master',
        specialization: 'Топ-барбер',
        experience: '5 лет',
        rating: 5.0,
        avatar: 'https://moslenta.ru/thumb/600x0/filters:quality(75)/imgs/2022/09/20/06/5591831/03061a1b2fa3ea5456ef8e3f76945811c7d4b21c.jpg',
        createdAt: new Date().toISOString()
      }
    ];

    // Услуги
    const services = [
      {
        id: 'service1',
        name: 'Стрижка + борода',
        description: 'Профессиональная стрижка и укладка бороды',
        price: 2500,
        duration: 60,
        image: 'https://barber.su/imgs/blog/031/31/blg5d20423fca98d5_91599848.jpg'
      },
      {
        id: 'service2',
        name: 'Бритьё опасной бритвой',
        description: 'Классическое бритьё с уходом за кожей',
        price: 1800,
        duration: 45,
        image: 'https://kirkland24.ru/image/cachewebp/catalog/samples/blog/25-1500x1000.webp'
      },
      {
        id: 'service3',
        name: 'Укладка',
        description: 'Стильная укладка с продуктами премиум-класса',
        price: 900,
        duration: 30,
        image: 'https://pricheskino.by/upload/medialibrary/6c2/6c261d4dfe31219e7f3fc440490d4fcb.jpg'
      }
    ];

    // Отзывы о барберах
    const reviews = [
      {
        id: 'review1',
        masterId: 'master1',
        clientName: 'Иван Петров',
        rating: 5,
        comment: 'Алексей - настоящий профессионал! Стрижка и оформление бороды выполнены идеально. Очень внимательный к деталям мастер.',
        date: '2026-03-15'
      },
      {
        id: 'review2',
        masterId: 'master1',
        clientName: 'Сергей Козлов',
        rating: 4.5,
        comment: 'Отличный барбер, всегда хожу только к нему. Уютная атмосфера и качественная работа.',
        date: '2026-03-10'
      },
      {
        id: 'review3',
        masterId: 'master2',
        clientName: 'Андрей Морозов',
        rating: 5,
        comment: 'Дмитрий отлично знает своё дело. Бритьё опасной бритвой - просто песня! Рекомендую.',
        date: '2026-03-18'
      },
      {
        id: 'review4',
        masterId: 'master2',
        clientName: 'Павел Новиков',
        rating: 4,
        comment: 'Хорошая стрижка, но немного задержали по времени. В целом доволен результатом.',
        date: '2026-03-05'
      },
      {
        id: 'review5',
        masterId: 'master3',
        clientName: 'Роман Белов',
        rating: 5,
        comment: 'Максим - топ-мастер! Каждая стрижка как произведение искусства. Всегда выхожу довольным.',
        date: '2026-03-20'
      },
      {
        id: 'review6',
        masterId: 'master3',
        clientName: 'Денис Крылов',
        rating: 5,
        comment: 'Лучший барбер в городе! Укладка держится несколько дней. Максим всегда подскажет что подойдет.',
        date: '2026-03-12'
      }
    ];

    // Оборудование
    const equipment = [
      { id: 'eq1', name: 'Машинка для стрижки Wahl', quantity: 4, condition: 'Отличное' },
      { id: 'eq2', name: 'Фен профессиональный', quantity: 3, condition: 'Хорошее' },
      { id: 'eq3', name: 'Опасная бритва', quantity: 6, condition: 'Отличное' },
      { id: 'eq4', name: 'Кресло барбера', quantity: 3, condition: 'Хорошее' },
      { id: 'eq5', name: 'Триммер для бороды', quantity: 4, condition: 'Отличное' }
    ];

    // Материалы
    const materials = [
      { id: 'mat1', name: 'Шампунь American Crew', quantity: 12, unit: 'шт', minQuantity: 5 },
      { id: 'mat2', name: 'Воск для укладки', quantity: 8, unit: 'шт', minQuantity: 3 },
      { id: 'mat3', name: 'Масло для бороды', quantity: 15, unit: 'шт', minQuantity: 5 },
      { id: 'mat4', name: 'Помада для волос', quantity: 6, unit: 'шт', minQuantity: 3 },
      { id: 'mat5', name: 'Спрей для укладки', quantity: 10, unit: 'шт', minQuantity: 4 }
    ];

    // Записи (ПУСТОЙ МАССИВ - без примеров)
    const appointments = [];

    // Сохраняем все в localStorage
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('services', JSON.stringify(services));
    localStorage.setItem('reviews', JSON.stringify(reviews));
    localStorage.setItem('equipment', JSON.stringify(equipment));
    localStorage.setItem('materials', JSON.stringify(materials));
    localStorage.setItem('appointments', JSON.stringify(appointments));
    localStorage.setItem('appInitialized', 'true');
    
    console.log('Начальные данные загружены в localStorage');
  }
})();