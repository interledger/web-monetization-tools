import { ImportModal } from '~/components/modals/index.js'
import { useNavigate, useOutletContext } from '@remix-run/react'
import type { ElementConfigType } from '~/lib/types.js'

type ContextType = {
  toolConfig: ElementConfigType
  setConfigs: (config: Record<string, ElementConfigType>) => void
  setToolConfig: React.Dispatch<React.SetStateAction<ElementConfigType>>
}

export default function ImportRoute() {
  const navigate = useNavigate()
  const { toolConfig, setConfigs, setToolConfig } =
    useOutletContext<ContextType>()

  return (
    <ImportModal
      title="Import config from wallet address"
      isOpen={true}
      onClose={() => navigate('..')}
      toolConfig={toolConfig}
      setConfigs={setConfigs}
      setToolConfig={setToolConfig}
    />
  )
}
