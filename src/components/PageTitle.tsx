import { memo } from 'react'

interface PageTitleProps {
  title: string
  description?: string
}

export const PageTitle = memo(function PageTitle({ title, description }: PageTitleProps) {
  return (
    <div className="mb-4 md:mb-8">
      <h2 className="font-display text-xl md:text-3xl font-bold mb-1 md:mb-2">
        {title}
      </h2>
      {description && (
        <p className="text-sm md:text-lg text-muted-foreground font-ui font-medium">
          {description}
        </p>
      )}
    </div>
  )
})