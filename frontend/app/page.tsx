'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'

const YandexMap = dynamic(() => import('@/components/YandexMap'), { ssr: false })

export default function Home() {
  return (
    <div className="font-sans text-white bg-black min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-black overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black opacity-60" />
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Создавай. Находи. <span className="text-orange-500">Участвуй.</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Вместе — платформа, которая помогает организаторам и участникам находить друг друга. Всё, что нужно для мероприятий — в одном месте.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <button className="bg-orange-500 hover:bg-orange-600 text-black font-bold px-8 py-4 rounded-full transition-all transform hover:scale-105">
                Начать сейчас
              </button>
            </Link>
            <Link href="#features">
              <button className="border-2 border-white hover:border-orange-500 hover:text-orange-500 font-bold px-8 py-4 rounded-full transition-all">
                Узнать больше
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Почему выбирают нас</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Все инструменты для организаторов и участников в одном месте
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '📅',
                title: 'Создавай мероприятия',
                text: 'Простой конструктор событий для организаторов любого уровня.'
              },
              {
                icon: '🔍',
                title: 'Ищи по интересам',
                text: 'Умные рекомендации на основе ваших предпочтений и местоположения.'
              },
              {
                icon: '🤝',
                title: 'Сообщество',
                text: 'Общайтесь с единомышленниками и находите новых друзей.'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-gray-900 p-8 rounded-xl hover:bg-gray-800 transition-all"
              >
                <div className="text-orange-500 text-4xl mb-4">{item.icon}</div>
                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-300">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Explanation */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Как это работает?</h2>
              <p className="text-xl text-gray-300 mb-6">
                Посмотрите короткое видео о том, как платформа помогает находить и создавать мероприятия.
              </p>
              <Link href="/login">
                <button className="bg-orange-500 hover:bg-orange-600 text-black font-bold px-8 py-3 rounded-full transition-all">
                  Попробовать бесплатно
                </button>
              </Link>
            </div>
            <div className="md:w-1/2 bg-gray-800 rounded-xl overflow-hidden aspect-video">
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-gray-700 to-gray-900">
                <span className="text-2xl">Видео-презентация</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Yandex Map Section */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Мероприятия вокруг вас</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Находите события рядом с вами с помощью интерактивной карты
            </p>
          </div>
          <YandexMap />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-r from-orange-600 to-orange-800">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Готовы начать?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Присоединяйтесь к тысячам организаторов и участников прямо сейчас
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <button className="bg-black hover:bg-gray-900 text-white font-bold px-8 py-4 rounded-full transition-all transform hover:scale-105">
                Зарегистрироваться
              </button>
            </Link>
            <Link href="/login">
              <button className="border-2 border-black hover:bg-black hover:text-white font-bold px-8 py-4 rounded-full transition-all">
                Войти
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
