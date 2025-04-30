'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { getToken, clearToken } from '../lib/auth'

interface UserData {
  username: string
  email: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = getToken()
        if (!token) throw new Error('Нет токена')

        const res = await axios.get('http://localhost:3000/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        setUser(res.data)
        setUsername(res.data.username)
      } catch (err) {
        clearToken()
        router.push('/login?reason=unauthorized') // ⬅ редирект с объяснением
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const handleLogout = () => {
    clearToken()
    router.push('/login')
  }

  const handleUsernameChange = async () => {
    try {
      const token = getToken()
      await axios.patch(
        'http://localhost:3000/users/username',
        { username },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMessage('Имя пользователя обновлено')
    } catch (err) {
      setMessage('Ошибка при обновлении')
    }
  }

  if (loading) return <p className="p-4">Загрузка...</p>

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10 sm:py-20 overflow-y-auto">
      <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-xl space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Личный кабинет</h2>

        <p><strong>Email:</strong> {user?.email}</p>

        <div>
          <label className="block text-sm font-medium mb-1">Имя пользователя</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleUsernameChange}
            className="mt-2 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Сохранить
          </button>
        </div>

        {message && <p className="text-sm text-center text-gray-600">{message}</p>}

        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
        >
          Выйти
        </button>
      </div>
    </div>
  )
}
