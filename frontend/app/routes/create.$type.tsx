import { ActionFunctionArgs, LoaderFunctionArgs, json } from '@remix-run/node'
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation
} from '@remix-run/react'
import { useEffect, useState } from 'react'
import {
  ConfirmModal,
  ImportModal,
  InfoModal,
  NewVersionModal,
  ScriptModal
} from '~/components/modals/index.js'
import {
  ErrorPanel,
  NotFoundConfig,
  PageHeader,
  SelectOption,
  ToolConfig,
  ToolPreview
} from '~/components/index.js'
import { ApiClient, ApiResponse } from '~/lib/apiClient.js'
import { type Message, messageStorage } from '~/lib/message.server.js'
import { validConfigTypes } from '~/lib/presets.js'
import { tooltips } from '~/lib/tooltips.js'
import { ElementConfigType, ElementErrors } from '~/lib/types.js'
import {
  capitalizeFirstLetter,
  encodeAndCompressParameters,
  getIlpayCss
} from '~/lib/utils.js'
import {
  createBannerSchema,
  createButtonSchema,
  createWidgetSchema,
  fullConfigSchema,
  versionSchema,
  walletSchema
} from '~/lib/validate.server'

export async function loader({ params, request }: LoaderFunctionArgs) {
  const elementType = params.type

  const cookies = request.headers.get('cookie')

  const session = await messageStorage.getSession(cookies)
  const message = session.get('script') as Message

  // get default config
  const apiResponse: ApiResponse = await ApiClient.getDefaultConfig()
  const defaultConfig: ElementConfigType = apiResponse?.payload?.default

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

  const [openWidget, setOpenWidget] = useState(false)
  const [toolConfig, setToolConfig] = useState<ElementConfigType>(defaultConfig)
  const [fullConfig, setFullConfig] =
    useState<Record<string, ElementConfigType>>()
  const [modalOpen, setModalOpen] = useState(false)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [newVersionModalOpen, setNewVersionModalOpen] = useState(false)
  const [infoModalOpen, setInfoModalOpen] = useState(false)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState('default')
  const [versionOptions, setVersionOptions] = useState<SelectOption[]>([
    { label: 'Default', value: 'default' }
  ])

  const wa = (toolConfig?.walletAddress || '')
    .replace('$', '')
    .replace('https://', '')
  const scriptToDisplay = `<script id="wmt-init-script" type="module" src="${toolsUrl}init.js?wa=${wa}&tag=[version]&types=[elements]"></script>`

  const onConfirm = () => {
    if (fullConfig) {
      const { [selectedVersion]: _, ...rest } = fullConfig
      setFullConfig(rest)
      const config = fullConfig['default']
      setToolConfig(config)

      const filteredOptions = versionOptions.filter(
        (ver) => ver.value != selectedVersion
      )
      setVersionOptions(filteredOptions)
      setSelectedVersion('default')
      setConfirmModalOpen(false)
    }
  }

  useEffect(() => {
    const errors = Object.keys(response?.errors?.fieldErrors || {})

    if (response && !errors.length && response.displayScript) {
      setModalOpen(true)
    } else if (
      response &&
      response.apiResponse &&
      response.apiResponse.newversion
    ) {
      const versionLabels = Object.keys(response.apiResponse?.payload).map(
        (key) => {
          return { label: capitalizeFirstLetter(key), value: key }
        }
      )
      setVersionOptions(versionLabels)

      const selVersion = response.apiResponse.newversion
      setSelectedVersion(selVersion)
      const config = response.apiResponse.payload[selVersion]
      setToolConfig(config)
      setNewVersionModalOpen(false)
      setInfoModalOpen(true)
    } else if (
      response &&
      response.apiResponse &&
      response.apiResponse.isFailure == false
    ) {
      const versionLabels = Object.keys(response.apiResponse?.payload).map(
        (key) => {
          return { label: capitalizeFirstLetter(key), value: key }
        }
      )
      setVersionOptions(versionLabels)

      setFullConfig(response.apiResponse.payload)
      const config = response.apiResponse.payload['default']
      setToolConfig(config)
      setImportModalOpen(false)
      setInfoModalOpen(true)
    }
  }, [response])

  useEffect(() => {
    const updatedFullConfig = {
      ...fullConfig,
      [selectedVersion]: toolConfig
    }
    setFullConfig(updatedFullConfig)
  }, [toolConfig])

  useEffect(() => {
    if (fullConfig) {
      const config = fullConfig[selectedVersion]
      setToolConfig(config)
    }
  }, [selectedVersion])

  return (
    <div className="flex flex-col gap-6 min-w-128 max-w-prose mx-auto my-8">
      <PageHeader
        link="/"
        title={`Create ${elementType}`}
        elementType={elementType}
        setImportModalOpen={setImportModalOpen}
        setNewVersionModalOpen={setNewVersionModalOpen}
        setConfirmModalOpen={setConfirmModalOpen}
        versionOptions={versionOptions}
        selectedVersion={selectedVersion}
        setSelectedVersion={setSelectedVersion}
      />
      {validConfigTypes.includes(String(elementType)) ? (
        <div className="flex flex-col">
          <Form method="post" replace>
            <fieldset disabled={isSubmitting}>
              <ToolPreview
                type={elementType}
                toolConfig={toolConfig}
                openWidget={openWidget}
                setOpenWidget={setOpenWidget}
                ilpayUrl={ilpayUrl}
              />
              <ToolConfig
                type={elementType}
                toolConfig={toolConfig}
                defaultConfig={defaultConfig}
                setToolConfig={setToolConfig}
                isSubmiting={isSubmitting}
                errors={response?.errors}
                setOpenWidget={setOpenWidget}
              />
            </fieldset>
            <input
              type="hidden"
              name="fullconfig"
              value={JSON.stringify(fullConfig)}
            />
            <input type="hidden" name="version" value={selectedVersion} />
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
        selectedVersion={selectedVersion}
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
      <NewVersionModal
        title="Create a new version of your config"
        isOpen={newVersionModalOpen}
        isSubmitting={isSubmitting}
        onClose={() => setNewVersionModalOpen(false)}
        errors={response?.errors}
        toolConfig={toolConfig}
        setToolConfig={setToolConfig}
      />
      <InfoModal
        title="Available configs"
        content={versionOptions.map((ver) => ver.value).join(', ')}
        isOpen={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
      />
      <ConfirmModal
        title={`Are you sure you want to remove ${selectedVersion}?`}
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={onConfirm}
      />
    </div>
  )
}

export async function action({ request, params }: ActionFunctionArgs) {
  const elementType = params.type
  const formData = Object.fromEntries(await request.formData())
  const intent = formData?.intent

  let apiResponse: ApiResponse = { isFailure: true, newversion: false }
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
  } else if (intent == 'newversion') {
    const result = versionSchema.merge(walletSchema).safeParse(formData)

    if (!result.success) {
      errors.fieldErrors = result.error.flatten().fieldErrors
      return json({ errors, apiResponse, displayScript }, { status: 400 })
    }

    const payload = result.data
    apiResponse = await ApiClient.createUserConfig(
      payload.version,
      payload.walletAddress
    )
    apiResponse.newversion = payload.version

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
    const result = currentSchema
      .merge(fullConfigSchema)
      .safeParse(Object.assign(formData, { ...{ elementType } }))

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
