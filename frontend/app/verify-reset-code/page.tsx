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
    <div className="min-h-screen bg-gray-100 px-4 py-10 text-black">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl space-y-8">
        <h1 className="text-2xl font-bold mb-4">Введите код</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            type="text"
            placeholder="Код из письма"
            {...register('code')}
            className="w-full px-4 py-2 border rounded"
          />
          {errors.code && <p className="text-red-500 text-sm">{errors.code.message}</p>}
          {serverError && <p className="text-red-500 text-sm">{serverError}</p>}
          <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">Проверить</button>
        </form>
      </div>
    </div>
  )
}
 