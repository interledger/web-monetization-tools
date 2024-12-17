import type { MetaFunction } from '@remix-run/node'
import { TypeCard } from '~/components/index.js'
import { availableTools } from '~/lib/presets.js'

export const meta: MetaFunction = () => {
  return [
    { title: 'WebMonetization Tools' },
    { name: 'description', content: 'Choose and configure your elements!' }
  ]
}

const tools = [

  {
    enabled: true,
    title: "Banner",
    image: "banner_representation.svg",
    bgColor: "from-wm-dark-green to-wm-dark-green-fade",
    link: "create/banner",
    description:
      "A banner to display on your website for visitors who do not have WM extension active. A call-to-action with a link to the extension or description of the options. It will also add a paiment pointer to your website."
  },
  {
    enabled: true,
    title: "Widget",
    image: "widget_representation.svg",
    bgColor: "from-wm-red to-wm-red-fade",
    link: "create/widget",
    description:
      "A widget to display a small explanation or description of your choice and a solution for donations or a one-time payment, even for visitors who do not have the WM extension active."
  },
  {
    enabled: true,
    title: "Button",
    image: "button_representation.svg",
    bgColor: "from-wm-green to-wm-green-fade",
    link: "create/button",
    description:
      "Add a custom button to your website with a short tooltip, that triggers a payment option for donations or one-time payments in a full page overlay, for a convenient option for your visitors to support your work / content."
  },
  {
    enabled: false,
    title: "Exclusive content",
    image: "exclusive_representation.svg",
    bgColor: "from-wm-green to-wm-green-fade",
    link: "create/exclusive",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam dictum felis eget dui ullamcorper, sit amet hendrerit ante sollicitudin. Donec eget metus lectus."
  },
].filter((tool) => tool.enabled)

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
