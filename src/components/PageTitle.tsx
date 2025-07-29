import { memo } from 'react'

interface PageTitleProps {
  title: string
  description?: string
}

export const PageTitle = memo(function PageTitle({ title, description }: PageTitleProps) {
  return (
    <div className="mb-6 md:hidden">
      <h2 className="font-display text-xl font-bold text-foreground mb-1">
        {title}
      </h2>
      {description && (
        <p className="text-sm text-muted-foreground font-ui">
          {description}
        </p>
      )}
    </div>
  )
})