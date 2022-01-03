<p align="center">
<img width='400px' src='./react-ethers.svg' alt='logo'/>
</p>

<h1 align="center"><b>React Ethers</b></h1>

![](https://img.shields.io/badge/React%20ethers-v1.0.1-lightgrey)
![](https://img.shields.io/badge/Ethers.js-v5.5.1-green)
![](https://img.shields.io/badge/React-v17.0.2-blue)
![](https://img.shields.io/badge/TypeScript-v4.5.2-blue)

## Current work

Switching to Wallet Connect 2.0

## Description

`react-ethers` was created to facilitate the use, in React, of [Ethers.js](https://docs.ethers.io/v5/) which is a library for interacting with Ethereum Blockchain. It aims to be a small dependencies which can be easily used in any React dApp.

- [Installation](https://github.com/RaphaelHardFork/react-ethers#installation)
- [Usage in the dApp](https://github.com/RaphaelHardFork/react-ethers#usage-in-the-dapp)
  - [Wrap the dApp](https://github.com/RaphaelHardFork/react-ethers#wrap-your-app-with-the-web3contextprovider)
  - [Get blockchain informations](https://github.com/RaphaelHardFork/react-ethers#get-blockchain-informations)
  - [Connect Metamask](https://github.com/RaphaelHardFork/react-ethers#connect-metamask)
  - [Switch network](https://github.com/RaphaelHardFork/react-ethers#switch-network)
  - [Connect Wallet Connect](https://github.com/RaphaelHardFork/react-ethers#connect-with-wallet-connect)
  - [Create a contract instance](https://github.com/RaphaelHardFork/react-ethers#create-a-contract-instance)
  - [Do a call on a contract](https://github.com/RaphaelHardFork/react-ethers#do-a-call-on-a-contract)
  - [Tools](https://github.com/RaphaelHardFork/react-ethers#tools)
- [API keys](https://github.com/RaphaelHardFork/react-ethers#api-keys)
- [How it's work](https://github.com/RaphaelHardFork/react-ethers#react-ethers-in-action)
- [Improvment for V2](https://github.com/RaphaelHardFork/react-ethers#improvment-for-v2)
- [Contribute](https://github.com/RaphaelHardFork/react-ethers#contribution)

## Installation

```
yarn add react-ethers
```

## Usage in the dApp

### Wrap your app with the `Web3ContextProvider`

```js
// src/index.js
import { Web3ContextProvider } from "react-ethers"

ReactDOM.render(
  <React.StrictMode>
    <Web3ContextProvider>
      <App />
    </Web3ContextProvider>
  </React.StrictMode>,
  document.getElementById("root")
)
```

### Get blockchain informations

```js
// src/Dapp.js
import { useWeb3 } from "react-ethers"

const Dapp = () => {
  const { state } = useWeb3()
  const {
    providerType: String,
    ethersProvider: {Web3Provider | FallbackProvider},
    providerSrc: String,
    networkName: String,
    chainId: Number,
    blockHeight: Number,
    isLogged: Boolean,
    signer: {JsonRpcSigner | null},
    account: String, // address zero as default
    balance: BigNumber,
  } = state
}
```

References:  
[Web3Provider](https://docs.ethers.io/v5/api/providers/other/#Web3Provider)  
[FallbackProvider](https://docs.ethers.io/v5/api/providers/other/#FallbackProvider)  
[JsonRpcSigner](https://docs.ethers.io/v5/api/providers/jsonrpc-provider/#JsonRpcSigner)  
[BigNumber](https://docs.ethers.io/v5/api/utils/bignumber/#BigNumber)

### Connect Metamask

```js
// src/Dapp.js
import { useWeb3 } from "react-ethers"

const Dapp = () => {
  const { connectToMetamask } = useWeb3()

  {...}

  return <>
    <button onClick={connectToMetamask}>
      Connect Metamask
    </button>
  </>
}
```

_Do nothing if the provider do not come from Metamask_

### Switch network

```js
// src/Dapp.js
import { useWeb3 } from "react-ethers"

const Dapp = () => {
  const { switchNetwork } = useWeb3()

  {...}

  return <>
    <button onClick={() => switchNetwork("0x4")}>Rinkeby</button>
  </>
}
```

Do not work with **Wallet Connect** and with **Metamask (in read-only / locked)**. With a Fallback provider the page is reload with the switched network in option.  
This function take the chainId in string of the hexadecimal value.  
**All network added to Metamask are supported.** To add new network go to https://chainlist.org/

To use new network without metamask you can add RPC endpoints to the `Web3ContextProvider`:

```js
// src/index.js
ReactDOM.render(
  <React.StrictMode>
      <Web3ContextProvider
        customNetwork={[
          {
            chainId: 43114,
            publicEndpoints: ["https://api.avax.network/ext/bc/C/rpc"],
          },
        ]}
      >
        <App />
      </Web3ContextProvider>
  </React.StrictMode>,
  document.getElementById("root")
```

You can add several networks and several RPC endpoints.

### Connect with Wallet Connect

The page is reload with an option to connect to Wallet Connect.

```js
// src/Dapp.js
import { useWeb3 } from "react-ethers"

const Dapp = () => {
  const { wcConnect } = useWeb3()

  {...}

  return <>
    <button onClick={wcConnect}>
    Connect with Wallet Connect
    </button>
  </>
}
```

_Operations with wallet connect are still in progress_

### Create a contract instance

```js
// src/Dapp.js
import { useContract } from "react-ethers"

const Dapp = () => {
  const contract = useContract(contractAddress, contractABI)

  {...}

  async function read(){
    // try / catch if network is not controlled
    const totalSupply = await contract.totalSupply()
  }

  return <>
    <button onClick={read}>
    Total Supply
    </button>
  </>
}
```

This hook **must be used in a context** in order to prevent the creation of multiple instance of a contract. Especially if we want to listen event on this contract.  
If there is no signer, the contract instance is it read-only.  
 **To get this information, call:**  
`contract.signer` (should return `null` if there is no signer)

### Do a call on a contract

```js
// src/Dapp.js
import { useCall } from "react-ethers"

const Dapp = () => {
  const contract = useContract(contractAddress, contractABI)
  const { readContract, contractCall } = useCall()

  {...}

  async function call(){
    const functionName = "transfer" // String correspond to the function name
    const params = ["0x435f4...2et68", 20 * 10 ** 18] // list of parameter in the order
    await contractCall(contract, functionName, params)
  }

  async function read(){
    const totalSupply = await readContract(contract, "totalSupply")
    const balance = await readContract(contract, "balanceOf", ["0x4564...2Dg5"])
  }

  return <>
    <button onClick={call}>
    Transfer
    </button>

    <button onClick={read}>
    Total Supply & balance
    </button>
  </>
}
```

The hook provider also a `status` state, which indicate either the transaction is in:

- **"Waiting for comfirmation"**: user must accept transaction on the wallet interface
- **"Pending"**: transaction waiting to be mined
- **"Success"**: transaction success
- **"Failed"**: transaction failed

The `tx` which is the [transaction object](https://docs.ethers.io/v5/api/providers/types/#types--transactions) and the `errorMessage` in case of revert. Which are empty strings by default.

```js
const Dapp = () => {
  const contract = useContract(contractAddress, contractABI)
  const { contractCall, status, tx, errorMessage } = useCall()

  {...}

  async function approve(){
    await contractCall(contract, "approve", [
      "0x3eB876042A00685c75Cfe1fa2Ee496615e3aef8b",
      10000,
    ])
  }

  return <>
    <button onClick={read}>
    Total Supply
    </button>


    <button
      disabled={
        status.startsWith("Pending") ||
        status.startsWith("Waiting")
      }
      onClick={approve}>
    Approve
    </button>

    {tx !== null ? <p>Transaction hash: {tx?.hash}</p> : ''}
    {errorMessage !== '' ? <p>Error: {errorMessage}</p> : ''}
  </>
}
```

### Tools

You can use `readNumber` to read big number from contract method or providers.

```js
// src/Dapp.js
import { useWeb3 } from "react-ethers"

const Dapp = () => {
  const { state, readNumber } = useWeb3()
  const { balance } = state

  const decimal = 18

  return (
    <>
      <p>Balance: {readNumber(balance, decimal)} ETH</p>
    </>
  )
}
```

## API keys

In your `.env` file you can add several API keys, which `INFURA` is mandatory if you want to use Wallet Connect, and which can be useful for the performance of your app in read-only.

```txt
REACT_APP_INFURA_ID=""
REACT_APP_ALCHEMY_ID=""
REACT_APP_ETHERSCAN_ID=""
REACT_APP_POCKET_ID=""
```

## React-Ethers in action

Visit the template dApp and go through the code.

## Improvment for V2

Convertion into a full typescript code.

Add custom hooks to use ERC20/721/1155.

Handle utilisation of ProxyContract (if needed)

Link to the explorer, display name of network well

## Contribution

You can contribute by:

- using the librairy and report bug
- share new ideas to improve it
- fork and pull request
- send a tip to the creator and contributors

©Raphaël

<hr>
<div align="center">
<img width='30px' src='./ethereum.png' alt='logo'/>
<img width='45px' src='./polygon.png' alt='logo'/>
</div>
<h3 align='center'><b>react-ethers.wallet | 0x2437e49fe22a90565811dceccbe14dce98e9c086</b></h3>
