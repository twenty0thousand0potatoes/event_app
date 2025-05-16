'use client'

import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

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

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Декоративная полоса */}
        <div className="h-2 bg-gradient-to-r from-orange-500 to-pink-600"></div>
        
        <div className="p-8">
          <motion.div 
            variants={fadeIn}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500 mb-2">
              Создайте аккаунт
            </h1>
            <p className="text-gray-400">Начните использовать все возможности платформы</p>
          </motion.div>

          {success ? (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="bg-green-900/50 text-green-300 p-6 rounded-xl text-center space-y-4 border border-green-700/50"
            >
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-green-800/50 rounded-full flex items-center justify-center border border-green-600/50">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <p className="text-lg">Код подтверждения отправлен на вашу почту</p>
              <button
                onClick={() => router.push('/verify')}
                className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-black font-bold py-2 px-6 rounded-lg transition transform hover:scale-105"
              >
                Продолжить
              </button>
            </motion.div>
          ) : (
            <motion.form 
              onSubmit={handleSubmit(onSubmit)} 
              className="space-y-6"
              variants={fadeIn}
              transition={{ delay: 0.4 }}
            >
              {/* Поле email */}
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

              {/* Поле пароля */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Пароль
                </label>
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

              {/* Сообщение об ошибке сервера */}
              {serverError && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-900/50 border border-red-700/50 rounded-lg flex items-start"
                >
                  <div className="flex-shrink-0 text-red-400 mt-0.5 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-sm text-red-200">{serverError}</div>
                </motion.div>
              )}

              {/* Кнопка регистрации */}
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
                    Регистрация...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    Зарегистрироваться
                  </>
                )}
              </button>
            </motion.form>
          )}

          {!success && (
            <motion.div 
              variants={fadeIn}
              transition={{ delay: 0.6 }}
              className="mt-6 text-center text-sm text-gray-400"
            >
              Уже есть аккаунт?{' '}
              <Link 
                href="/login" 
                className="font-medium text-orange-400 hover:text-orange-300 transition-colors"
              >
                Войти
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}