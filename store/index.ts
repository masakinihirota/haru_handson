// プロフィール情報を状態管理に格納します。
// Zustand Reactの状態管理ライブラリ
// https://github.com/pmndrs/zustand

import { create } from "zustand"
import type { Database } from "@/lib/database.types"
type ProfileType = Database["public"]["Tables"]["profiles"]["Row"]

type StateType = {
  user: ProfileType
  setUser: (payload: ProfileType) => void
}

const useStore = create<StateType>((set) => ({
  // 初期値
  user: {
    id: "",
    email: "",
    name: "",
    introduce: "",
    avatar_url: "",
  },

  // アップデート
  // 非同期的
  // setUser: (payload) => set(() => ({ user: payload })),
  // 同期的
  setUser: (payload) => set({ user: payload }),
}))

export default useStore
