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

export const nameChainId = (chainId: string | number) => {
  switch (Number(chainId)) {
    case 1:
      return "Ethereum mainnet"
    case 3:
      return "Ropsten testnet"
    case 4:
      return "Rinkeby testnet"
    case 42:
      return "Kovan testnet"
    case 5:
      return "Goërli testnet"
    case 137:
      return "Polygon mainnet"
    case 80001:
      return "Mumbai testnet"
    case 56:
      return "Binance Smart Chain"
    case 97:
      return "BSC testnet"
    case 43114:
      return "Avalanche mainnet"
    case 43113:
      return "Fuji testnet"

    default:
      return "Unknown network"
  }
}
