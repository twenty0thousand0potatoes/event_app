"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";

const YandexMap = dynamic(() => import("@/components/YandexMap"), {
  ssr: false,
});

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Home() {
  return (
    <div className="font-sans text-white bg-gradient-to-br from-gray-900 to-black min-h-screen overflow-x-hidden">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#111827",
            color: "#fff",
            border: "1px solid rgba(249, 115, 22, 0.5)",
            boxShadow: "0 4px 20px rgba(249, 115, 22, 0.15)",
            backdropFilter: "blur(10px)",
          },
        }}
      />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/video_main_page.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-black/90 z-10 backdrop-blur-sm" />
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.5 }}
          className="relative z-20 text-center px-6 max-w-4xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-xl p-8"
        >
          <motion.h1
            variants={fadeIn}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-500"
          >
            Создавай. Находи. <span className="text-orange-400">Участвуй.</span>
          </motion.h1>
          <motion.p
            variants={fadeIn}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl mb-10 text-gray-400"
          >
            Вместе — всё для организаторов и участников в одном месте.
          </motion.p>
          <motion.div
            variants={fadeIn}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link href="/login">
              <button className="bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white font-bold px-8 py-4 rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-orange-500/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 inline"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
                Начать сейчас
              </button>
            </Link>
            <Link href="#features">
              <button className="border-2 border-gray-700/50 hover:border-orange-500/50 text-gray-300 hover:text-orange-400 font-bold px-8 py-4 rounded-lg transition-all backdrop-blur-sm hover:shadow-orange-500/20">
                Подробнее
              </button>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20"
        >
          <a href="#features" className="animate-bounce inline-block">
            <svg
              className="w-8 h-8 text-orange-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
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
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-500">
              Возможности
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Всё необходимое для организации и участия в событиях
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "📅",
                title: "Создание событий",
                text: "Простой инструмент для планирования мероприятий.",
                bg: "bg-gray-900/80 border-gray-700/50",
              },
              {
                icon: "🔍",
                title: "Поиск по интересам",
                text: "Рекомендации по интересам и локации.",
                bg: "bg-gray-900/80 border-gray-700/50",
              },
              {
                icon: "🤝",
                title: "Сообщество",
                text: "Общение и новые знакомства.",
                bg: "bg-gray-900/80 border-gray-700/50",
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                transition={{ delay: idx * 0.2, duration: 0.5 }}
                className={`${item.bg} p-8 rounded-2xl hover:shadow-xl transition-all border backdrop-blur-sm hover:border-orange-500/30`}
              >
                <div className="text-5xl mb-6 text-orange-400">{item.icon}</div>
                <h3 className="text-2xl font-bold mb-4 text-gray-100">
                  {item.title}
                </h3>
                <p className="text-gray-400">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Video & CTA */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="md:w-1/2"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-500">
              Как это работает?
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Смотрите, как просто найти или создать мероприятие.
            </p>
            <Link href="/login">
              <button className="bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white font-bold px-8 py-4 rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-orange-500/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 inline"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
                Попробовать
              </button>
            </Link>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="md:w-1/2 bg-gray-900/80 rounded-2xl overflow-hidden aspect-video border border-gray-700/50 shadow-xl backdrop-blur-sm"
          >
            <div className="w-full h-full flex items-center justify-center">
              <div className="relative group">
                <button className="w-20 h-20 bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 rounded-full flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
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
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-500">
              Мероприятия рядом
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Откройте для себя события на интерактивной карте
            </p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="rounded-2xl overflow-hidden border border-gray-700/50 shadow-xl backdrop-blur-sm"
          >
            <YandexMap />
          </motion.div>
        </div>
      </section>

      <section className="py-32 bg-gradient-to-r from-orange-600/80 to-pink-700/80 relative overflow-hidden backdrop-blur-md">
        <div className="absolute inset-0 opacity-5 bg-[url('/pattern.svg')] bg-[length:200px]" />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto text-center px-4 relative bg-gray-900/90 border border-gray-700/50 rounded-2xl p-8 shadow-xl backdrop-blur-sm"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-500">
            Присоединяйтесь сейчас
          </h2>
          <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto text-gray-300">
            Тысячи людей уже с нами — будь среди них
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <button className="bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white font-bold px-8 py-4 rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-orange-500/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 inline"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
                Зарегистрироваться
              </button>
            </Link>
            <Link href="/login">
              <button className="border-2 border-gray-700/50 hover:border-orange-500/50 text-gray-300 hover:text-orange-400 font-bold px-8 py-4 rounded-lg transition-all backdrop-blur-sm hover:shadow-orange-500/20">
                Войти
              </button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
