import { memo } from 'react'

interface PageTitleProps {
  title: string
  description?: string
}

export const PageTitle = memo(function PageTitle({ title, description }: PageTitleProps) {
  return (
    <div className="mb-8">
      <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
        {title}
      </h2>
      {description && (
        <p className="text-base md:text-lg text-muted-foreground font-ui font-medium">
          {description}
        </p>
      )}
    </div>
  )
})