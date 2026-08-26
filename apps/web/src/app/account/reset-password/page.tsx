import { ResetPasswordForm } from "@/components/reset-password-form"

export default async function ResetPasswordPage({
  searchParams,
}: PageProps<"/account/reset-password">) {
  const { token } = await searchParams

  return (
    <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
      <h1 className="font-heading mb-10 text-center text-3xl">
        Restablece tu contrasena
      </h1>
      <ResetPasswordForm token={typeof token === "string" ? token : null} />
    </div>
  )
}
