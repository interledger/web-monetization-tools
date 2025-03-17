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
import { validConfigTypes, ModalType } from '~/lib/presets.js'
import { tooltips } from '~/lib/tooltips.js'
import { ElementConfigType, ElementErrors } from '~/lib/types.js'
import {
  capitalizeFirstLetter,
  encodeAndCompressParameters,
  getIlpayCss,
  toWalletAddressUrl
} from '~/lib/utils.js'
import { validateForm } from '~/lib/validate.server'
import { commitSession, getSession } from '~/lib/session.js'
import {
  fetchQuote,
  getValidWalletAddress,
  createInteractiveGrant,
  isGrantValidAndAccepted
} from '~/lib/open-payments.server'

export async function loader({ params, request }: LoaderFunctionArgs) {
  const elementType = params.type

  const url = new URL(request.url)
  const contentOnlyParam = url.searchParams.get('contentOnly')
  const interactRef = url.searchParams.get('interact_ref') || ''
  const result = url.searchParams.get('result') || ''

  const session = await getSession(request.headers.get('Cookie'))
  const walletAddress = session.get('wallet-address')
  const grant = session.get('payment-grant')

  // console.log({ walletAddress, interactRef, quote })
  if (walletAddress && grant && interactRef) {
    const grantAccepted = await isGrantValidAndAccepted(grant, interactRef)

    // console.log({ grant })
  }

  // get default config
  const apiResponse: ApiResponse = await ApiClient.getDefaultConfig()
  const defaultConfig: ElementConfigType = apiResponse?.payload?.default

  const ilpayUrl = process.env.ILPAY_URL || ''
  const scriptInitUrl = process.env.INIT_SCRIPT_URL || ''

  return {
    elementType,
    defaultConfig,
    ilpayUrl,
    scriptInitUrl,
    walletAddress,
    contentOnlyParam
  }
}

export default function Create() {
  const {
    elementType,
    defaultConfig,
    ilpayUrl,
    scriptInitUrl,
    walletAddress,
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
  const [modalOpen, setModalOpen] = useState<ModalType | undefined>()

  const [selectedVersion, setSelectedVersion] = useState('default')
  const [versionOptions, setVersionOptions] = useState<SelectOption[]>([
    { label: 'Default', value: 'default' }
  ])
  const [configUpdateTrigger, setConfigUpdateTrigger] = useState(0)

  const wa = toWalletAddressUrl(toolConfig?.walletAddress || '')
  const scriptToDisplay = `<script id="wmt-init-script" type="module" src="${scriptInitUrl}init.js?wa=${wa}&tag=[version]&types=[elements]"></script>`
  const submitForm = useSubmit()

  const onConfirmRemove = () => {
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
      setModalOpen(undefined)

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

  const onConfirmOwnership = () => {
    if (response?.grantRequired) {
      window.location.href = response.grantRequired
    }
  }

  const getInfoModalContent = (type: string) => {
    let title = '',
      description = '',
      onConfirm = () => {}
    const onClose = () => setModalOpen(undefined)

    switch (type) {
      case 'confirm':
        title = `Are you sure you want to remove ${selectedVersion}?`
        onConfirm = onConfirmRemove
        break
      case 'wallet-ownership':
        title = `Please confirm you are owner of 
                <span class="flex w-full justify-center text-center">
                  ${walletAddress.id}
                </span>`
        description =
          "You will need to confirm a grant to prove that you are the owner of the wallet address. It's value is et to $1 but there will be no funds removed from your wallet"
        onConfirm = onConfirmOwnership
        break
    }
    return { title, description, onClose, onConfirm }
  }

  useEffect(() => {
    const errors = Object.keys(response?.errors?.fieldErrors || {})

    if (response && !errors.length && response.displayScript) {
      setModalOpen('script')
    } else if (response && response.grantRequired) {
      setModalOpen('wallet-ownership')
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

      setModalOpen('info')

      const selVersion = response.apiResponse.newversion
      setSelectedVersion(selVersion)
      // make sure the update is triggered
      setConfigUpdateTrigger((prev) => prev + 1)
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
      setModalOpen(undefined)
      if (response.intent != 'remove') {
        setModalOpen('info')
      }
      setSelectedVersion('default')
      // make sure the update is triggered
      setConfigUpdateTrigger((prev) => prev + 1)
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
  }, [selectedVersion, configUpdateTrigger])

  return (
    <div className="flex flex-col gap-6 min-w-128 max-w-prose mx-auto my-8">
      <PageHeader
        title={`Create ${elementType}`}
        elementType={elementType}
        setImportModalOpen={() => setModalOpen('import')}
        link={`/${contentOnly ? '?contentOnly' : ''}`}
        setNewVersionModalOpen={() => setModalOpen('new-version')}
        setConfirmModalOpen={() => setModalOpen('confirm')}
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
        isOpen={modalOpen == 'script'}
        onClose={() => setModalOpen(undefined)}
      />
      <ImportModal
        title="Import config from wallet address"
        isOpen={modalOpen == 'import'}
        isSubmitting={isSubmitting}
        onClose={() => setModalOpen(undefined)}
        toolConfig={toolConfig}
        setToolConfig={setToolConfig}
        errors={response?.errors}
      />
      <NewVersionModal
        title="Create a new version of your config"
        isOpen={modalOpen == 'new-version'}
        isSubmitting={isSubmitting}
        onClose={() => setModalOpen(undefined)}
        errors={response?.errors}
        toolConfig={toolConfig}
        setToolConfig={setToolConfig}
        fullConfig={fullConfig}
      />
      <InfoModal
        title="Available configs"
        content={versionOptions.map((ver) => ver.value).join(', ')}
        isOpen={modalOpen == 'info'}
        onClose={() => setModalOpen(undefined)}
      />
      <ConfirmModal
        {...getInfoModalContent(modalOpen ?? '')}
        isOpen={['confirm', 'wallet-ownership'].includes(modalOpen ?? '')}
      />
    </div>
  )
}

export async function action({ request, params }: ActionFunctionArgs) {
  const elementType = params.type
  const formData = Object.fromEntries(await request.formData())
  const intent = formData?.intent

  let apiResponse: ApiResponse = { isFailure: true, newversion: false }
  const displayScript: boolean = false
  const grantRequired: string = ''
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
  const { result, payload } = await validateForm(formData, elementType)
  if (!result.success || !payload) {
    errors.fieldErrors = result.error?.flatten().fieldErrors || {
      walletAddress: undefined
    }
    return json(actionResponse, { status: 400 })
  }

  // no need when importing
  if (intent != 'import') {
    const ownerWalletAddress: string = payload.walletAddress as string

    const session = await getSession(request.headers.get('Cookie'))
    opId = session.get('opId')

    if (!opId) {
      try {
        const walletAddress = await getValidWalletAddress(ownerWalletAddress)
        session.set('wallet-address', walletAddress)

        const quote = await fetchQuote({
          senderAddress: walletAddress,
          receiverAddress: walletAddress,
          amount: 0.02, // 0 value fails and fee must be deducted from this
          note: 'Publisher Tools wallet verification'
        })
        session.set('quote', quote)

        const redirectUrl = `${process.env.FRONTEND_URL}create/${elementType}/`
        const grant = await createInteractiveGrant({
          walletAddress: walletAddress,
          quote: quote,
          redirectUrl
        })
        session.set('payment-grant', grant)

        actionResponse.grantRequired = grant.interact.redirect
      } catch (err) {
        console.log({ err })
        errors.fieldErrors = {
          walletAddress: ['Could not verify ownership of wallet address']
        }
        actionResponse.errors = errors
      }

      return json(actionResponse, {
        status: 200,
        headers: {
          'Set-Cookie': await commitSession(session)
        }
      })
    }
  }

  if (intent == 'import') {
    apiResponse = await ApiClient.getUserConfig(payload.walletAddress)

    actionResponse.apiResponse = apiResponse
    return json(actionResponse, { status: 200 })
  } else if (intent == 'newversion') {
    const versionName = payload.version.replaceAll(' ', '-')
    const configKeys = Object.keys(JSON.parse(payload.fullconfig))
    if (configKeys.indexOf(versionName) !== -1) {
      errors.fieldErrors = { version: ['Already exists'] }
      actionResponse.errors = errors
      return json(actionResponse, { status: 400 })
    }
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
