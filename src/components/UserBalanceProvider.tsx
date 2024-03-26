'use client';
import { UserBalance } from '@/lib/db/schema';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import React, { ReactNode, createContext, useContext, useState } from 'react';

interface UserBalanceContextType {
  userBalance: UserBalance;
  updateUserBalance: (increment: number) => void;
  setUserBalance: (balance: UserBalance) => void;
}
type balanceParams = {
  increment: number;
};
type Props = {
  children: ReactNode;
};

const UserBalanceContext = createContext<UserBalanceContextType | undefined>(
  undefined
);
const UserBalanceProvider: React.FC<Props> = ({ children }) => {
  const [userBalance, setUserBalance] = useState<UserBalance>({ userId: '' });
  const { mutate } = useMutation({
    mutationFn: async (data: balanceParams) => {
      const response = await axios.post<UserBalance>('/api/update-balance', {
        data,
      });
      return response.data;
    },
  });
  const updateUserBalance = (increment: number) => {
    if (userBalance && increment) {
      const data = { increment: increment };
      mutate(data, {
        onSuccess(data) {
          setUserBalance(data);
        },
      });
    }
  };

  return (
    <UserBalanceContext.Provider
      value={{ userBalance, setUserBalance, updateUserBalance }}
    >
      {children}
    </UserBalanceContext.Provider>
  );
};

function useUserBalance() {
  const context = useContext(UserBalanceContext);
  if (context === undefined)
    throw new Error(
      'UserBalanceContext is used outside the UserBalanceProvider'
    );
  return context;
}

export { UserBalanceProvider, useUserBalance };
