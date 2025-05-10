'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

export default function VerifyPage() {
  const [code, setCode] = useState('')
  const [clientError, setClientError] = useState<string | null>(null)
  const [backendError, setBackendError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [timer, setTimer] = useState(60)

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
      setTimer(300)
      alert('Код повторно отправлен на почту.')
    } catch (err) {
      console.log(err)
      alert('Не удалось повторно отправить код. Попробуйте позже.')
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black px-4 py-10 sm:py-20">
      <div className="bg-gray-900 p-8 rounded-2xl shadow-xl w-full max-w-sm border border-orange-600 space-y-6">
        <h2 className="text-2xl font-bold text-center text-orange-400">Подтверждение почты</h2>

        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Введите код из письма"
          className="w-full px-4 py-2 bg-gray-800 border border-orange-500 text-orange-100 placeholder-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
        />

        {clientError && <p className="text-sm text-red-400">{clientError}</p>}
        {backendError && <p className="text-sm text-red-400">{backendError}</p>}

        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-black py-2 rounded-lg font-semibold transition disabled:bg-gray-600"
        >
          {loading ? 'Проверка...' : 'Подтвердить'}
        </button>

        <div className="text-center text-sm text-orange-300">
          {timer > 0 ? (
            <p>
              Повторить можно через:{' '}
              <span className="font-medium">{formatTime(timer)}</span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              className="text-orange-400 hover:text-orange-300 underline font-medium"
            >
              Отправить код снова
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
