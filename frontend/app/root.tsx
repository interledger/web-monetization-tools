import {
  type LinksFunction,
  type LoaderFunctionArgs,
  type MetaFunction,
  json
} from '@remix-run/cloudflare'
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
  isRouteErrorResponse
} from '@remix-run/react'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import stylesheet from '~/tailwind.css?url'
import { Button, Footer, Header, Snackbar } from './components/index.js'
import { XCircle } from './components/icons.js'
import { cx } from 'class-variance-authority'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  const contentOnlyParam = url.searchParams.get('contentOnly')

  let message

  if (!message) {
    return json({ message: null, contentOnlyParam })
  }

  return json({ message, contentOnlyParam })
}

export default function App() {
  const { message, contentOnlyParam } = useLoaderData<typeof loader>()
  const [snackbarOpen, setSnackbarOpen] = useState(false)

  const contentOnly = contentOnlyParam != null

  useEffect(() => {
    if (!message) {
      return
    }
    setSnackbarOpen(true)
  }, [message])

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-screen">
        <main className="h-auto min-h-full flex flex-col justify-between">
          <div
            className={cx(
              'h-full flex flex-col',
              !contentOnly
                ? 'bg-[url(/images/bg-tile.svg)] bg-[auto_25em]'
                : 'bg-transparent'
            )}
          >
            {!contentOnly && <Header />}
            <Outlet />
          </div>
          {!contentOnly && <Footer />}
        </main>
        <Snackbar
          id="snackbar"
          onClose={() => setSnackbarOpen(false)}
          show={snackbarOpen}
          message={message}
          dismissAfter={2000}
        />
        <ScrollRestoration />
        <Scripts crossOrigin="" />
      </body>
    </html>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()

  const ErrorPage = ({ children }: { children: ReactNode }) => {
    return (
      <html lang="en" className="h-full">
        <head>
          <Meta />
          <Links />
        </head>
        <body className="h-full text-tealish">
          <div className="min-h-full">
            <div className="flex pt-20 md:pt-0 flex-1 flex-col">
              <main className="grid min-h-screen place-items-center">
                {children}
              </main>
            </div>
          </div>
          <ScrollRestoration />
          <Scripts />
        </body>
      </html>
    )
  }

  if (isRouteErrorResponse(error)) {
    return (
      <ErrorPage>
        <div className="flex items-center justify-center flex-col bg-white p-10 rounded-md shadow-md space-y-2">
          <h4 className="font-semibold text-xl -tracking-widest text-[#F37F64]">
            {error.status}
          </h4>
          <h2 className="text-xl">{error.statusText}</h2>
          <Button to="/" aria-label="go to homepage">
            Go to homepage
          </Button>
        </div>
      </ErrorPage>
    )
  }

  let errorMessage = 'Unknown error'
  if (error instanceof Error) {
    errorMessage = error.message
  }

  return (
    <ErrorPage>
      <div className="flex items-center justify-center flex-col bg-white p-10 rounded-md shadow-md space-y-5">
        <div className="grid place-items-center">
          <XCircle className="w-10 h-10 text-red-500" />
          <p className="text-lg font-semibold">
            There was an issue with your request.
          </p>
        </div>
        <div>
          <span className="font-light">Cause:</span> <span>{errorMessage}</span>
        </div>
        <Button to={'/'} aria-label="go to homepage">
          Go to homepage
        </Button>
      </div>
    </ErrorPage>
  )
}

export const meta: MetaFunction = () => [
  { title: 'WebMonetization Tools' },
  { charset: 'utf-8' },
  { name: 'viewport', content: 'width=device-width,initial-scale=1' }
]

export const links: LinksFunction = () => [
  {
    rel: 'apple-touch-icon',
    sizes: '180x180',
    href: '/images/favicon.png'
  },
  {
    rel: 'icon',
    type: 'image/png',
    sizes: '32x32',
    href: '/images/favicon.png'
  },
  {
    rel: 'icon',
    type: 'image/png',
    sizes: '16x16',
    href: '/images/favicon.png'
  },
  {
    rel: 'icon',
    href: '/favicon.ico',
    type: 'image/x-icon'
  },
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous'
  },
  { rel: 'stylesheet', href: stylesheet }
]
