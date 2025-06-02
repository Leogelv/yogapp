import React, { useState } from 'react';
import './LandingPage.css';

interface FormData {
  name: string;
  phone: string;
  email: string;
}

export const LandingPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Здесь можно добавить отправку данных на сервер
    console.log('Данные формы:', formData);
    setIsSubmitted(true);
  };

  const downloadSyllabus = () => {
    const link = document.createElement('a');
    link.href = '/Syllabus_ShkolaAI.pdf';
    link.download = 'Syllabus_ShkolaAI.pdf';
    link.click();
  };

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="container">
          <nav className="landing-nav">
            <div className="logo">
              <h1>Школа AI</h1>
            </div>
            <div className="nav-links">
              <a href="#course">Курс</a>
              <a href="#instructor">Преподаватель</a>
              <a href="#program">Программа</a>
              <a href="#contact">Контакты</a>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Курс «GenAI Engineer — Начальный уровень»
            </h1>
            <p className="hero-subtitle">
              готовит Junior GenAI-инженеров
            </p>
            <p className="hero-description">
              Изучите основы генеративного искусственного интеллекта и AI-агентов. 
              Получите практические навыки работы с современными технологиями ИИ.
            </p>
            <div className="hero-buttons">
              <button className="btn btn-primary" onClick={() => document.getElementById('registration')?.scrollIntoView()}>
                Записаться
              </button>
              <button className="btn btn-secondary" onClick={downloadSyllabus}>
                Посмотреть полную программу
              </button>
            </div>
          </div>
          <div className="hero-image">
            <div className="ai-illustration">
              <div className="ai-brain"></div>
              <div className="ai-connections"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Section */}
      <section id="course" className="course-section">
        <div className="container">
          <h2 className="section-title">О курсе</h2>
          <div className="course-grid">
            <div className="course-card">
              <div className="course-icon">🤖</div>
              <h3>Генеративный ИИ</h3>
              <p>Изучите принципы работы с GPT, DALL-E, Midjourney и другими генеративными моделями</p>
            </div>
            <div className="course-card">
              <div className="course-icon">🔧</div>
              <h3>AI Агенты</h3>
              <p>Создавайте интеллектуальных агентов для автоматизации бизнес-процессов</p>
            </div>
            <div className="course-card">
              <div className="course-icon">💼</div>
              <h3>Практические проекты</h3>
              <p>Работайте над реальными задачами и создавайте портфолио GenAI-инженера</p>
            </div>
            <div className="course-card">
              <div className="course-icon">🎯</div>
              <h3>Карьерная подготовка</h3>
              <p>Подготовка к собеседованиям и трудоустройству в сфере ИИ</p>
            </div>
          </div>
        </div>
      </section>

      {/* Instructor Section */}
      <section id="instructor" className="instructor-section">
        <div className="container">
          <div className="instructor-content">
            <div className="instructor-image">
              <img src="/leonid_photo.jpg" alt="Леонид Гельвих" />
            </div>
            <div className="instructor-info">
              <h2>Леонид Гельвих</h2>
              <p className="instructor-title">Senior GenAI Engineer</p>
              <p className="instructor-description">
                Опытный специалист в области искусственного интеллекта с многолетним опытом 
                разработки AI-решений. Эксперт по генеративным моделям и AI-агентам.
              </p>
              <div className="instructor-achievements">
                <div className="achievement">
                  <span className="achievement-number">5+</span>
                  <span className="achievement-text">лет в AI</span>
                </div>
                <div className="achievement">
                  <span className="achievement-number">100+</span>
                  <span className="achievement-text">проектов</span>
                </div>
                <div className="achievement">
                  <span className="achievement-number">500+</span>
                  <span className="achievement-text">студентов</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Program Section */}
      <section id="program" className="program-section">
        <div className="container">
          <h2 className="section-title">Программа курса</h2>
          <div className="program-preview">
            <div className="program-modules">
              <div className="module">
                <h3>Модуль 1: Основы GenAI</h3>
                <p>Введение в генеративный ИИ, архитектуры моделей, принципы работы</p>
              </div>
              <div className="module">
                <h3>Модуль 2: Практическая работа с API</h3>
                <p>OpenAI API, Anthropic Claude, интеграция в приложения</p>
              </div>
              <div className="module">
                <h3>Модуль 3: AI Агенты</h3>
                <p>Создание автономных агентов, цепочки инструментов, планирование</p>
              </div>
              <div className="module">
                <h3>Модуль 4: Проектная работа</h3>
                <p>Разработка собственного AI-проекта под руководством ментора</p>
              </div>
            </div>
            <div className="program-cta">
              <button className="btn btn-outline" onClick={downloadSyllabus}>
                Скачать полную программу (PDF)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Section */}
      <section id="registration" className="registration-section">
        <div className="container">
          <div className="registration-content">
            <h2>Записаться на курс</h2>
            <p>Оставьте свои контактные данные, и мы свяжемся с вами для записи на курс</p>
            
            {!isSubmitted ? (
              <form className="registration-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Имя *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Введите ваше имя"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Телефон *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="+7 (771) 899-99-99"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="your@email.com"
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-full">
                  Записаться на курс
                </button>
              </form>
            ) : (
              <div className="success-message">
                <h3>Спасибо за заявку!</h3>
                <p>Мы свяжемся с вами в ближайшее время для уточнения деталей.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <div className="container">
          <h2 className="section-title">Контакты</h2>
          <div className="contact-info">
            <div className="contact-item">
              <div className="contact-icon">📞</div>
              <div className="contact-details">
                <h3>Телефон</h3>
                <p>+7 (771) 899-99-99</p>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon">📧</div>
              <div className="contact-details">
                <h3>Email</h3>
                <p>info@shkola-ai.kz</p>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon">🏢</div>
              <div className="contact-details">
                <h3>Организация</h3>
                <p>TOO "AI Land"</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Школа AI</h3>
              <p>Образование в сфере искусственного интеллекта</p>
            </div>
            <div className="footer-section">
              <h4>Курсы</h4>
              <ul>
                <li><a href="#course">GenAI Engineer</a></li>
                <li><a href="#program">Программа</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Контакты</h4>
              <ul>
                <li>+7 (771) 899-99-99</li>
                <li>info@shkola-ai.kz</li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 TOO "AI Land". Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}; 