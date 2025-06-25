export const Footer = () => {
  return (
    <footer className="w-full pb-8">
      <div className="container mx-auto px-4 py-px text-center">
        <span className="text-silver-800 text-sm font-normal font-sans leading-5">
          Copyright© {new Date().getFullYear()} Interledger Foundation.
        </span>
      </div>
    </footer>
  )
}
