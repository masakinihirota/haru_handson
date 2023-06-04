import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

import { Database } from "@/lib/database.types"

// メインページ
const Home = async () => {
  const supabase = createServerComponentClient<Database>({
    cookies,
  })

  // セッションの取得
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return <div className="text-center text-xl">text{session ? <div>ログイン済み</div> : <div>未ログイン</div>}text</div>
}

export default Home
