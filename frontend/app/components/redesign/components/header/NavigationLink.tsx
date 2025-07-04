type NavLinkProps = {
  to: string
  children: React.ReactNode
  onClick?: () => void
}

export const NavLink = ({ to, children, onClick }: NavLinkProps) => {
  return (
    <li className="group flex md:justify-center md:items-center">
      <a
        href={to}
        className="w-full px-md py-sm font-sans font-normal text-sm leading-sm rounded-lg bg-transparent text-buttons-default hover:bg-secondary-hover-surface hover:text-buttons-hover focus:outline-none focus-visible:outline-2 focus-visible:outline-buttons-hover focus-visible:outline-offset-2 focus-visible:bg-secondary-hover-surface focus-visible:text-buttons-hover transition-colors"
        onClick={onClick}
      >
        {children}
      </a>
    </li>
  )
}
