'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import Link from 'next/link'

const schema = yup.object({
  email: yup.string().email('Неверный email').required('Обязательное поле'),
  password: yup.string()
    .min(6, 'Минимум 6 символов')
    .required('Введите пароль'),
})

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  })

  const onSubmit = async (data: { email: string; password: string }) => {
    setLoading(true)
    setError(null)
    
    try {
      await axios.post('http://localhost:3000/auth/signin', data, {
        withCredentials: true 
      })
      
      
      router.push('/dashboard')
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        'Ошибка входа. Проверьте email и пароль'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-black">Вход в систему</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-black">Email</label>
            <input
              type="email"
              {...register('email')}
              className={`w-full p-2 border rounded placeholder-black ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-black">Пароль</label>
            <input
              type="password"
              {...register('password')}
              className={`w-full p-2 border rounded placeholder-black ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {error && (
            <div className="p-2 text-sm text-red-600 bg-red-50 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded text-white ${
              loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          <Link href="/register" className="text-blue-600 hover:underline">
            Создать аккаунт
          </Link>
        </div>
      </div>
    </div>
  )
}