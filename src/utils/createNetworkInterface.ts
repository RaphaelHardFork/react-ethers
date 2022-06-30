import { Network } from "../types"

export const createNetworkInterface = (
  chainId: number,
  customNetworks: Network[]
): Network => {
  const knownChainId = knownNetworks.map((network) => network.chainId)
  if ([1, 3, 4, 5, 42].includes(chainId)) {
    const defaultNetwork = defaultNetworks.find(
      (network) => network.chainId === chainId
    )
    if (defaultNetwork) {
      return defaultNetwork
    } else {
      return networkNull
    }
  } else if (knownChainId.includes(chainId)) {
    const knownNetwork = knownNetworks.find(
      (network) => network.chainId === chainId
    )
    if (knownNetwork) {
      return knownNetwork
    } else {
      return networkNull
    }
  } else {
    const customNetwork = customNetworks.find((network) => {
      if (network !== null) {
        return network.chainId === chainId
      }
      return network
    })

    if (customNetwork) {
      return customNetwork
    } else {
      console.warn(
        'No network match, make sure the network is known by "react-ether" or added in the config'
      )
      return networkNull
    }
  }
}

export const extractEndpoints = (
  chainId: number,
  customNetworks: Network[]
) => {
  const knownChainId = knownNetworks.map((network) => network.chainId)
  if ([1, 3, 4, 5, 42].includes(chainId)) {
    return []
  } else if (knownChainId.includes(chainId)) {
    const knownNetwork = knownNetworks.find(
      (network) => network.chainId === chainId
    )
    if (knownNetwork) {
      return knownNetwork.publicEndpoints
    } else {
      console.warn(`No endpoints to extract on chainId:${chainId}`)
      return []
    }
  } else {
    const customNetwork = customNetworks.find((network) => {
      if (network !== null) {
        return network.chainId === chainId
      }
      return network
    })

    if (customNetwork) {
      return customNetwork.publicEndpoints
    } else {
      console.warn(`No endpoints to extract on chainId:${chainId}`)
      return []
    }
  }
}

const networkNull = {
  name: "Network null",
  chainId: 0,
  blockHeight: 0,
  publicEndpoints: [],
  explorerUrl: "/",
}

export const defaultNetworks = [
  {
    name: "Ethereum mainnet",
    chainId: 1,
    blockHeight: 0,
    publicEndpoints: [],
    explorerUrl: "https://etherscan.io/",
  },
  {
    name: "Ethereum Ropsten testnet",
    chainId: 3,
    blockHeight: 0,
    publicEndpoints: [],
    explorerUrl: "https://ropsten.etherscan.io/",
  },
  {
    name: "Ethereum Rinkeby testnet",
    chainId: 4,
    blockHeight: 0,
    publicEndpoints: [],
    explorerUrl: "https://rinkeby.etherscan.io/",
  },
  {
    name: "Ethereum Görli testnet",
    chainId: 5,
    blockHeight: 0,
    publicEndpoints: [],
    explorerUrl: "https://goerli.etherscan.io/",
  },
  {
    name: "Ethereum Kovan testnet",
    chainId: 42,
    blockHeight: 0,
    publicEndpoints: [],
    explorerUrl: "https://kovan.etherscan.io/",
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
    explorerUrl: "https://bscscan.com/",
  },
  {
    name: "Binance SC testnet",
    chainId: 97,
    blockHeight: 0,
    publicEndpoints: [
      "https://data-seed-prebsc-1-s1.binance.org:8545/",
      "https://data-seed-prebsc-1-s2.binance.org:8545/",
      "https://data-seed-prebsc-2-s2.binance.org:8545/",
      "https://data-seed-prebsc-2-s3.binance.org:8545/",
    ],
    explorerUrl: "https://testnet.bscscan.com/",
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
    explorerUrl: "https://polygonscan.com/",
  },
  {
    name: "Polygon Mumbai testnet",
    chainId: 80001,
    blockHeight: 0,
    publicEndpoints: [
      "https://rpc-mumbai.matic.today",
      "https://matic-mumbai.chainstacklabs.com",
      "https://rpc-mumbai.maticvigil.com",
      "https://matic-testnet-archive-rpc.bwarelabs.com",
    ],
    explorerUrl: "https://mumbai.polygonscan.com/",
  },
]
