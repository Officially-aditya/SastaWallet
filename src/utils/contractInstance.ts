import { ethers } from "ethers";
import { SIMPLE_TRANSFER_CONTRACT } from "../constants/addresses";  // Import the contract object

declare global {
  interface Window {
    ethereum?: any;
  }
}

export async function getContract() {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  // Access address and ABI separately
  const contract = new ethers.Contract(
    SIMPLE_TRANSFER_CONTRACT.address, // Address is a string
    SIMPLE_TRANSFER_CONTRACT.abi,     // ABI is an array
    signer
  );

  return contract;
}
