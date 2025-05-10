'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

const schema = yup.object({
  code: yup.string().length(6, 'Код должен содержать 6 цифр').required('Введите код'),
})

export default function VerifyCodePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams.get('email') || ''
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  })

  const onSubmit = async (data: { code: string }) => {
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
    }
  }

  return (
    <div className="min-h-screen bg-black px-4 py-10 text-orange-100 flex items-center justify-center">
      <div className="w-full max-w-md bg-gray-900 p-8 rounded-2xl shadow-xl border border-orange-600 space-y-6">
        <h1 className="text-2xl font-bold text-center text-orange-400">Введите код</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            type="text"
            placeholder="Код из письма"
            {...register('code')}
            className="w-full px-4 py-2 bg-gray-800 border border-orange-500 text-orange-100 placeholder-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
          />

          {errors.code && <p className="text-sm text-red-400">{errors.code.message}</p>}
          {serverError && <p className="text-sm text-red-400">{serverError}</p>}

          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-black py-2 rounded-lg font-semibold transition"
          >
            Проверить
          </button>
        </form>
      </div>
    </div>
  )
}
