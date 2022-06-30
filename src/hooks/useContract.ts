import { Contract, ethers } from "ethers"
import { useEffect, useState } from "react"
import { useEVM } from "./useEVM"

export type ContractInstance = null | Contract

export const useContract = (address: string, abi: []) => {
  const { provider, account } = useEVM()
  const [contract, setContract] = useState<ContractInstance>(null)

  useEffect(() => {
    if (provider) {
      if (!account.hasOwnProperty("address")) {
        setContract(new ethers.Contract(address, abi, provider))
      } else {
        setContract(new ethers.Contract(address, abi, account.signer))
      }
    }
  }, [account, provider, address, abi])

  return contract
}
