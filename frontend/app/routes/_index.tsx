import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { json, useLoaderData } from '@remix-run/react'
import { TypeCard } from '~/components/index.js'
import { availableTools } from '~/lib/presets.js'

export const meta: MetaFunction = () => {
  return [
    { title: 'WebMonetization Tools' },
    { name: 'description', content: 'Choose and configure your elements!' }
  ]
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  const contentOnlyParam = url.searchParams.get('contentOnly')

  return json({ contentOnlyParam })
}

export default function Index() {
  const { contentOnlyParam } = useLoaderData<typeof loader>()
  const contentOnly = contentOnlyParam != null

  return (
    <div className="h-full p-14">
      <div className="flex flex-wrap justify-center gap-6 max-w-prosex p-4 mx-auto">
        {availableTools.map((tool) => {
          const toolLink = `${tool.link}${contentOnly ? '?contentOnly' : ''}`
          const props = {
            ...tool,
            link: toolLink
          }
          return <TypeCard key={toolLink} {...props} />
        })}
      </div>
    </div>
  )
}
