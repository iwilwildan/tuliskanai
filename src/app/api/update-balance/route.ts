import { db } from '@/lib/db';
import { $userBalance } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { userId, increment } = body.data;

    if (!userId || !increment) {
      return new NextResponse('missing URL params', { status: 400 });
    }

    //get db note object
    const userBalances = await db
      .select()
      .from($userBalance)
      .where(eq($userBalance.userId, userId));

    if (userBalances.length != 1) {
      return new NextResponse('failed to update', { status: 500 });
    }
    const balance = userBalances[0];
    await db
      .update($userBalance)
      .set({ creditBalance: balance.creditBalance + increment })
      .where(eq($userBalance.userId, userId));

    return NextResponse.json(
      { ...balance, creditBalance: balance.creditBalance + increment },
      { status: 200 }
    );
  } catch (err) {
    console.log(err);

    return NextResponse.json({ success: false }, { status: 500 });
  }
}
