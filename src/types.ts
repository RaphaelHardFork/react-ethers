import {
  Web3Provider,
  FallbackProvider,
  BaseProvider,
  JsonRpcSigner,
} from "@ethersproject/providers"

// --- network ---
export type Network = {
  name: string
  chainId: number
  blockHeight: number
  publicEndpoints: string[]
  explorerUrl: string
}

// --- account ---
export interface Account {
  isLogged: boolean
  address: string
  balance: string | number
  walletType: string
  signer: JsonRpcSigner
}

// --- provider ---
export type Provider = null | Web3Provider | FallbackProvider | BaseProvider

// --- connection type ---
export type ConnectionType = "not initialized" | "injected" | "endpoints"

// --- config ---
export interface Config {
  connectionType: ConnectionType
  customNetworks: Network[]
  chainId: number
  apiKeys: ApiKeysOption
}

// --- context load ---
export type ContextLoad = {
  connectionType: ConnectionType
  methods: {
    launchConnection: (connectionType: ConnectionType) => void
    setAutoRefresh: (setTo: boolean) => void
    switchNetwork: (chainId: number) => void
    loginToInjected: () => void
  }
  provider: Provider
  network: Network
  account: Account
}

// --- apikeys option ---
export type ApiKeysOption = {
  infura: string | undefined
  etherscan: string | undefined
  alchemy: string | undefined
  pocket: string | undefined
  quorum: number
}
