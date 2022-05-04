import React, {
  createContext,
  PropsWithChildren,
  ReactNode,
  useContext,
  useState,
} from "react"
import { STATE } from "./reducer"
import { Network } from "./types"
import { useBlockchainConnect } from "./useBlockchainConnect"
import { networkNull } from "./utils/networks"

export type Props = {
  children: ReactNode
  customNetworks: Network[] | undefined
  defaultNetwork: Network | "injected" | undefined
  autoRefresh: boolean | undefined
}

export type ContextValue = {
  state: STATE
  switchNetwork: (chainId: string) => Promise<void>
  wcConnect: () => void
  connectToMetamask: () => Promise<any>
}

export const ProviderContext = createContext<ContextValue>({} as ContextValue)

export const Web3ContextProvider = ({
  children,
  customNetworks,
  defaultNetwork,
  autoRefresh,
}: Props) => {
  autoRefresh = autoRefresh === undefined ? true : autoRefresh
  defaultNetwork = defaultNetwork === undefined ? "injected" : defaultNetwork
  customNetworks = customNetworks === undefined ? [] : customNetworks

  const [state, switchNetwork, wcConnect, connectToMetamask] =
    useBlockchainConnect(customNetworks, defaultNetwork, autoRefresh)

  return (
    <ProviderContext.Provider
      value={{ state, switchNetwork, wcConnect, connectToMetamask }}
    >
      {children}
    </ProviderContext.Provider>
  )
}
