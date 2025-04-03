import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { getDefaultData } from '../../lib/server/s3.server'
import { corsHeaders } from '../../lib/server/cors.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const defaultData = await getDefaultData()
    return json(JSON.parse(defaultData), { headers: corsHeaders })
  } catch (error) {
    console.error('Error fetching default config:', error)
    return json(
      { error: 'Failed to fetch default config' },
      {
        status: 500,
        headers: corsHeaders
      }
    )
  }
}
