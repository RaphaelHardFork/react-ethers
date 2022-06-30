import { useContext } from "react"
import { Context } from "../EVMContext"

export const useEVM = () => {
  const {
    provider,
    account,
    network,
    methods,
    connectionType,
    autoRefreshActive,
  } = useContext(Context)

  if (provider === undefined) {
    throw new Error(
      `It seems that you are trying to use ContractContext outside of its provider`
    )
  }

  return {
    provider,
    account,
    network,
    methods,
    connectionType,
    autoRefreshActive,
  } as const
}
