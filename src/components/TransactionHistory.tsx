'use client';

import React from 'react';
import { History, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Transaction {
  id: string;
  type: 'send' | 'receive';
  amount: number;
  address: string;
  timestamp: number;
  status: 'confirmed' | 'pending' | 'failed';
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

const TransactionHistory = ({ transactions }: TransactionHistoryProps) => {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };

  const shortenAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <div className="p-6 flex flex-col gap-4 items-center bg-gray-900 text-white rounded-xl">
      <div className="flex items-center gap-2 mb-5">
        <History size={18} className="text-white/70" />
        <h2 className="text-xl font-display font-semibold text-white/90">Transaction History</h2>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-6 text-white/60">
          <p>No transactions yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div 
              key={tx.id} 
              className="flex items-center justify-between p-4 rounded-xl bg-white/10 hover:bg-white/15 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center",
                  tx.type === 'send' ? "bg-red-500/20" : "bg-green-500/20"
                )}>
                  {tx.type === 'send' ? (
                    <ArrowUp size={20} className="text-red-400" />
                  ) : (
                    <ArrowDown size={20} className="text-green-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-white/90">
                    {tx.type === 'send' ? 'Sent' : 'Received'}
                  </p>
                  <p className="text-xs text-white/60">
                    {shortenAddress(tx.address)} • {formatDate(tx.timestamp)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={cn(
                  "font-medium",
                  tx.type === 'send' ? "text-red-400" : "text-green-400"
                )}>
                  {tx.type === 'send' ? '-' : '+'}{tx.amount} ETH
                </p>
                <p className={cn(
                  "text-xs",
                  tx.status === 'confirmed' ? "text-green-400" : 
                  tx.status === 'pending' ? "text-yellow-400" : "text-red-400"
                )}>
                  {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
