'use client';

import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Send, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';

interface TransactionFormProps {
  walletAddress: string;
  onSend?: (receiver: string, amount: number) => void;
}

const TransactionForm = ({ walletAddress, onSend }: TransactionFormProps) => {
  const [receiverAddress, setReceiverAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const estimatedGas =
    receiverAddress && parseFloat(amount) > 0
      ? (0.0001 + parseFloat(amount) * 0.002).toFixed(6)
      : '0.0001';

  const handleSend = async () => {
    if (!window.ethereum) {
      toast({
        title: 'Wallet Not Found',
        description: 'Please install MetaMask or a compatible wallet',
        variant: 'destructive',
      });
      return;
    }

    if (!receiverAddress || !amount) {
      toast({
        title: 'Invalid Transaction',
        description: 'Please enter both receiver address and amount',
        variant: 'destructive',
      });
      return;
    }

    if (!receiverAddress.startsWith('0x') || receiverAddress.length !== 42) {
      toast({
        title: 'Invalid Address',
        description: 'Please enter a valid Ethereum address',
        variant: 'destructive',
      });
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();

      toast({
        title: 'Transaction Initiated',
        description: `Sending ${amount} ETH to ${receiverAddress.slice(0, 10)}...`,
      });

      const tx = await signer.sendTransaction({
        to: receiverAddress,
        value: ethers.parseEther(amount),
      });

      await tx.wait();

      toast({
        title: 'Success',
        description: `Sent ${amount} ETH to ${receiverAddress.slice(0, 10)}...`,
      });

      onSend?.(receiverAddress, parseFloat(amount));
      setReceiverAddress('');
      setAmount('');
    } catch (error: any) {
      toast({
        title: 'Transaction Error',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-6 flex flex-col gap-4 items-center bg-gray-900 text-white rounded-xl">
      <div className="space-y-4">
        <div className="flex flex-col gap-3">
          <label className="text-sm text-white/70">Receiver's Address</label>
          <Input
            placeholder="0x..."
            value={receiverAddress}
            onChange={(e) => setReceiverAddress(e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-lg px-4 py-2"
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-sm text-white/70">Amount (ETH)</label>
          <Input
            type="number"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-lg px-4 py-2"
            step="0.001"
            min="0"
          />
        </div>

        {(receiverAddress || amount) && (
          <div className="flex justify-between text-sm py-2 px-1">
            <span className="text-white/60">Estimated Gas Fee:</span>
            <span className="text-white/80">{estimatedGas} ETH</span>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg px-4 py-2 flex items-center justify-center gap-2"
            onClick={handleSend}
          >
            <Send size={18} />
            Send
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="flex-1 border-purple-500 hover:bg-purple-600 text-purple-500 hover:text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2"
              >
                <Wallet size={18} />
                Receive
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/20 text-white">
              <DialogHeader>
                <DialogTitle className="text-center text-xl">Your Wallet Address</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4 p-4">
                <div className="bg-white/10 border border-white/20 rounded-xl p-4 w-full break-all font-mono text-center text-sm">
                  {walletAddress}
                </div>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(walletAddress);
                    toast({
                      description: 'Address copied to clipboard',
                    });
                    setIsDialogOpen(false);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2"
                >
                  Copy Address
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default TransactionForm;
