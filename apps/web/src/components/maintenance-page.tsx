export function MaintenancePage({ fontClassName }: { fontClassName: string }) {
  return (
    <html lang="es" className={`${fontClassName} h-full antialiased`}>
      <body className="flex h-full min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">
        <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">
          Mantenimiento
        </p>
        <h1 className="font-heading text-3xl sm:text-4xl">
          Volvemos en un momento
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Estamos haciendo ajustes en la tienda. Intenta de nuevo en unos
          minutos.
        </p>
      </body>
    </html>
  )
}
