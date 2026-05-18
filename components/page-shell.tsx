import { ReactNode } from "react"

interface PageShellProps {
  icon?: ReactNode
  title: string
  description?: string
  maxWidth?: string
  headerClassName?: string
  titleClassName?: string
  descriptionClassName?: string
  children: ReactNode
}

export function PageShell({
  icon,
  title,
  description,
  maxWidth = "max-w-6xl",
  headerClassName = "rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm md:p-6",
  titleClassName = "text-2xl font-semibold tracking-tight text-slate-800 md:text-3xl",
  descriptionClassName = "text-sm text-slate-500",
  children,
}: PageShellProps) {
  return (
    <section className="min-h-[calc(100vh-7rem)] bg-[radial-gradient(circle_at_top_right,#dcfce7_0%,#f8fafc_45%,#eef2ff_100%)] p-3 md:p-6">
      <div className={`mx-auto w-full ${maxWidth} space-y-5`}>
        <header className={headerClassName}>
          <div className="flex items-start gap-3">
            {icon && (
              <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700">{icon}</div>
            )}
            <div>
              <h1 className={titleClassName}>{title}</h1>
              {description && <p className={descriptionClassName}>{description}</p>}
            </div>
          </div>
        </header>
        {children}
      </div>
    </section>
  )
}
