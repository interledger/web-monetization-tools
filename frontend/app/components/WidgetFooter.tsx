import { Link } from '@remix-run/react'
import { PoweredBy } from './index.js'

export const WidgetFooter = () => {
  return (
    <Link
      to="https://interledger.app"
      target="_blank"
      className="bg-white flex items-center gap-1 mt-6 text-sm cursor-pointer"
    >
      <PoweredBy className="h-10" />
    </Link>
  )
}
WidgetFooter.displayName = 'WidgetFooter'
