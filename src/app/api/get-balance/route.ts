import { db } from '@/lib/db';
import { $userBalance } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const POST = async (req: Request) => {
  const { userId } = await req.json();
  const balances = await db
    .select()
    .from($userBalance)
    .where(eq($userBalance.userId, userId));

  if (balances.length != 1) return NextResponse.json({ status: 400 });
  return NextResponse.json(balances[0]);
};
