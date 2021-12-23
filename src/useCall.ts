import { useState } from "react"
import { ContractInstance } from "./useContract"

interface metamaskError {
  code: string | number
  message: string
  error: {
    code: number
    message: string
    data: { originalError: { code: number; data: string; message: string } }
  }
}

export type ContractError = metamaskError

// This hook allow to call a blockchain function and have an associated status of the transaction
// The hook is customizable, here we use the {toast} from CHAKRA-UI
export const useCall = () => {
  const [status, setStatus] = useState("")
  const [transaction, setTransaction] = useState(null)
  const [errorMessage, setErrorMessage] = useState("")

  // read function to avoid network change problems
  // NOT USED IN THIS VERSION
  const readContract = async (
    contract: ContractInstance,
    functionName: string,
    params: Array<any>
  ) => {
    if (contract === null) throw new Error("Contract instance is not set")
    if (params === undefined) params = []

    let result
    try {
      switch (params.length) {
        case 0:
          result = await contract[functionName]()
          break
        case 1:
          result = await contract[functionName](params[0])
          break
        case 2:
          result = await contract[functionName](params[0], params[1])
          break
        case 3:
          result = await contract[functionName](params[0], params[1], params[2])
          break
        case 4:
          result = await contract[functionName](
            params[0],
            params[1],
            params[2],
            params[3]
          )
          break
        case 5:
          result = await contract[functionName](
            params[0],
            params[1],
            params[2],
            params[3],
            params[4]
          )
          break
        default:
          console.log("Wrong number of params")
      }
      return result
    } catch (e) {
      let errorMessage
      switch ((e as Error).name) {
        case "NETWORK_ERROR":
          errorMessage = "Wrong network: " + (e as Error).message
          break
        case "CALL_EXCEPTION":
          errorMessage = "Wrong network (certainly): " + (e as Error).message
          break
        default:
          errorMessage = "unknown error"
          break
      }
      return errorMessage
    }
  }

  // Ex: await contractCall(token, "transfer", ["0x....", 105000])
  const contractCall = async (
    contract: ContractInstance,
    functionName: string,
    params: Array<any>
  ) => {
    if (contract === null) throw new Error("Contract instance is not set")
    if (params === undefined) params = []
    let tx
    try {
      setStatus("Waiting for confirmation")

      // transaction
      switch (params.length) {
        case 0:
          tx = await contract[functionName]()
          break
        case 1:
          tx = await contract[functionName](params[0]) // .functionName
          break
        case 2:
          tx = await contract[functionName](params[0], params[1])
          break
        case 3:
          tx = await contract[functionName](params[0], params[1], params[2])
          break
        case 4:
          tx = await contract[functionName](
            params[0],
            params[1],
            params[2],
            params[3]
          )
          break
        case 5:
          tx = await contract[functionName](
            params[0],
            params[1],
            params[2],
            params[3],
            params[4]
          )
          break
        default:
          console.log("Wrong number of params")
      }
      setStatus("Pending")

      await tx.wait()

      // Transaction succeed
      setStatus("Success")
      setTransaction(tx)
    } catch (e) {
      // Transaction failed
      const u = e as ContractError
      let errorMessage
      console.log(u.error)
      console.log(u.code)

      // Error management need to be improved (add wallet connect & read-only contract)
      switch (u.code) {
        case "UNPREDICTABLE_GAS_LIMIT":
          errorMessage = u.error.message
          break
        case 4001:
          errorMessage = u.message
          break
        case "INVALID_ARGUMENT":
          errorMessage = "Wrong argument: " + u.message
          break
        case "UNSUPPORTED_OPERATION":
          errorMessage = "Wrong setup: " + u.message
          break
        case "CALL_EXCEPTION":
          errorMessage = "Wrong network (certainly): " + u.message
          break
        default:
          errorMessage = "unknown error"
          break
      }
      setStatus("Failed")
      setErrorMessage(errorMessage)
    }
  }

  return { status, tx: transaction, errorMessage, contractCall, readContract }
}
