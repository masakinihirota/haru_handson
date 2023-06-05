"use client"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import Loading from "@/app/loading"
import * as z from "zod"
import type { Database } from "@/lib/database.types"
type Schema = z.infer<typeof schema>

// 入力データの検証ルールを定義
const schema = z.object({
  email: z.string().email({ message: "メールアドレスの形式で入力してください" }),
  password: z.string().min(8, { message: "パスワードは8文字以上で入力してください" }),
})

// ログインページ
const Login = () => {
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    // 初期値
    defaultValues: {
      email: "",
      password: "",
    },
    // 入力値の検証
    resolver: zodResolver(schema),
  })

  // 送信
  const onSubmit: SubmitHandler<Schema> = async (data) => {
    setLoading(true)

    try {
      // ログインページ
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      // エラーチェック
      if (error) {
        setMessage("エラーが発生しました" + error.message)
        return
      }

      // トップページに遷移
      router.push("/")
    } catch (error) {
      setMessage("エラーが発生しました" + error)
      return
    } finally {
      setLoading(false)
      router.refresh()
    }
  }

  return (
    <div className="max-w-[400px] mx-auto">
      <div className="mb-10 text-xl font-bold text-center">ログイン</div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* メールアドレス */}
        <div className="mb-3">
          <input
            type="email"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-sky-500"
            placeholder="メールアドレス"
            id="email"
            {...(register("email"), { required: true })}
          />
          <div className="my-3 text-sm text-center text-red-500">{errors.email?.message}</div>
        </div>

        {/* パスワード */}
        <div className="mb-5">
          <input
            type="password"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-sky-500"
            placeholder="パスワード"
            id="password"
            {...(register("password"), { required: true })}
          />
          <div className="my-3 text-sm text-center text-red-500">{errors.password?.message}</div>
        </div>

        {/* ログインボタン */}
        <div className="mb-5">
          {loading ? (
            <Loading />
          ) : (
            <button
              type="submit"
              className="w-full p-2 text-sm font-bold text-white rounded-full bg-sky-500 hover:brightness-95"
            >
              ログイン
            </button>
          )}
        </div>
      </form>

      {message && <div className="my-5 text-sm text-center text-red-500">{message}</div>}
      <div className="mb-5 text-sm text-center">
        <Link href="/auth/reset-password" className="font-bold text-gray-500">
          パスワードを忘れた場合
        </Link>
      </div>
      <div className="text-sm text-center">
        <Link href="/auth/signup" className="font-bold text-gray-500">
          アカウントを作成する
        </Link>
      </div>
    </div>
  )
}

export default Login
