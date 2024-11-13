import { ActionFunctionArgs, LoaderFunctionArgs, json } from '@remix-run/node'
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation
} from '@remix-run/react'
import { useEffect, useState } from 'react'
import { ImportModal } from '~/components/ImportModal'
import {
  ErrorPanel,
  NotFoundConfig,
  PageHeader,
  ScriptModal,
  ToolConfig,
  ToolPreview
} from '~/components/index.js'
import { ApiClient, ApiResponse } from '~/lib/apiClient.js'
import { type Message, messageStorage } from '~/lib/message.server.js'
import { validConfigTypes } from '~/lib/presets.js'
import { ElementConfigType, ElementErrors } from '~/lib/types.js'
import { encodeAndCompressParameters, getIlpayCss } from '~/lib/utils.js'
import {
  createBannerSchema,
  createButtonSchema,
  createWidgetSchema
} from '~/lib/validate.server'

export async function loader({ params, request }: LoaderFunctionArgs) {
  const elementType = params.type

  const cookies = request.headers.get('cookie')

  const session = await messageStorage.getSession(cookies)
  const message = session.get('script') as Message

  // get default config
  const apiResponse: ApiResponse = await ApiClient.getDefaultConfig()
  const defaultConfig: ElementConfigType = apiResponse?.payload

  const ilpayUrl = process.env.ILPAY_URL || ''
  const toolsUrl = process.env.FRONTEND_URL || ''

  return { elementType, defaultConfig, message, ilpayUrl, toolsUrl }
}

export default function Create() {
  const { elementType, defaultConfig, ilpayUrl, toolsUrl } =
    useLoaderData<typeof loader>()
  const response = useActionData<typeof action>()
  const { state } = useNavigation()
  const isSubmitting = state === 'submitting'

  const [toolConfig, setToolConfig] = useState<ElementConfigType>(defaultConfig)
  const [modalOpen, setModalOpen] = useState(false)
  const [importModalOpen, setImportModalOpen] = useState(false)

  const wa = (toolConfig?.walletAddress || '')
    .replace('$', '')
    .replace('https://', '')
  const scriptToDisplay = `<script id="wmt-init-script" type="module" src="${toolsUrl}init.js?wa=${wa}&types=[elements]"></script>`

  useEffect(() => {
    const errors = Object.keys(response?.errors?.fieldErrors || {})
    if (response && !errors.length) {
      setModalOpen(true)
    }
  }, [response])

  return (
    <div className="flex flex-col gap-6 min-w-128 max-w-prose mx-auto my-8">
      <PageHeader
        title={`Create ${elementType}`}
        elementType={elementType}
        setImportModalOpen={setImportModalOpen}
        link="/"
      />
      {validConfigTypes.includes(String(elementType)) ? (
        <div className="flex flex-col">
          <Form method="post" replace>
            <fieldset disabled={isSubmitting}>
              <ToolPreview
                type={elementType}
                toolConfig={toolConfig}
                ilpayUrl={ilpayUrl}
              />
              <ToolConfig
                type={elementType}
                toolConfig={toolConfig}
                defaultConfig={defaultConfig}
                setToolConfig={setToolConfig}
                isSubmiting={isSubmitting}
                errors={response?.errors}
              />
            </fieldset>
            <div className="px-6 pt-5">
              <ErrorPanel errors={response?.errors.message} />
            </div>
          </Form>
        </div>
      ) : (
        <NotFoundConfig />
      )}
      <ScriptModal
        title="Your script"
        tooltip="Copy your script, place it before the closing body tag in your website, or place it into a script type element in instances when you have a site management software (ex: wordpress, etc). 
        <br />Check all options at the include section, that you want to display on your website."
        defaultType={elementType}
        scriptForDisplay={scriptToDisplay}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
      <ImportModal
        title="Import config from wallet address"
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        toolConfig={toolConfig}
        setToolConfig={setToolConfig}
        errors={response?.errors}
      />
    </div>
  )
}

export async function action({ request, params }: ActionFunctionArgs) {
  const elementType = params.type
  const formData = Object.fromEntries(await request.formData())

  let currentSchema

  switch (elementType) {
    case 'button':
      currentSchema = createButtonSchema
      break
    case 'widget':
      currentSchema = createWidgetSchema
      break
    case 'banner':
    default:
      currentSchema = createBannerSchema
  }
  const result = currentSchema.safeParse(
    Object.assign(formData, { ...{ elementType } })
  )

  const errors: ElementErrors = {
    fieldErrors: {},
    message: []
  }

  if (!result.success) {
    errors.fieldErrors = result.error.flatten().fieldErrors
    return json({ errors }, { status: 400 })
  }

  const payload = result.data

  if (payload.elementType == 'widget') {
    const css = await encodeAndCompressParameters(
      getIlpayCss(payload as unknown as ElementConfigType)
    )

    Object.assign(payload, { css })
  }

  const apiResponse: ApiResponse = await ApiClient.saveUserConfig(payload)

  return json({ errors, apiResponse }, { status: 200 })
}
