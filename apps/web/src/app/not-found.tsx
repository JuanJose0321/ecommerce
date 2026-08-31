import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">
        Error 404
      </p>
      <h1 className="font-heading text-3xl sm:text-4xl">
        No encontramos esta página
      </h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        El producto o la página que buscas ya no está disponible, o la dirección
        tiene un error.
      </p>
      <div className="mt-2 flex gap-3">
        <Link
          href="/"
          className="rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          Ver catálogo
        </Link>
      </div>
    </div>
  )
}
