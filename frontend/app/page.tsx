'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Toaster } from 'react-hot-toast'
import { motion } from 'framer-motion'

const YandexMap = dynamic(() => import('@/components/YandexMap'), { ssr: false })

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export default function Home() {
  return (
    <div className="font-sans text-white bg-gradient-to-b from-black to-gray-900 min-h-screen overflow-x-hidden">
      <Toaster position="top-center" toastOptions={{
        style: {
          background: '#111827',
          color: '#fff',
          border: '1px solid rgba(249, 115, 22, 0.5)',
          boxShadow: '0 4px 20px rgba(249, 115, 22, 0.15)',
          backdropFilter: 'blur(10px)'
        }
      }} />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80" />
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/video_main_page.mp4" type="video/mp4" />
          </video>
        </div>

        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-4 max-w-4xl"
        >
          <motion.h1 
            variants={fadeIn}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-orange-400"
          >
            Создавай. Находи. <span className="text-orange-500">Участвуй.</span>
          </motion.h1>
          <motion.p 
            variants={fadeIn}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto text-gray-300"
          >
            Вместе — платформа, которая помогает организаторам и участникам находить друг друга. Всё, что нужно для мероприятий — в одном месте.
          </motion.p>
          <motion.div 
            variants={fadeIn}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/login">
              <button className="relative overflow-hidden group bg-orange-500 hover:bg-orange-600 text-black font-bold px-8 py-4 rounded-full transition-all transform hover:scale-105 shadow-lg hover:shadow-orange-500/30">
                <span className="relative z-10">Начать сейчас</span>
                <span className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"></span>
              </button>
            </Link>
            <Link href="#features">
              <button className="border-2 border-white/30 hover:border-orange-500 hover:text-orange-500 font-bold px-8 py-4 rounded-full transition-all shadow-lg hover:shadow-orange-500/20 backdrop-blur-sm">
                Узнать больше
              </button>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10"
        >
          <a href="#features" className="animate-bounce inline-block">
            <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-orange-400">
              Почему выбирают нас
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Все инструменты для организаторов и участников в одном месте
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '📅',
                title: 'Создавай мероприятия',
                text: 'Простой конструктор событий для организаторов любого уровня.',
                bg: 'bg-gradient-to-br from-orange-500/10 to-pink-600/10'
              },
              {
                icon: '🔍',
                title: 'Ищи по интересам',
                text: 'Умные рекомендации на основе ваших предпочтений и местоположения.',
                bg: 'bg-gradient-to-br from-blue-500/10 to-purple-600/10'
              },
              {
                icon: '🤝',
                title: 'Сообщество',
                text: 'Общайтесь с единомышленниками и находите новых друзей.',
                bg: 'bg-gradient-to-br from-green-500/10 to-teal-600/10'
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                transition={{ delay: idx * 0.2 }}
                className={`${item.bg} p-8 rounded-2xl hover:shadow-xl transition-all border border-gray-700/50 backdrop-blur-sm hover:border-orange-500/30`}
              >
                <div className="text-5xl mb-6">{item.icon}</div>
                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                <p className="text-gray-300">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="md:w-1/2"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-orange-400">
                Как это работает?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Посмотрите короткое видео о том, как платформа помогает находить и создавать мероприятия.
              </p>
              <Link href="/login">
                <button className="relative overflow-hidden group bg-orange-500 hover:bg-orange-600 text-black font-bold px-8 py-4 rounded-full transition-all transform hover:scale-105 shadow-lg hover:shadow-orange-500/30">
                  <span className="relative z-10">Попробовать бесплатно</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"></span>
                </button>
              </Link>
            </motion.div>
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ delay: 0.2 }}
              className="md:w-1/2 bg-gray-800/50 rounded-2xl overflow-hidden aspect-video border border-gray-700/50 shadow-xl backdrop-blur-sm"
            >
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-gray-800/50 to-gray-900/50">
                <div className="relative group">
                  <div className="absolute inset-0 bg-orange-500 rounded-full opacity-20 group-hover:opacity-30 transition-opacity blur-xl"></div>
                  <button className="relative z-10 w-20 h-20 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-orange-400">
              Мероприятия вокруг вас
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Находите события рядом с вами с помощью интерактивной карты
            </p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="rounded-2xl overflow-hidden border border-gray-700/50 shadow-xl"
          >
            <YandexMap />
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-r from-orange-600/90 to-orange-800/90 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-[length:200px]"></div>
        </div>
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="max-w-4xl mx-auto text-center px-4 relative"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-8">Готовы начать?</h2>
          <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto text-orange-100">
            Присоединяйтесь к тысячам организаторов и участников прямо сейчас
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <button className="relative overflow-hidden group bg-black hover:bg-gray-900 text-white font-bold px-8 py-4 rounded-full transition-all transform hover:scale-105 shadow-lg hover:shadow-black/30">
                <span className="relative z-10">Зарегистрироваться</span>
                <span className="absolute inset-0 bg-gradient-to-r from-gray-900 to-black opacity-0 group-hover:opacity-100 transition-opacity rounded-full"></span>
              </button>
            </Link>
            <Link href="/login">
              <button className="border-2 border-black/20 hover:bg-black/20 hover:border-black/30 font-bold px-8 py-4 rounded-full transition-all shadow-lg backdrop-blur-sm">
                Войти
              </button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  )
}