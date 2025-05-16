'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export default function VerifyPage() {
  const [code, setCode] = useState('')
  const [clientError, setClientError] = useState<string | null>(null)
  const [backendError, setBackendError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [timer, setTimer] = useState(60)
  const [resendSuccess, setResendSuccess] = useState(false)

  const router = useRouter()

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleVerify = async () => {
    setLoading(true)
    setClientError(null)
    setBackendError(null)

    if (!code.trim()) {
      setClientError('Введите код подтверждения')
      setLoading(false)
      return
    }

    try {
      await axios.post(
        'http://localhost:3000/auth/verify',
        { code },
        { withCredentials: true }
      )
      router.push('/dashboard')
    } catch (err: any) {
      setBackendError(
        err.response?.data?.message || 'Ошибка при подтверждении. Попробуйте снова.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    try {
      await axios.post(
        'http://localhost:3000/auth/resend-code',
        {},
        { withCredentials: true }
      )
      setTimer(60)
      setResendSuccess(true)
      setTimeout(() => setResendSuccess(false), 3000)
    } catch (err) {
      console.log(err)
      setBackendError('Не удалось повторно отправить код. Попробуйте позже.')
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
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

        <div className="h-2 bg-gradient-to-r from-orange-500 to-pink-600"></div>
        
        <div className="p-8">
          <motion.div 
            variants={fadeIn}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500 mb-2">
              Подтверждение email
            </h1>
            <p className="text-gray-400">Введите код подтверждения, отправленный на вашу почту</p>
          </motion.div>

          <motion.div
            variants={fadeIn}
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <div className="relative">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Введите 6-значный код"
                className={`w-full px-4 py-3 bg-gray-800/50 border ${
                  clientError || backendError
                    ? 'border-red-500/50 focus:ring-red-500/30 focus:border-red-500' 
                    : 'border-gray-700 focus:ring-orange-500/30 focus:border-orange-500'
                } rounded-lg text-gray-100 placeholder-gray-500 transition-all duration-200 text-center tracking-widest font-mono text-xl`}
                maxLength={6}
              />
              {(clientError || backendError) && (
                <div className="absolute right-3 top-3.5 text-red-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            
            {clientError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 flex items-center text-red-400 text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {clientError}
              </motion.div>
            )}
            {backendError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 p-3 bg-red-900/50 border border-red-700/50 rounded-lg flex items-start"
              >
                <div className="flex-shrink-0 text-red-400 mt-0.5 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-sm text-red-200">{backendError}</div>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            variants={fadeIn}
            transition={{ delay: 0.6 }}
          >
            <button
              onClick={handleVerify}
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
                  Проверка...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Подтвердить
                </>
              )}
            </button>
          </motion.div>
          <motion.div
            variants={fadeIn}
            transition={{ delay: 0.8 }}
            className="mt-6 text-center"
          >
            {resendSuccess ? (
              <div className="p-2 bg-green-900/30 text-green-400 rounded-lg text-sm border border-green-700/50">
                Код успешно отправлен!
              </div>
            ) : timer > 0 ? (
              <p className="text-sm text-gray-400">
                Повторная отправка возможна через{' '}
                <span className="font-mono text-orange-400">{formatTime(timer)}</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                className="text-sm text-orange-400 hover:text-orange-300 underline font-medium transition-colors"
              >
                Отправить код повторно
              </button>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}