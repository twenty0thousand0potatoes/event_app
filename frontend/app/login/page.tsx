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

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
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
    <div className="flex items-center justify-center min-h-screen bg-black text-orange-100 px-4">
      <div className="w-full max-w-md bg-gray-900 p-8 rounded-2xl shadow-lg border border-orange-800">
        <h1 className="text-2xl font-bold text-center mb-6 text-orange-400">Вход в систему</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-orange-300">Email</label>
            <input
              type="email"
              {...register('email')}
              className={`w-full p-2 rounded bg-gray-800 text-orange-100 border ${
                errors.email ? 'border-red-500' : 'border-orange-700'
              }`}
              disabled={loading}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-orange-300">Пароль</label>
            <input
              type="password"
              {...register('password')}
              className={`w-full p-2 rounded bg-gray-800 text-orange-100 border ${
                errors.password ? 'border-red-500' : 'border-orange-700'
              }`}
              disabled={loading}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
            )}
          </div>

          <div className="text-right mb-4">
            <button
              type="button"
              disabled={loading || !watch('email')}
              onClick={() => {
                const email = watch('email');
                if (email) {
                  router.push(`/forgot-password?email=${encodeURIComponent(email)}`);
                }
              }}
              className="text-sm text-orange-400 hover:text-orange-300 underline disabled:text-gray-600 disabled:no-underline"
            >
              Забыли пароль?
            </button>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-300 bg-red-900 border border-red-700 rounded text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-black py-2 rounded transition disabled:bg-gray-600 disabled:text-gray-400"
          >
            {loading ? 'Входим...' : 'Войти'}
          </button>
        </form>

        <p className="mt-4 text-sm text-orange-300 text-center">
          Нет аккаунта?{' '}
          <Link href="/register" className="text-orange-400 hover:text-orange-300 underline">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  )
}
