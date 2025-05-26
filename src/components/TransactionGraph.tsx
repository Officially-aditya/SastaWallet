
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction } from './TransactionHistory';

interface TransactionGraphProps {
  transactions: Transaction[];
}

const TransactionGraph = ({ transactions }: TransactionGraphProps) => {
  // Process transactions for chart data
  const processDataForChart = () => {
    if (transactions.length === 0) return [];
    
    // Sort transactions by timestamp
    const sortedTransactions = [...transactions].sort((a, b) => a.timestamp - b.timestamp);
    
    // Group by day
    const groupedByDay: Record<string, { sent: number; received: number }> = {};
    
    sortedTransactions.forEach(tx => {
      const date = new Date(tx.timestamp).toLocaleDateString();
      
      if (!groupedByDay[date]) {
        groupedByDay[date] = { sent: 0, received: 0 };
      }
      
      if (tx.type === 'send') {
        groupedByDay[date].sent += tx.amount;
      } else {
        groupedByDay[date].received += tx.amount;
      }
    });
    
    // Convert to array for Recharts
    return Object.entries(groupedByDay).map(([date, values]) => ({
      date,
      sent: values.sent,
      received: values.received,
    }));
  };

  const chartData = processDataForChart();
  
  // If there's no data, show placeholder data
  const data = chartData.length > 0 ? chartData : [
    { date: '2025-04-25', sent: 0, received: 0 },
    { date: '2025-04-26', sent: 0, received: 0 },
    { date: '2025-04-27', sent: 0, received: 0 },
    { date: '2025-04-28', sent: 0, received: 0 },
    { date: '2025-04-29', sent: 0, received: 0 },
  ];

  return (
    <div className="p-6 flex flex-col gap-4 items-center bg-gray-900 text-white rounded-xl">
      <h2 className="text-xl font-display font-semibold text-white/90 mb-5">Transaction Activity</h2>
      
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#4CAF50" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis 
              dataKey="date" 
              stroke="#ffffff50" 
              tick={{ fill: '#ffffff80' }} 
              tickLine={{ stroke: '#ffffff30' }}
            />
            <YAxis 
              stroke="#ffffff50" 
              tick={{ fill: '#ffffff80' }} 
              tickLine={{ stroke: '#ffffff30' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(20, 20, 30, 0.9)', 
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0.5rem',
                color: 'white'
              }} 
            />
            <Area 
              type="monotone" 
              dataKey="sent" 
              stroke="#FF6B6B" 
              fillOpacity={1}
              fill="url(#colorSent)" 
              name="Sent"
            />
            <Area 
              type="monotone" 
              dataKey="received" 
              stroke="#4CAF50" 
              fillOpacity={1}
              fill="url(#colorReceived)" 
              name="Received"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TransactionGraph;
