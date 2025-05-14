'use client'
import { useEffect, useRef, useState } from 'react'

interface YandexMapProps {
  onLocationSelect?: (latitude: number, longitude: number) => void
}

export default function YandexMap({ onLocationSelect }: YandexMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)
  const placemarkRef = useRef<any>(null)
  const mapInstanceRef = useRef<any>(null)

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

        mapInstanceRef.current = map

        const placemark = new ymaps.Placemark(
          [53.893009, 27.567444],
          {
            balloonContent: '<strong>Фестиваль в центре Минска</strong><br/>14:00, 25 мая',
            hintContent: 'Мероприятие: Фестиваль',
          },
          {
            preset: 'islands#orangeIcon',
            draggable: true,
          }
        )

        placemarkRef.current = placemark
        map.geoObjects.add(placemark)

        placemark.events.add('dragend', function (e: any) {
          const coords = e.get('target').geometry.getCoordinates()
          if (onLocationSelect) {
            onLocationSelect(coords[0], coords[1])
          }
        })

        map.events.add('click', function (e: any) {
          const coords = e.get('coords')
          placemark.geometry.setCoordinates(coords)
          if (onLocationSelect) {
            onLocationSelect(coords[0], coords[1])
          }
        })

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
  }, [loaded, onLocationSelect])

  return <div ref={mapRef} className="w-full h-96 rounded-2xl overflow-hidden" />
}