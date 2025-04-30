'use client'

import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import axios from 'axios'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { saveToken } from '../lib/auth'

const schema = yup.object({
  email: yup.string().email('Неверный email').required('Обязательное поле'),
  password: yup.string().min(6, 'Мин. 6 символов').required('Обязательное поле'),
})

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const reason = searchParams.get('reason')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) })

  useEffect(() => {
    if (reason === 'unauthorized') {
      setError('Пожалуйста, войдите или зарегистрируйтесь для доступа к личному кабинету.')
    }
  }, [reason])

  const onSubmit = async (data: any) => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.post('http://localhost:3000/auth/signin', data)
      const token = response.data.access_token
      saveToken(token)
      router.push('/dashboard') ;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при входе')
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
        <h2 className="text-3xl font-bold text-center text-gray-800">Вход</h2>

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

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          {loading ? 'Загрузка...' : 'Войти'}
        </button>

        <p className="text-center text-sm text-gray-600">
          Нет аккаунта?{' '}
          <Link href="/register" className="text-blue-600 underline font-medium">
            Регистрация
          </Link>
        </p>
      </form>
    </div>
  )
}
