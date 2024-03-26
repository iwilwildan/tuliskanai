'use client';
import React, { useEffect, useState } from 'react';
import { useUserBalance } from './UserBalanceProvider';
import axios from 'axios';
import { UserBalance } from '@/lib/db/schema';
import toast from 'react-hot-toast';
import { Badge } from './ui/badge';

type Props = {};

const TotalCredit = (props: Props) => {
  const { userBalance, setUserBalance } = useUserBalance();
  const [isLoading, setIsLoading] = useState(false);
  useEffect(function () {
    async function fetchBalance() {
      try {
        setIsLoading(true);
        const response = await axios.post<UserBalance>('/api/get-balance');

        setUserBalance(response.data);
      } catch (error) {
        toast.error('Error fetching the balance');
      } finally {
        setIsLoading(false);
      }
    }
    if (!userBalance.id) fetchBalance();
  }, []);

  return !isLoading && <Badge>Credit: {userBalance?.creditBalance}</Badge>;
};

export default TotalCredit;
