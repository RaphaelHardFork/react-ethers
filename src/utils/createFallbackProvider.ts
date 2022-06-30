import {
  FallbackProvider,
  FallbackProviderConfig,
  Provider as EthersProvider,
} from "@ethersproject/providers"
import { ethers } from "ethers"
import { ApiKeysOption } from "../types"

// should create a Fallback provider with default config of Ethers.js and also with custom RPC endpoint AND integrate API
export const defaultApiOption = {
  infura: undefined,
  etherscan: undefined,
  alchemy: undefined,
  pocket: undefined,
  quorum: 0,
}

export const createFallbackProvider = (
  chainId: number,
  apiKeys: ApiKeysOption = defaultApiOption,
  endpoints: string[]
) => {
  if ([1, 3, 4, 5, 42].includes(chainId)) {
    if (chainId === 1) {
      apiKeys.quorum = 2
    } else {
      apiKeys.quorum = 1
    }

    const { providerConfigs } = ethers.getDefaultProvider(chainId, {
      apiKeys,
    }) as FallbackProvider

    return new ethers.providers.FallbackProvider(
      providerConfigs as (EthersProvider | FallbackProviderConfig)[]
    )
  } else {
    const providerConfigs = []
    for (const endpoint of endpoints) {
      try {
        const jsonRPC = new ethers.providers.JsonRpcProvider(endpoint)
        providerConfigs.push(jsonRPC)
      } catch (e) {
        console.warn(e)
      }
    }

    if (providerConfigs.length > 0) {
      return new ethers.providers.FallbackProvider(
        providerConfigs as (EthersProvider | FallbackProviderConfig)[]
      )
    } else {
      console.warn(
        "No endpoint available for the chainId:" +
          chainId +
          "\nAdd it in your config (on the EVMContext) and reload the page"
      )
      return null
    }
  }
}
