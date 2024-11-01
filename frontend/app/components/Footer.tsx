export const Footer = () => {
  const currentYear = new Date().getFullYear()
  let displayYear = currentYear == 2024 ? '2024' : `2024 - ${currentYear}`

  return (
    <div className="flex flex-col pb-6 items-center justify-around space-x-5">
      <span className="text-sm mt-2">
        Copyright© {displayYear} Interledger Foundation.
      </span>
    </div>
  )
}

Footer.displayName = 'Footer'
