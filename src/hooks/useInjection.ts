/**
 * Should detect the wallet
 * @returns Web3Provider
 */

import { ethers } from "ethers"
import { JsonRpcFetchFunc, Web3Provider } from "@ethersproject/providers"
import { useCallback, useEffect } from "react"
import { ConnectionType } from "../types"
import { Account, Provider } from "../types"

export const useInjection = (
  connectionType: ConnectionType,
  setProvider: React.Dispatch<React.SetStateAction<Provider>>,
  setAccount: React.Dispatch<React.SetStateAction<Account>>,
  provider: Provider
) => {
  const onChainChanged = useCallback(
    async (chainId: number | string) => {
      console.log(`Chain changed to ${Number(chainId)}`)
      setProvider((p) => {
        if (p) {
          p.removeAllListeners("block")
          const newInjectedProvider = (
            window as any
          ).ethereum.removeAllListeners("chainChanged")
          return new ethers.providers.Web3Provider(
            newInjectedProvider.on(
              "chainChanged",
              onChainChanged
            ) as JsonRpcFetchFunc,
            "any"
          )
        } else {
          return p
        }
      })
    },
    [setProvider]
  )

  const onAccountsChanged = useCallback(
    async (newAccount: string) => {
      console.log(`Account changed to ${newAccount}`)
      ;(async () => {
        if (provider) {
          if (newAccount.length > 0) {
            const signer = await (provider as Web3Provider).getSigner()
            const address = await signer.getAddress()
            const balance = await signer.getBalance()
            setAccount({
              address,
              signer,
              balance: balance.toString(),
              isLogged: true,
              walletType: (provider as Web3Provider).connection.url,
            })
          } else {
            setAccount({} as Account)
          }
        }
      })()
    },
    [provider, setAccount]
  )

  useEffect(() => {
    if (connectionType === "injected") {
      try {
        let injectedProvider = (window as any).ethereum.on(
          "chainChanged",
          onChainChanged
        )
        injectedProvider = injectedProvider.on(
          "accountsChanged",
          onAccountsChanged
        )
        setProvider((p) => {
          if (!p) {
            const web3Provider = new ethers.providers.Web3Provider(
              injectedProvider as JsonRpcFetchFunc,
              "any"
            )
            return web3Provider
          } else {
            return p
          }
        })
      } catch (e) {
        console.warn(e)
      }
    }
  }, [connectionType, setProvider, onChainChanged, onAccountsChanged])
}
