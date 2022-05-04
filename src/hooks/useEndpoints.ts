import { ApiKeysOption, ConnectionType, Network } from "../types"
import { Provider } from "../types"
import { useEffect } from "react"
import { createFallbackProvider } from "../utils/createFallbackProvider"
import { extractEndpoints } from "../utils/createNetworkInterface"

/**
 * This hook create a Fallback provider with several providers (with API KEYS or not)
 * It render only for one network, otherwise the page is reload (or can it be reuse for multichain?)
 * @returns Fallback provider
 */

export const useEndpoints = (
  connectionType: ConnectionType,
  setProvider: React.Dispatch<React.SetStateAction<Provider>>,
  provider: Provider,
  chainId: number,
  customNetworks: Network[],
  apiKeys: ApiKeysOption
) => {
  useEffect(() => {
    if (!provider) {
      if (connectionType === "endpoints") {
        setProvider((p) => {
          if (!p) {
            const provider = createFallbackProvider(
              chainId,
              apiKeys,
              extractEndpoints(chainId, customNetworks)
            )
            window.localStorage.removeItem("network-to-initialize")
            return provider
          }
          return p
        })
      } else return
    }
  }, [setProvider, connectionType, chainId, customNetworks, provider, apiKeys])
}
