import { Networkish } from "@ethersproject/networks"
import { FallbackProvider } from "@ethersproject/providers"

export const readNetwork = () => {
  const network = window.localStorage.getItem("switched-network")
  if (network === null) return undefined

  return _translateChainId(network) as Networkish
}

export const extractProvidersConfig = (defaultProvider: FallbackProvider) => {
  return defaultProvider.providerConfigs
}

export const createApiOptions = () => {
  return {
    infura: undefined,
    etherscan: undefined,
    alchemy: undefined,
    pocket: undefined,
    quorum: 2, // 2 for mainnet, 1 for testnet
  }
}

const _translateChainId = (chainId: string) => {
  return Number(chainId)
}
