'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

interface UserData {
  username: string
  email: string
  hobbies: string[]
  avatar: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [username, setUsername] = useState('')
  const [hobbies, setHobbies] = useState<string[]>([])
  const [newHobby, setNewHobby] = useState('')
  const [avatar, setAvatar] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('http://localhost:3000/users/me', {
          withCredentials: true,
        })
        setUser(res.data)
        setUsername(res.data.username)
        setHobbies(res.data.hobbies || [])
        setAvatar(res.data.avatar || 'https://via.placeholder.com/150')
      } catch (err) {
        router.push('/login?reason=unauthorized')
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [router])

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3000/auth/logout', {}, {
        withCredentials: true,
      })
      router.push('/login')
    } catch (err) {
      showMessage('Ошибка при выходе', 'error')
    }
  }

  const updateUsername = async () => {
    try {
      await axios.patch(
        'http://localhost:3000/users/me/username',
        { username },
        { withCredentials: true }
      )
      setUser(prev => prev ? {...prev, username} : null)
      showMessage('Имя пользователя обновлено', 'success')
    } catch (err) {
      showMessage('Ошибка при обновлении имени', 'error')
    }
  }

  const updateAvatar = async () => {
    try {
      await axios.patch(
        'http://localhost:3000/users/avatar',
        { avatar },
        { withCredentials: true }
      )
      setUser(prev => prev ? {...prev, avatar} : null)
      showMessage('Аватар обновлен', 'success')
    } catch (err) {
      showMessage('Ошибка при обновлении аватара', 'error')
    }
  }

  const updateHobbies = async () => {
    try {
      await axios.patch(
        'http://localhost:3000/users/hobbies',
        { hobbies },
        { withCredentials: true }
      )
      setUser(prev => prev ? {...prev, hobbies} : null)
      showMessage('Увлечения обновлены', 'success')
    } catch (err) {
      showMessage('Ошибка при обновлении увлечений', 'error')
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 2 * 1024 * 1024) {
        showMessage('Файл слишком большой (макс. 2MB)', 'error')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatar(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addHobby = () => {
    if (newHobby.trim() && !hobbies.includes(newHobby.trim())) {
      setHobbies([...hobbies, newHobby.trim()])
      setNewHobby('')
    }
  }

  const removeHobby = (index: number) => {
    setHobbies(hobbies.filter((_, i) => i !== index))
  }

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => setMessage(''), 3000)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg">Загрузка...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10 sm:py-20 overflow-y-auto">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl space-y-8">
        <h2 className="text-3xl font-bold text-gray-800 text-center">Личный кабинет</h2>

        <div className="flex flex-col items-center space-y-6">
      
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <img 
                src={avatar || ''} 
                alt="Аватар" 
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
              />
              <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition">
                <input 
                  type="file" 
                  onChange={handleAvatarChange}
                  className="hidden"
                  accept="image/*"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </label>
            </div>
            <h3 className="text-2xl font-semibold text-gray-800">{username}</h3>
          </div>

        
          <div className="w-full space-y-6">
           
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900">Имя пользователя</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
                <button
                  onClick={updateUsername}
                  disabled={!username || username === user?.username}
                  className={`px-4 py-2 rounded-lg transition ${
                    username && username !== user?.username
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Сохранить
                </button>
              </div>
            </div>

         
            <div>
              <label className="block text-sm font-medium text-gray-900">Email</label>
              <p className="mt-1 px-4 py-2 bg-gray-50 rounded-lg text-gray-900 font-medium">
                {user?.email}
              </p>
            </div>

     
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900">Увлечения</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newHobby}
                  onChange={(e) => setNewHobby(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addHobby()}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Добавьте увлечение"
                />
                <button
                  onClick={addHobby}
                  disabled={!newHobby.trim()}
                  className={`px-4 py-2 rounded-lg transition ${
                    newHobby.trim()
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Добавить
                </button>
              </div>
              
              {hobbies.length > 0 && (
                <div className="mt-2 space-y-2">
                  {hobbies.map((hobby, index) => (
                    <div key={index} className="flex justify-between items-center bg-gray-50 px-4 py-2 rounded-lg">
                      <span>{hobby}</span>
                      <button 
                        onClick={() => removeHobby(index)}
                        className="text-red-500 hover:text-red-700 transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={updateHobbies}
                disabled={JSON.stringify(hobbies) === JSON.stringify(user?.hobbies || [])}
                className={`w-full mt-2 py-2 rounded-lg transition ${
                  JSON.stringify(hobbies) !== JSON.stringify(user?.hobbies || [])
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Сохранить увлечения
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900">Ссылка на аватар</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Введите URL изображения"
                />
                <button
                  onClick={updateAvatar}
                  disabled={avatar === (user?.avatar || 'https://via.placeholder.com/150')}
                  className={`px-4 py-2 rounded-lg transition ${
                    avatar !== (user?.avatar || 'https://via.placeholder.com/150')
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Сохранить
                </button>
              </div>
            </div>

          
            {message && (
              <div className={`p-3 rounded-lg text-center ${
                messageType === 'success' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {message}
              </div>
            )}

   
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition flex items-center justify-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
              <span>Выйти</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}