"use client"

import { useCallback, useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import { SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Image from "next/image"
import Loading from "@/app/loading"
import * as z from "zod"
import type { Database } from "@/lib/database.types"
import useStore from "@/../store"
type Schema = z.infer<typeof schema>

// 入力データの検証ルールを定義
const schema = z.object({
  name: z.string().min(2, "2文字以上で入力してください"),
  introduce: z.string().min(0).max(140, "140文字以内で入力してください"),
})

// プロフィール
const Profile = () => {
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()
  const [loading, setLoading] = useState(false)
  const [avatar, setAvatar] = useState<File | null>(null)
  const [message, setMessage] = useState("")
  const [fileMessage, setFileMessage] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("/default.png")
  const { user } = useStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    // 初期値
    defaultValues: {
      name: user.name ? user.name : "",
      introduce: user.introduce ? user.introduce : "",
    },
    // 入力値の検証
    resolver: zodResolver(schema),
  })

  // アバター画像の取得
  useEffect(() => {
    if (user && user.avatar_url) {
      setAvatarUrl(user.avatar_url)
    }
  }, [user])

  // 画像アップロード
  const onUploadImage = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files
    setFileMessage("")

    // ファイルが選択されていない場合
    if (!files || files?.length === 0) {
      setFileMessage("画像をアップロードしてください")
      return
    }

    const fileSize = file[0]?.size / 1024 / 1024 // size in MB
    const fileType = file[0]?.type // MIME type of the file

    // 画像ファイルサイズが2MBを超えている場合

    if (fileSize > 2) {
      setFileMessage("ファイルサイズが2MBを超えています")
      return
    }

    // 画像ファイル形式がjpegまたはpngではない場合
    if (fileType !== "image/jpeg" && fileType !== "image/png") {
      setFileMessage("ファイル形式がjpegまたはpngではありません")
      return
    }

    // 画像をセット
    setAvatar(files[0])
  }, [])

  // 送信
  const onSubmit: SubmitHandler<z.Schema> = async (data) => {
    setLoading(true)
    setMessage("")

    try {
      let avatar_url = user.avatar_url

      if (avatar) {
        // 画像をアップロード
        const { data: storageData, error: storageError } = await supabase.storage
          .from("profile")
          .upload(`${user.id}/${uuidv4()}`, avatar)

        // エラーチェック
        if (storageError) {
          setMessage("画像のアップロードに失敗しました" + storageError.message)
          return
        }
        if (avatar_url) {
          const fileName = avatar_url.split("/").slice(-1)[0]
          // 古い画像を削除
          await supabase.storage.from("profile").remove([`${user.id}/${fileName}`])
        }

        //  画像のURLを取得
        const { data: urlData } = await supabase.storage.from("profile").getPublicUrl(storageData.path)

        avatar_url = urlData.publicUrl
      }

      // プロフィールを更新
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          name: data.name,
          introduce: data.introduce,
          avatar_url,
        })
        .eq("id", user.id)

      // エラーチェック
      if (updateError) {
        setMessage("プロフィールの更新に失敗しました" + updateError.message)
        return
      }

      setMessage("プロフィールを更新しました")
    } catch (error) {
      setMessage("プロフィールの更新に失敗しました" + error)
      return
    } finally {
      setLoading(false)
      router.refresh()
    }
  }

  return (
    <div>
      <div className="mb-10 text-xl font-bold text-center">プロフィール</div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* アバター動画 */}
        <div className="mb-5">
          <div className="flex flex-col items-center justify-center mb-5 text-sm">
            <div className="relative w-24 h-24 mb-5">
              <Image src={avatarUrl} className="object-cover rounded-full" alt="avatar" fill />
            </div>
            <input type="file" id="avatar" onChange={onUploadImage} />
            {fileMessage && <div className="my-5 text-center text-red-500 ">{fileMessage}</div>}
          </div>
        </div>

        {/* 名前 */}
        <div className="mb-5">
          <div className="mb-1 text-sm font-bold">名前</div>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-mb focus:outline-none focus:border-sky-500"
            placeholder="名前"
            id="name"
            {...register("name", { required: true })}
            required
          />
          <div className="my-3 text-sm text-center text-red-500">{errors.name?.message}</div>
        </div>

        {/* 自己紹介 */}
        <div className="mb-5">
          <div className="mb-1 text-sm font-bold">自己紹介</div>
          <textarea
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-sky-500"
            placeholder="自己紹介"
            id="introduce"
            {...register("introduce")}
            rows={5}
          />
        </div>

        {/* 変更ボタン */}
        <div className="mb-5">
          {loading ? (
            <Loading />
          ) : (
            <button
              type="submit"
              className="w-full p-2 text-sm font-bold text-white rounded-full bg-sky-500 hover:brightness-95"
            >
              変更
            </button>
          )}
        </div>
      </form>

      {/* メッセージ */}
      {message && <div className="my-5 mb-5 text-red-500 test-center">{message}</div>}
    </div>
  )
}

export default Profile
