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
import { messageStorage, setMessageAndRedirect } from "~/lib/message.server"
import { ElementConfigType, ElementErrors } from "~/lib/types"
import {
  createBannerSchema,
  createButtonSchema,
  createWidgetSchema
} from "~/lib/validate.server"

const validConfigTypes = ["button", "banner", "widget"]

export async function loader({ params }: LoaderFunctionArgs) {
  const elementType = params.type

  // get default config
  const apiResponse: ApiResponse = await ApiClient.getDefaultConfig()
  const defaultConfig: ElementConfigType = apiResponse?.payload

  return { elementType, defaultConfig }
}

export default function Create() {
  const { elementType, defaultConfig } = useLoaderData<typeof loader>()
  const response = useActionData<typeof action>()
  const { state } = useNavigation()
  const isSubmitting = state === "submitting"

  const [toolConfig, setToolConfig] = useState<ElementConfigType>(defaultConfig)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    if (response) {
      console.log(response)
    }
  }, [response])

  return (
    <div className="flex flex-col gap-6 min-w-128 max-w-prose mx-auto my-8">
      <PageHeader title={`Create ${elementType}`} link="/" />
      {validConfigTypes.includes(String(elementType)) ? (
        <div className="flex flex-col">
          <Form method="post" replace>
            <fieldset disabled={isSubmitting}>
              <ToolPreview type={elementType} toolConfig={toolConfig} />
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
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}

export async function action({ request, params }: ActionFunctionArgs) {
  const elementType = params.type
  const formData = Object.fromEntries(await request.formData())

  console.log(elementType)

  const walletAddress = String(formData.walletAddress)

  let currentSchema

  switch (elementType) {
    case "banner":
      currentSchema = createBannerSchema
      break
    case "widget":
      currentSchema = createWidgetSchema
      break
    case "button":
    default:
      currentSchema = createButtonSchema
  }
  const result = currentSchema.safeParse(formData)

  const errors: ElementErrors = {
    fieldErrors: {},
    message: []
  }

  if (!result.success) {
    errors.fieldErrors = result.error.flatten().fieldErrors
    return json({ errors }, { status: 400 })
  }

  const apiResponse: ApiResponse = await ApiClient.saveUserConfig(
    walletAddress,
    result.data
  )
  console.log(apiResponse)

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
