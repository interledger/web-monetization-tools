const FRONTEND_URL = "http://localhost:5100/"
const API_URL = "http://localhost:5101/"
const ILPAY_URL = "https://localhost:5200/extension/"

const scriptUrl = new URL(import.meta.url)
const params = new URLSearchParams(scriptUrl.search)
const paramType = params.get("type")
const paramWallet = params.get("wa")

var config = fetch(`${API_URL}tools/default`)
  .then((response) => response.json())
  .then((resp) => {
    const config = resp
    drawElement(paramType, paramWallet, config)
  })
  .catch((error) => console.log(error))

//   functions

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

const drawElement = (type, walletAddress, config) => {
  const { shadowHost, shadowRoot } = createShadowDOM()

  switch (type) {
    case "widget": {
      const css = getCSSFile("css/widget.css")
      const style = addIframeCss(config)
      const element = drawWidget(walletAddress, config)
      shadowRoot.appendChild(css)
      shadowRoot.appendChild(element)
      document.body.appendChild(shadowHost)
      setTimeout(() => {
        const iframe = shadowRoot.getElementById("ilpay_iframe")
        const iframeContent = iframe.contentWindow
        if (iframe && iframeContent) { console.log("WTF")
            iframeContent.postMessage({ configCss: style }, "*")
          }
      }, 1500)
      break
    }
    case "banner":
    default:
      const css = getCSSFile("css/banner.css")
      const element = drawBanner(walletAddress, config)
      shadowRoot.appendChild(css)
      shadowRoot.appendChild(element)
      document.body.appendChild(shadowHost)
  }
}

const drawBanner = (walletAddress, config) => {
  // check if user / visitor has monetization
  const monetizationLinks = document.querySelector("link[rel=monetization]")
  if (
    !(monetizationLinks && monetizationLinks.relList.supports("monetization"))
  ) {
    // prevent element being created
    console.log("here")
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

  if (config.bannerTitleText) {
    element.innerHTML = `<h5>${config.bannerTitleText}</h5>`
  }
  element.innerHTML += `<span>${config.bannerDescriptionText}</span>`
  element.innerHTML += `<span class="_wm_link">${getWebMonetizationLink()}</span>`
  element.innerHTML += `<link rel="monetization" href="${walletAddress}" />`

  return element
}

const drawWidget = (walletAddress, config) => {
  const element = document.createElement("div")
  element.className = "_wm_tools_widget"

  const content = document.createElement("div")
  content.className = "_wm_tools_widget_content"
  // custom styles for the element
  content.style.color = config.widgetTextColor
  content.style.backgroundColor = config.widgetBackgroundColor

  const iframeUrl = `${ILPAY_URL}?action=${encodeURI(
    config.widgetButtonText
  )}&receiver=https://${encodeURI(walletAddress || "")}`
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
    content.classList.toggle("_wm_tools_widget_open")
  })
  element.appendChild(trigger)

  return element
}
