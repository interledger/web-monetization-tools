import { useNavigate } from '@remix-run/react'
import { cx } from 'class-variance-authority'
import { Button } from './Button.js'
import { Chevron } from './icons.js'

export const PageHeader = ({
  title,
  link,
  setImportModalOpen
}: {
  title: string
  link: string
  setImportModalOpen: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const navigate = useNavigate()
  return (
    <div
      className={cx(
        'flex py-4 rounded-md items-center justify-between space-x-5'
      )}
    >
      <div className="flex-1">
        <h3 className="text-2xl">{title}</h3>
      </div>
      <div className="ml-auto">
        <Button
          className="mr-2"
          aria-label="back"
          onClick={() => {
            navigate(`${link}`)
          }}
        >
          <Chevron direction="left" className="w-3 h-3 mr-1 -ml-1" /> Back
        </Button>
        <Button aria-label="import" onClick={() => setImportModalOpen(true)}>
          <Chevron direction="up" className="w-3 h-3 mr-1 -ml-1" /> Import
        </Button>
      </div>
    </div>
  )
}
