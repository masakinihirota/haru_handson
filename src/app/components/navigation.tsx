"use client"

import Link from "next/link"
import useStore from "@/../store"
import Image from "next/image"
import { useEffect } from "react"
import type { Session } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"
type ProfileType = Database["public"]["Tables"]["profiles"]["Row"]

// ナビゲーション
type Props = {
  session: Session | null
  profile: ProfileType | null
}

const Navigation = ({ session, profile }: Props) => {
  const { setUser } = useStore()

  // 状態管理にユーザー情報を保存
  useEffect(() => {
    setUser({
      id: session ? session.user.id : "",
      email: session ? session.user.email! : "",
      name: session && profile ? profile.name : "",
      introduce: session && profile ? profile.introduce : "",
      avatar_url: session && profile ? profile.avatar_url : "",
    })
  }, [session, setUser, profile])

  return (
    <header className="shadow-lg shadow-gray-100">
      <div className="container flex items-center justify-between max-w-screen-sm py-5 mx-auto">
        <Link href="/" className="text-xl font-bold cursor-pointer">
          VNS
        </Link>
        <div className="text-sm font-bold">
          {session ? (
            <div className="flex items-center space-x-5">
              <Link href="/settings/profile">
                <div className="relative w-10 h-10">
                  <Image
                    src={profile && profile.avatar_url ? profile.avatar_url : "/default.png"}
                    className="object-cover rounded-full"
                    alt="avatar"
                    fill
                  />
                </div>
              </Link>
            </div>
          ) : (
            <div className="flex items-center space-x-5">
              <Link href="/auth/login">ログイン</Link>
              <Link href="/auth/signup">サインアップ</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navigation
