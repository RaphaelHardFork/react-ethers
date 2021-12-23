import { CustomNetwork } from "./useProviders"

export const fetchUrl = (chainId: number) => {
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
      // biance smart chain
      return [
        "https://bsc-dataseed.binance.org/",
        "https://bsc-dataseed1.defibit.io/",
        "https://bsc-dataseed1.ninicoin.io/",
      ]
  }
}

export const fetchCustomUrl = (
  network: number,
  customNetwork: CustomNetwork[]
) => {
  for (const config of customNetwork) {
    if (config.chainId === network) {
      return config.publicEndpoints
    }
  }
  return []
}
