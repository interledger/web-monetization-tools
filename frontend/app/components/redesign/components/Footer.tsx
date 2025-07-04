export const Footer = () => {
  return (
    <footer className="w-full pb-xl">
      <div className="container mx-auto px-md py-px text-center">
        <span className="text-text-helper text-sm font-normal font-sans leading-sm">
          Copyright© {new Date().getFullYear()} Interledger Foundation.
        </span>
      </div>
    </footer>
  )
}
