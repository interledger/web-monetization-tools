import { json } from '@remix-run/cloudflare'
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { TypeCard } from '~/components/index.js'
import { availableTools } from '~/lib/presets.js'

export const meta: MetaFunction = () => {
  return [
    { title: 'Publisher Tools' },
    { name: 'description', content: 'Choose and configure your elements!' }
  ]
}

export async function loader({ request }: LoaderFunctionArgs) {
  const enableWidget = new URL(request.url).searchParams.get('widget') === '1'
  return json({ enableWidget })
}

export default function Index() {
  const { enableWidget } = useLoaderData<typeof loader>()
  return (
    <div className="h-full p-14">
      <div className="flex flex-wrap justify-center gap-6 max-w-prosex p-4 mx-auto">
        {availableTools
          .filter(
            (tool) => tool.enabled || (tool.link === 'widget' && enableWidget)
          )
          .map((tool) => (
            <TypeCard key={tool.link} {...tool} />
          ))}
      </div>
    </div>
  )
}
