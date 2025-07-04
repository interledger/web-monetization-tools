import type { MetaFunction } from '@remix-run/cloudflare'
import { TypeCard } from '~/components/index.js'
import { availableTools } from '~/lib/presets.js'

const DEFAULT_TITLE = 'Publisher Tools'
const DEFAULT_DESCRIPTION = 'Choose and configure your elements!'
const DEFAULT_IMAGE_URL = 'https://webmonetization.org/img/wm-social.png'
const DEFAULT_URL = 'https://webmonetization.org/tools'
const SITE_NAME = 'Web Monetization'

export const meta: MetaFunction = () => {
  const title = DEFAULT_TITLE
  const description = DEFAULT_DESCRIPTION
  const imageUrl = DEFAULT_IMAGE_URL
  const pageUrl = DEFAULT_URL

  return [
    { title },
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:image', content: imageUrl },
    { property: 'og:url', content: pageUrl },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: SITE_NAME },
    { tagName: 'link', rel: 'canonical', href: pageUrl }
  ]
}
export default function Index() {
  return (
    <div className="h-full p-14">
      <div className="flex flex-wrap justify-center gap-6 max-w-prosex p-4 mx-auto">
        {availableTools.map((tool) => (
          <TypeCard key={tool.link} {...tool} />
        ))}
      </div>
    </div>
  )
}
