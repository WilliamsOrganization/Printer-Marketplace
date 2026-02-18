"use client"
import { GalleryVerticalEnd } from "lucide-react"
import { LoginForm } from "@/components/ui/custom/login-form"
import { useSession, signIn, signOut } from "next-auth/react"
import Dashboard from "@/components/ui/custom/dashboard"


export default function LoginPage() {
	const { data: session, status } = useSession()

	if (status === "authenticated") {
		return (
		<Dashboard />
		)
	}
  return (
    <div className="bg-muted flex min-h-[70vh] flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Acme Inc.
        </a>
        <LoginForm />
      </div>
    </div>
  )
}
