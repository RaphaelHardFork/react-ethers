import { ethers } from "ethers"
import { Web3Provider, FallbackProvider } from "@ethersproject/providers"
import { Reducer } from "react"
import { networkNull } from "./utils/networks"
import { Provider } from "./types"

export const initialeState = {
  network: networkNull,
  account: {
    isLogged: false,
    address: ethers.constants.AddressZero,
    balance: 0,
    walletType: "",
  },
  autoRefresh: false,
  type: "",
  status: "",
  provider: "",
}

export type ReducerAction = {
  type: string
  payload: Provider
}

export type ACTION =
  | {
      type: "SET_ETHERS_PROVIDER"
      providerType: string | null
      wrappedProvider: Web3Provider | FallbackProvider | null
      providerSrc: string | null
    }
  | {
      type: "SET_NETWORK"
      networkName: string | null
      chainId: string | number
    }
  | {
      type: "SET_ACCOUNT"
      account: string | null
      signer: any
    }
  | { type: "SET_BALANCE"; balance: string | number }
  | { type: "SET_BLOCK"; block: number }
  | {
      type: string | "DEFAULT"
      providerType: string | null
      wrappedProvider: Web3Provider | FallbackProvider | null
      providerSrc: string | null
      networkName: string | null
      chainId: string | number
      block: number
      isLogged: boolean
      account: string | null
      balance: string | number
      signer: any
    }

export type STATE = {
  providerType: string | null
  ethersProvider: null | any
  providerSrc: string | null
  networkName: string | null
  chainId: string | number
  blockHeight: string | number
  isLogged: boolean
  account: string | null
  balance: string | number
  signer: any
}

// Reducer for maintain the hook state
export const reducer: Reducer<Provider, ReducerAction> = (state, action) => {
  switch (action.type) {
    case "SET_ETHERS_PROVIDER":
      return {
        ...state,
        providerType: action.providerType,
        ethersProvider: action.wrappedProvider,
        providerSrc: action.providerSrc,
      }

    case "SET_NETWORK":
      return {
        ...state,
        networkName: action.networkName,
        chainId: action.chainId,
      }

    case "SET_ACCOUNT":
      let isLogged = false
      if (action.account !== ethers.constants.AddressZero) {
        isLogged = true
      }
      return {
        ...state,
        signer: action.signer,
        account: action.account,
        isLogged,
      }

    case "SET_BALANCE":
      return { ...state, balance: action.balance }

    case "SET_BLOCK":
      return { ...state, blockHeight: action.block }

    default:
      throw new Error(
        `useProviders: something went wrong in the reducer with the type ${action.type}`
      )
  }
}
