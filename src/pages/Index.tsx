import React, { useState } from 'react';
import WalletHeader from '@/components/WalletHeader';
import TransactionForm from '@/components/TransactionForm';
import TransactionHistory from '@/components/TransactionHistory';
import TransactionGraph from '@/components/TransactionGraph';
import { Transaction } from '@/components/TransactionHistory';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';

const Index = () => {
  // Demo wallet data
  const walletAddress = '0x293E7f49057A8F3962d005dC697ce1b6788dE543';
  const [balance, setBalance] = useState('1.2345');
  
  // Transactions state
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'receive',
      amount: 0.5,
      address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      timestamp: Date.now() - 86400000 * 2, // 2 days ago
      status: 'confirmed'
    },
    {
      id: '2',
      type: 'send',
      amount: 0.125,
      address: '0xD8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      timestamp: Date.now() - 86400000, // 1 day ago
      status: 'confirmed'
    },
  ]);

  const handleSendTransaction = (receiver: string, amount: number) => {
    // Create new transaction
    const newTransaction: Transaction = {
      id: uuidv4(),
      type: 'send',
      amount,
      address: receiver,
      timestamp: Date.now(),
      status: 'pending'
    };
    
    // Update transactions
    setTransactions(prev => [newTransaction, ...prev]);
    
    // Update balance
    setBalance((prev) => (parseFloat(prev) - amount).toFixed(4));
    
    // Simulate transaction confirmation
    setTimeout(() => {
      setTransactions(prev => 
        prev.map(tx => 
          tx.id === newTransaction.id 
            ? { ...tx, status: 'confirmed' } 
            : tx
        )
      );
      
      toast({
        title: "Transaction Confirmed",
        description: `Successfully sent ${amount} ETH`,
      });
    }, 2000);
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-r from-gray-800 via-red-900 to-black rounded-xl">
      {/* Vignette overlay */}
      <div className="absolute inset-0 bg-black opacity-30 rounded-xl"></div>
      
      {/* Main content */}
      <div className="relative z-10 max-w-3xl mx-auto pt-8 pb-12 rounded-xl">
        <WalletHeader 
          address={walletAddress} 
          balance={balance} 
          currency="ETH" 
        />
        
        <TransactionForm 
          walletAddress={walletAddress}
          onSend={handleSendTransaction}
        />
        
        <TransactionHistory 
          transactions={transactions}
        />
        
        <TransactionGraph 
          transactions={transactions}
        />
      </div>
    </div>
  );
};

export default Index;
