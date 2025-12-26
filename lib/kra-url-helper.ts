export function buildKraBaseUrl(
  serverAddress: string | null | undefined,
  serverPort: string | null | undefined
): string {
  const DEFAULT_SERVER = '5.189.171.160'
  const DEFAULT_PORT = '8088'
  
  if (!serverAddress) {
    return `http://${DEFAULT_SERVER}:${serverPort || DEFAULT_PORT}`
  }
  
  let address = serverAddress.trim()
  
  const hasScheme = /^https?:\/\//i.test(address)
  if (hasScheme) {
    address = address.replace(/^https?:\/\//i, '')
  }
  
  address = address.replace(/\/+$/, '')
  
  const hasPort = /:\d+$/.test(address)
  
  if (hasPort) {
    return `http://${address}`
  }
  
  return `http://${address}:${serverPort || DEFAULT_PORT}`
}
