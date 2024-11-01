import { Link } from '@remix-run/react'
import { PoweredBy } from './poweredBy'

export const WidgetFooter = () => {
  return (
    <Link
      to="/"
      target="_blank"
      className="bg-white -mx-5 -mb-3 flex items-center gap-1 mt-6 text-sm cursor-pointer"
    >
      <PoweredBy className="h-10" />
    </Link>
  )
}
WidgetFooter.displayName = 'WidgetFooter'
