import { ethers } from "ethers"
import { Web3Provider, FallbackProvider } from "@ethersproject/providers"

export type ACTION = {
  type: undefined | string
  providerType: undefined | string | null
  wrappedProvider: undefined | Web3Provider | FallbackProvider | null
  providerSrc: undefined | string | null
  networkName: undefined | string | null
  chainId: undefined | string | number
  account: undefined | string | null
  balance: undefined | string | number
  signer: undefined | any
}

export type STATE = {
  providerType: string | null
  ethersProvider: null | any
  providerSrc: string | null
  networkName: string | null
  isLogged: boolean
  chainId: string | number
  account: string | null
  balance: string | number
  signer: any
}

// Reducer for maintain the hook state
export const reducer = (state: STATE, action: ACTION) => {
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

    default:
      throw new Error(
        `useProviders: something went wrong in the reducer with the type: ${action.type}`
      )
  }
}
