import detectEthereumProvider from "@metamask/detect-provider"
// import WalletConnectProvider from "@walletconnect/web3-provider"
import { ethers } from "ethers"
import { useEffect, useReducer, useRef, useState } from "react"
import { reducer, initialeState } from "./reducer"
import { INFURA_ID, ALCHEMY_ID, ETHERSCAN_ID, POCKET_ID } from "./apiKeys"
import {
  FallbackProvider,
  FallbackProviderConfig,
  JsonRpcFetchFunc,
  Provider,
} from "@ethersproject/providers"
import { extractProvidersConfig, readNetwork } from "./utils"
import { fetchCustomUrl, fetchUrl } from "./rpcPublicEndpoint"

/* 
This is a hook to connect to blockchain through several provider.

For security and pratical reasons the page is reloaded each time the provider change. More accurately each time
the network change, otherwise the former provider is still active, so it listen several network at the same time. 

If the provider come from Metamask, we do not need to reload the page (which give a better UX)

Metamask provider the easiest way to connect a blockchain, indeed Metamask inject a provider in the browser. 
So the except the connection is initiated with Wallet Connect, the hook will try to find the provider from Metamask
*/

type PROVIDER = null | unknown

export type CustomNetwork = {
  chainId: number
  publicEndpoints: string[]
}

export const useProviders = (customNetwork: CustomNetwork[]) => {
  // This state is internal, it store the provider which will be used.
  const [provider, setProvider] = useState<PROVIDER>(null)

  const isMounted = useRef(false)

  // State of the hook which will be exported
  const [state, dispatch] = useReducer(reducer, initialeState)
  // Extraction of keys of the hook state
  const { providerType, ethersProvider, networkName, account, providerSrc } =
    state

  // 1. Get a provider
  // Some options are stored in the local storage to guide which provider the useEffect have to fetch
  useEffect(() => {
    console.log("1. Get a provider")
    // Read options in the local storage
    const walletConnect = window.localStorage.getItem("wallet-connect")
    const network = readNetwork()

    ;(async () => {
      // Connexion to wallet connect initiated
      // Can't store the connection since the page is reloaded
      if (walletConnect === "true") {
        // connexion to WC
        console.log("connexion to WC")
        window.localStorage.clear()
        // Get wallet connect provider
        /*
        const walletConnectProvider = new WalletConnectProvider({
          infuraId: INFURA_ID,
        })
        try {
          await walletConnectProvider.enable()
          setProvider(walletConnectProvider)
        } catch (e) {
          console.log(e)
        }
        */
      } else {
        // Detect if Metamask is installed
        let metamaskProvider = await detectEthereumProvider()
        if (metamaskProvider) {
          setProvider(metamaskProvider)
        } else if (
          [undefined, 1, 3, 4, 5, 42].includes(network as undefined | number)
        ) {
          // Metamask is not installed
          // A default provider will be used in this case
          // Options to add API key (will speed up the connection a lot)
          const apiKeyOptions = {
            infura: INFURA_ID,
            etherscan: ETHERSCAN_ID,
            alchemy: ALCHEMY_ID,
            pocket: POCKET_ID,
            quorum: 2, // 2 for mainnet, 1 for testnet
          }

          // A network is specified in the local storage
          // If {network} is null, the mainnet (homestead) is choosed
          const defaultProvider = ethers.getDefaultProvider(
            network,
            apiKeyOptions
          )

          // The quorum of providers selected by {getDefaultProvider} is extracted
          // and will be used to create a FallbackProvider
          const providersQuorum = extractProvidersConfig(
            defaultProvider as FallbackProvider
          )
          setProvider(providersQuorum)
        } else if ([56, 137].includes(network as number)) {
          // create several provider from public endpoints
          // for RPC endpoint saved in the library
          // these providers will be used to create a Fallback provider
          const endpoints = fetchUrl(network as number)
          if (endpoints !== undefined) {
            const providersQuorum = []
            for (const endpoint of endpoints) {
              try {
                const jsonRPC = new ethers.providers.JsonRpcProvider(endpoint)
                providersQuorum.push(jsonRPC)
              } catch (e) {
                console.error(e)
              }
            }
            setProvider(providersQuorum)
          } else {
            setProvider([])
          }
        } else {
          // use option for custom network
          const endpoints = fetchCustomUrl(network as number, customNetwork)
          const providersQuorum = []
          for (const endpoint of endpoints) {
            try {
              const jsonRPC = new ethers.providers.JsonRpcProvider(endpoint)
              providersQuorum.push(jsonRPC)
            } catch (e) {
              console.error(e)
            }
          }
          setProvider(providersQuorum)
        }
      }
    })()
  }, [])

  // 2. Wrap the provider(s) into a Ethers.JS provider configuration
  // And store it in the state of the hook
  useEffect(() => {
    // Do not run on the first render
    if (!isMounted.current) {
      isMounted.current = true
    } else {
      if (ethersProvider === null) {
        console.log("2. Wrap the provider(s)")

        // Try to wrap the providers into a Web3Provider (Metamask & Wallet Connect)
        try {
          const web3Provider = new ethers.providers.Web3Provider(
            provider as JsonRpcFetchFunc,
            "any"
          )
          const src = web3Provider.connection.url
          dispatch({
            type: "SET_ETHERS_PROVIDER",
            providerType: "Web3Provider",
            wrappedProvider: web3Provider,
            providerSrc: src,
          })
        } catch {
          // Create a fallback provider with the quorum of providers
          try {
            const fallbackProvider = new ethers.providers.FallbackProvider(
              provider as (Provider | FallbackProviderConfig)[]
            )
            const src = `From quorum of ${fallbackProvider.providerConfigs.length} providers`
            dispatch({
              type: "SET_ETHERS_PROVIDER",
              providerType: "FallbackProvider",
              wrappedProvider: fallbackProvider,
              providerSrc: src,
            })
          } catch (e) {
            console.error(
              "Be aware if the desired network is configurated, or put the configuration in the ContextProvider"
            )
            console.error(e)
          }
        }
      }
    }
  }, [provider, ethersProvider])

  // 3. Get informations from the EthersJS wrapped provider
  useEffect(() => {
    if (ethersProvider) {
      console.log("3. Get informations")
      ;(async () => {
        // Get network informations
        const network = await ethersProvider.getNetwork()
        dispatch({
          type: "SET_NETWORK",
          networkName: network.name,
          chainId: network.chainId,
        })

        // Get account information (only in Web3Provider)
        if (providerType === "Web3Provider") {
          const signer = await ethersProvider.getSigner()
          let account
          try {
            // Look if a wallet is connected
            account = await signer.getAddress()

            // Get balance of this account
            const balance = await ethersProvider.getBalance(account)
            dispatch({ type: "SET_BALANCE", balance })
          } catch {
            account = ethers.constants.AddressZero
          }
          dispatch({ type: "SET_ACCOUNT", signer, account })
        }
      })()
    }
  }, [ethersProvider, providerType])

  // -------------------------------------------- METHODS -------------------------
  const connectToMetamask = async () => {
    if (providerSrc === "metamask") {
      try {
        const account = await ethersProvider.provider.request({
          method: "eth_requestAccounts",
        })
        return account
      } catch (e) {
        throw e
      }
    }
  }

  const switchNetwork = async (chainId: string) => {
    // Only Metamask support this RPC method
    if (providerSrc === "metamask") {
      try {
        await ethersProvider.provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId }],
        })
      } catch (e) {
        console.error(e)
      }
    } else {
      // Network will be changed by reloading the page
      // And new network information will be stored in the local storage
      window.localStorage.setItem("switched-network", chainId)
      window.location.reload()

      // IMPORTANT
      // prevent this function with wallet connect! Is a wallet connect networkChanged event is emitted?
    }
  }

  // connect to wallet connect
  const wcConnect = () => {
    window.localStorage.setItem("wallet-connect", "true")
    window.location.reload()
  }

  // -------------------------------------------- LISTEN EVENTS -------------------
  // Listen block on the EthersProvider (only event listenable from this provider)
  useEffect(() => {
    if (ethersProvider) {
      const newBlock = async (block: number) => {
        console.log(`Block n°${block} mined on ${networkName}`)
        if (account !== ethers.constants.AddressZero) {
          const balance = await ethersProvider.getBalance(account)
          dispatch({ type: "SET_BALANCE", balance })
        }
        dispatch({ type: "SET_BLOCK", block })
      }
      ethersProvider.on("block", newBlock)
      return () => ethersProvider.off("block", newBlock)
    }
  }, [ethersProvider, account, networkName])

  /*
  Others blockchain event are listened directly on the provider.
  They are useful only for a Web3Provider
  the {.off} doesn't work instead use {.removeListener} (see EIP-1193)
  */
  // Network changed
  useEffect(() => {
    if (providerType === "Web3Provider") {
      const chainChanged = async (chainId: number | string) => {
        // No need to reload the page with Metamask (maybe with Wallet Connect, can we change it on the wallet?)
        console.log(`Chain changed to ${chainId}`)
        if (providerSrc === "metamask") {
          const newProvider = await detectEthereumProvider()
          const web3Provider = new ethers.providers.Web3Provider(
            newProvider as JsonRpcFetchFunc,
            "any"
          )
          ethersProvider.off("block")
          const src = web3Provider.connection.url
          dispatch({
            type: "SET_ETHERS_PROVIDER",
            providerType: "Web3Provider",
            wrappedProvider: web3Provider,
            providerSrc: src,
          })
        } else {
          // If wallet connect
          console.log("wallet connect changed his network")
          /*
          const walletConnectProvider = new WalletConnectProvider({
            infuraId: "3c717cd3192b470baedb127d89581a23",
          })
          console.log(walletConnectProvider)
          const web3Provider = new ethers.providers.Web3Provider(
            walletConnectProvider
          )
          console.log(web3Provider)
          const src = web3Provider.connection.url
          dispatch({
            type: "SET_ETHERS_PROVIDER",
            providerType: "Web3Provider",
            wrappedProvider: web3Provider,
            providerSrc: src,
          })
          */
        }
      }
      ethersProvider.provider.on("chainChanged", chainChanged)
      return () =>
        ethersProvider.provider.removeListener("chainChanged", chainChanged)
    }
  }, [ethersProvider, providerType, providerSrc])

  // Account changed
  useEffect(() => {
    if (providerType === "Web3Provider") {
      const accountChanged = async (newAccount: string) => {
        console.log(`Account changed to ${newAccount}`)
        // Same as in [3. Get informations]
        if (providerType === "Web3Provider") {
          const signer = await ethersProvider.getSigner()
          let account
          try {
            // Look if a wallet is connected
            account = await signer.getAddress()

            // Get balance of this account
            const balance = await ethersProvider.getBalance(account)
            dispatch({ type: "SET_BALANCE", balance })
          } catch {
            account = ethers.constants.AddressZero
          }
          dispatch({ type: "SET_ACCOUNT", signer, account })
        }
      }
      ethersProvider.provider.on("accountsChanged", accountChanged)
      return () =>
        ethersProvider.provider.removeListener(
          "accountsChanged",
          accountChanged
        )
    }
  }, [ethersProvider, providerType, providerSrc])

  // Connection to the provider
  type CONNECT = { chainId: string | number }
  useEffect(() => {
    if (providerType === "Web3Provider") {
      const connection = async ({ chainId }: CONNECT) => {
        console.log(`Connection to chainID: ${chainId}`)
      }
      ethersProvider.provider.on("connect", connection)
      return () => ethersProvider.provider.removeListener("connect", connection)
    }
  }, [ethersProvider, providerType])

  // Disconnection from the provider (Wallet Connect)
  useEffect(() => {
    if (providerType === "Web3Provider") {
      const disconnection = async (code: string | number, reason: string) => {
        console.log(code)
        console.log(reason)
        // Infinite loop with killSession
        ethersProvider.provider.removeListener("disconnect", disconnection)
        ethersProvider.provider.connector.killSession()

        window.location.reload()
      }
      ethersProvider.provider.on("disconnect", disconnection)
      return () =>
        ethersProvider.provider.removeListener("disconnect", disconnection)
    }
  }, [ethersProvider, providerType])

  // -------------------------------------------LISTEN EVENT FROM WALLET CONNECT
  useEffect(() => {
    if (providerSrc === "eip-1193:") {
      const update = async (error: string, payload: string) => {
        console.log(error)
        console.log(payload)
      }
      ethersProvider.provider.connector.on("session_update", update)
    }
  }, [ethersProvider, providerSrc])

  // Exported from this hook
  return [state, switchNetwork, wcConnect, connectToMetamask] as const
}
