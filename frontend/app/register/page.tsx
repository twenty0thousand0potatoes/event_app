"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

const schema = yup.object({
  email: yup
    .string()
    .email("Неверный формат email")
    .required("Email обязателен"),
  password: yup
    .string()
    .min(6, "Пароль должен содержать минимум 6 символов")
    .required("Пароль обязателен"),
});

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onBlur",
  });

  const onSubmit = async (data: { email: string; password: string }) => {
    setLoading(true);
    setServerError(null);

    try {
      const response = await axios.post(
        "http://localhost:3000/auth/signup",
        data,
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setSuccess(true);
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        setServerError(error.response.data.message);
      } else {
        setServerError("Произошла ошибка при регистрации. Попробуйте позже.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Создать аккаунт</h1>
          <p className="text-gray-500 mt-2">
            {success
              ? "Код подтверждения отправлен на ваш email!"
              : "Введите свои данные для регистрации"}
          </p>
        </div>

        {success ? (
          <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-center space-y-4">
            <p>Код подтверждения отправлен на вашу почту.</p>
            <button
              onClick={() => router.push("/verify")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              OK
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                  errors.email
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
                }`}
                placeholder="your@email.com"
                disabled={loading}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Пароль
              </label>
              <input
                id="password"
                type="password"
                {...register("password")}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                  errors.password
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
                }`}
                placeholder="Не менее 6 символов"
                disabled={loading}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {serverError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 rounded-lg font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
              }`}
            >
              {loading ? "Отправка кода..." : "Зарегистрироваться"}
            </button>
          </form>
        )}

        <div className="text-center text-sm text-gray-500">
          Уже есть аккаунт?{" "}
          <button
            onClick={() => router.push("/login")}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Войти
          </button>
        </div>
      </div>
    </div>
  );
}
