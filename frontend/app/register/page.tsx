'use client'

import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { saveTemporaryToken } from '../lib/auth'
import { useState } from 'react'

const schema = yup.object({
  email: yup.string().email('Неверный email').required('Обязательное поле'),
  password: yup.string().min(6, 'Мин. 6 символов').required('Обязательное поле'),
})

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [backendError, setBackendError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) })

  const onSubmit = async (data: any) => {
    setLoading(true)
    setError(null)
    setBackendError(null)

    try {
      const res = await axios.post('http://localhost:3000/auth/signup', data)

      saveTemporaryToken(res.data.temporaryToken)
      router.push('/verify')
    } catch (err: any) {
      if (err.response?.data?.message) {
        setBackendError(err.response?.data?.message)
      } else {
        setBackendError('Ошибка при регистрации. Попробуйте позже.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 py-10 sm:py-20 overflow-y-auto">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm space-y-6"
      >
        <h2 className="text-3xl font-bold text-center text-gray-800">Регистрация</h2>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
          <input
            type="email"
            {...register('email')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Введите email"
          />
          {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Пароль</label>
          <input
            type="password"
            {...register('password')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Введите пароль"
          />
          {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
        </div>

        {backendError && <p className="text-sm text-red-500 text-center">{backendError}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
      </form>
    </div>
  )
}
