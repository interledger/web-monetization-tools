/**
 * Convert a ReadableStream to a JSON object
 * for both cloudflare workers and node environments
 * @param stream - the ReadableStream to convert
 */
export async function streamToJson<T>(stream: ReadableStream | NodeJS.ReadableStream): Promise<T> {
  if ((stream instanceof ReadableStream)) {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let chunks = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }
        chunks += decoder.decode(value, { stream: true });
      }
      chunks += decoder.decode();

      return JSON.parse(chunks) as T;
    } catch (error) {
      console.error("Error converting stream to JSON:", error);
      throw error;
    } finally {
      reader.releaseLock();
    }
  }

  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = []
    stream.on('data', (chunk) => chunks.push(chunk))
    stream.on('end', () =>
      resolve(JSON.parse(Buffer.concat(chunks).toString('utf-8')))
    )
    stream.on('error', reject)
  })
}

/**
 * @param obj
 * @param levelCount
 * @returns Record<string, any>
 * @description Returns only properties that are at least levelCount deep
 */
/* eslint-disable  @typescript-eslint/no-explicit-any */
export const filterDeepProperties = (
  obj: Record<string, any>,
  levelCount: number = 2
): Record<string, any> => {
  const result: Record<string, any> = {}

  const traverse = (
    current: any,
    path: string[],
    parent: Record<string, any>
  ) => {
    if (typeof current === 'object' && current !== null) {
      for (const key in current) {
        if (Object.prototype.hasOwnProperty.call(current, key)) {
          const newPath = [...path, key]

          if (typeof current[key] === 'object' && current[key] !== null) {
            // Ensure parent structure exists
            if (path.length === 0) {
              if (!result[key]) result[key] = {}
              traverse(current[key], newPath, result[key])
            } else {
              if (!parent[key]) parent[key] = {}
              traverse(current[key], newPath, parent[key])
            }
          } else if (path.length >= levelCount - 1) {
            // Only keep properties that are at least levelCount levels deep
            if (!result[path[0]]) result[path[0]] = {}
            result[path[0]][key] = current[key]
          }
        }
      }
    }
  }

  traverse(obj, [], result)
  return result
}
