import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Copy, CopyCheck, ToggleLeft, ToggleRight, CircleDollarSign, Bitcoin, Coins, CircleEllipsis } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import SimpleTransferArtifact from "../abi/SimpleTransfer.json";

const CONTRACT_ADDRESS = "0xYourDeployedAddressHere"; // Replace with actual contract address

const Wallet = () => {
  const [balance, setBalance] = useState<string>("0");
  const [receiver, setReceiver] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [account, setAccount] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState("Ethereum");
  const [networkType, setNetworkType] = useState<"Mainnet" | "Testnet">("Mainnet");
  const [currency, setCurrency] = useState("ETH");
  const [efficientMode, setEfficientMode] = useState(false);

  const networks = [
    { name: "Ethereum", icon: <CircleDollarSign className="h-4 w-4" />, type: "Mainnet", currency: "ETH" },
    { name: "Bitcoin", icon: <Bitcoin className="h-4 w-4" />, type: "Mainnet", currency: "BTC" },
    { name: "Polygon", icon: <Coins className="h-4 w-4" />, type: "Mainnet", currency: "MATIC" },
    { name: "Solana", icon: <CircleEllipsis className="h-4 w-4" />, type: "Mainnet", currency: "SOL" },
    { name: "Polygon Amoy", icon: <Coins className="h-4 w-4" />, type: "Testnet", currency: "MATIC" },
    { name: "Holesky", icon: <CircleDollarSign className="h-4 w-4" />, type: "Testnet", currency: "ETH" },
    { name: "Ethereum Sepolia", icon: <CircleDollarSign className="h-4 w-4" />, type: "Testnet", currency: "ETH" }
  ];

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: "eth_accounts" }).then((accounts: string[]) => {
        if (accounts.length > 0) setAccount(accounts[0]);
      });
      window.ethereum.request({ method: "eth_chainId" }).then((chainId: string) => {
        setNetwork(chainId);
      });
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
    if (connecting) return;

    setConnecting(true);
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        alert("Wallet connected!");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect wallet");
    } finally {
      setConnecting(false);
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
      const tx = await contract.sendEther(receiver, { value: ethers.parseEther(amount) });
      await tx.wait();
      alert("Transaction Successful!");
      getBalance(); // Refresh balance after successful transaction
    } catch (err) {
      console.error(err);
      alert("Transaction Failed!");
    }
  };

  const getContract = async (): Promise<ethers.Contract> => {
    if (!window.ethereum) throw new Error("MetaMask is not installed");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, SimpleTransferArtifact.abi, signer);
  };

  const handleNetworkTypeChange = (value: "Mainnet" | "Testnet") => {
    setNetworkType(value);
    const firstNetworkOfType = networks.find(network => network.type === value);
    if (firstNetworkOfType) {
      setSelectedNetwork(firstNetworkOfType.name);
      setCurrency(firstNetworkOfType.currency);
    }
    toast({ description: `Switched to ${value} networks`, duration: 2000 });
  };

  const handleNetworkChange = (networkName: string) => {
    const network = networks.find(n => n.name === networkName);
    if (network) {
      setSelectedNetwork(networkName);
      setCurrency(network.currency);
      toast({ description: `Switched to ${networkName}`, duration: 2000 });
    }
  };

  const shortenAddress = (addr: string) => `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;

  const toggleEfficientMode = () => {
    setEfficientMode(!efficientMode);
    toast({
      description: `Switched to ${!efficientMode ? "Efficient" : "Normal"} smart contracts`,
      duration: 2000,
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(account ?? "");
    setCopied(true);
    toast({
      description: "Address copied to clipboard",
      duration: 2000,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 flex flex-col gap-4 items-center bg-gray-900 text-white rounded-xl">
      <h1 className="text-3xl font-bold">NetMain Wallet</h1>

      {!account ? (
        <button
          onClick={handleConnect}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-xl"
          disabled={connecting}
        >
          {connecting ? "Connecting..." : "Connect Wallet"}
        </button>
      ) : (
        <div>
          <p className="text-lg">Connected Account: {account}</p>
          <p className="text-lg">Network: {network}</p>
        </div>
      )}

      <div className="flex justify-between items-center w-full mt-4">
        <div className="flex gap-4">
          <Select value={networkType} onValueChange={(value) => handleNetworkTypeChange(value as "Mainnet" | "Testnet")}>
            <SelectTrigger className="h-8 w-24 bg-black/30 border-white/10 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background/90 backdrop-blur-md">
              <SelectGroup>
                <SelectItem value="Mainnet">Mainnet</SelectItem>
                <SelectItem value="Testnet">Testnet</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple/20 text-purple text-xs font-medium cursor-pointer">
                {networks.find(n => n.name === selectedNetwork)?.icon}
                <span>{selectedNetwork}</span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-background/90 backdrop-blur-md">
              <DropdownMenuLabel>Select Network</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {networks
                  .filter(network => network.type === networkType)
                  .map(network => (
                    <DropdownMenuItem
                      key={network.name}
                      onClick={() => handleNetworkChange(network.name)}
                      className="cursor-pointer flex items-center gap-2"
                    >
                      {network.icon}
                      <span>{network.name}</span>
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div>
          <button onClick={getBalance} className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-xl">
            Get Balance
          </button>
        </div>
      </div>

      <div className="text-3xl md:text-4xl font-display font-bold gradient-text mb-1">
        {balance} {currency}
      </div>
      <div className="flex items-center gap-2 text-white/70 text-sm">
        <Button variant="ghost" size="sm" className="px-0 h-auto hover:bg-transparent hover:text-white flex items-center gap-1" onClick={copyToClipboard}>
          <span className="font-mono">{shortenAddress(account ?? "")}</span>
          {copied ? <CopyCheck size={14} /> : <Copy size={14} />}
        </Button>
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/70">Contract Mode:</span>
          <span className="text-sm font-medium text-white/90">{efficientMode ? "Efficient" : "Normal"}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/60">{efficientMode ? "Low Gas" : "Standard"}</span>
          <div onClick={toggleEfficientMode} className="cursor-pointer">
            {efficientMode ? (
              <ToggleRight className="h-6 w-6 text-purple" />
            ) : (
              <ToggleLeft className="h-6 w-6 text-white/60" />
            )}
          </div>
        </div>
      </div>


    </div>
  );
};

export default Wallet;
