const BASE = '/api'

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  if (!res.ok) {
    let msg = `请求失败 (${res.status})`
    try {
      const data = await res.json()
      msg = data.detail || data.message || msg
    } catch {
      /* keep default message */
    }
    throw new Error(msg)
  }

  if (res.status === 204) {
    return undefined as T
  }
  return (await res.json()) as T
}
