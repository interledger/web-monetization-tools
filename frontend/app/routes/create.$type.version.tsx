import { NewVersionModal } from '~/components/modals'
import { useNavigate, useOutletContext } from '@remix-run/react'
import { ElementConfigType } from '~/lib/types'
import { ModalType } from '~/lib/presets'

type ContextType = {
  toolConfig: ElementConfigType
  setConfigs: (
    config: Record<string, ElementConfigType>,
    versionName: string
  ) => void
  setToolConfig: React.Dispatch<React.SetStateAction<ElementConfigType>>
  setModalOpen: React.Dispatch<React.SetStateAction<ModalType | undefined>>
}

export default function NewVersionRoute() {
  const navigate = useNavigate()
  const { toolConfig, setConfigs, setToolConfig, setModalOpen } =
    useOutletContext<ContextType>()

  return (
    <NewVersionModal
      title="Create a new version of your config"
      isOpen={true}
      onClose={() => navigate('..')}
      toolConfig={toolConfig}
      setToolConfig={setToolConfig}
      setConfigs={setConfigs}
      setModalOpen={setModalOpen}
    />
  )
}
