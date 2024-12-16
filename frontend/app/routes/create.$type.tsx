import { ActionFunctionArgs, LoaderFunctionArgs, json } from '@remix-run/node'
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation
} from '@remix-run/react'
import { useEffect, useState } from 'react'
import { ImportModal, ScriptModal } from '~/components/modals/index.js'
import {
  ErrorPanel,
  NotFoundConfig,
  PageHeader,
  ToolConfig,
  ToolPreview
} from '~/components/index.js'
import { ApiClient, ApiResponse } from '~/lib/apiClient.js'
import { type Message, messageStorage } from '~/lib/message.server.js'
import { validConfigTypes } from '~/lib/presets.js'
import { tooltips } from '~/lib/tooltips.js'
import { ElementConfigType, ElementErrors } from '~/lib/types.js'
import { encodeAndCompressParameters, getIlpayCss } from '~/lib/utils.js'
import {
  createBannerSchema,
  createButtonSchema,
  createWidgetSchema,
  walletSchema
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

    if (
      response &&
      response.apiResponse &&
      response.apiResponse.payload &&
      response.apiResponse.payload.grantRequired
    ) {
      /// code comes here
    } else if (response && !errors.length && response.displayScript) {
      setModalOpen(true)
    } else if (
      response &&
      response.apiResponse &&
      response.apiResponse.isFailure == false
    ) {
      const config = response.apiResponse.payload
      setToolConfig(config)
      setImportModalOpen(false)
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
        tooltip={tooltips.scriptModal}
        defaultType={elementType}
        scriptForDisplay={scriptToDisplay}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
      <ImportModal
        title="Import config from wallet address"
        isOpen={importModalOpen}
        isSubmitting={isSubmitting}
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
  const intent = formData?.intent

  let apiResponse: ApiResponse = { isFailure: true }
  let displayScript: boolean = false
  const errors: ElementErrors = {
    fieldErrors: {},
    message: []
  }

  if (intent == 'import') {
    const result = walletSchema.safeParse(formData)

    if (!result.success) {
      errors.fieldErrors = result.error.flatten().fieldErrors
      return json({ errors, apiResponse, displayScript }, { status: 400 })
    }

    const payload = result.data
    apiResponse = await ApiClient.getUserConfig(payload.walletAddress)

    return json({ errors, apiResponse, displayScript }, { status: 200 })
  } else {
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

    if (!result.success) {
      errors.fieldErrors = result.error.flatten().fieldErrors
      return json({ errors, apiResponse, displayScript }, { status: 400 })
    }

    const payload = result.data

    if (payload.elementType == 'widget') {
      const css = await encodeAndCompressParameters(
        getIlpayCss(payload as unknown as ElementConfigType)
      )

      Object.assign(payload, { css })
    }

    apiResponse = await ApiClient.saveUserConfig(payload)
    displayScript = true

    return json({ errors, apiResponse, displayScript }, { status: 200 })
  }
}
