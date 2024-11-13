import { useNavigate } from '@remix-run/react'
import { cx } from 'class-variance-authority'
import { Button } from './Button.js'
import { InfoIconWithTooltip } from './InfoIconWithTooltip.js'
import { availableTools } from '~/lib/presets.js'

export const PageHeader = ({
  elementType,
  title,
  link
}: {
  elementType: string | undefined
  title: string
  link: string
}) => {
  const navigate = useNavigate()

  const currentElement = availableTools.find(
    (element) => element.title.toLowerCase() == elementType
  )

  return (
    <div
      className={cx(
        'flex py-4 rounded-md items-center justify-between space-x-5'
      )}
    >
      <div className="flex-1">
        <h3 className="text-2xl flex">
          <span>{title}</span>
          <InfoIconWithTooltip tooltip={currentElement?.tooltip} />
        </h3>
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
