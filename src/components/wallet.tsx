import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import SimpleTransferArtifact from "../abi/SimpleTransfer.json";

// ✅ Manually define the deployed contract address:
const CONTRACT_ADDRESS = "0xYourDeployedAddressHere";

export const getContract = async (): Promise<ethers.Contract> => {
  if (!window.ethereum) throw new Error("MetaMask is not installed");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  // 👇 Explicitly return a Contract instance
  return new ethers.Contract(CONTRACT_ADDRESS, SimpleTransferArtifact.abi, signer);
};

const Wallet: React.FC = () => {
  const [balance, setBalance] = useState<string>("");
  const [receiver, setReceiver] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [account, setAccount] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<boolean>(false); // new state to track connection request

  useEffect(() => {
    if (window.ethereum) {
      // Check if an account is already connected
      window.ethereum.request({ method: "eth_accounts" }).then((accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      });

      // Check for the network (chainId)
      window.ethereum.request({ method: "eth_chainId" }).then((chainId: string) => {
        setNetwork(chainId);
      });

      // Listen for account changes
      //window.ethereum.on("accountsChanged", (accounts: string[]) => {
        //if (accounts.length > 0) {
          //setAccount(accounts[0]);
        //} else {
          //setAccount(null);
        //}
      //});

      // Listen for network changes
      window.ethereum.on("chainChanged", (chainId: string) => {
        setNetwork(chainId);
      });
    }
  }, []);

  const handleConnect = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    // Prevent multiple connect requests from happening simultaneously
    if (connecting) {
      return; // If there's already a connection request in progress, prevent another one
    }

    setConnecting(true); // Set the connecting flag to true to indicate the process is ongoing

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

      // If no account is selected, MetaMask will prompt to create one.
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        alert("Wallet connected!");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect wallet");
    } finally {
      setConnecting(false); // Reset the connecting flag once the request is finished
    }
  };

  const getBalance = async () => {
    if (!account) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const balanceBigInt = await provider.getBalance(account);
      const balanceEther = ethers.formatEther(balanceBigInt);
      setBalance(balanceEther);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch balance");
    }
  };

  const sendTransaction = async () => {
    if (!receiver || !amount || !account) {
      alert("Please provide all fields and connect your wallet!");
      return;
    }

    try {
      const contract = await getContract();
      const tx = await contract.sendEther(receiver, {
        value: ethers.parseEther(amount),
      });

      await tx.wait();
      alert("Transaction Successful!");
      getBalance(); // Refresh balance after successful transaction
    } catch (err) {
      console.error(err);
      alert("Transaction Failed!");
    }
  };

  return (
    <div className="p-6 flex flex-col gap-4 items-center bg-gray-900 text-white rounded-xl">
      <h1 className="text-3xl font-bold">Wallet</h1>

      {!account ? (
        <button
          onClick={handleConnect}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-xl"
          disabled={connecting} // Disable the button while a connection request is in progress
        >
          {connecting ? "Connecting..." : "Connect Wallet"}
        </button>
      ) : (
        <div>
          <p className="text-lg">Connected Account: {account}</p>
          <p className="text-lg">Network: {network}</p>
        </div>
      )}

      <button onClick={getBalance} className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-xl">
        Get Balance
      </button>

      <p className="text-lg">Balance: {balance ? `${balance} ETH` : "Not Fetched"}</p>

      <input
        type="text"
        placeholder="Receiver Address"
        value={receiver}
        onChange={(e) => setReceiver(e.target.value)}
        className="px-4 py-2 rounded-xl text-black"
      />
      <input
        type="text"
        placeholder="Amount in ETH"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="px-4 py-2 rounded-xl text-black"
      />

      <button onClick={sendTransaction} className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-xl">
        Send ETH
      </button>
    </div>
  );
};

export default Wallet;
