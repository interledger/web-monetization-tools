import { ActionFunctionArgs, LoaderFunctionArgs, json } from '@remix-run/node'
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit
} from '@remix-run/react'
import { ReactElement, useEffect, useState } from 'react'
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
import { validateForm } from '~/lib/server/validate.server'
import { commitSession, getSession } from '~/lib/server/session.server'
import {
  getValidWalletAddress,
  createInteractiveGrant
} from '~/lib/server/open-payments.server'

export async function loader({ params, request }: LoaderFunctionArgs) {
  const elementType = params.type

  const url = new URL(request.url)
  const contentOnlyParam = url.searchParams.get('contentOnly')

  const session = await getSession(request.headers.get('Cookie'))
  const walletAddress = session.get('wallet-address')
  const lastAction = session.get('last-action')
  const grantResponse = session.get('grant-response')
  const isGrantAccepted = session.get('is-grant-accepted')
  const isGrantResponse = session.get('is-grant-response')

  // removed unneeded data
  session.unset('grant-response')
  session.unset('is-grant-accepted')
  session.unset('is-grant-response')

  // get default config
  const apiResponse: ApiResponse = await ApiClient.getDefaultConfig()
  const defaultConfig: ElementConfigType = apiResponse?.payload?.default

  const ilpayUrl = process.env.ILPAY_URL || ''
  const scriptInitUrl = process.env.INIT_SCRIPT_URL || ''
  const frontendUrl = process.env.FRONTEND_URL || ''

  return json(
    {
      elementType,
      defaultConfig,
      ilpayUrl,
      scriptInitUrl,
      frontendUrl,
      walletAddress,
      contentOnlyParam,
      grantResponse,
      isGrantResponse,
      isGrantAccepted,
      lastAction
    },
    {
      headers: {
        'Set-Cookie': await commitSession(session) // Commit session changes
      }
    }
  )
}

export default function Create() {
  const {
    elementType,
    defaultConfig,
    ilpayUrl,
    scriptInitUrl,
    frontendUrl,
    walletAddress,
    contentOnlyParam,
    isGrantAccepted,
    grantResponse,
    isGrantResponse,
    lastAction
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

  const [versionName, setVersionName] = useState('')
  const [selectedVersion, setSelectedVersion] = useState('default')
  const [versionOptions, setVersionOptions] = useState<SelectOption[]>([
    { label: 'Default', value: 'default' }
  ])
  const [configUpdateTrigger, setConfigUpdateTrigger] = useState(0)

  const wa = toWalletAddressUrl(toolConfig?.walletAddress || '')
  const scriptToDisplay = `<script id="wmt-init-script" type="module" src="${scriptInitUrl}init.js?wa=${wa}&tag=[version]&types=[elements]"></script>`
  const submitForm = useSubmit()

  const getFormData = (
    configArray: Record<string, ElementConfigType>,
    intent: string,
    version: string
  ) => {
    const formData = new FormData()
    const defaultSet = configArray.default as unknown as Record<string, string>
    Object.keys(defaultSet).map((key) => {
      formData.set(key, defaultSet[key])
    })

    formData.set('intent', intent)
    formData.set('version', version)
    formData.set('fullconfig', JSON.stringify(configArray))

    return formData
  }

  const setConfigs = (
    fullConfigObject: Record<string, ElementConfigType>,
    versionName: string
  ) => {
    if (fullConfigObject?.default) {
      const versionLabels = Object.keys(fullConfigObject).map((key) => {
        return {
          label: capitalizeFirstLetter(key.replaceAll('-', ' ')),
          value: key
        }
      })
      setVersionOptions(versionLabels)
      setFullConfig(fullConfigObject)
    }
    if (versionName) {
      const selVersion = versionName
      setSelectedVersion(selVersion)
    }
    // make sure the update is triggered
    setConfigUpdateTrigger((prev) => prev + 1)
  }

  const onConfirmRemove = () => {
    if (fullConfig) {
      // only create and submit form data
      const formData = getFormData(fullConfig, 'remove', selectedVersion)
      submitForm(formData, { method: 'post' })
      setModalOpen(undefined)
    }
  }

  const onConfirmOwnership = () => {
    if (response?.grantRequired) {
      window.location.href = response.grantRequired
    }
  }

  const onResubmit = () => {
    setModalOpen(undefined)
    const formData = getFormData(fullConfig || {}, lastAction, selectedVersion)
    submitForm(formData, { method: 'post' })
  }

  const getConfirmModalContent = (type: string) => {
    let title: string | ReactElement = '',
      description = '',
      onConfirm = () => {}
    const onClose = () => setModalOpen(undefined)

    switch (type) {
      case 'confirm':
        title = `Are you sure you want to remove ${selectedVersion}?`
        onConfirm = onConfirmRemove
        break
      case 'wallet-ownership':
        title = (
          <span>
            Please confirm you are owner of
            <span className="flex w-full justify-center text-center">
              {walletAddress?.id || ''}
            </span>
          </span>
        )
        description =
          "You will need to confirm a grant to prove that you are the owner of the wallet address. It's value is set to 1 but there will be no funds removed from your wallet"
        onConfirm = onConfirmOwnership
        break
      case 'grant-response':
        title = grantResponse
        onConfirm = isGrantAccepted ? onResubmit : onClose
        break
    }
    return { title, description, onClose, onConfirm }
  }

  useEffect(() => {
    const newVersion = sessionStorage.getItem('new-version')
    const userFullconfig = JSON.parse(
      sessionStorage.getItem('fullconfig') || '{}'
    )
    // make sure newly created version has config value
    if (newVersion && !userFullconfig[newVersion]) {
      userFullconfig[newVersion] = userFullconfig['default']
    }

    setConfigs(userFullconfig, newVersion || 'default')

    if (isGrantResponse) {
      setModalOpen('grant-response')
    }
  }, [])

  useEffect(() => {
    const errors = Object.keys(response?.errors?.fieldErrors || {})

    if (response && !errors.length) {
      if (response.displayScript) {
        setModalOpen('script')
      } else if (response.grantRequired) {
        setModalOpen('wallet-ownership')
      } else if (response.apiResponse?.isFailure === false) {
        if (response.intent === 'remove') {
          // update state only after successful deletion
          const { [selectedVersion]: _, ...rest } = fullConfig || {}
          setFullConfig(rest)
          setToolConfig(rest['default'])

          const filteredOptions = versionOptions.filter(
            (ver) => ver.value !== selectedVersion
          )
          setVersionOptions(filteredOptions)
          setSelectedVersion('default')
        } else {
          setConfigs(response.apiResponse?.payload, 'default')
          if (response.intent !== 'remove') {
            setModalOpen('info')
          }
        }
      }
    }
  }, [response])

  useEffect(() => {
    // ensure fullconfig always has the current version's data, even for 'default'
    // with no wa import beforehand
    if (
      fullConfig ||
      (selectedVersion === 'default' && toolConfig.walletAddress)
    ) {
      const updatedFullConfig = {
        ...fullConfig,
        [selectedVersion]: toolConfig
      }
      setFullConfig(updatedFullConfig)

      //preserve data for page redirect
      sessionStorage.setItem('new-version', selectedVersion)
      sessionStorage.setItem('fullconfig', JSON.stringify(updatedFullConfig))
    }
  }, [toolConfig])

  useEffect(() => {
    if (fullConfig) {
      const config = fullConfig[selectedVersion]
      setToolConfig(config)

      //preserve data for page redirect
      sessionStorage.setItem('new-version', selectedVersion)
    }
  }, [selectedVersion, configUpdateTrigger])

  return (
    <div className="flex flex-col gap-6 min-w-128 max-w-prose mx-auto my-8">
      <PageHeader
        title={`Create ${elementType}`}
        elementType={elementType}
        setImportModalOpen={() => setModalOpen('import')}
        link={`${frontendUrl}/tools/${contentOnly ? '?contentOnly' : ''}`}
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
        versionName={versionName}
        setVersionName={(v) => {
          setVersionName(v)
          sessionStorage.setItem('new-version', v)
        }}
      />
      <InfoModal
        title="Available configs"
        content={versionOptions.map((ver) => ver.value).join(', ')}
        isOpen={modalOpen == 'info'}
        onClose={() => setModalOpen(undefined)}
      />
      <ConfirmModal
        {...getConfirmModalContent(modalOpen ?? '')}
        isOpen={['confirm', 'wallet-ownership', 'grant-response'].includes(
          modalOpen ?? ''
        )}
      />
    </div>
  )
}

export async function action({ request, params }: ActionFunctionArgs) {
  const elementType = params.type
  const formData = Object.fromEntries(await request.formData())
  const intent = formData?.intent

  const theCookie = request.headers.get('Cookie')
  const session = await getSession(theCookie)
  session.set('last-action', intent as string)

  let apiResponse: ApiResponse = { isFailure: true, newversion: false }
  const displayScript: boolean = false
  const grantRequired: string = ''
  let validForWallet: string
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
  // additional check for newversion
  if (intent == 'newversion') {
    // get existing keys
    const apiData = await ApiClient.getUserConfig(payload.walletAddress)
    const currentConfig = apiData.payload || {}

    const versionName = payload.version.replaceAll(' ', '-')
    const configKeys = Object.keys(currentConfig)
    if (configKeys.indexOf(versionName) !== -1) {
      errors.fieldErrors = { version: ['Already exists'] }
      actionResponse.errors = errors
      return json(actionResponse, { status: 400 })
    }
  }

  // no need when importing
  if (intent != 'import') {
    const ownerWalletAddress: string = payload.walletAddress as string
    validForWallet = session.get('validForWallet')

    if (!validForWallet || validForWallet !== ownerWalletAddress) {
      try {
        const walletAddress = await getValidWalletAddress(ownerWalletAddress)
        session.set('wallet-address', walletAddress)

        const redirectUrl = `${process.env.FRONTEND_URL}grant/${elementType}/`
        const grant = await createInteractiveGrant({
          walletAddress: walletAddress,
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
    session.set('last-action', '')
    apiResponse = await ApiClient.getUserConfig(payload.walletAddress)

    actionResponse.apiResponse = apiResponse
    return json(actionResponse, {
      status: 200,
      headers: {
        'Set-Cookie': await commitSession(session)
      }
    })
  } else if (intent == 'newversion') {
    const versionName = payload.version.replaceAll(' ', '-')
    apiResponse = await ApiClient.createUserConfig(
      versionName,
      payload.walletAddress,
      theCookie || ''
    )
    apiResponse.newversion = versionName

    actionResponse.apiResponse = apiResponse
    return json(actionResponse, {
      status: 200,
      headers: {
        'Set-Cookie': await commitSession(session)
      }
    })
  } else if (intent === 'remove') {
    apiResponse = await ApiClient.deleteConfigVersion(
      payload.walletAddress,
      payload.version,
      theCookie || ''
    )

    actionResponse.apiResponse = apiResponse
    return json(actionResponse, {
      status: 200,
      headers: {
        'Set-Cookie': await commitSession(session)
      }
    })
  } else {
    if (payload.elementType == 'widget') {
      const css = await encodeAndCompressParameters(
        getIlpayCss(payload as unknown as ElementConfigType)
      )

      Object.assign(payload, { css })
    }

    apiResponse = await ApiClient.saveUserConfig(payload, theCookie || '')

    actionResponse.apiResponse = apiResponse
    actionResponse.displayScript = intent != 'remove' ? true : displayScript
    return json(actionResponse, {
      status: 200,
      headers: {
        'Set-Cookie': await commitSession(session)
      }
    })
  }
}
