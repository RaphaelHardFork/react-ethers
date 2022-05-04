import { useEffect } from "react"
import { Network, Provider } from "../types"
import { createNetworkInterface } from "../utils/createNetworkInterface"

export const useNetwork = (
  setProvider: React.Dispatch<React.SetStateAction<Provider>>,
  setNetwork: React.Dispatch<React.SetStateAction<Network>>,
  provider: Provider,
  autoRefresh: boolean,
  chainId: number,
  customNetworks: Network[]
) => {
  useEffect(() => {
    if (provider !== null) {
      // For any provider
      ;(async () => {
        let network = await provider._networkPromise
        if (!network) {
          network = provider._network
        }
        const currentNetwork = createNetworkInterface(
          Number(network.chainId),
          customNetworks
        )
        setNetwork((n) => {
          if (n.chainId !== currentNetwork.chainId) {
            return currentNetwork
          } else return n
        })

        if (autoRefresh) {
          setProvider((p) => {
            if (p && p.listeners("block").length === 0) {
              return p.on("block", async (blockNumber: number) => {
                console.log(
                  `Block n°${blockNumber} emitted on ${currentNetwork.name} (${currentNetwork.chainId})`
                )
                setNetwork({ ...currentNetwork, blockHeight: blockNumber })
              })
            } else {
              return p
            }
          })
        }
      })()
    }
  }, [chainId, provider, customNetworks, setNetwork, autoRefresh, setProvider])
}

// if (provider.hasOwnProperty("providerConfigs")) {
//   // Fallback provider
//   console.log(provider)
//   const currentNetwork = createNetworkInterface(
//     provider._network.chainId,
//     customNetworks
//   )
//   setNetwork((n) => {
//     if (n.chainId !== currentNetwork.chainId) {
//       return currentNetwork
//     } else return n
//   })

//   if (autoRefresh) {
//     setProvider((p) => {
//       if (p && p.listeners("block").length === 0) {
//         return p.on("block", async (blockNumber: number) => {
//           console.log(
//             `Block n°${blockNumber} emitted on ${currentNetwork.name} (${currentNetwork.chainId})`
//           )
//           setNetwork({ ...currentNetwork, blockHeight: blockNumber })
//         })
//       } else {
//         return p
//       }
//     })
//   }
// } else {
//   // Web3Provider
//   ;(provider as BaseProvider)._networkPromise
//     .then((network) => {
//       const currentNetwork = createNetworkInterface(
//         Number(network.chainId),
//         customNetworks
//       )
//       setNetwork((n) => {
//         if (n.chainId !== currentNetwork.chainId) {
//           return currentNetwork
//         } else return n
//       })

//       if (autoRefresh) {
//         setProvider((p) => {
//           if (p && p.listeners("block").length === 0) {
//             return p.on("block", async (blockNumber: number) => {
//               console.log(
//                 `Block n°${blockNumber} emitted on ${currentNetwork.name} (${currentNetwork.chainId})`
//               )
//               setNetwork({ ...currentNetwork, blockHeight: blockNumber })
//             })
//           } else {
//             return p
//           }
//         })
//       }
//     })
//     .catch((e) => console.warn(e))
// }
