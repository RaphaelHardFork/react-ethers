import { ethers } from "ethers"
import { useEffect, useState } from "react"
import { useWeb3 } from "./useWeb3"

export type ContractInstance = null | ethers.Contract

// This hook have to be set in a context in order to have a unique instance of the contract
// Otherwise event will be listened one time for each time we use this hook
export const useContract = (address: string, abi: []) => {
  const { state } = useWeb3()
  const [contract, setContract] = useState<ContractInstance>(null)

  useEffect(() => {
    if (state.ethersProvider) {
      // Detect if the contract have to be created with a signer or a provider
      if (state.account !== ethers.constants.AddressZero) {
        const contractInstance = new ethers.Contract(address, abi, state.signer)
        setContract(contractInstance)
      } else {
        const contractReader = new ethers.Contract(
          address,
          abi,
          state.ethersProvider
        )
        setContract(contractReader)
      }
    }
  }, [address, abi, state.signer, state.ethersProvider, state.account])

  return contract
}
