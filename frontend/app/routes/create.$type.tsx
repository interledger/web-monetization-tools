import { ActionFunctionArgs, LoaderFunctionArgs, json } from '@remix-run/node'
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit
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
import { validateForm } from '~/lib/validate.server'
import { getSession } from '~/lib/session'
import {
  fetchQuote,
  getValidWalletAddress,
  initializePayment
} from '~/lib/open-payments.server'

export async function loader({ params, request }: LoaderFunctionArgs) {
  const elementType = params.type

  const url = new URL(request.url)
  const contentOnlyParam = url.searchParams.get('contentOnly')

  const cookies = request.headers.get('cookie')

  const session = await messageStorage.getSession(cookies)
  const message = session.get('script') as Message

  // get default config
  const apiResponse: ApiResponse = await ApiClient.getDefaultConfig()
  const defaultConfig: ElementConfigType = apiResponse?.payload?.default

  const ilpayUrl = process.env.ILPAY_URL || ''
  const scriptInitUrl = process.env.SCRIPT_EMBED_URL || ''

  return {
    elementType,
    defaultConfig,
    message,
    ilpayUrl,
    scriptInitUrl,
    contentOnlyParam
  }
}

export default function Create() {
  const {
    elementType,
    defaultConfig,
    ilpayUrl,
    scriptInitUrl,
    contentOnlyParam
  } = useLoaderData<typeof loader>()
  const response = useActionData<typeof action>()
  const { state } = useNavigation()
  const isSubmitting = state === 'submitting'
  const contentOnly = contentOnlyParam != null

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
  const scriptToDisplay = `<script id="wmt-init-script" type="module" src="${scriptInitUrl}init.js?wa=${wa}&tag=[version]&types=[elements]"></script>`
  const submitForm = useSubmit()

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

      const formData = new FormData()
      formData.append('intent', 'remove')
      formData.append('version', 'default')
      formData.append('fullconfig', JSON.stringify(rest))
      const defaultSet = rest.default as unknown as Record<string, string>
      Object.keys(defaultSet).map((key) => {
        formData.append(key, defaultSet[key])
      })
      submitForm(formData, { method: 'post' })
    }
  }

  useEffect(() => {
    const errors = Object.keys(response?.errors?.fieldErrors || {})

    if (response && !errors.length && response.displayScript) {
      setModalOpen(true)
    } else if (response && response.grantRequired) {
      console.log(response.grantRequired)
    } else if (
      response &&
      response.apiResponse &&
      response.apiResponse.newversion
    ) {
      const versionLabels = Object.keys(response.apiResponse?.payload).map(
        (key) => {
          return {
            label: capitalizeFirstLetter(key.replaceAll('-', ' ')),
            value: key
          }
        }
      )
      setVersionOptions(versionLabels)
      setFullConfig(response.apiResponse.payload)

      const selVersion = response.apiResponse.newversion
      setSelectedVersion(selVersion)
      setNewVersionModalOpen(false)
      setInfoModalOpen(true)
    } else if (
      response &&
      response.apiResponse &&
      response.apiResponse.isFailure == false
    ) {
      const versionLabels = Object.keys(response.apiResponse?.payload).map(
        (key) => {
          return {
            label: capitalizeFirstLetter(key.replaceAll('-', ' ')),
            value: key
          }
        }
      )
      setVersionOptions(versionLabels)

      setFullConfig(response.apiResponse.payload)
      setSelectedVersion('default')
      setImportModalOpen(false)
      if (response.intent != 'remove') {
        setInfoModalOpen(true)
      }
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
        title={`Create ${elementType}`}
        elementType={elementType}
        setImportModalOpen={setImportModalOpen}
        link={`/${contentOnly ? '?contentOnly' : ''}`}
        setNewVersionModalOpen={setNewVersionModalOpen}
        setConfirmModalOpen={setConfirmModalOpen}
        versionOptions={versionOptions}
        selectedVersion={selectedVersion}
        setSelectedVersion={setSelectedVersion}
      />
      {toolConfig && validConfigTypes.includes(String(elementType)) ? (
        <div className="flex flex-col">
          <Form id="config-form" method="post" replace>
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
              value={JSON.stringify(fullConfig ?? {})}
            />
            <input
              type="hidden"
              name="version"
              value={selectedVersion || 'default'}
            />
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
  let grantRequired: string | undefined
  let opId: string
  const errors: ElementErrors = {
    fieldErrors: {},
    message: []
  }

  const actionResponse = {
    errors,
    apiResponse,
    displayScript,
    intent,
    grantRequired
  }

  // validate form data
  const { result, payload } = validateForm(formData, elementType)
  if (!result.success || !payload) {
    errors.fieldErrors = result.error?.flatten().fieldErrors || {
      walletAddress: undefined
    }
    return json(actionResponse, { status: 400 })
  }

  // no need when importing
  if (intent != 'import') {
    const session = await getSession(request.headers.get('Cookie'))
    opId = session.get('opId')

    if (!opId) {
      try {
        const ownerWalletAddress: string = payload.walletAddress as string
        const walletAddress = await getValidWalletAddress(ownerWalletAddress)
        const quote = await fetchQuote({
          senderAddress: walletAddress,
          receiverAddress: walletAddress,
          amount: 0.1, // 0 value fails on ILP side
          note: 'Publisher Tools owner verification'
        })

        const redirectUrl = `${process.env.FRONTEND_URL}create/${elementType}/`
        const grant = await initializePayment({
          walletAddress: walletAddress.id,
          quote: quote,
          redirectUrl
        })
        actionResponse.grantRequired = grant.interact.redirect
      } catch (err) {
        console.log({ err })
        errors.fieldErrors = {
          walletAddress: ['Could not verify ownership of wallet address']
        }
        actionResponse.errors = errors
      }

      return json(actionResponse, { status: 200 })
    }
  }

  if (intent == 'import') {
    apiResponse = await ApiClient.getUserConfig(payload.walletAddress)

    actionResponse.apiResponse = apiResponse
    return json(actionResponse, { status: 200 })
  } else if (intent == 'newversion') {
    const versionName = payload.version.replaceAll(' ', '-')
    apiResponse = await ApiClient.createUserConfig(
      versionName,
      payload.walletAddress
    )
    apiResponse.newversion = versionName

    actionResponse.apiResponse = apiResponse
    return json(actionResponse, { status: 200 })
  } else {
    if (payload.elementType == 'widget') {
      const css = await encodeAndCompressParameters(
        getIlpayCss(payload as unknown as ElementConfigType)
      )

      Object.assign(payload, { css })
    }

    apiResponse = await ApiClient.saveUserConfig(payload)

    actionResponse.apiResponse = apiResponse
    actionResponse.displayScript = intent != 'remove' ? true : displayScript
    return json(actionResponse, { status: 200 })
  }
}
