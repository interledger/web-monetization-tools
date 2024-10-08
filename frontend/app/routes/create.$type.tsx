import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import {
  Form,
  json,
  useActionData,
  useLoaderData,
  useNavigation
} from "@remix-run/react"
import { useEffect, useState } from "react"
import {
  ErrorPanel,
  NotFoundConfig,
  PageHeader,
  ScriptModal,
  ToolConfig,
  ToolPreview
} from "~/components"
import { ApiClient, ApiResponse } from "~/lib/apiClient"
import { type Message, messageStorage } from "~/lib/message.server"
import { ElementConfigType, ElementErrors } from "~/lib/types"
import { encodeAndCompressParameters, getIlpayCss } from "~/lib/utils"
import {
  createBannerSchema,
  createButtonSchema,
  createWidgetSchema
} from "~/lib/validate.server"

const validConfigTypes = ["button", "banner", "widget"]

export async function loader({ params, request }: LoaderFunctionArgs) {
  const elementType = params.type

  const cookies = request.headers.get("cookie")

  const session = await messageStorage.getSession(cookies)
  const message = session.get("script") as Message

  // get default config
  const apiResponse: ApiResponse = await ApiClient.getDefaultConfig()
  const defaultConfig: ElementConfigType = apiResponse?.payload

  const ilpayUrl = process.env.VITE_ILPAY_URL || ""
  const toolsUrl = process.env.VITE_FRONTEND_URL || ""

  return { elementType, defaultConfig, message, ilpayUrl, toolsUrl }
}

export default function Create() {
  const { elementType, defaultConfig, ilpayUrl, toolsUrl } =
    useLoaderData<typeof loader>()
  const response = useActionData<typeof action>()
  const { state } = useNavigation()
  const isSubmitting = state === "submitting"

  const [toolConfig, setToolConfig] = useState<ElementConfigType>(defaultConfig)
  const [modalOpen, setModalOpen] = useState(false)

  const wa = (toolConfig?.walletAddress || "")
    .replace("$", "")
    .replace("https://", "")
  const scriptToDisplay = `<script id="wmt-init-script" type="module" src="${toolsUrl}init.js?wa=${wa}&types=[elements]"></script>`

  useEffect(() => {
    const errors = Object.keys(response?.errors?.fieldErrors || {})
    if (response && !errors.length) {
      setModalOpen(true)
    }
  }, [response])

  return (
    <div className="flex flex-col gap-6 min-w-128 max-w-prose mx-auto my-8">
      <PageHeader title={`Create ${elementType}`} link="/" />
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
        defaultType={elementType}
        scriptForDisplay={scriptToDisplay}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}

export async function action({ request, params }: ActionFunctionArgs) {
  const elementType = params.type
  const formData = Object.fromEntries(await request.formData())

  let currentSchema

  switch (elementType) {
    case "button":
      currentSchema = createButtonSchema
      break
    case "widget":
      currentSchema = createWidgetSchema
      break
    case "banner":
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

  if (payload.elementType == "widget") {
    const css = await encodeAndCompressParameters(
      getIlpayCss(payload as unknown as ElementConfigType)
    )

    Object.assign(payload, { css })
  }

  const apiResponse: ApiResponse = await ApiClient.saveUserConfig(payload)

  return json({ errors, apiResponse }, { status: 200 })
}
