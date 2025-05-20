'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { motion } from 'framer-motion'
import { useState } from 'react'
import axios from 'axios'

const schema = yup.object({
  password: yup.string().min(6, 'Минимум 6 символов').required('Введите новый пароль'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Пароли не совпадают')
    .required('Повторите пароль'),
})

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export default function NewPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams.get('email') || ''
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  })

  const onSubmit = async (data: { password: string }) => {
    setLoading(true)
    setServerError('')
    try {
      await axios.post('http://localhost:3000/auth/reset-password', {
        email,
        password: data.password
      }, { withCredentials: true })
      router.push('/login')
    } catch (error) {
      setServerError('Не удалось установить новый пароль')
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
        className="w-full max-w-md bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="h-2 bg-gradient-to-r from-orange-500 to-pink-600" />

        <div className="p-8">
          <motion.div
            variants={fadeIn}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center border border-orange-500/30">
                <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0-1.657-1.343-3-3-3S6 9.343 6 11v1H4v6h16v-6h-2v-1c0-1.657-1.343-3-3-3s-3 1.343-3 3z" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-400 to-pink-500 mb-2 drop-shadow-[0_1px_1px_rgba(255,255,255,0.1)]">
              Новый пароль
            </h1>
            <p className="text-gray-400">Введите новый пароль для {email}</p>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit(onSubmit)}
            variants={fadeIn}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <div>
              <input
                type="password"
                {...register('password')}
                placeholder="Новый пароль"
                className={`w-full px-6 py-4 bg-gray-800/50 border ${
                  errors.password
                    ? 'border-red-500/50 focus:ring-red-500/30 focus:border-red-500'
                    : 'border-gray-700 focus:ring-orange-500/30 focus:border-orange-500'
                } rounded-xl text-gray-100 placeholder-gray-600 text-base focus:outline-none transition-all`}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            <div>
              <input
                type="password"
                {...register('confirmPassword')}
                placeholder="Повторите пароль"
                className={`w-full px-6 py-4 bg-gray-800/50 border ${
                  errors.confirmPassword
                    ? 'border-red-500/50 focus:ring-red-500/30 focus:border-red-500'
                    : 'border-gray-700 focus:ring-orange-500/30 focus:border-orange-500'
                } rounded-xl text-gray-100 placeholder-gray-600 text-base focus:outline-none transition-all`}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>
              )}
            </div>

            {serverError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 bg-red-900/50 border border-red-700/50 rounded-lg flex items-start"
              >
                <svg className="flex-shrink-0 w-5 h-5 mt-0.5 mr-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-red-200 text-sm">{serverError}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-sm tracking-wide uppercase transition-all ${
                loading
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white shadow-md shadow-orange-400/30 hover:shadow-pink-500/40'
              } flex items-center justify-center`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Сохраняем...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Сохранить
                </>
              )}
            </button>
          </motion.form>
        </div>
      </motion.div>
    </div>
  )
}
