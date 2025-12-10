// Backend configuration utility

export interface BackendConfig {
  url: string
  port?: string
  updatedAt: string
}

export function getBackendConfig(): BackendConfig | null {
  if (typeof window === "undefined") return null

  const savedConfig = localStorage.getItem("backendConfig")
  if (!savedConfig) return null

  try {
    return JSON.parse(savedConfig)
  } catch (error) {
    console.error("[v0] Error parsing backend config:", error)
    return null
  }
}

export function getBackendUrl(): string {
  const config = getBackendConfig()
  if (!config) {
    // Return default backend URL if not configured
    return process.env.NEXT_PUBLIC_BACKEND_URL || "http://20.224.40.56:8088"
  }

  return config.port ? `${config.url}:${config.port}` : config.url
}

export function getBackendUrlFromRequest(request: Request): string {
  const backendUrl = request.headers.get("x-backend-url")
  return backendUrl || process.env.NEXT_PUBLIC_BACKEND_URL || "http://20.224.40.56:8088"
}

export function setBackendConfig(config: BackendConfig): void {
  if (typeof window === "undefined") return

  localStorage.setItem("backendConfig", JSON.stringify(config))
}

export function clearBackendConfig(): void {
  if (typeof window === "undefined") return

  localStorage.removeItem("backendConfig")
}
