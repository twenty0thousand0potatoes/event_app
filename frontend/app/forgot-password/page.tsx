'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

const schema = yup.object({
  email: yup.string().email('Неверный email').required('Обязательное поле'),
})

export default function ForgotPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [serverError, setServerError] = useState('')
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  })

  useEffect(() => {
    const emailFromParams = searchParams.get('email')
    if (emailFromParams) {
      setValue('email', emailFromParams)
    }
  }, [searchParams, setValue])

  const onSubmit = async (data: { email: string }) => {
    setServerError('')
    try {
      await axios.post(
        'http://localhost:3000/auth/request-password-reset',
        data,
        { withCredentials: true }
      )
      router.push(`/verify-reset-code?email=${encodeURIComponent(data.email)}`)
    } catch {
      setServerError('Не удалось отправить код')
    }
  }

  return (
    <div className="min-h-screen bg-black px-4 py-10 text-orange-100 flex items-center justify-center">
      <div className="w-full max-w-md bg-gray-900 p-8 rounded-2xl shadow-xl border border-orange-600 space-y-6">
        <h1 className="text-2xl font-bold text-center text-orange-400">Забыли пароль?</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            {...register('email')}
            className="w-full px-4 py-2 bg-gray-800 border border-orange-500 text-orange-100 placeholder-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}
          {serverError && <p className="text-sm text-red-400">{serverError}</p>}
          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-black py-2 rounded-lg font-semibold transition"
          >
            Отправить код
          </button>
        </form>
      </div>
    </div>
  )
}
