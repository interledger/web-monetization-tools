/* eslint-disable no-case-declarations */
const FRONTEND_URL = import.meta.env.VITE_SCRIPT_FRONTEND_URL
const API_URL = import.meta.env.VITE_SCRIPT_API_URL
const ILPAY_URL = import.meta.env.VITE_SCRIPT_ILPAY_URL

let paramTypes: string[] | undefined, paramWallet: string | undefined, urlWallet

// TODO: Have a defined interface for the config
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Config = Record<string, any>

const currentScript = document.getElementById(
  'wmt-init-script'
) as HTMLScriptElement
if (currentScript) {
  const scriptUrl = new URL(currentScript.src)
  const params = new URLSearchParams(scriptUrl.search)
  paramTypes = (params.get('types') || '').split('|')
  paramWallet = params.get('wa') || undefined
  urlWallet = encodeURIComponent(params.get('wa') || '')
}

// check
if (!paramTypes || !paramWallet) {
  throw 'Missing parameters! Could not initialise WM Tools.'
}

fetch(`${API_URL}tools/${urlWallet}`)
  .then((response) => response.json())
  .then((resp) => {
    const config = resp
    drawElement(paramTypes, paramWallet as string, config)
  })
  .catch((error) => console.log(error))

// functions
const getWebMonetizationLink = () => {
  const userAgent = navigator.userAgent

  // Detect browsers
  if (userAgent.includes('Firefox')) {
    return `Get the&nbsp;<a rel="noindex nofollow" target="_blank" href="https://addons.mozilla.org/en-US/firefox/addon/web-monetization-extension/">extension</a>`
  } else if (
    userAgent.includes('Chrome') &&
    !userAgent.includes('Edg') &&
    !userAgent.includes('OPR')
  ) {
    return `Get the&nbsp;<a rel="noindex nofollow" target="_blank" href="https://chromewebstore.google.com/detail/web-monetization-extensio/oiabcfomehhigdepbbclppomkhlknpii">extension</a>`
  } else if (userAgent.includes('Edg')) {
    return `Get the&nbsp;<a rel="noindex nofollow" target="_blank" href="https://microsoftedge.microsoft.com/addons/detail/web-monetization-extensio/imjgemgmeoioefpmfefmffbboogighjl">extension</a>`
    //   } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
    //     return "Safari"
    //   } else if (userAgent.includes("MSIE") || userAgent.includes("Trident")) {
    //     return "Internet Explorer"
  } else {
    return `Learn more&nbsp;<a rel="noindex nofollow" target="_blank" href="https://webmonetization.org/">here</a>.`
  }
}

const createShadowDOM = () => {
  const shadowHost = document.createElement('div')
  const shadowRoot = shadowHost.attachShadow({ mode: 'open' })

  return { shadowHost, shadowRoot }
}

const appendPaymentPointer = (walletAddress: string) => {
  const monetizationElement = document.createElement('link')
  monetizationElement.rel = 'monetization'
  monetizationElement.href = `https://${walletAddress}`
  document.head.appendChild(monetizationElement)
}

const getCSSFile = (url: string) => {
  const link = document.createElement('link')

  link.rel = 'stylesheet'
  link.type = 'text/css'
  link.href = `${FRONTEND_URL}${url}`

  return link
}

const allowedFonts = ['Cookie', 'Roboto', 'Open Sans', 'Titillium Web', `Arial`]
const getFontFamily = (family: string, forElement: string = 'banner') => {
  // if exists remove it
  const currentFontFamily = document.getElementById(
    `wmt-font-family-${forElement}`
  ) as HTMLLinkElement
  if (currentFontFamily) {
    currentFontFamily.remove()
  }

  let selectedFont = 'Arial'
  if (allowedFonts.indexOf(family) != -1) {
    selectedFont = family
  }

  const styleObj = document.createElement('link') as HTMLLinkElement
  styleObj.id = `wmt-font-family-${forElement}`
  styleObj.rel = 'stylesheet'
  styleObj.type = 'text/css'

  switch (selectedFont) {
    case 'Open Sans':
      styleObj.href = `https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap`
      break
    case 'Cookie':
      styleObj.href = `https://fonts.googleapis.com/css2?family=Cookie&display=swap`
      break
    case 'Roboto':
      styleObj.href = `https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap`
      break
    default:
      styleObj.href = `https://fonts.googleapis.com/css2?family=Titillium+Web:ital,wght@0,200;0,300;0,400;0,600;0,700;0,900;1,200;1,300;1,400;1,600;1,700&display=swap`
  }

  return { fontFamily: styleObj, selectedFont }
}

const drawElement = (
  types: string[] | undefined,
  walletAddress: string,
  config: Config
) => {
  const { shadowHost, shadowRoot } = createShadowDOM()

  // add payment pointer / wallet address to target website first
  // so we have something to check against when displaying the banner
  appendPaymentPointer(walletAddress)

  for (const key in types) {
    const type = types[Number(key)]
    switch (type) {
      case 'widget': {
        const font = getFontFamily(config.widgetFontName, 'widget')
        shadowHost.style.setProperty('--wmt-widget-font', font.selectedFont)
        const css = getCSSFile('css/widget.css')
        const element = drawWidget(walletAddress, config)
        shadowRoot.appendChild(css)
        shadowRoot.appendChild(element)
        // font family needs to be outside of the shadow DOM
        document.body.appendChild(font.fontFamily)
        document.body.appendChild(shadowHost)
        break
      }
      case 'banner':
      default:
        const font = getFontFamily(config.bannerFontName, 'banner')
        shadowHost.style.setProperty('--wmt-banner-font', font.selectedFont)
        const css = getCSSFile('css/banner.css')
        const element = drawBanner(config)
        if (element) {
          shadowRoot.appendChild(css)
          shadowRoot.appendChild(element)
        }
        // font family needs to be outside of the shadow DOM
        document.body.appendChild(font.fontFamily)
        document.body.appendChild(shadowHost)
    }
  }
}

const drawBanner = (config: Config) => {
  // check if user closed the banner
  const closedByUser = sessionStorage.getItem('_wm_tools_closed_by_user')

  // check if user / visitor has monetization
  const monetizationLinks = document.querySelector<HTMLLinkElement>(
    'link[rel=monetization]'
  )
  if (
    (monetizationLinks && monetizationLinks.relList.supports('monetization')) ||
    closedByUser
  ) {
    // prevent element being created, if the extension is installed
    return
  }

  const element = document.createElement('div')
  element.className = '_wm_tools_banner'

  const position = config.bannerPosition
    ? config.bannerPosition.toLowerCase()
    : 'bottom'
  element.classList.add(`_wm_tools_banner_${position}`)

  if (config.bannerSlideAnimation != 'None') {
    const animation =
      config.bannerSlideAnimation && position == 'top' ? 'down' : 'up'
    element.classList.add(`_wm_tools_banner_${animation}`)
  }

  // custom styles for the element
  element.style.color = config.bannerTextColor
  element.style.backgroundColor = config.bannerBackgroundColor

  const bannerBorder =
    config.bannerBorder == 'Light'
      ? '0.375rem'
      : config.bannerBorder == 'Pill'
        ? '1rem'
        : '0'
  element.style.borderRadius = bannerBorder

  const bannerHeader = document.createElement('div')
  bannerHeader.className = '_wm_tools_banner_header'
  if (config.bannerTitleText) {
    bannerHeader.innerHTML = `<h5>${config.bannerTitleText}</h5>`
  } else {
    bannerHeader.innerHTML = `<span></span>`
  }
  const closeButton = document.createElement('span')
  closeButton.innerHTML = 'x'
  closeButton.addEventListener('click', () => {
    sessionStorage.setItem('_wm_tools_closed_by_user', 'true')
    element.classList.add('_wm_tools_hidden')
  })
  bannerHeader.append(closeButton)

  element.append(bannerHeader)
  element.insertAdjacentHTML(
    'beforeend',
    `<span>${config.bannerDescriptionText}</span>`
  )
  element.insertAdjacentHTML(
    'beforeend',
    `<span class="_wm_link">${getWebMonetizationLink()}</span>`
  )

  return element
}

const drawWidget = (walletAddress: string, config: Config) => {
  const vpHeight = window.innerHeight
  const vpWidth = window.innerWidth
  const element = document.createElement('div')
  element.className = '_wm_tools_widget'

  const content = document.createElement('div')
  content.className = '_wm_tools_widget_content'
  // custom styles for the element
  content.style.color = config.widgetTextColor
  content.style.backgroundColor = config.widgetBackgroundColor

  const css = config.css || undefined
  let iframeUrl = `${ILPAY_URL}?receiver=https://${encodeURI(
    walletAddress || ''
  )}&`
  if (config.widgetButtonText) {
    iframeUrl += `action=${encodeURI(config.widgetButtonText)}&`
  }
  if (css) {
    iframeUrl += `css=${css}&`
  }

  content.innerHTML = `
        <div class="_wm_tools_widget_header">
          <h5>${config.widgetTitleText}</h5>
          <p>${config.widgetDescriptionText}</p>
        </div>
        <div class="_wm_tools_widget_iframe_wrapper"> 
          <iframe
            id="ilpay_iframe"
            class="_wm_tools_widget_iframe"
            src=${iframeUrl}
          />
        </div>`

  const poweredBy = document.createElement('a')
  poweredBy.className = '_wm_tools_widget_poweredby'
  poweredBy.innerHTML = `<img src="${FRONTEND_URL}images/powered_by.svg" />`
  content.appendChild(poweredBy)

  element.appendChild(content)

  const trigger = document.createElement('div')
  trigger.className = '_wm_tools_widget_trigger'
  trigger.style.backgroundColor = config.widgetBackgroundColor
  trigger.innerHTML = `
        <img
          src="${FRONTEND_URL}images/wm_logo_animated.svg"
          alt="widget trigger"
        />`
  trigger.addEventListener('click', () => {
    if (vpHeight < 710) {
      content.classList.toggle('_wm_short_screen')
    }
    if (vpWidth < 400) {
      content.classList.toggle('_wm_small_screen')
    }
    content.classList.toggle('_wm_tools_widget_open')
  })
  element.appendChild(trigger)

  return element
}
