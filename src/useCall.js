// ts-check
import { Link, Text } from "@chakra-ui/layout"
import { useToast } from "@chakra-ui/toast"
import { useState } from "react"

// This hook allow to call a blockchain function and have an associated status of the transaction
// The hook is customizable, here we use the {toast} from CHAKRA-UI
export const useCall = () => {
  const [status, setStatus] = useState("")
  const toast = useToast()

  // read function to avoid network change problems
  // NOT USED IN THIS VERSION
  const readContract = async (contract, functionName, params) => {
    let nbOfParam
    if (params === undefined) {
      nbOfParam = 0
    } else {
      nbOfParam = params.length
    }

    let result
    try {
      switch (nbOfParam) {
        case 0:
          result = await contract[functionName]()
          break
        case 1:
          result = await contract[functionName](params[0]) // .functionName
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
      switch (e.code) {
        case "NETWORK_ERROR":
          errorMessage = "Wrong network: " + e.message
          break
        case "CALL_EXCEPTION":
          errorMessage = "Wrong network (certainly): " + e.message
          break
        default:
          errorMessage = "unknown error"
          break
      }
      return errorMessage
    }
  }

  // Ex: await contractCall(token, "transfer", ["0x....", 105000])
  const contractCall = async (contract, functionName, params) => {
    let nbOfParam
    if (params === undefined) {
      nbOfParam = 0
    } else {
      nbOfParam = params.length
    }
    let tx
    try {
      setStatus("Waiting for confirmation")

      // transaction
      switch (nbOfParam) {
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
      try {
        // throw an error if this is a read-only call
        await tx.wait()
      } catch {
        setStatus("")
        return tx
      }

      // If transaction success
      setStatus("Success")
      toast({
        title: "Transaction completed",
        description: (
          <>
            <Text isTruncated>Hash: {tx.hash})</Text>
            <Link
              isExternal
              href={`https://rinkeby.etherscan.io/tx/${tx.hash}`}
            >
              See on Etherscan
            </Link>
          </>
        ),
        status: "success",
        duration: 10000,
        isClosable: true,
      })
    } catch (e) {
      // If transaction fail
      let errorMessage
      console.log(e.code)
      console.log(e.message)

      // Error management need to be improved (add wallet connect & read-only contract)
      switch (e.code) {
        case "UNPREDICTABLE_GAS_LIMIT":
          errorMessage = e.error.message
          break
        case 4001:
          errorMessage = e.message
          break
        case "INVALID_ARGUMENT":
          errorMessage = "Wrong argument: " + e.message
          break
        case "UNSUPPORTED_OPERATION":
          errorMessage = "Wrong setup: " + e.message
          break

        case "CALL_EXCEPTION":
          errorMessage = "Wrong network (certainly): " + e.message
          break
        default:
          errorMessage = "unknown error"
          break
      }
      setStatus("Failed")
      toast({
        title: "Transaction failed",
        description: errorMessage,
        status: "error",
        duration: 7000,
        isClosable: true,
      })
    }

    return tx
  }

  return [status, contractCall, readContract]
}
