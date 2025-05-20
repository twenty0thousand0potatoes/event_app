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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-xl overflow-hidden">

        <div className="h-2 bg-gradient-to-r from-orange-500 to-pink-600"></div>
        
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500 mb-2">
              Добро пожаловать
            </h1>
            <p className="text-gray-400">Введите свои данные для входа</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
    
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  {...register('email')}
                  className={`w-full px-4 py-3 bg-gray-800/50 border ${
                    errors.email 
                      ? 'border-red-500/50 focus:ring-red-500/30 focus:border-red-500' 
                      : 'border-gray-700 focus:ring-orange-500/30 focus:border-orange-500'
                  } rounded-lg text-gray-100 placeholder-gray-500 transition-all duration-200`}
                  placeholder="your@email.com"
                  disabled={loading}
                />
                {errors.email && (
                  <div className="absolute right-3 top-3.5 text-red-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              {errors.email && (
                <div className="mt-2 flex items-center text-red-400 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.email.message}
                </div>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  Пароль
                </label>
                <button
                  type="button"
                  disabled={loading || !watch('email')}
                  onClick={() => {
                    const email = watch('email');
                    if (email) {
                      router.push(`/forgot-password?email=${encodeURIComponent(email)}`);
                    }
                  }}
                  className="text-xs text-orange-400 hover:text-orange-300 transition-colors disabled:text-gray-600 disabled:hover:text-gray-600"
                >
                  Забыли пароль?
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  {...register('password')}
                  className={`w-full px-4 py-3 bg-gray-800/50 border ${
                    errors.password 
                      ? 'border-red-500/50 focus:ring-red-500/30 focus:border-red-500' 
                      : 'border-gray-700 focus:ring-orange-500/30 focus:border-orange-500'
                  } rounded-lg text-gray-100 placeholder-gray-500 transition-all duration-200`}
                  placeholder="••••••••"
                  disabled={loading}
                />
                {errors.password && (
                  <div className="absolute right-3 top-3.5 text-red-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              {errors.password && (
                <div className="mt-2 flex items-center text-red-400 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.password.message}
                </div>
              )}
            </div>

      
            {error && (
              <div className="p-4 bg-red-900/50 border border-red-700/50 rounded-lg flex items-start">
                <div className="flex-shrink-0 text-red-400 mt-0.5 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-sm text-red-200">{error}</div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                loading 
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white shadow-lg hover:shadow-orange-500/20'
              } flex items-center justify-center`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Вход в систему...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Войти
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            Нет аккаунта?{' '}
            <Link 
              href="/register" 
              className="font-medium text-orange-400 hover:text-orange-300 transition-colors"
            >
              Зарегистрироваться
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}