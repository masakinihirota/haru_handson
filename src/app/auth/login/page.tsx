import { Database } from "@/lib/database.types"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { redirect } from "next/navigation"
import Login from "@/app/components/login"
import { cookies } from "next/headers"

// ログインページ
const LoginPage = async () => {
  const supabase = createServerComponentClient<Database>({ cookies })

  // セッションの取得
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 認証している場合、リダイレクトをする。
  if (session) {
    redirect("/")
  }

  return <Login />
}

export default LoginPage
