import React, { createContext, ReactNode, useState } from "react"
import {
  Account,
  ApiKeysOption,
  ConnectionType,
  ContextLoad,
  Network,
  Provider,
} from "./types"
import { useEndpoints } from "./hooks/useEndpoints"
import { useNetwork } from "./hooks/useNetwork"
import { useInjection } from "./hooks/useInjection"
import { useSigner } from "./hooks/useSigner"
import { Web3Provider } from "@ethersproject/providers"
import { defaultApiOption } from "./utils/createFallbackProvider"
import detectEthereumProvider from "@metamask/detect-provider"

export type Props = {
  children: ReactNode
  defaultConnectionType: ConnectionType
  customNetworks: Network[]
  chainId: number
  apiKeys: ApiKeysOption
}

export const Context = createContext<ContextLoad>({} as ContextLoad)

export const EVMContext = ({
  children,
  defaultConnectionType = window.localStorage.getItem(
    "network-to-initialize"
  ) === null
    ? "not initialized"
    : "endpoints",
  customNetworks = [],
  chainId = Number(window.localStorage.getItem("network-to-initialize")) || 4,
  apiKeys = defaultApiOption,
}: Props) => {
  if (window.localStorage.getItem("network-to-initialize") !== null) {
    chainId = Number(window.localStorage.getItem("network-to-initialize"))
  }
  // Connection type
  const [connectionType, setConnectionType] = useState<ConnectionType>(
    defaultConnectionType
  )

  // provider
  const [provider, setProvider] = useState<Provider>(null)
  const [network, setNetwork] = useState<Network>({} as Network)
  const [account, setAccount] = useState<Account>({} as Account)

  function launchConnection(connectionType: ConnectionType) {
    if (!provider) {
      setConnectionType(connectionType)
    } else {
      console.warn(
        "Connection type cannot be changed once the provider is set, you should reload the page"
      )
    }
  }

  function setAutoRefresh(setTo: boolean) {
    setProvider((p) => {
      if (p !== null) {
        console.log(`Setting autorefresh to ${setTo}`)
        if (setTo) {
          if (p.listeners("block").length === 0) {
            return p.on("block", async (blockNumber: number) => {
              console.log(
                `Block n°${blockNumber} emitted on ${network.name} (${network.chainId})`
              )
              setNetwork((n) => {
                n.blockHeight = blockNumber
                return n
              })
            })
          } else {
            return p
          }
        } else {
          return p.removeAllListeners("block")
        }
      } else {
        return p
      }
    })
  }

  async function switchNetwork(chainId: number) {
    const paddedChainId = "0x" + chainId.toString(16)
    if (connectionType === "endpoints") {
      window.localStorage.setItem("network-to-initialize", paddedChainId)
      window.location.reload()
    } else if (connectionType === "injected") {
      const request = (provider as Web3Provider).provider.request
      if (request)
        request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: paddedChainId }],
        })
    } else {
      console.warn("Connect to provider to use this method")
    }
  }

  async function loginToInjected() {
    if (connectionType === "injected") {
      const request = (provider as Web3Provider).provider.request
      if (request) {
        const account = await request({
          method: "eth_requestAccounts",
        })
        console.log(`Account: ${account[0]} is connected`)
      }
    }
  }

  async function haveWebExtension() {
    let ethereum
    try {
      ethereum = await detectEthereumProvider()
    } catch (e) {
      console.log(e)
    }
    return ethereum ? true : false
  }

  useEndpoints(
    connectionType,
    setProvider,
    provider,
    chainId,
    customNetworks,
    apiKeys
  )
  useInjection(connectionType, setProvider, setAccount, provider)
  useNetwork(setProvider, setNetwork, provider, true, chainId, [])
  useSigner(setAccount, setProvider, provider, network)

  return (
    <Context.Provider
      value={{
        connectionType,
        provider,
        methods: {
          launchConnection,
          setAutoRefresh,
          switchNetwork,
          loginToInjected,
        },
        network,
        account,
      }}
    >
      {children}
    </Context.Provider>
  )
}
