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
    <div className="min-h-screen bg-gray-100 px-4 py-10 text-black">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl space-y-8">
        <h1 className="text-2xl font-bold mb-4">Забыли пароль?</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            {...register('email')}
            className="w-full px-4 py-2 border rounded"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          {serverError && <p className="text-red-500 text-sm">{serverError}</p>}
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">Отправить код</button>
        </form>
      </div>
    </div>
  )
}
