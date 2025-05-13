'use client'
import { useEffect, useRef, useState } from 'react'

export default function YandexMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const initMap = () => {
      if (loaded) return

      (window as any).ymaps.ready(() => {
        const ymaps = (window as any).ymaps

        const map = new ymaps.Map(mapRef.current, {
          center: [53.9006, 27.5590], // Центр Минска
          zoom: 12,
          controls: ['zoomControl', 'fullscreenControl'],
        })

        // Добавим метку мероприятия — Площадь Независимости
        const placemark = new ymaps.Placemark(
          [53.893009, 27.567444],
          {
            balloonContent: '<strong>Фестиваль в центре Минска</strong><br/>14:00, 25 мая',
            hintContent: 'Мероприятие: Фестиваль',
          },
          {
            preset: 'islands#orangeIcon',
          }
        )

        map.geoObjects.add(placemark)
        setLoaded(true)
      })
    }

    if ((window as any).ymaps) {
      initMap()
    } else {
      const existingScript = document.querySelector('script[src*="api-maps.yandex.ru"]')
      if (existingScript) {
        existingScript.addEventListener('load', initMap)
        return
      }

      const script = document.createElement('script')
      script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU'
      script.type = 'text/javascript'
      script.onload = initMap
      document.body.appendChild(script)
    }
  }, [loaded])

  return <div ref={mapRef} className="w-full h-96 rounded-2xl overflow-hidden" />
}
