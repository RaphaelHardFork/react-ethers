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
import { ethers } from "ethers"
import { defaultNetworks, knownNetworks } from "./utils/createNetworkInterface"

export type Props = {
  children: ReactNode
  defaultConnectionType: ConnectionType
  autoRefresh: boolean
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
  autoRefresh = true,
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

  // Auto refresh
  const [autoRefreshActive, setAutoRefreshActive] =
    useState<boolean>(autoRefresh)

  // Void Signer
  const [voidSigner, setVoidSigner] = useState(false)

  // provider
  const [provider, setProvider] = useState<Provider>(null)
  const [network, setNetwork] = useState<Network>({} as Network)
  const [account, setAccount] = useState<Account>({} as Account)

  function launchConnection(_connectionType: ConnectionType) {
    if (!provider) {
      setConnectionType(_connectionType)
    } else {
      console.warn(
        "Connection type cannot be changed once the provider is set, you should reload the page"
      )
    }
  }

  function setAutoRefresh(setTo: boolean) {
    setProvider((p) => {
      if (p !== null) {
        if (setTo) {
          if (p.listeners("block").length === 0) {
            console.log("listerners added")
            setAutoRefreshActive(true)
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
          console.log("listerners removed")
          setAutoRefreshActive(false)
          return p.removeAllListeners("block")
        }
      } else {
        return p
      }
    })
  }

  async function switchNetwork(chainId: number) {
    const paddedChainId = "0x" + Number(chainId.toString()).toString(16) // thanks javascript
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

  async function createVoidSigner(address: string) {
    if (address.length !== 42 && !address.startsWith("0x")) {
      console.warn("Wrong address format")
    } else if (account.address) {
      console.warn(
        "Disconnect accounts from your extensions, or delete existant void signer"
      )
    } else {
      if (provider) {
        const signer = new ethers.VoidSigner(
          ethers.utils.getAddress(address.toLowerCase()),
          provider
        )
        const addressSummed = await signer.getAddress()
        const balance = (await signer.getBalance()).toString()
        setAccount({
          address: addressSummed,
          balance,
          walletType: "void signer (watch only)",
          isLogged: true,
          signer: signer,
        })
        setVoidSigner(true)
      }
    }
  }

  function deleteVoidSigner() {
    setVoidSigner(false)
  }

  function getNetworkList() {
    let list: Network[] = []
    list = list.concat(defaultNetworks)
    list = list.concat(knownNetworks)
    list = list.concat(customNetworks)
    return list
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
  useNetwork(
    setProvider,
    setNetwork,
    provider,
    autoRefreshActive,
    chainId,
    customNetworks
  )
  useSigner(setAccount, provider, network, voidSigner)

  return (
    <Context.Provider
      value={{
        connectionType,
        autoRefreshActive,
        provider,
        methods: {
          launchConnection,
          setAutoRefresh,
          switchNetwork,
          loginToInjected,
          haveWebExtension,
          createVoidSigner,
          deleteVoidSigner,
          getNetworkList,
        },
        network,
        account,
      }}
    >
      {children}
    </Context.Provider>
  )
}
