import type { MetaFunction } from '@remix-run/node'
import { TypeCard } from '~/components/index.js'
import { availableTools } from '~/lib/presets.js'

export const meta: MetaFunction = () => {
  return [
    { title: 'WebMonetization Tools' },
    { name: 'description', content: 'Choose and configure your elements!' }
  ]
}

export default function Index() {
  return (
    <div>
      <div className="bg-gradient-to-r from-wm-green to-wm-green-fade border-t-4 border-t-wm-green-shade p-14">
        <div className="flex flex-wrap justify-center gap-6 max-w-prosex p-4 mx-auto">
          {availableTools.map((tool) => (
            <TypeCard key={tool.link} {...tool} />
          ))}
        </div>
      </div>
      <div className="flex w-full h-1">
        <div className="flex w-1/4 bg-wm-pink"></div>
        <div className="flex w-1/4 bg-wm-orange"></div>
        <div className="flex w-1/4 bg-wm-teal"></div>
        <div className="flex w-1/4 bg-wm-purple"></div>
      </div>
    </div>
  )
}
