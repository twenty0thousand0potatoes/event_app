'use client'
import { useEffect, useRef, useState } from 'react'

interface YandexMapProps {
  initialLatitude?: number
  initialLongitude?: number
  onLocationSelect?: (latitude: number, longitude: number) => void
  showRandomPlacemarks?: boolean
}

export default function YandexMap({ initialLatitude, initialLongitude, onLocationSelect, showRandomPlacemarks }: YandexMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)
  const placemarksRef = useRef<any[]>([]) 
  const mapInstanceRef = useRef<any>(null)


  const getRandomMinskCoords = () => {
    const minskCenter = { lat: 53.9006, lon: 27.5590 }
    const offset = () => (Math.random() - 0.5) * 0.2
    return [minskCenter.lat + offset(), minskCenter.lon + offset()]
  }

  useEffect(() => {
    if (typeof window === 'undefined') return

    const initMap = () => {
      if (loaded) return

      (window as any).ymaps.ready(() => {
        const ymaps = (window as any).ymaps

        const centerLat = initialLatitude ?? 53.9006
        const centerLon = initialLongitude ?? 27.5590

        const map = new ymaps.Map(mapRef.current, {
          center: [centerLat, centerLon],
          zoom: 12,
          controls: ['zoomControl', 'fullscreenControl'],
        })

        mapInstanceRef.current = map

        if (initialLatitude && initialLongitude) {
          const placemark = new ymaps.Placemark(
            [initialLatitude, initialLongitude],
            {
              balloonContent: '<strong>Место проведения мероприятия</strong>',
              hintContent: 'Место проведения',
            },
            {
              preset: 'islands#blueIcon',
              draggable: !!onLocationSelect,
            }
          )

          if (onLocationSelect) {
            placemark.events.add('dragend', function (e: any) {
              const coords = e.get('target').geometry.getCoordinates()
              onLocationSelect(coords[0], coords[1])
            })
          }

          map.geoObjects.add(placemark)
          placemarksRef.current.push(placemark)
        } else if (showRandomPlacemarks) {
          const placemarksCount = 5 
          
          for (let i = 0; i < placemarksCount; i++) {
            const coords = getRandomMinskCoords()
            const placemark = new ymaps.Placemark(
              coords,
              {
                balloonContent: `<strong>Место ${i+1}</strong>`,
                hintContent: `Место ${i+1}`,
              },
              {
                preset: 'islands#blueIcon',
                draggable: !!onLocationSelect, 
              }
            )

            if (onLocationSelect) {
              placemark.events.add('dragend', function (e: any) {
                const coords = e.get('target').geometry.getCoordinates()
                onLocationSelect(coords[0], coords[1])
              })
            }

            map.geoObjects.add(placemark)
            placemarksRef.current.push(placemark)
          }
        }

        if (!initialLatitude || !initialLongitude) {
          if (onLocationSelect) {
            map.events.add('click', function (e: any) {
              const coords = e.get('coords')
              const placemark = new ymaps.Placemark(
                coords,
                {
                  balloonContent: '<strong>Новая метка</strong>',
                  hintContent: 'Новая метка',
                },
                {
                  preset: 'islands#redIcon',
                  draggable: !!onLocationSelect,
                }
              )

              placemark.events.add('dragend', function (e: any) {
                const coords = e.get('target').geometry.getCoordinates()
                onLocationSelect(coords[0], coords[1])
              })

              map.geoObjects.add(placemark)
              placemarksRef.current.push(placemark)

              onLocationSelect(coords[0], coords[1])
            })
          }
        }

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
  }, [loaded, onLocationSelect, initialLatitude, initialLongitude])

  return <div ref={mapRef} className="w-full h-96 rounded-2xl overflow-hidden" />
}