import { Network } from "./types"
import { CustomNetwork } from "./useBlockchainConnect"

export const getEndpoints = (chainId: number) => {
  switch (chainId) {
    case 137:
      // polygon
      return [
        "https://polygon-rpc.com/",
        "https://rpc-mainnet.matic.quiknode.pro",
        "https://matic-mainnet.chainstacklabs.com",
        "https://matic-mainnet-full-rpc.bwarelabs.com",
        "https://matic-mainnet-archive-rpc.bwarelabs.com",
      ]

    case 56:
      // binance smart chain
      return [
        "https://bsc-dataseed.binance.org/",
        "https://bsc-dataseed1.defibit.io/",
        "https://bsc-dataseed1.ninicoin.io/",
      ]
    default:
      return []
  }
}

export const getCustomEndpoints = (
  network: number,
  customNetwork: Network[]
) => {
  for (const config of customNetwork) {
    if (config.chainId === network) {
      return config.publicEndpoints
    }
  }
  return []
}
