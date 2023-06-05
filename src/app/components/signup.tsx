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
  name: z.string().min(6, { message: "名前を入力してください 6文字以上" }),
  email: z.string().email({ message: "メールアドレスの形式で入力してください" }),
  password: z.string().min(8, { message: "パスワードは8文字以上で入力してください" }),
})

// サインアップページ
const Signup = () => {
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    // 初期値
    defaultValues: {
      name: "",
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
      // サインアップ
      const { error: errorSignup } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      })

      // エラーチェック
      if (errorSignup) {
        setMessage("エラーが発生しました" + errorSignup.message)
        return
      }

      // プロフィールの名前を更新
      const { error: updateError } = await supabase.from("profiles").update({ name: data.name }).eq("email", data.email)

      // エラーチェック
      if (updateError) {
        setMessage("エラーが発生しました" + updateError.message)
        return
      }

      // 入力フォームをリセット
      reset()
      setMessage("確認メールを送信しました。メールに記載されているリンクをクリックしてください。")
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
      <div className="mb-10 text-xl font-bold text-center">サインアップ</div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* 名前 */}
        <div className="mb-3">
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-sky-500"
            placeholder="名前"
            id="name"
            {...register("name", { required: true })}
          />
          <div className="my-3 text-sm text-center text-red-500">{errors.name?.message}</div>
        </div>

        {/* メールアドレス */}
        <div className="mb-3">
          <input
            type="email"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-sky-500"
            placeholder="メールアドレス"
            id="email"
            {...register("email", { required: true })}
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
            {...register("password", { required: true })}
          />
          <div className="my-3 text-sm text-center text-red-500">{errors.password?.message}</div>
        </div>

        {/* サインアップボタン */}
        <div className="mb-5">
          {loading ? (
            <Loading />
          ) : (
            <button
              type="submit"
              className="w-full p-2 text-sm font-bold text-white rounded-full bg-sky-500 hover:brightness-95"
            >
              サインアップ
            </button>
          )}
        </div>
      </form>

      {message && <div className="mb-5 text-sm text-center text-red-500">{message}</div>}

      <div className="text-sm text-center">
        <Link href="/auth/signin" className="font-bold text-gray-500">
          ログインはこちら
        </Link>
      </div>
    </div>
  )
}

export default Signup
