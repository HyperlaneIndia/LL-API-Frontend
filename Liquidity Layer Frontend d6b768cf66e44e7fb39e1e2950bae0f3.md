# Liquidity Layer Frontend

Hey Developers! We will be building a simple frontend application which would be a useful template to call the Liquidity Layer contract that was developed in previous blog. In a gist, you will be transferring USDC through CIRCLE bridge into other chains. All of this happens under the hood of Hyperlane. So lets get started:

We will be walking through the following series:

- Setup
- Connect Wallet
- Contracts Integration
- Additional JSX
- Calling Contract

<aside>
💡 Liquidity Layer mainly deals with transfer of USDC and is active on Goerli and Fuji testnets. We have deployed contracts on Fuji networks in the previous blog as getting Fuji faucet is much easier than Goerli. Hence we will be sending USDC from Fuji to Goerli.

</aside>

## Setup:

We have setup a basic react app on [Replit](https://replit.com/@shreyaspadmakir/interchain-messages). You can fork this repository and start working with it. It is a simple create-react-app command implemented application.

Replit Instance : [https://replit.com/@shreyaspadmakir/interchain-messages](https://replit.com/@shreyaspadmakir/interchain-messages)

(If you are using Replit, you can skip till [here](https://www.notion.so/Interchain-Query-Frontend-822ca8e9a1da4d149e92492383a043b9?pvs=21))

So if you don’t want to use the replit then open the terminal in the desired directory for your frontend application and enter the following command (hoping you have npm installed, else install npm and then continue)

```bash
npx create-react-app messaging-api-frontend
```

If you are using through the above command and not the [replit](https://replit.com/@shreyaspadmakir/interchain-messages) instance, then I would recommend to navigate to the `./src` folder and open the `App.js` file. Inside the `App.js` file, in the return section, remove all of the JSX except the div with className as “App”.

![Untitled](Liquidity%20Layer%20Frontend%20d6b768cf66e44e7fb39e1e2950bae0f3/Untitled.png)

## Connect Wallet:

Now that our application is ready to be set up, lets start building the following components:

- Connect Wallet button : we need a `signer` to sign the transaction right.
- Button to call the contract on a remote chain which will in turn fetch the votes from another remote chain.

Since we have an idea of what we are building with the components lets get started with the functionality.

Initially, lets install ethers library using the following command:

```bash
npm i ethers
```

We use ethers library to interact with contracts. 

The first step is to get the user to connect his wallet to our webapp/frontend.

So, lets create a button. Inside the div as follows:

```html
<div className="App">
	<button>Connect Wallet</button>
</div>
```

If you wish to see your app changes, for:

One’s using Replit, just press the Run button.

One’s using local setup, run the following command:

```bash
npm run start
```

You can see a button in the top middle of the screen.

Lets add some functionality to it so that it pops up a wallet and return the account address as well as the provider. We need the provider as it contains the signer object.

Lets add the following piece of code to our codebase. In the `App.js` :

```jsx
import { useState } from "react";
import { ethers } from "ethers";

function App(){
	const [wallet, setWallet] = useState();
  const [provider, setProvider] = useState();
const connectWallet = () => {
    const { ethereum } = window;
    if (!ethereum) {
      alert("Get metamask!");
    }
    ethereum
      .request({ method: "eth_requestAccounts" })
      .then(async (accounts) => {
        setWallet(accounts[0]);
        let newProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(newProvider);
        console.log(await newProvider.getNetwork());
        if ((await newProvider.getNetwork()).chainId !== 80001n) {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0xa869" }],      // fuji network
          });
          setProvider(new ethers.BrowserProvider(window.ethereum));
        }
      });
  };
return(
	<div className="App">
		<button onClick={connectWallet}>Connect Wallet</button>
	</div>
);
}

export default App;
```

Add the code accordingly or just copy paste your `App.js` file with above code.

Here we are using useState hook, to set wallet address, and to set the provider. 

In the connectWallet function, we are checking for a object destructuring named as ethereum from the window library. Usually EVM wallets are named as ethereum and the most common one, Metamask pops up for the same. If you want to use any other wallet, recommend to use a wallet hook from walletConnect SDK. 

Now, if there is an ethereum object or a wallet available, then it pops up whenever a button is clicked and then asks for permission to grant the user details to the webapp. If you press connect, then your webapp will have access to account address as well as the provider. 

And here, since we have our Router contract deployed on Mumbai, we will be telling the user to shift to Mumbai network if he is not connected to the Mumbai network. We do this by checking the `provider.getNetwork()` method and comparing the chain ID retrieved. Once we have the chain changed, we will be setting the new Provider through which we will be retrieving the signer object.

Once you have added this piece of code, just try to hit the button as you will see a wallet pop up and if no wallet exists, then, it will throw an alert as ”Get Metamask!” 

And finally lets get the signer object from the provider. Lets write a simple function after connectWallet(). Add this piece of code under connectWallet() function.

```jsx
const getSigner = async () => {
    const signer = await provider.getSigner();
    return signer;
  };
```

This above piece of code will return the signer object which will be needed later.

## Contract:

Now, lets construct the contracts. 

Inside your `./src` directory, create a folder named `./utils` . Under `./utils` create 3 files named `contracts.js` , `liquidityLayer.json` and `erc20ABI.json` 

`contracts.js` file will have the Router contract instantiations.

`liquidityLayer.json` will have the ABI of router contract.

`erc20ABI.json`  will have the ABI of ERC20 which is our USDC contract.

You can find the ABI by copy pasting the [contract](https://github.com/HyperlaneIndia/Query-API/blob/main/src/VoteRouter.sol) into remix → Compile → Copy ABI and then paste it into respective JSON files. It will usually be an array object.

Now lets deep dive to creating contract connections.

Inside `contracts.js` add the following piece of code:

```jsx
/**
 * Instantiate contracts
 */
import { ethers } from "ethers";
import abiLayer from "./liquidityLayer.json";
import abiERC from "./ERC20.json"

const contractAddress = "0xdEB0F354CC542Cb6d4E86836850505782E3Df3C0";
const usdcAddress = "0x5425890298aed601595a70AB815c96711a31Bc65";

export const fetchContract = async (signer) => {
  return new ethers.Contract(contractAddress, abiLayer, signer);
};

export const fetchERCContract = async(signer) => {
	return new ethers.Contract(usdcAddress, abiERC, signer);
}
```

You can change the address as per your deployment addresses. 

Now there is 1 function which take the signer as an argument and return a Contract interface. The ethers.Contract takes in 3 arguments, the address of the contract, ABI of the contract, signer instance. The signer argument will be passed during the function call which we will see down the line.

Now that we have the **provider**, **contracts** ready, lets start calling the contract from our main file i.e. `App.js` .

Lets import our `contracts.js` into our `App.js` file. We will include import statement in the top of the file under the import statements.

## Additional JSX:

We now need things like 

- Amount : Amount of USDC
- Message : Message for the transaction
- Destination chain
- Address of our contract

We now will setup input elements with useState hooks to cater to the above needs. Just paste the code below in the start ,i.e. right above the `App()` function where we used the useState hook for storing wallet and provider.

```jsx
  const [amount, setAmount] = useState(0);
  const [message, setMessage] = useState("");
```

Now add the following JSX below the `connect wallet` button in the return statement.

```jsx

      <input type="text" onChange={(e) => setMessage(e.target.value)} />
      <input type="number" min={0} onChange={(e) => setAmount(e.target.value)} />
```

Hence here we are storing the states of Message and Amount.

We will set the destination chain to Goerli with the domain ID `5` (you will find it [here](https://docs.hyperlane.xyz/docs/resources/domains#testnet)). 

We will set the contract address to our contract address. 

Add the below lines to your codebase below the useState hooks.

 

```jsx
  const address = '0xdEB0F354CC542Cb6d4E86836850505782E3Df3C0';   // contract address
  const destination = 5;   // destination chain domain id
```

Now with these values we can now move ahead to call the contract.

## Call Contract:

Now lets import the contract instances created in the `./utils/contracts.js` as follows which will enable us to use the contract in the `App.js` file. We import as follows, in `App.js` :

```jsx
import { fetchContract, fetchERCContract } from "./utils/contracts";
```

We will now be coding a button to call the contract. Just add a button below the last input element as follows:

```jsx
<button onClick={contractCall}>Send</button>
```

Let us finally define the `contractCall` function right below `getSigner()` function, which would include the following functionality:

- getting signer from the provider
- checking if the address provided is the right address
- getting contract instances
- Getting approval of USDC contract
- Calling the contract with required parameters

The code for the following is shown below:

```jsx
const contractCall = async () => {
    if (provider !== null) {
      const signer = await getSigner();
      const checkAddress = ethers.isAddress(address); // address variable was set above

      if (checkAddress === false) {
        alert("Invalid address");
        return;
      }
      const usdcContract = await fetchERCContract(signer);
      const approval = await usdcContract.approve("", amount);

      if (approval === false) {
        alert("Approval failed");
        return;
      }
      const contract = await fetchContract(signer);
      const tx = await contract.send(destination, address, amount, message, {
        value: "0.01",
        gasLimit: 1000000,
      });
      console.log(tx);
    }
  };
```

The only aspect where a normal contract interaction changes with respect to a contract integrating Hyperlane is while calling the function which enables Hyperlane APIs. Hence we see that we attach value to the function while calling which will be used by `InterchainGasPaymaster` as it enables to bridge tokens to the other chain. 

## Conclusion:

Hence, with this simple frontend and implementation you can design a webapp that will deal with contracts that have Hyperlane integration to them. As  in the beginning, the change in building an application from a normal application to that which has implemented Hyperlane is  simple with just adding a value parameter to the function that will send to another contract on a remote chain via Hyperlane.

The link to GitHub repository is given below:

[https://github.com/HyperlaneIndia/LL-API-Frontend](https://github.com/HyperlaneIndia/LL-API-Frontend)

Happy Buidling!