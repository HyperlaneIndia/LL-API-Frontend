import "./App.css";
import { useState } from "react";
import { ethers } from "ethers";
import { fetchContract, fetchERCContract } from "./utils/contracts";

function App() {
  const [wallet, setWallet] = useState();
  const [provider, setProvider] = useState();
  const address = "0xdEB0F354CC542Cb6d4E86836850505782E3Df3C0"; // contract address
  const destination = 5; // destination chain domain id
  const [amount, setAmount] = useState(0);
  const [message, setMessage] = useState("");

  /**
   * Function to connect the wallet
   * When the wallet is connected, the wallet address is set to the state along with provider
   */
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
        if ((await newProvider.getNetwork()).chainId !== 43113n) {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0xa869" }], // fuji chain
          });
          setProvider(new ethers.BrowserProvider(window.ethereum));
          console.log(wallet);
        }
      });
  };

  /**
   *
   * @returns signer
   * Returns the signer for the provider which will be used to call the metamask to sign transactions
   */

  const getSigner = async () => {
    const signer = await provider.getSigner();
    return signer;
  };

  const contractCall = async () => {
    if (provider !== null) {
      const signer = await getSigner();
      const checkAddress = ethers.isAddress(address);

      if (checkAddress === false) {
        alert("Invalid address");
        return;
      }
      const usdcContract = await fetchERCContract(signer);
      const approval = await usdcContract
        .approve(address, amount)
        .catch((e) => {
          console.log(e);
          return false;
        });

      if (approval === false) {
        alert("Approval failed");
        return;
      }

      const contract = await fetchContract(signer);
      const tx = await contract
        .send(destination, address, amount, message, {
          value: "0.01",
          gasLimit: 1000000,
        })
        .then((hash) => {
          console.log(hash.hash);
        })
        .catch((e) => {
          console.log(e);
        });
      console.log(tx);
    }
  };

  return (
    <div className="App">
      <button onClick={connectWallet}>Connect Wallet</button>
      <input type="text" onChange={(e) => setMessage(e.target.value)} />
      <input
        type="number"
        min={0}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={contractCall}>Send</button>
    </div>
  );
}

export default App;
