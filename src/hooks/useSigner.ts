import { Web3Provider } from "@ethersproject/providers"
import { useEffect } from "react"
import { Account, Network, Provider } from "../types"

export const useSigner = (
  setAccount: React.Dispatch<React.SetStateAction<Account>>,
  setProvider: React.Dispatch<React.SetStateAction<Provider>>,
  provider: Provider,
  network: Network
) => {
  // Manage account list and try to deconnect by empty this list

  useEffect(() => {
    if (provider) {
      if (provider.hasOwnProperty("providerConfigs")) {
        //
      } else {
        ;(async () => {
          const request = (provider as Web3Provider).provider.request
          let accounts
          if (request) {
            accounts = await request({
              method: "eth_accounts",
            })
          }
          if (accounts.length > 0) {
            const signer = (provider as Web3Provider).getSigner()
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
        })()
      }
    }
  }, [provider, network.blockHeight, setAccount])
}

// Another hooks for VoidSigner
