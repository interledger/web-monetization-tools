import { useNavigate } from "@remix-run/react"

export const Header = () => {
  const navigate = useNavigate()
  return (
    <div className="flex py-6 items-center justify-around space-x-5">
      <div className="flex w-full">
        <img
          className="ml-6 cursor-pointer"
          src="/images/wm_logo.svg"
          alt="Web Monetization Tools"
          onClick={() => {
            navigate(`/`)
          }}
        />
        <h1
          className="ml-6 text-lg cursor-pointer"
          onClick={() => {
            navigate(`/`)
          }}
        >
          Web Monetization Tools
        </h1>
      </div>
    </div>
  )
}

Header.displayName = "Header"
