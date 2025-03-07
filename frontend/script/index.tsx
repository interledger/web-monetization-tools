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
  // add payment pointer / wallet address to target website first
  // pay into this address when displaying embedded element
  appendPaymentPointer(walletAddress)

  for (const key in types) {
    const type = types[Number(key)]
    switch (type) {
      case 'widget': {
        const { shadowHost, shadowRoot } = createShadowDOM()
        const font = getFontFamily(config.widgetFontName, 'widget')
        shadowHost.style.setProperty('--wmt-widget-font', font.selectedFont)
        shadowHost.style.setProperty(
          '--wmt-widget-font-size',
          config.widgetFontSize
        )
        const css = getCSSFile('css/widget.css')
        const element = drawWidget(walletAddress, config)
        shadowRoot.appendChild(css)
        shadowRoot.appendChild(element)
        // font family needs to be outside of the shadow DOM
        document.body.appendChild(font.fontFamily)
        document.body.appendChild(shadowHost)
        break
      }
      case 'button': {
        // Create a single shadow DOM for button overlay
        const { shadowHost: buttonShadowHost, shadowRoot: buttonShadowRoot } = createShadowDOM()
        
        const font = getFontFamily(config.buttonFontName, 'button')
        buttonShadowHost.style.setProperty('--wmt-button-font', font.selectedFont)
        
        // add CSS to shadow DOM (just for overlay styles)
        const css = getCSSFile('css/overlay.css')
        buttonShadowRoot.appendChild(css)
        
        // add overlay container to shadow DOM (shared by all buttons)
        const overlayElement = drawButtonOverlay(walletAddress, config)
        buttonShadowRoot.appendChild(overlayElement)
        
        document.body.appendChild(font.fontFamily)
        document.body.appendChild(buttonShadowHost)
        
        // find and process all button placeholders
        setupButtonPlaceholders(config, buttonShadowRoot)
        break
      }
      case 'banner':
      default: {
        const { shadowHost, shadowRoot } = createShadowDOM()
        const font = getFontFamily(config.bannerFontName, 'banner')
        shadowHost.style.setProperty('--wmt-banner-font', font.selectedFont)
        shadowHost.style.setProperty(
          '--wmt-banner-font-size',
          config.bannerFontSize
        )
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

const drawButtonOverlay = (walletAddress: string, config: Config) => {
  const generateIframeUrl = () => {
    const css = config.css || undefined
    let iframeUrl = `${ILPAY_URL}?amount=1&receiver=https://${encodeURI(walletAddress || '')}&`
    
    if (config.buttonText) {
      iframeUrl += `action=${encodeURI(config.buttonText)}&`
    }
    
    if (css) {
      iframeUrl += `css=${css}&`
    }
    
    return iframeUrl
  }

  // overlay container
  const overlay = document.createElement('div')
  overlay.className = '_wm_tools_button_overlay'
  
  // overlay background
  const backdrop = document.createElement('div')
  backdrop.className = '_wm_tools_button_overlay_backdrop'
  backdrop.addEventListener('click', (e) => {
    e.preventDefault()
    e.stopPropagation()
    overlay.classList.remove('_wm_tools_button_overlay_open')
  })
  
  // overlay content
  const overlayContent = document.createElement('div')
  overlayContent.className = '_wm_tools_button_overlay_content'
  
  // overlay header
  const overlayHeader = document.createElement('div')
  overlayHeader.className = '_wm_tools_button_overlay_header'
  overlayHeader.style.backgroundColor = config.buttonBackgroundColor
  overlayHeader.style.color = config.buttonTextColor
  
  const overlayTitle = document.createElement('h3')
  overlayTitle.textContent = config.buttonText || 'Donate'
  
  const closeButton = document.createElement('button')
  closeButton.type = 'button'
  closeButton.className = '_wm_tools_button_overlay_close'
  closeButton.setAttribute('aria-label', 'Close')
  closeButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>'
  closeButton.addEventListener('click', (e) => {
    e.preventDefault()
    e.stopPropagation()
    overlay.classList.remove('_wm_tools_button_overlay_open')
  })
  
  overlayHeader.appendChild(overlayTitle)
  overlayHeader.appendChild(closeButton)
  
  // interledgerpay iframe
  const overlayBody = document.createElement('div')
  overlayBody.className = '_wm_tools_button_overlay_body'
  
  const iframe = document.createElement('iframe')
  iframe.id = 'button_ilpay_iframe'
  iframe.className = '_wm_tools_button_overlay_iframe'
  iframe.src = generateIframeUrl()
  iframe.title = 'Payment Preview'
  iframe.setAttribute('loading', 'eager')
  
  overlayBody.appendChild(iframe)
  
  // overlay footer
  const overlayFooter = document.createElement('div')
  overlayFooter.className = '_wm_tools_button_overlay_footer'
  
  const poweredBy = document.createElement('a')
  poweredBy.className = '_wm_tools_widget_poweredby'
  poweredBy.innerHTML = `<img src="${FRONTEND_URL}images/powered_by.svg" />`
  overlayFooter.appendChild(poweredBy)
  
  overlayContent.appendChild(overlayHeader)
  overlayContent.appendChild(overlayBody)
  overlayContent.appendChild(overlayFooter)
  
  overlay.appendChild(backdrop)
  overlay.appendChild(overlayContent)
  
  return overlay
}

const setupButtonPlaceholders = (config: Config, buttonShadowRoot: ShadowRoot) => {
  const buttonPlaceholders = document.querySelectorAll('._wm_tools_button')
  
  // font properties for button
  const font = getFontFamily(config.buttonFontName, 'button')
  const buttonFontFamily = `${font.selectedFont}, system-ui, sans-serif`
  const buttonFontSize = `${config.buttonFontSize}px`
  
  buttonPlaceholders.forEach((placeholder) => {
    // create wrapper span to hold the button and tooltip
    const wrapper = document.createElement('span')
    wrapper.style.display = 'inline-block'
    wrapper.style.position = 'relative'
    wrapper.style.verticalAlign = 'baseline'
    
    // create actual button element
    const button = document.createElement('button')
    button.type = 'button'
    button.style.fontFamily = buttonFontFamily
    button.style.fontSize = buttonFontSize
    button.style.padding = '8px 20px'
    button.style.color = config.buttonTextColor
    button.style.backgroundColor = config.buttonBackgroundColor
    button.style.border = '1px solid transparent'
    button.style.borderRadius = config.buttonBorder == 'Light'
      ? '0.375rem'
      : config.buttonBorder == 'Pill'
        ? '1rem'
        : '0'
    button.style.cursor = 'pointer'
    button.style.transition = 'all 0.3s ease'
    button.style.display = 'inline-block'
    button.style.margin = '0'
    button.style.textAlign = 'center'
    button.style.verticalAlign = 'middle'
    button.style.boxSizing = 'border-box'
    button.textContent = config.buttonText || 'Donate'
    
    button.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      
      const overlay = buttonShadowRoot.querySelector('._wm_tools_button_overlay')
      overlay?.classList.add('_wm_tools_button_overlay_open')
    })
    
    // add tooltip if configured
    if (config.buttonTooltip !== '0' && config.buttonDescriptionText) {
      const tooltip = document.createElement('div')
      tooltip.style.position = 'absolute'
      tooltip.style.bottom = 'calc(100% + 10px)'
      tooltip.style.left = '50%'
      tooltip.style.transform = 'translateX(-50%)'
      tooltip.style.padding = '4px 10px'
      tooltip.style.zIndex = '10'
      tooltip.style.maxWidth = '200px'
      tooltip.style.whiteSpace = 'nowrap'
      tooltip.style.textAlign = 'center'
      tooltip.style.marginBottom = '5px'
      tooltip.style.fontFamily = buttonFontFamily
      tooltip.style.fontSize = buttonFontSize
      tooltip.style.color = config.buttonTooltipTextColor
      tooltip.style.backgroundColor = config.buttonTooltipBackgroundColor
      tooltip.style.borderRadius = config.buttonBorder == 'Light'
        ? '0.375rem'
        : config.buttonBorder == 'Pill'
          ? '1rem'
          : '0'
      tooltip.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
      tooltip.style.pointerEvents = 'none'
      
      const test = document.createElement('span')
      test.textContent = config.buttonDescriptionText
      test.style.whiteSpace = 'nowrap'
      tooltip.appendChild(test)
      
      // tooltip arrow
      const tooltipArrow = document.createElement('div')
      tooltipArrow.style.position = 'absolute'
      tooltipArrow.style.width = '14px'
      tooltipArrow.style.height = '14px'
      tooltipArrow.style.bottom = '-7px'
      tooltipArrow.style.left = '50%'
      tooltipArrow.style.transform = 'translateX(-50%) rotate(45deg)'
      tooltipArrow.style.backgroundColor = config.buttonTooltipBackgroundColor
      tooltipArrow.style.pointerEvents = 'none'
      tooltip.appendChild(tooltipArrow)
      
      if (config.buttonTooltip === '2') {
        tooltip.style.opacity = '0'
        tooltip.style.visibility = 'hidden'
        
        wrapper.addEventListener('mouseenter', () => {
          tooltip.style.opacity = '1'
          tooltip.style.visibility = 'visible'
        })
        
        wrapper.addEventListener('mouseleave', () => {
          tooltip.style.opacity = '0'
          tooltip.style.visibility = 'hidden'
        })
      }
      
      wrapper.appendChild(tooltip)
    }
    
    wrapper.appendChild(button)
    
    // replace the placeholder with wrapper
    placeholder.replaceWith(wrapper)
  })
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

  const triggerIcon = config?.widgetTriggerIcon
    ? config?.widgetTriggerIcon
    : `${FRONTEND_URL}images/wm_logo_animated.svg`

  const trigger = document.createElement('div')
  trigger.className = '_wm_tools_widget_trigger'
  trigger.style.backgroundColor = config.widgetTriggerBackgroundColor
  trigger.innerHTML = `
        <img
          src="${triggerIcon}"
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
