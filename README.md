<p align="center">
<img width='400px' src='./assets/react-ethers.svg' alt='logo'/>
</p>

<h1 align="center"><b>React Ethers</b> v1.8.0</h1>

![](https://img.shields.io/badge/React%20ethers-v1.0.1-lightgrey)
![](https://img.shields.io/badge/Node-v17.3.0-orange)
![](https://img.shields.io/badge/npm-v8.3.0-orange)
![](https://img.shields.io/badge/Ethers.js-v5.5.1-green)
![](https://img.shields.io/badge/React-v17.0.2-blue)
![](https://img.shields.io/badge/TypeScript-v4.5.2-blue)

# Current work

- many errors are not handled
- Add wallet connect v1, then v2
- detect web extensions

# Description

`react-ethers` was created to facilitate the use, in React, of [Ethers.js](https://docs.ethers.io/v5/) which is a library for interacting with Ethereum Blockchain. It aims to be a small dependence which can be easily used in any React dApp.

- [Installation](https://github.com/RaphaelHardFork/react-ethers#installation)
- [Usage in your dApp](https://github.com/RaphaelHardFork/react-ethers#usage-in-the-dapp)
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

# Installation

```
yarn add react-ethers
```

# Usage in your dApp

## Wrap your app with `EVMContext`

```js
// src/index.js
import { EVMContext } from "react-ethers"

ReactDOM.render(
  <React.StrictMode>
    <EVMContext>
      <App />
    </EVMContext>
  </React.StrictMode>,
  document.getElementById("root")
)
```

## Get blockchain informations

```js
// src/Dapp.js
import { useEVM } from "react-ethers"

const Dapp = () => {
  const { network, account, provider, methods, connectionType } = useEVM()

  return <>...</>
}
```

**Available informations & methods:**

```ts
// --- provider ---
type Provider = null | Web3Provider | FallbackProvider | BaseProvider

// --- network ---
type Network = {
  name: string
  chainId: number
  blockHeight: number
  publicEndpoints: string[]
  explorerUrl: string
}

// --- account ---
interface Account {
  isLogged: boolean
  address: string
  balance: string | number
  walletType: string
  signer: JsonRpcSigner
}

// --- methods ---
type Methods = {
  launchConnection: (connectionType: ConnectionType) => void
  setAutoRefresh: (setTo: boolean) => void
  switchNetwork: (chainId: number) => void
  loginToInjected: () => void
}

// --- connection type ---
type ConnectionType = "not initialized" | "injected" | "endpoints"
```

References:  
[Web3Provider](https://docs.ethers.io/v5/api/providers/other/#Web3Provider)  
[FallbackProvider](https://docs.ethers.io/v5/api/providers/other/#FallbackProvider)  
[JsonRpcSigner](https://docs.ethers.io/v5/api/providers/jsonrpc-provider/#JsonRpcSigner)

## Launch connection

You can either launch the connection with the web extensions (`injected`) or through `endpoints`

```js
import { useEVM } from "react-ethers"

const Dapp = () => {
  const { methods } = useEVM()

  {...}

  return <>
    <button onClick={() => methods.launchConnection("injected")}>
      Launch connection
    </button>
  </>
}
```

By launching your connection with `endpoints` you will start by default on **rinkeby network (4)**. This can be changed with a configuration of the `EVMContext`:

```js
// src/index.js
import { EVMContext } from "react-ethers"

ReactDOM.render(
  <React.StrictMode>
    <EVMContext defaultConnectionType="endpoints" chainId={1}>
      <App />
    </EVMContext>
  </React.StrictMode>,
  document.getElementById("root")
)
```

You can also set `defaultConnectionType` to fix which connection type should be use when the dApp is launched.

## Connect Metamask

The `connectionType` must be `injected`

```js
import { useEVM } from "react-ethers"

const Dapp = () => {
  const { methods, account } = useEVM()

  {...}

  return <>
    <button onClick={() => methods.loginToInjected()}>
      Connect Metamask
    </button>
    {account.isLogged ? (
        <p>Connected with {account.address}</p>
      ) : (
        <p>Not connected</p>
      )}
  </>
}
```

_Do nothing if the `connectionType` is not on `injected`_

Once connected you can access informations from `account`. There is no methods to disconnected the wallet, users have to do so (for securities reasons).

## Switch network

```js
import { useEVM } from "react-ethers"

const Dapp = () => {
  const { methods } = useEVM()

  {...}

  return <>
      <button onClick={() => methods.switchNetwork(1)}>
        Switch to Mainnet
      </button>
  </>
}
```

When the connection is `injected` this will open the wallet to confirm the switch of the network. All networks registered (on https://chainlist.org/ for exemple) in your web extensions are supported.

With `endpoints` the page is reloaded on the chosen network. The network should be specified in `react-ethers` or in the `EVMContext` configuration:

```js
// src/index.js
import { EVMContext } from "react-ethers"

ReactDOM.render(
  <React.StrictMode>
    <EVMContext
      customNetworks={[
        {
          name: "Aurora Mainnet",
          chainId: 1313161554,
          blockHeight: 0,
          publicEndpoints: ["https://mainnet.aurora.dev"],
          explorerUrl: "https://aurorascan.dev/",
        },
        {
          name: "Aurora Testnet",
          chainId: 1313161555,
          blockHeight: 0,
          publicEndpoints: ["https://testnet.aurora.dev"],
          explorerUrl: "https://testnet.aurorascan.dev/",
        },
      ]}
    >
      <App />
    </EVMContext>
  </React.StrictMode>,
  document.getElementById("root")
)
```

You can provide a list of endpoints in `publicEndpoints`

## Create a contract instance

```js
import { useContract } from "react-ethers"
import contracts from "./contracts.json"

const Dapp = () => {
  const { ropsten } = contracts

  const token = useContract(
    ropsten.FungibleToken.address,
    ropsten.FungibleToken.abi
  )

  async function read() {
    let supply
    try {
      supply = await token.totalSupply(anyAddress)
    } catch (e) {
      console.log(e)
    }
    console.log(supply)
  }

  return (
    <>
      <button onClick={read}>Log Total Supply</button>
    </>
  )
}
```

To avoid create multiple instance of your contract, consider using `useContract` hook in a context or a single component.

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

## Contribution

You can contribute by:

- using the librairy and report bug
- share new ideas to improve it
- fork and pull request
- send a tip to the creator and contributors

©Raphaël

<hr>
<div align="center">
<img width='30px' src='./assets/ethereum.png' alt='logo'/>
<img width='45px' src='./assets/polygon.png' alt='logo'/>
</div>
<h3 align='center'><b>react-ethers.wallet | 0x2437e49fe22a90565811dceccbe14dce98e9c086</b></h3>
