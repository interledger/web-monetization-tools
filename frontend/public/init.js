const FRONTEND_URL = "https://localhost:5100/"
const API_URL = "https://localhost:5101/"
// const ILPAY_URL = "http://localhost:3000/extension/"
const ILPAY_URL = "https://interledgerpay.com/extension/"

const scriptUrl = new URL(import.meta.url)
const params = new URLSearchParams(scriptUrl.search)
const paramTypes = (params.get("types") || "").split("|")
const paramWallet = params.get("wa")
const urlWallet = encodeURIComponent(params.get("wa"))

// check
if (!paramTypes || !paramWallet) {
  throw "Missing parameters! Could not initialise WM Tools."
}

fetch(`${API_URL}tools/${urlWallet}`)
  .then((response) => response.json())
  .then((resp) => {
    const config = resp
    drawElement(paramTypes, paramWallet, config)
  })
  .catch((error) => console.log(error))

// functions
const getWebMonetizationLink = () => {
  const userAgent = navigator.userAgent

  // Detect browsers
  if (userAgent.includes("Firefox")) {
    return `Get the&nbsp;<a rel="noindex nofollow" target="_blank" href="https://addons.mozilla.org/en-US/firefox/addon/web-monetization-extension/">extension</a>`
  } else if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) {
    return `Get the&nbsp;<a rel="noindex nofollow" target="_blank" href="https://chromewebstore.google.com/detail/web-monetization-extensio/oiabcfomehhigdepbbclppomkhlknpii">extension</a>`
    //   } else if (userAgent.includes("Edg")) {
    //     return "Microsoft Edge"
    //   } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
    //     return "Safari"
    //   } else if (userAgent.includes("MSIE") || userAgent.includes("Trident")) {
    //     return "Internet Explorer"
  } else {
    return `Learn more <a rel="noindex nofollow" target="_blank" href="https://webmonetization.org/">here</a>.`
  }
}

const createShadowDOM = () => {
  const shadowHost = document.createElement("div")
  const shadowRoot = shadowHost.attachShadow({ mode: "open" })

  return { shadowHost, shadowRoot }
}

const getCSSFile = (url) => {
  const link = document.createElement("link")

  link.rel = "stylesheet"
  link.type = "text/css"
  link.href = `${FRONTEND_URL}${url}`

  return link
}

const addIframeCss = (config) => {
  const selectedFont = ""

  const widgetButtonBorder =
    config.widgetButtonBorder == "Light"
      ? "0.375rem"
      : config.widgetButtonBorder == "Pill"
      ? "1rem"
      : "0"

  return `
        .ilpay_body {
            font-family: ${selectedFont}, system-ui, sans-serif !important;
            color: ${config.widgetTextColor};
        }
        .ilpay_body button.wmt-formattable-button {
            color: ${config.widgetButtonTextColor};
            background-color: ${config.widgetButtonBackgroundColor};
            border-radius: ${widgetButtonBorder};
            transition: all 0.5s ease;
        }
        .ilpay_body .amount-display,
        .ilpay_body li,
        #extension-pay-form label {
          color: ${config.widgetTextColor};
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
        }
    `
}

const drawElement = (types, walletAddress, config) => {
  const { shadowHost, shadowRoot } = createShadowDOM()

  for (let key in types) {
    const type = types[key]
    switch (type) {
      case "widget": {
        const css = getCSSFile("css/widget.css")
        // const style = addIframeCss(config)
        const element = drawWidget(walletAddress, config)
        shadowRoot.appendChild(css)
        shadowRoot.appendChild(element)
        document.body.appendChild(shadowHost)
        break
      }
      case "banner":
      default:
        // add the monetization link first,
        // so we have something to check against when displaying the banner
        const monetizationElement = document.createElement("link")
        monetizationElement.rel = "monetization"
        monetizationElement.href = `https://${walletAddress}`
        document.body.appendChild(monetizationElement)

        const css = getCSSFile("css/banner.css")
        const element = drawBanner(config)
        if (element) {
          shadowRoot.appendChild(css)
          shadowRoot.appendChild(element)
        }
        document.body.appendChild(shadowHost)
    }
  }
}

const drawBanner = (config) => {
  // check if user closed the banner
  const closedByUser = sessionStorage.getItem("_wm_tools_closed_by_user")

  // check if user / visitor has monetization
  const monetizationLinks = document.querySelector("link[rel=monetization]")
  if (
    (monetizationLinks && monetizationLinks.relList.supports("monetization")) ||
    closedByUser
  ) {
    // prevent element being created, if the extension is installed
    return
  }

  const element = document.createElement("div")
  element.className = "_wm_tools_banner"

  const position = config.bannerPosition
    ? config.bannerPosition.toLowerCase()
    : "bottom"
  element.classList.add(`_wm_tools_banner_${position}`)

  if (config.bannerSlideAnimation != "None") {
    const animation =
      config.bannerSlideAnimation && position == "top" ? "down" : "up"
    element.classList.add(`_wm_tools_banner_${animation}`)
  }

  // custom styles for the element
  element.style.color = config.bannerTextColor
  element.style.backgroundColor = config.bannerBackgroundColor

  const bannerBorder =
    config.bannerBorder == "Light"
      ? "0.375rem"
      : config.bannerBorder == "Pill"
      ? "1rem"
      : "0"
  element.style.borderRadius = bannerBorder

  const bannerHeader = document.createElement("div")
  bannerHeader.className = "_wm_tools_banner_header"
  if (config.bannerTitleText) {
    bannerHeader.innerHTML = `<h5>${config.bannerTitleText}</h5>`
  } else {
    bannerHeader.innerHTML = `<span></span>`
  }
  const closeButton = document.createElement("span")
  closeButton.innerHTML = "x"
  closeButton.addEventListener("click", () => {
    sessionStorage.setItem("_wm_tools_closed_by_user", true)
    element.classList.add("_wm_tools_hidden")
  })
  bannerHeader.append(closeButton)

  element.append(bannerHeader)
  element.insertAdjacentHTML(
    "beforeend",
    `<span>${config.bannerDescriptionText}</span>`
  )
  element.insertAdjacentHTML(
    "beforeend",
    `<span class="_wm_link">${getWebMonetizationLink()}</span>`
  )

  return element
}

const drawWidget = (walletAddress, config) => {
  const vpHeight = window.innerHeight
  const vpWidth = window.innerWidth
  const element = document.createElement("div")
  element.className = "_wm_tools_widget"

  const content = document.createElement("div")
  content.className = "_wm_tools_widget_content"
  // custom styles for the element
  content.style.color = config.widgetTextColor
  content.style.backgroundColor = config.widgetBackgroundColor

  const css = config.css || undefined
  let iframeUrl = `${ILPAY_URL}?receiver=https://${encodeURI(
    walletAddress || ""
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

  const poweredBy = document.createElement("a")
  poweredBy.className = "_wm_tools_widget_poweredby"
  poweredBy.innerHTML = `<img src="${FRONTEND_URL}images/powered_by.svg" />`
  content.appendChild(poweredBy)

  element.appendChild(content)

  const trigger = document.createElement("div")
  trigger.className = "_wm_tools_widget_trigger"
  trigger.innerHTML = `
        <img
          src="${FRONTEND_URL}images/widget_logo.svg"
          alt="widget trigger"
        />`
  trigger.addEventListener("click", () => {
    if (vpHeight < 710) {
      content.classList.toggle("_wm_short_screen")
    }
    if (vpWidth < 400) {
      content.classList.toggle("_wm_small_screen")
    }
    content.classList.toggle("_wm_tools_widget_open")
  })
  element.appendChild(trigger)

  return element
}
