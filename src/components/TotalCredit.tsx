'use client';
import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { useUserBalance } from './UserBalanceProvider';
import axios from 'axios';
import { UserBalance } from '@/lib/db/schema';
import toast from 'react-hot-toast';

type Props = {
  userId: string;
};

const TotalCredit = ({ userId }: Props) => {
  const { userBalance, setUserBalance } = useUserBalance();
  const [isLoading, setIsLoading] = useState(false);
  useEffect(
    function () {
      async function fetchBalance() {
        try {
          setIsLoading(true);
          const response = await axios.post<UserBalance>('/api/get-balance', {
            userId,
          });

          setUserBalance(response.data);
        } catch (error) {
          toast.error('Error fetching the balance');
        } finally {
          setIsLoading(false);
        }
      }
      if (!userBalance.id) fetchBalance();
    },
    [userId]
  );

  return (
    !isLoading && <Button disabled>Credit: {userBalance?.creditBalance}</Button>
  );
};

export default TotalCredit;
