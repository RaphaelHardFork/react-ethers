import detectEthereumProvider from "@metamask/detect-provider"
import { ethers } from "ethers"
import { FallbackProvider } from "@ethersproject/providers"
import { ALCHEMY_ID, ETHERSCAN_ID, INFURA_ID, POCKET_ID } from "../apiKeys"
import { Network } from "../types"
import { getCustomEndpoints, getEndpoints } from "../rpcPublicEndpoint"

// should return the provider (or quorum) to wrap
export const getProvider = async (
  source: Network | "injected"
): Promise<ethers.providers.JsonRpcProvider[] | unknown | null> => {
  // ------------- Injected provider (metamask, brave, XDEFI) ----------
  if (source === "injected") {
    window.ethereum
    let metamaskProvider = await detectEthereumProvider()
    if (metamaskProvider) {
      return metamaskProvider
    } else return null // exit the function => create error (can't connect metamask)
  }

  // -------------------- FallbackProviders -------------------
  if (source.chainId === 0) return null // no network specified
  if ([1, 3, 4, 5, 42].includes(source.chainId)) {
    const apiKeyOptions = {
      infura: INFURA_ID,
      etherscan: ETHERSCAN_ID,
      alchemy: ALCHEMY_ID,
      pocket: POCKET_ID,
      quorum: source.chainId === 1 ? 2 : 1, // 2 for mainnet, 1 for testnet
    }

    // extract the quorum from the default provider
    const { providerConfigs } = ethers.getDefaultProvider(
      source.chainId,
      apiKeyOptions
    ) as FallbackProvider

    return providerConfigs // networks in Ethers.js

    // ----------------------------------------------- Need to check RPC URL ---------------
  } else {
    return createProviders(source.publicEndpoints)
  }
}

const createProviders = (endpoints: string[]) => {
  const providersQuorum = []
  for (const endpoint of endpoints) {
    try {
      const jsonRPC = new ethers.providers.JsonRpcProvider(endpoint)
      providersQuorum.push(jsonRPC)
    } catch (e) {
      console.error(e)
    }
  }
  return providersQuorum
}
