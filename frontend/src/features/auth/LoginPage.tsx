import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { isAxiosError } from "axios"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginSchema, type LoginFormValues } from "./login-schema"
import { useAuth } from "./AuthContext"

function BrandMark({ className }: { className?: string }) {
  return (
    <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary font-semibold text-primary-foreground ${className ?? ""}`}>
      S
    </div>
  )
}

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: Location })?.from?.pathname ?? "/dashboard"
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login(values.email, values.password)
      navigate(from, { replace: true })
    } catch (error) {
      const message =
        isAxiosError(error) && error.response?.status === 401
          ? "Invalid email or password."
          : "Something went wrong. Please try again."
      toast.error(message)
    }
  })

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex items-center gap-2.5 lg:hidden">
            <BrandMark />
            <span className="text-lg font-semibold tracking-tight">SACRM</span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Sign in to your SACRM account to continue.</p>

          <form onSubmit={onSubmit} className="mt-8 grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                {...register("email")}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>

            <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-primary lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-14">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(255,255,255,0.16),_transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_90%,_rgba(255,255,255,0.10),_transparent_45%)]" />

        <div className="relative flex items-center gap-2.5 text-primary-foreground">
          <div className="flex size-9 items-center justify-center rounded-lg bg-white/15 font-semibold backdrop-blur-sm">
            S
          </div>
          <span className="text-lg font-semibold tracking-tight">SACRM</span>
        </div>

        <div className="relative max-w-md">
          <p className="text-3xl font-medium leading-snug text-primary-foreground">
            Manage every lead, follow-up, and deal — all in one place.
          </p>
          <p className="mt-4 text-sm text-primary-foreground/70">
            SwarnApp CRM helps your sales team track leads from first contact to closed deal, with a full
            audit trail on every change.
          </p>
        </div>

        <p className="relative text-xs text-primary-foreground/50">© {new Date().getFullYear()} SwarnApp</p>
      </div>
    </div>
  )
}
