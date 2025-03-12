export const Footer = () => {
  const currentYear = new Date().getFullYear()
  const displayYear = currentYear == 2024 ? '2024' : `2024 - ${currentYear}`

  return (
    <div className="flex flex-col pb-6 items-center justify-around space-x-5">
      <div className="flex w-full h-1">
        <div className="flex w-1/4 bg-wm-pink"></div>
        <div className="flex w-1/4 bg-wm-orange"></div>
        <div className="flex w-1/4 bg-wm-teal"></div>
        <div className="flex w-1/4 bg-wm-purple"></div>
      </div>
      <span className="text-sm mt-2">
        Copyright© {displayYear} Interledger Foundation.
      </span>
    </div>
  )
}

Footer.displayName = 'Footer'
