'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

const schema = yup.object({
  password: yup.string().min(6, 'Минимум 6 символов').required('Введите новый пароль'),
})

export default function NewPasswordPage() {
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

  const onSubmit = async (data: { password: string }) => {
    setServerError('')
    try {
      await axios.post(
        'http://localhost:3000/auth/reset-password',
        { password: data.password },
        { withCredentials: true }
      )
      router.push('/login')
    } catch {
      setServerError('Не удалось изменить пароль')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10 text-black">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl space-y-8">
        <h1 className="text-2xl font-bold mb-4">Новый пароль</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            type="password"
            placeholder="Новый пароль"
            {...register('password')}
            className="w-full px-4 py-2 border rounded"
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          {serverError && <p className="text-red-500 text-sm">{serverError}</p>}
          <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition">Сохранить</button>
        </form>
      </div>
    </div>
  )
}
