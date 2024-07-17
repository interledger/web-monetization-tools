import { useNavigate } from "@remix-run/react"
import { cx } from "class-variance-authority"
import { Button } from "./Button"

export const PageHeader = ({
  title,
  link
}: {
  title: string
  link: string
}) => {
  const navigate = useNavigate()
  return (
    <div
      className={cx(
        "flex py-4 rounded-md items-center justify-between space-x-5"
      )}
    >
      <div className="flex-1">
        <h3 className="text-2xl">{title}</h3>
      </div>
      <div className="ml-auto">
        <Button
          aria-label="back"
          onClick={() => {
            navigate(`${link}`)
          }}
        >
          Back
        </Button>
      </div>
    </div>
  )
}
