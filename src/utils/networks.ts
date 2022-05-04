import { Network } from "../types"

// should return the desired chainId(number)
export const getNetwork = (defaultNetwork: Network | "injected") => {
  const network = window.localStorage.getItem("desired-network")
  if (network === null) {
    if (defaultNetwork === "injected") {
      return -1
    }
    return defaultNetwork.chainId
  } else {
    window.localStorage.removeItem("desired-network") // clean localStorage
    return Number(network)
  }
}

// should return the network interface with public endpoints
export const getNetworkInterface = (
  chainId: number,
  customNetworks: Network[]
): Network => {
  if ([1, 3, 4, 5, 42].includes(chainId)) {
    const network = defaultNetwork.find(
      (network) => network.chainId === chainId
    )
    return network === undefined ? networkNull : network
  } else {
    let network = knownNetworks.find((network) => network.chainId === chainId)
    if (network !== undefined) return network

    const customNetwork = customNetworks.find(
      (network) => network.chainId === chainId
    )
    return customNetwork === undefined ? networkNull : customNetwork
  }
}

export const networkNull = {
  name: "Not connected to network",
  chainId: 0,
  blockHeight: 0,
  publicEndpoints: [],
  explorerUrl: "/",
}

export const defaultNetwork = [
  {
    name: "Ethereum mainnet",
    chainId: 1,
    blockHeight: 0,
    publicEndpoints: [],
    explorerUrl: "https://etherscan.io/address/",
  },
  {
    name: "Ethereum Ropsten testnet",
    chainId: 3,
    blockHeight: 0,
    publicEndpoints: [],
    explorerUrl: "https://ropsten.etherscan.io/address/",
  },
  {
    name: "Ethereum Rinkeby testnet",
    chainId: 4,
    blockHeight: 0,
    publicEndpoints: [],
    explorerUrl: "https://rinkeby.etherscan.io/address/",
  },
  {
    name: "Ethereum Görli testnet",
    chainId: 5,
    blockHeight: 0,
    publicEndpoints: [],
    explorerUrl: "https://goerli.etherscan.io/address/",
  },
  {
    name: "Ethereum Kovan testnet",
    chainId: 42,
    blockHeight: 0,
    publicEndpoints: [],
    explorerUrl: "https://kovan.etherscan.io/address/",
  },
]

export const knownNetworks = [
  {
    name: "Binance Smart Chain",
    chainId: 56,
    blockHeight: 0,
    publicEndpoints: [
      "https://bsc-dataseed.binance.org/",
      "https://bsc-dataseed1.defibit.io/",
      "https://bsc-dataseed1.ninicoin.io/",
    ],
    explorerUrl: "https://bscscan.com/address/",
  },
  {
    name: "Polygon mainnet",
    chainId: 137,
    blockHeight: 0,
    publicEndpoints: [
      "https://polygon-rpc.com/",
      "https://rpc-mainnet.matic.quiknode.pro",
      "https://matic-mainnet.chainstacklabs.com",
      "https://matic-mainnet-full-rpc.bwarelabs.com",
      "https://matic-mainnet-archive-rpc.bwarelabs.com",
    ],
    explorerUrl: "https://polygonscan.com/address/",
  },
]
