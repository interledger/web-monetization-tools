import React from "react";
import { CornerType, ElementConfigType } from "./types";
import { l } from "node_modules/vite/dist/node/types.d-aGj9QkWt";

export const getEnv = (key: string) => {
  if (typeof window !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const windowEnv = (window as any).ENV;
    return windowEnv[key] ?? undefined;
  }
  const processEnv = process.env;
  return processEnv[key] ?? undefined;
};

const getSelectedFont = (name: string) => {
  switch (name) {
    case "Cookie":
    case "Roboto":
    case "Open Sans":
    case "Titillium Web":
      return name;
    default:
      return `Arial`;
  }
};

export const generateCss = (config: ElementConfigType, returnRaw = false) => {
  const selectedFont = getSelectedFont(config.fontName);
  const buttonBorder =
    config.buttonBorder == CornerType.Light
      ? "0.375rem"
      : config.buttonBorder == CornerType.Pill
      ? "1rem"
      : "0";

  const bannerBorder =
    config.bannerBorder == CornerType.Light
      ? "0.375rem"
      : config.bannerBorder == CornerType.Pill
      ? "1rem"
      : "0";

  const widgetButtonBorder =
    config.widgetButtonBorder == CornerType.Light
      ? "0.375rem"
      : config.widgetButtonBorder == CornerType.Pill
      ? "1rem"
      : "0";

  const css = `       
        .wm_button {
            font-family: ${selectedFont}, system-ui, sans-serif !important;
            font-size: 16px;
            padding: 8px 20px;
            border: 1px solid transparent;
            color: ${config.buttonTextColor};
            background-color: ${config.buttonBackgroundColor};
            border-radius: ${buttonBorder};
            transition: all 0.5s ease;
        }       
        .wm_banner {
            font-family: ${selectedFont}, system-ui, sans-serif !important;
            font-size: 16px;
            padding: 12px 20px;
            border: 1px solid transparent;
            border-radius: ${bannerBorder};
            color: ${config.bannerTextColor};
            background-color: ${config.bannerBackgroundColor};
            transition: all 0.5s ease;
            overflow: hidden;
        }
        .wm_banner h5 {
            font-size: 18px;
        }

        .wm_widget .content {
            font-family: ${selectedFont}, system-ui, sans-serif !important;
            font-size: 14px;
            padding: 12px 20px;
            color: ${config.widgetTextColor};
            background-color: ${config.widgetBackgroundColor};
        }
        .wm_widget .content h5 {
          font-size: 16px;
        }

        .ilpay_body {
          font-family: ${selectedFont}, system-ui, sans-serif !important;
          color: ${config.widgetTextColor};
        }

        .ilpay_body #headlessui-portal-root {
          all:revert;
        }

        .ilpay_body .amount-display,
        .ilpay_body li,
        #extension-pay-form label {
          color: ${config.widgetTextColor};
        }

        #extension-pay-form input {
          color: #000000;
        }

        #extension-pay-form input.disabled {
          background-color: #eeeeee;
          color: #666;
        }

        .ilpay_body button.wmt-formattable-button {
            color: ${config.widgetButtonTextColor};
            background-color: ${config.widgetButtonBackgroundColor};
            border-radius: ${widgetButtonBorder};
            transition: all 0.5s ease;
        }

        .animate {
          animation-name: slideDown;
          animation-duration: 4s;
        }

        @keyframes slideDown {
          0% {
              max-height: 0px;
          }
          100% {
              max-height: 300px;
          }
        }
    `;
  if (returnRaw) {
    return css;
  }

  return React.createElement("style", {
    dangerouslySetInnerHTML: { __html: css },
  });
};

export const isColorLight = (color: string) => {
  let r, g, b, colorPart;

  // Check the format of the color, HEX or RGB?
  if (color.match(/^rgb/)) {
    // If HEX --> separate the red, green, blue values in separate variables
    colorPart =
      color.match(
        /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/
      ) || [];

    r = colorPart[1];
    g = colorPart[2];
    b = colorPart[3];
  } else {
    // If RGB --> Convert it to HEX: http://gist.github.com/983661
    if (color.length < 5) {
      colorPart = +("0x" + color.slice(1).replace(/./g, "$&$&"));
    } else {
      colorPart = +("0x" + color.slice(1));
    }

    r = colorPart >> 16;
    g = (colorPart >> 8) & 255;
    b = colorPart & 255;
  }

  r = Number(r);
  g = Number(g);
  b = Number(b);
  // HSP equation from http://alienryderflex.com/hsp.html
  const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));

  // Using the HSP value, the color is light or not (dark)
  return hsp > 192 ? true : false;
};

const rgbToHex = (r: number, g: number, b: number) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

// Inspired from: https://github.com/sveltejs/svelte/blob/main/sites/svelte-5-preview/src/routes/gzip.js
export const encodeAndCompressCss = async (css: string) => {
  let buffer = "";
  const reader = new Blob([css])
    .stream()
    .pipeThrough(new CompressionStream("gzip"))
    .getReader();

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      reader.releaseLock();
      break;
    } else {
      for (let i = 0; i < value.length; i++) {
        // decoding as utf-8 will make btoa reject the string
        buffer += String.fromCharCode(value[i]);
      }
    }
  }

  return btoa(buffer).replaceAll("+", "-").replaceAll("/", "_");
};
