import { Web3Provider, FallbackProvider } from "@ethersproject/providers"
import { ethers } from "ethers"

export interface Network {
  name: string
  chainId: number
  blockHeight: number
  publicEndpoints: string[]
  explorerUrl: string
}

export interface Account {
  isLogged: boolean
  address: string
  balance: string | number
  walletType: string
}

export interface Provider {
  network: Network
  account: Account
  autoRefresh: boolean
  type: string
  status: ConnectionStatus
  provider: string | Web3Provider | FallbackProvider
}

// at the loading of the page
export type ProviderSource = null | unknown | ethers.providers.JsonRpcProvider[]

// states of the proivders loading
export type ConnectionStatus = "Looking for network to connect"
