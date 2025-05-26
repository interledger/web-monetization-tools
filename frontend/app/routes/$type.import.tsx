import { ImportModal } from '~/components/modals/index.js'
import { useLoaderData, useNavigate, useOutletContext } from '@remix-run/react'
import type { ElementConfigType } from '~/lib/types.js'
import { type LoaderFunctionArgs, json } from '@remix-run/cloudflare'

type ContextType = {
  toolConfig: ElementConfigType
  setConfigs: (config: Record<string, ElementConfigType>) => void
  setToolConfig: React.Dispatch<React.SetStateAction<ElementConfigType>>
}

export async function loader({ context }: LoaderFunctionArgs) {
  const { env } = context.cloudflare

  return json({
    basepath: env.APP_BASEPATH
  })
}

export default function ImportRoute() {
  const navigate = useNavigate()
  const { basepath } = useLoaderData<typeof loader>()
  const { toolConfig, setConfigs, setToolConfig } =
    useOutletContext<ContextType>()

  return (
    <ImportModal
      title="Import config from wallet address"
      basepath={basepath}
      isOpen={true}
      onClose={() => navigate('..')}
      toolConfig={toolConfig}
      setConfigs={setConfigs}
      setToolConfig={setToolConfig}
    />
  )
}
