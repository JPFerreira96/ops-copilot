import { redirect } from "next/navigation"

import { auth } from "@/auth"
import Header from "@/components/layout/header"

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container mx-auto flex-1 p-6">{children}</main>
    </div>
  )
}
