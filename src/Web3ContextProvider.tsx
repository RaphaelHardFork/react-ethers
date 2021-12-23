import React, {
  createContext,
  PropsWithChildren,
  ReactNode,
  useContext,
  useState,
} from "react"
import { STATE } from "./reducer"
import { CustomNetwork, useProviders } from "./useProviders"

export type Props = {
  children: ReactNode
  customNetwork: CustomNetwork[]
}

export type ContextValue = {
  state: STATE
  switchNetwork: (chainId: string) => Promise<void>
  wcConnect: () => void
  connectToMetamask: () => Promise<any>
}

export const ProviderContext = createContext<ContextValue>({} as ContextValue)

export const Web3ContextProvider = ({ children, customNetwork }: Props) => {
  const [state, switchNetwork, wcConnect, connectToMetamask] =
    useProviders(customNetwork)

  return (
    <ProviderContext.Provider
      value={{ state, switchNetwork, wcConnect, connectToMetamask }}
    >
      {children}
    </ProviderContext.Provider>
  )
}
