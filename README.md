<p align="center">
<img width='400px' src='./assets/react-ethers.svg' alt='logo'/>
</p>

<h1 align="center"><b>React Ethers</b> v1.8.1</h1>

![](https://img.shields.io/badge/Node-v16.15.0-orange)
![](https://img.shields.io/badge/npm-v8.3.0-orange)
![](https://img.shields.io/badge/nvm-v0.38.0-orange)
![](https://img.shields.io/badge/Ethers.js-v5.6.9-green)
![](https://img.shields.io/badge/React-v17.0.2-blue)
![](https://img.shields.io/badge/TypeScript-v4.7.4-blue)

_Waiting for `WalletConnectV2` stable release and want ot see this library in `Rust`_

# Current work 👷

- fix errors that are not handled

# Description

`react-ethers` was created to facilitate the use, in React, of [Ethers.js](https://docs.ethers.io/v5/) which is a library for interacting with Ethereum Blockchain. It aims to be a small dependence which can be easily used in any React dApp.

- [Usage in your dApp](https://github.com/RaphaelHardFork/react-ethers#usage-in-the-dapp)
  - [Installation](https://github.com/RaphaelHardFork/react-ethers#installation)
  - [Get blockchain informations](https://github.com/RaphaelHardFork/react-ethers#get-blockchain-informations)
  - [Launch connection]()
  - [Connect Web extension](https://github.com/RaphaelHardFork/react-ethers#connect-metamask)
  - [Auto refresh]()
  - [Switch network](https://github.com/RaphaelHardFork/react-ethers#switch-network)
  - [Create a void signer]()
  - [Create a contract instance](https://github.com/RaphaelHardFork/react-ethers#create-a-contract-instance)
- [API keys](https://github.com/RaphaelHardFork/react-ethers#api-keys)
- [Contribute](https://github.com/RaphaelHardFork/react-ethers#contribution)

# Usage in your dApp

## Installation

```
yarn add react-ethers
```

## Wrap your app with `EVMContext`

Use it with zero config:

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

See how to add a config

_(still using React17 for the moment)_

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
  haveWebExtension: () => Promise<boolean>
  createVoidSigner: (address: string) => void
  deleteVoidSigner: () => void
  getNetworkList: () => Network[]
}

// --- connection type ---
type ConnectionType = "not initialized" | "injected" | "endpoints"

// --- others ---
autoRefreshActive: boolean
```

EthersJS References:  
[Web3Provider](https://docs.ethers.io/v5/api/providers/other/#Web3Provider)  
[FallbackProvider](https://docs.ethers.io/v5/api/providers/other/#FallbackProvider)  
[JsonRpcSigner](https://docs.ethers.io/v5/api/providers/jsonrpc-provider/#JsonRpcSigner)

## Launch connection

There two type of connections:

- `injected`: using the web extensions to connect the blockchain (so through INFURA in the case of the basic configuration of Metamask for exemple). The provider is connected by default on the chosen network in the web extension, if this network is not known by `EVMContext` this will set the name of the network as `Network null (chainID:0)`.  
  You can use `methods.haveWebExtension` to check if the user have an extension installed (`window.ethereum` injected).  
  Caution: this is mainly tested with Metamask

- `endpoints`: using one or several endpoints to connect the blockchain. It use a `FallbackProvider` (witch use a quorum of provider). By default the network is set to `Ethereum Rinkeby testnet (chainID:4)`.  
  Useful for users who don't have a web extension and want to read blockchain informations.

```js
import { useEVM } from "react-ethers"

const Dapp = () => {
  const { methods } = useEVM()

  {...}

  return <>
    <button onClick={() => methods.launchConnection("injected")}>
      Launch connection with web extension
    </button>
    <button onClick={() => methods.launchConnection("endpoints")}>
      Launch connection with endpoints
    </button>
  </>
}
```

To avoid any conflicts it is better to reload the page if you want to change the `connectionType`

You can config the default connection type by passing the `defaultConnectionType` to the `EVMContext`:

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

## Connect Web extension

Only on `injected` `connectionType`

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
        <p>Wallet type: {account.walletType}</p>
        <p>Balance: {account.balance}</p>
        <button onClick={() => console.log(account.signer)}>
            Log signer
          </button>
      ) : (
        <p>Not connected</p>
      )}
  </>
}
```

Once connected you can access informations from `account`.

There is no methods to disconnected the wallet, users have to do it directly on the wallet.

## Auto refresh

`autoRefreshActive` is set by default to `true`, it listen block on the provider and update the state (update balance if account is connected for exemple). You can disable by default in the `EVMContext` config:

```js
// src/index.js
import { EVMContext } from "react-ethers"

ReactDOM.render(
  <React.StrictMode>
    <EVMContext autoRefresh={false}>
      <App />
    </EVMContext>
  </React.StrictMode>,
  document.getElementById("root")
)
```

Or by using `methods.setAutoRefresh`:

```js
import { useEVM } from "react-ethers"

const Dapp = () => {
  const { methods, autoRefreshActive } = useEVM()

  {...}

  return <>
    <button
        disabled={autoRefreshActive}
        onClick={() => methods.setAutoRefresh(true)}
      >
        On
      </button>
    <button
        disabled={!autoRefreshActive}
        onClick={() => methods.setAutoRefresh(false)}
      >
        Off
      </button>
  </>
}
```

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

When the connection is `injected` this will open the wallet (for Metamask) to confirm the switch of the network. All networks registered (on https://chainlist.org/ for exemple) in your web extensions are supported.

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

## Create a void signer

A [void signer](https://docs.ethers.io/v5/api/signer/#VoidSigner) is a "watch-only" account that cannot sign transaction:

```js
import { useEVM } from "react-ethers"

const Dapp = () => {
  const { methods } = useEVM()

  {...}

  return <>
      <button onClick={() => methods.createVoidSigner(
              "0xe5cc7a18b29a090c4Cc72eC7270C4ee1498F73aF"
            )}>
        Use "watch-only" account
       </button>

      <button onClick={() => methods.deleteVoidSigner()}>
        Delete void signer
       </button>
  </>
}
```

To create it you should not have any account connected to the dApp (in `injected` connection) and not have any others void signer created.

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

## Contribution

You can contribute by:

- using the librairy and report bug
- share new ideas to improve it
- fork and pull request

©Raphaël

<hr>
<div align="center">
<img width='30px' src='./assets/ethereum.png' alt='logo'/>
<img width='45px' src='./assets/polygon.png' alt='logo'/>
</div>
<h3 align='center'><b>react-ethers.wallet | 0x2437e49fe22a90565811dceccbe14dce98e9c086</b></h3>
