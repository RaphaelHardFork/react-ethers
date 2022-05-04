const defaultNetwork = [
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

const main = (chainId) => {
  const index = defaultNetwork.find((network) => network.chainId === chainId)
  console.log(index)
}

main(45)
