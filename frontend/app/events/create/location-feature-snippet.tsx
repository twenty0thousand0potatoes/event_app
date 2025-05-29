import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import YandexMap from "../../../components/YandexMap";

interface LocationInputProps {
  location: string;
  setLocation: (value: string) => void;
  latitude: number | null;
  setLatitude: (value: number | null) => void;
  longitude: number | null;
  setLongitude: (value: number | null) => void;
}

export default function LocationInputExample({
  location,
  setLocation,
  latitude,
  setLatitude,
  longitude,
  setLongitude,
}: LocationInputProps) {
  useEffect(() => {
    // Reset coordinates if location is cleared
    if (location.trim() === '') {
      setLatitude(null);
      setLongitude(null);
    }
  }, [location, setLatitude, setLongitude]);

  const handleLocationChange = async (value: string) => {
    setLocation(value);

    if (value.trim() === '') {
      setLatitude(null);
      setLongitude(null);
      return;
    }

    try {
      const response = await fetch(
        `https://geocode-maps.yandex.ru/1.x/?format=json&apikey=YOUR_YANDEX_API_KEY&geocode=${encodeURIComponent(value)}`
      );
      const data = await response.json();
      const pos = data.response.GeoObjectCollection.featureMember[0]?.GeoObject.Point.pos;
      if (pos) {
        const [lon, lat] = pos.split(' ').map(Number);
        setLatitude(lat);
        setLongitude(lon);
        toast.success("Координаты обновлены по адресу");
      }
    } catch (error) {
      console.error("Ошибка геокодирования", error);
    }
  };

  const handleLocationSelect = async (lat: number, lon: number) => {
    setLatitude(lat);
    setLongitude(lon);
    try {
      const response = await fetch(
        `https://geocode-maps.yandex.ru/1.x/?format=json&apikey=YOUR_YANDEX_API_KEY&geocode=${lon},${lat}&kind=house`
      );
      const data = await response.json();
      const address = data.response.GeoObjectCollection.featureMember[0]?.GeoObject.metaDataProperty.GeocoderMetaData.text;
      if (address) {
        setLocation(address);
        toast.success("Адрес обновлен по координатам");
      }
    } catch (error) {
      console.error("Ошибка обратного геокодирования", error);
    }
  };

  return (
    <>
      <input
        type="text"
        value={location}
        onChange={e => handleLocationChange(e.target.value)}
        placeholder="Введите название или адрес места"
        className="w-full p-3 border border-gray-600 rounded-t-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-700 text-white"
      />
      <div className="border border-gray-600 rounded-b-lg overflow-hidden h-64">
        <YandexMap 
          onLocationSelect={handleLocationSelect} 
          initialLatitude={latitude || undefined} 
          initialLongitude={longitude || undefined} 
        />
      </div>
      {(latitude && longitude) && (
        <p className="mt-2 text-gray-400">
          Выбранные координаты: {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </p>
      )}
      {!latitude && !longitude && (
        <p className="mt-2 text-orange-400">Пожалуйста, выберите место на карте или введите адрес</p>
      )}
    </>
  );
}
