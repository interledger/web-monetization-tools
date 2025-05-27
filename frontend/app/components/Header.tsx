import { useNavigate } from '@remix-run/react'
import wmLogo from '~/assets/images/wm_logo.svg?url'

export const Header = () => {
  const navigate = useNavigate()
  return (
    <div className="flex py-6 items-center justify-around space-x-5 bg-none bg-white border-b-4 border-b-wm-green-shade">
      <div className="flex w-full">
        <img
          className="ml-6 cursor-pointer"
          src={wmLogo}
          alt="Publisher Tools"
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
          Publisher Tools
        </h1>
      </div>
    </div>
  )
}

Header.displayName = 'Header'
