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
import {
  type Message,
  messageStorage,
  setMessageAndRedirect
} from "~/lib/message.server"
import { ElementConfigType, ElementErrors } from "~/lib/types"
import { encodeAndCompressParameters } from "~/lib/utils"
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

  const ilpayUrl = process.env.ILPAY_URL || ""
  const toolsUrl = process.env.FRONTEND_URL || ""

  return { elementType, defaultConfig, message, ilpayUrl, toolsUrl }
}

export default function Create() {
  const { elementType, defaultConfig, message, ilpayUrl, toolsUrl } =
    useLoaderData<typeof loader>()
  const response = useActionData<typeof action>()
  const { state } = useNavigation()
  const isSubmitting = state === "submitting"

  const [toolConfig, setToolConfig] = useState<ElementConfigType>(defaultConfig)
  const [modalOpen, setModalOpen] = useState(false)

  const scriptToDisplay = `<script src="${toolsUrl}init.js?wa=${
    toolConfig?.walletAddress || ""
  }&type=${elementType}"></script>`

  useEffect(() => {
    if (response) {
      console.log(response)
      setModalOpen(true)
    }
  }, [response])

  useEffect(() => {
    console.log(message)
    if (!message) {
      return
    }
  }, [message])

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

  const walletAddress = String(formData.walletAddress)

  let currentSchema
  let tag

  switch (elementType) {
    case "banner":
      currentSchema = createBannerSchema
      break
    case "widget":
      currentSchema = createWidgetSchema
      tag = "widget"
      break
    case "button":
    default:
      currentSchema = createButtonSchema
  }
  const result = currentSchema.safeParse(
    Object.assign(formData, { ...(tag === "widget" ? { tag } : {}) })
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

  if (result.data.tag === "widget") {
    const selectedFont = result.data.fontName ?? ""

    const widgetButtonBorder =
      result.data.widgetButtonBorder == "Light"
        ? "0.375rem"
        : result.data.widgetButtonBorder == "Pill"
        ? "1rem"
        : "0"

    const css = await encodeAndCompressParameters(
      `
      .ilpay_body {
        font-family: ${selectedFont}, system-ui, sans-serif !important;
        color: ${result.data.widgetTextColor};
      }
      .ilpay_body button.wmt-formattable-button {
        color: ${result.data.widgetButtonTextColor};
        background-color: ${result.data.widgetButtonBackgroundColor};
        border-radius: ${widgetButtonBorder};
        transition: all 0.5s ease;
      }
      .ilpay_body .amount-display,
      .ilpay_body li,
      #extension-pay-form label {
        color: ${result.data.widgetTextColor};
      }
      .ilpay_body #headlessui-portal-root {
        all: revert;
      }   
      #extension-pay-form input {
        color: #000000;
      }
      #extension-pay-form input.disabled {
        background-color: #eeeeee;
        color: #666;
      }`
        .trim()
        .replaceAll(" ", "")
        .replaceAll("\n", "")
    )

    Object.assign(payload, { css })
  }

  console.log(payload)

  // const apiResponse: ApiResponse = await ApiClient.saveUserConfig(
  //   walletAddress,
  //   payload
  // );
  // console.log(apiResponse);
  return json({}, { status: 200 })

  const session = await messageStorage.getSession(request.headers.get("cookie"))

  return setMessageAndRedirect({
    session,
    message: {
      content: "Script ready.",
      type: "success"
    },
    location: `/create/${elementType}`
  })
}
