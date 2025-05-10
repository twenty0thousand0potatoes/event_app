'use client'

import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

const schema = yup.object({
  email: yup
    .string()
    .email('Неверный формат email')
    .required('Email обязателен'),
  password: yup
    .string()
    .min(6, 'Пароль должен содержать минимум 6 символов')
    .required('Пароль обязателен'),
})

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onBlur',
  })

  const onSubmit = async (data: { email: string; password: string }) => {
    setLoading(true)
    setServerError(null)

    try {
      const response = await axios.post(
        'http://localhost:3000/auth/signup',
        data,
        { withCredentials: true }
      )

      if (response.status === 200) {
        setSuccess(true)
      }
    } catch (error: any) {
      setServerError(
        error.response?.data?.message ||
          'Произошла ошибка при регистрации. Попробуйте позже.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-orange-100 px-4">
      <div className="w-full max-w-md bg-gray-900 p-8 rounded-2xl shadow-lg border border-orange-800">
        <h1 className="text-2xl font-bold text-center mb-6 text-orange-400">
          Регистрация
        </h1>

        {success ? (
          <div className="bg-green-900 text-green-300 p-4 rounded text-center space-y-4 border border-green-700">
            <p>Код подтверждения отправлен на вашу почту.</p>
            <button
              onClick={() => router.push('/verify')}
              className="bg-orange-500 hover:bg-orange-600 text-black py-2 px-4 rounded transition"
            >
              OK
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-orange-300">
                Email
              </label>
              <input
                type="email"
                {...register('email')}
                className={`w-full p-2 rounded bg-gray-800 text-orange-100 border ${
                  errors.email ? 'border-red-500' : 'border-orange-700'
                }`}
                disabled={loading}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-orange-300">
                Пароль
              </label>
              <input
                type="password"
                {...register('password')}
                className={`w-full p-2 rounded bg-gray-800 text-orange-100 border ${
                  errors.password ? 'border-red-500' : 'border-orange-700'
                }`}
                disabled={loading}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            {serverError && (
              <div className="p-3 text-sm text-red-300 bg-red-900 border border-red-700 rounded text-center">
                {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-black py-2 rounded transition disabled:bg-gray-600 disabled:text-gray-400"
            >
              {loading ? 'Отправка...' : 'Зарегистрироваться'}
            </button>
          </form>
        )}

        {!success && (
          <p className="mt-4 text-sm text-orange-300 text-center">
            Уже есть аккаунт?{' '}
            <Link
              href="/login"
              className="text-orange-400 hover:text-orange-300 underline"
            >
              Войти
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
 