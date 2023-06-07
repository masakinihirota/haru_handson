// プロフィール情報を状態管理に格納します。
// Zustand Reactの状態管理ライブラリ
// https://github.com/pmndrs/zustand

import { Database } from "@/lib/database.types"
import { create } from "zustand"

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
    avaatar_url: "",
  },

  // アップデート
  // setUser: (payload) => set(() => ({ user: payload })),
  setUser: (payload) => set({ user: payload }),
}))

export default useStore
