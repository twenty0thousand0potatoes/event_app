import Link from 'next/link';

export default function Home() {
  return (
    <div className="font-sans text-white bg-black">
      <section className="text-center py-20 bg-gradient-to-r from-black to-orange-600 text-white">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Создавай. Находи. Участвуй.</h1>
        <p className="text-xl max-w-xl mx-auto mb-6">
          Вместе — платформа, которая помогает организаторам и участникам находить друг друга. Всё, что нужно для мероприятий — в одном месте.
        </p>
        <Link href="http://localhost:3001/login" passHref>
          <button className="bg-orange-500 text-black font-semibold px-6 py-3 rounded-full hover:bg-orange-600 transition">
            Начать сейчас
          </button>
        </Link>
      </section>

      <section className="py-20 bg-black text-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 text-center">
          <div>
            <h3 className="text-xl font-bold mb-2">📅 Создавай мероприятия</h3>
            <p>Организаторы могут легко создавать и управлять событиями: от лекций до фестивалей.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">🔍 Ищи по интересам</h3>
            <p>Система рекомендаций подскажет, какие мероприятия могут быть интересны именно тебе.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">🤝 Находи единомышленников</h3>
            <p>Участвуй в группах и находи людей, с которыми у тебя общие интересы.</p>
          </div>
        </div>
      </section>

      <section className="bg-black py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Рекомендации, которые понимают тебя</h2>
          <p className="text-lg mb-6">
            Алгоритмы анализируют твои интересы, историю участия и локацию, чтобы предложить самые релевантные события.
          </p>
        </div>
      </section>

      <section className="py-20 bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Подпишись на события и организаторов</h2>
          <p className="text-lg mb-6">
            Получай уведомления о новых событиях, будь в курсе активности любимых организаторов и развивай своё сообщество.
          </p>
        </div>
      </section>

      <section className="bg-black py-20">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Мероприятия на карте</h2>
          <p className="mb-6 text-lg">Находи ближайшие события вокруг тебя и планируй участие с удобной картой.</p>
          <div className="w-full h-64 bg-orange-300 rounded-lg shadow-inner flex items-center justify-center text-black">
            [ Карта будет тут ]
          </div>
        </div>
      </section>

      <section className="bg-black py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Приватность и контроль</h2>
          <p className="text-lg">
            Ты сам решаешь, какую информацию показывать. Мы строго соблюдаем конфиденциальность и защиту данных.
          </p>
        </div>
      </section>

      <section className="bg-gradient-to-r from-black to-orange-600 text-white py-20">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Организатор? Это твоё место!</h2>
          <p className="text-lg mb-6">
            Управляй регистрацией, публикуй обновления, отслеживай статистику участия. Всё просто, быстро и красиво.
          </p>
          <Link href="http://localhost:3001/login" passHref>
            <button className="bg-orange-500 text-black px-6 py-3 rounded-full font-semibold hover:bg-orange-600 transition">
              Создать мероприятие
            </button>
          </Link>
        </div>
      </section>

      <section className="bg-black py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Мобильное приложение уже в пути</h2>
        <p className="text-lg">
          Оставайся на связи — в приложении ты сможешь следить за событиями и общаться с участниками в любое время.
        </p>
      </section>

      <section className="py-20 text-center bg-black">
        <h2 className="text-3xl font-bold mb-4">Готов начать?</h2>
        <p className="text-lg mb-6">Присоединяйся — бесплатно. Будь в центре событий своего города!</p>
        <Link href="http://localhost:3001/register" passHref>
          <button className="bg-orange-500 text-black px-8 py-3 rounded-full hover:bg-orange-600 transition">
            Зарегистрироваться
          </button>
        </Link>
      </section>
    </div>
  );
}
