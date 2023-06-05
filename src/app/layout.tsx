import './globals.css'
import { Inter } from 'next/font/google'
import SupabaseListener from "./components/supabase-listener"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Supabase Auth",
  description: "Supabase Auth",
}

// レイアウト
const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html>
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <SupabaseListener />

          <main className="container flex-1 max-w-screen-sm px-1 py-5 mx-auto">{children}</main>

          <footer className="py-5">
            <div className="text-sm text-center ">Copyright © All rights reserved | FullStackChannel</div>
          </footer>
        </div>
      </body>
    </html>
  )
}

export default RootLayout
