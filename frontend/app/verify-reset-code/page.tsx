'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { motion } from 'framer-motion'

const schema = yup.object({
  code: yup.string().length(6, 'Код должен содержать 6 цифр').required('Введите код'),
})

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export default function VerifyCodePage() {
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

  const onSubmit = async (data: { code: string }) => {
    setLoading(true)
    setServerError('')
    try {
      await axios.post(
        'http://localhost:3000/auth/verify-reset-code',
        { code: data.code },
        { withCredentials: true }
      )
      router.push(`/new-password?email=${email}`)
    } catch {
      setServerError('Неверный код подтверждения')
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
        {/* Gradient header */}
        <div className="h-2 bg-gradient-to-r from-orange-500 to-pink-600"></div>
        
        <div className="p-8">
          <motion.div 
            variants={fadeIn}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center border border-orange-500/30">
                <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-pink-400 mb-2">
              Подтвердите код
            </h1>
            <p className="text-gray-400">Мы отправили 6-значный код на {email}</p>
          </motion.div>

          {/* Code input */}
          <motion.form
            onSubmit={handleSubmit(onSubmit)}
            variants={fadeIn}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <div className="relative">
              <input
                type="text"
                {...register('code')}
                placeholder="______"
                maxLength={6}
                className={`w-full px-6 py-4 bg-gray-800/50 border ${
                  errors.code || serverError
                    ? 'border-red-500/50 focus:ring-red-500/30 focus:border-red-500'
                    : 'border-gray-700 focus:ring-orange-500/30 focus:border-orange-500'
                } rounded-xl text-gray-100 placeholder-gray-600 text-center text-2xl font-mono tracking-widest focus:outline-none transition-all`}
              />
              {(errors.code || serverError) && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Error messages */}
            {errors.code && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center text-red-400 text-sm"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.code.message}
              </motion.div>
            )}
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

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl font-medium transition-all ${
                loading
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white shadow-lg hover:shadow-orange-500/30'
              } flex items-center justify-center`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Проверка...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Подтвердить
                </>
              )}
            </button>
          </motion.form>
        </div>
      </motion.div>
    </div>
  )
}