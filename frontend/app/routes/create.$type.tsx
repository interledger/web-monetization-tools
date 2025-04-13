import { ActionFunctionArgs, LoaderFunctionArgs, json } from '@remix-run/cloudflare'
import {
  Form,
  useActionData,
  useLoaderData,
  useFetcher,
  useNavigation,
  Outlet,
  useSubmit
} from '@remix-run/react'
import { ReactElement, useEffect, useState } from 'react'
import {
  ConfirmModal,
  InfoModal,
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
import { validConfigTypes, ModalType } from '~/lib/presets.js'
import { tooltips } from '~/lib/tooltips.js'
import { ElementConfigType, ElementErrors } from '~/lib/types.js'
import { capitalizeFirstLetter, toWalletAddressUrl } from '~/lib/utils.js'
import { validateForm } from '~/lib/server/validate.server'
import { commitSession, getSession } from '~/lib/server/session.server'
import {
  getValidWalletAddress,
  createInteractiveGrant
} from '~/lib/server/open-payments.server'
import { getDefaultData } from '../lib/utils'

export async function loader({ params, request, context }: LoaderFunctionArgs) {
  const { cloudflare : {env} } = context
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

  const defaultConfig = getDefaultData().default
  const ilpayUrl =  env.SCRIPT_ILPAY_URL
  const scriptInitUrl = env.SCRIPT_EMBER_URL
  const frontendUrl = env.SCRIPT_FRONTEND_URL

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
        'Set-Cookie': await commitSession(session)
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
    isGrantResponse
  } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'
  const contentOnly = contentOnlyParam != null

  const deleteFetcher = useFetcher()
  const saveFetcher = useFetcher()
  const [openWidget, setOpenWidget] = useState(false)
  const [toolConfig, setToolConfig] = useState<ElementConfigType>(defaultConfig)
  const [fullConfig, setFullConfig] = useState<
    Record<string, ElementConfigType>
  >({
    default: defaultConfig
  })
  const [modal, setModal] = useState<ModalType | undefined>()
  const [selectedVersion, setSelectedVersion] = useState('default')
  const [versionOptions, setVersionOptions] = useState<SelectOption[]>([
    { label: 'Default', value: 'default' }
  ])

  const wa = toWalletAddressUrl(toolConfig?.walletAddress || '')
  const scriptToDisplay = `<script id="wmt-init-script" type="module" src="${scriptInitUrl}init.js?wa=${wa}&tag=[version]&types=[elements]"></script>`
  const submitForm = useSubmit()

  const onConfirmRemove = () => {
    if (
      fullConfig &&
      toolConfig.walletAddress &&
      selectedVersion !== 'default'
    ) {
      const formData = new FormData()
      formData.append('walletAddress', toolConfig.walletAddress)
      formData.append('version', selectedVersion)

      deleteFetcher.submit(formData, {
        method: 'delete',
        action: '/api/banner/delete',
        encType: 'multipart/form-data'
      })

      setModal(undefined)
    }
  }

  const onSelectVersion = (selectedVersion: string) => {
    const config = fullConfig[selectedVersion]
    if (config) {
      setToolConfig(config)
      setSelectedVersion(selectedVersion)
      sessionStorage.setItem('new-version', selectedVersion)
    } else {
      throw new Error('Version not found')
    }
  }

  const onConfirmOwnership = (redirectIntent?: string, interactHref?: string) => {
    if (!interactHref) {
      throw new Error('Grant not found')
    }
    if (redirectIntent) {
      sessionStorage.setItem('grant-redirect-intent', redirectIntent)
    }
    window.location.href = interactHref
  }

  /**
   * Update the config and version options based on the provided full config object and version name.
   * @param fullConfigObject
   * @param versionName
   */
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
      setSelectedVersion(versionName)
      setToolConfig(fullConfigObject[versionName])
    } else {
      setToolConfig(fullConfigObject.default)
    }
  }

  const getConfirmModalContent = (modal: ModalType | undefined) => {
    let title: string | ReactElement = '',
      description = '',
      onConfirm = () => {}
    const onClose = () => setModal(undefined)

    switch (modal?.type) {
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
        onConfirm = () => onConfirmOwnership(modal?.grantRedirectIntent, modal?.grantRedirectURI)
        break
      case 'grant-response':
        title = grantResponse
        onConfirm = isGrantAccepted
          ? () => {
              onResubmitForm()
              setModal(undefined)
            }
          : onClose
        break
    }
    return { title, description, onClose, onConfirm }
  }

  useEffect(() => {
    if (deleteFetcher.data && deleteFetcher.state === 'idle') {
      // @ts-ignore
      if (deleteFetcher.data.default) {
        const { [selectedVersion]: _, ...rest } = fullConfig
        setFullConfig(rest)
        setToolConfig(rest['default'])

        const filteredOptions = versionOptions.filter(
          (ver) => ver.value !== selectedVersion
        )
        setVersionOptions(filteredOptions)
        setSelectedVersion('default')

        sessionStorage.setItem('fullconfig', JSON.stringify(rest))
        sessionStorage.setItem('new-version', 'default')
      }
    }
  }, [deleteFetcher.data, deleteFetcher.state])

  useEffect(() => {
    const savedConfig = sessionStorage.getItem('fullconfig') || '{}'
    const savedSelectedVersion =
      sessionStorage.getItem('new-version') || 'default'

    try {
      const parsedConfig = JSON.parse(savedConfig)
      if (Object.keys(parsedConfig).length) {
        setConfigs(parsedConfig, savedSelectedVersion)

        setSelectedVersion(savedSelectedVersion)
        setToolConfig(
          parsedConfig[savedSelectedVersion] || parsedConfig.default
        )
      } else {
        setToolConfig(defaultConfig)
        setFullConfig({ default: defaultConfig })
      }
    } catch (error) {
      setToolConfig(defaultConfig)
      setFullConfig({ default: defaultConfig })
      throw new Error(
        `Error restoring saved configuration: ${(error as Error).message}`
      )
    }

    if (isGrantResponse) {
      setModal({ type: 'grant-response' })
    }
  }, [])

  useEffect(() => {
    const errors = Object.keys(actionData?.errors?.fieldErrors || {})

    // @ts-ignore
    if (!errors.length && actionData) {
      const updatedFullConfig = {
        ...fullConfig,
        [selectedVersion]: toolConfig
      }

      // @ts-ignore
      if (actionData?.grantRequired) {
        sessionStorage.setItem('fullconfig', JSON.stringify(updatedFullConfig))
        setModal({
          type: 'wallet-ownership',
          // @ts-ignore
          grantRedirectURI: actionData?.grantRequired,
          // @ts-ignore
          grantRedirectIntent: actionData?.intent
        })
      }
      // @ts-ignore
      else if (actionData?.success && actionData.intent == 'update') {
        const payload = {
          walletAddress: toolConfig.walletAddress,
          fullconfig: JSON.stringify(updatedFullConfig),
          version: selectedVersion,
          elementType: elementType
        }

        const formData = new FormData()
        for (const [key, value] of Object.entries(payload)) {
          formData.append(key, value!)
        }
        saveFetcher.submit(formData, {
          method: 'put',
          action: '/api/banner/update',
          encType: 'multipart/form-data'
        })
      }
    }
  }, [actionData])

  useEffect(() => {
    if (saveFetcher.data && saveFetcher.state === 'idle') {
      // @ts-ignore
      if (!saveFetcher.data.error) {
        // @ts-ignore
        setFullConfig(saveFetcher.data)
        sessionStorage.setItem('fullconfig', JSON.stringify(saveFetcher.data))
        setModal({ type: 'script' })
      }
    }
  }, [saveFetcher.data, saveFetcher.state])

  const onResubmitForm = () => {
    const intent = sessionStorage.getItem('grant-redirect-intent')
    if (intent !== 'update') {
      sessionStorage.removeItem('grant-redirect-intent')
      return
    }
    sessionStorage.removeItem('grant-redirect-intent')
    const formData = new FormData()
    formData.append('bannerFontName', toolConfig.bannerFontName)
    formData.append('bannerFontSize', toolConfig.bannerFontSize.toString())
    formData.append('bannerDescriptionText', toolConfig.bannerDescriptionText)
    formData.append('bannerTextColor', toolConfig.bannerTextColor)
    formData.append('bannerBackgroundColor', toolConfig.bannerBackgroundColor)
    formData.append('bannerSlideAnimation', toolConfig.bannerSlideAnimation)
    formData.append('bannerPosition', toolConfig.bannerPosition)
    formData.append('bannerBorder', toolConfig.bannerBorder)
    formData.append('walletAddress', toolConfig.walletAddress!)
    formData.append('version', selectedVersion)
    formData.append('fullconfig', JSON.stringify(fullConfig))
    formData.append('intent', 'update')

    submitForm(formData, {
      method: 'post',
      action: '/create/banner'
    })
  }

  return (
    <div className="flex flex-col gap-6 min-w-128 max-w-prose mx-auto my-8">
      <PageHeader
        title={`Create ${elementType}`}
        elementType={elementType}
        link={`${frontendUrl}/tools/${contentOnly ? '?contentOnly' : ''}`}
        setConfirmModalOpen={() => setModal({ type: 'confirm' })}
        versionOptions={versionOptions}
        selectedVersion={selectedVersion}
        onsetSelectVersion={onSelectVersion}
      />
      {toolConfig && validConfigTypes.includes(String(elementType)) ? (
        <div className="flex flex-col">
          <Form id="config-form" method="post" action="/create/banner">
            <fieldset
              disabled={
                isSubmitting ||
                deleteFetcher.state !== 'idle' ||
                saveFetcher.state !== 'idle'
              }
            >
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
                isSubmiting={
                  isSubmitting ||
                  deleteFetcher.state !== 'idle' ||
                  saveFetcher.state !== 'idle'
                }
                errors={actionData?.errors}
                setOpenWidget={setOpenWidget}
              />
            </fieldset>
            <input
              type="hidden"
              name="fullconfig"
              value={JSON.stringify(fullConfig)}
            />
            <input
              type="hidden"
              name="version"
              value={selectedVersion || 'default'}
            />
            <div className="px-6 pt-5">
              <ErrorPanel errors={actionData?.errors?.message || []} />
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
        isOpen={modal?.type === 'script'}
        onClose={() => setModal(undefined)}
      />
      <Outlet
        context={{
          toolConfig,
          setConfigs,
          setToolConfig,
          setModalOpen: setModal
        }}
      />
      <InfoModal
        title="Available configs"
        content={versionOptions.map((ver) => ver.value).join(', ')}
        isOpen={modal?.type === 'info'}
        onClose={() => setModal(undefined)}
      />
      <ConfirmModal
        {...getConfirmModalContent(modal)}
        isOpen={['confirm', 'wallet-ownership', 'grant-response'].includes(
          modal?.type || ''
        )}
      />
    </div>
  )
}

export async function action({ request, params, context }: ActionFunctionArgs) {
  const { cloudflare : {env} } = context
  const elementType = params.type
  const formData = Object.fromEntries(await request.formData())
  const intent = formData.intent

  const theCookie = request.headers.get('Cookie')
  const session = await getSession(theCookie)
  const errors: ElementErrors = {
    fieldErrors: {},
    message: []
  }

  const { result, payload } = await validateForm(formData, elementType)
  if (!result.success || !payload) {
    errors.fieldErrors = result.error?.flatten().fieldErrors || {
      walletAddress: undefined
    }
    return json({ errors, success: false, intent }, { status: 400 })
  }

  const ownerWalletAddress: string = payload.walletAddress as string
  const validForWallet = session.get('validForWallet')

  if (
    intent !== 'import' &&
    (!validForWallet || validForWallet !== ownerWalletAddress)
  ) {
    try {
      const walletAddress = await getValidWalletAddress(env, ownerWalletAddress)
      session.set('wallet-address', walletAddress)

      const redirectUrl = `${env.SCRIPT_FRONTEND_URL}grant/${elementType}/`
      const grant = await createInteractiveGrant(env,{
        walletAddress: walletAddress,
        redirectUrl
      })
      session.set('payment-grant', grant)

      return json(
        {
          errors,
          grantRequired: grant.interact.redirect,
          intent
        },
        {
          status: 200,
          headers: {
            'Set-Cookie': await commitSession(session)
          }
        }
      )
    } catch (err) {
      errors.fieldErrors = {
        walletAddress: ['Could not verify ownership of wallet address']
      }
      return json({ errors }, { status: 400 })
    }
  }

  return json(
    {
      errors,
      success: true,
      intent
    },
    {
      status: 200,
      headers: {
        'Set-Cookie': await commitSession(session)
      }
    }
  )
}
