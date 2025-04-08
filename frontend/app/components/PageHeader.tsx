import { useNavigate } from '@remix-run/react'
import { cx } from 'class-variance-authority'
import { availableTools } from '~/lib/presets.js'
import { Button, InfoWithTooltip, Select, SelectOption } from './index.js'
import { Chevron } from './icons.js'

export const PageHeader = ({
  elementType,
  title,
  link,
  setConfirmModalOpen,
  versionOptions,
  selectedVersion,
  setSelectedVersion
}: {
  elementType: string | undefined
  title: string
  link: string
  setConfirmModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  versionOptions: SelectOption[]
  selectedVersion: string
  setSelectedVersion: (value: string) => void
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
          <InfoWithTooltip tooltip={currentElement?.tooltip} />
        </h3>
      </div>
      <div className="flex mr-2">
        <Select
          placeholder="Default"
          options={versionOptions}
          value={versionOptions.find((opt) => opt.value == selectedVersion)}
          onChange={(value) => setSelectedVersion(value)}
        />
        <Button
          intent="icon"
          className="mr-2 pt-0"
          aria-label="add version"
          title="add version"
          onClick={() => {
            navigate('version', { preventScrollReset: true })
          }}
        >
          +
        </Button>
        <Button
          intent="icon"
          className="mr-2 pt-0 text-red-500 "
          aria-label="remove version"
          title="remove version"
          disabled={selectedVersion == 'default'}
          onClick={() => {
            setConfirmModalOpen(true)
          }}
        >
          x
        </Button>
      </div>
      <div className="ml-auto">
        <Button
          className="mr-2"
          aria-label="back"
          onClick={() => {
            navigate(link)
          }}
        >
          <Chevron direction="left" className="w-3 h-3 mr-1 -ml-1" /> Back
        </Button>
        <Button
          aria-label="import"
          onClick={() => navigate('import', { preventScrollReset: true })}
        >
          <Chevron direction="up" className="w-3 h-3 mr-1 -ml-1" /> Import
        </Button>
      </div>
    </div>
  )
}
