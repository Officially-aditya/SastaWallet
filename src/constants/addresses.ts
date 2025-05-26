//export const CONTRACT_ADDRESS = "0x7d3c8E5edbBD0797e6EaeC09005EB7E50e6f615e";
// src/constants/contracts.ts (or wherever you keep config)

import artifact from '../abi/SimpleTransfer.json';

export const SIMPLE_TRANSFER_CONTRACT = {
  address: "0x293E7f49057A8F3962d005dC697ce1b6788dE543", // <-- Replace this!
  abi: artifact.abi,
};
