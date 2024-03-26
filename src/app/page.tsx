import FileUpload from '@/components/FileUpload';
import TotalCredit from '@/components/TotalCredit';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/db';
import { $userBalance, documents } from '@/lib/db/schema';
import { UserButton, auth } from '@clerk/nextjs';
import { eq } from 'drizzle-orm';
import { LogIn } from 'lucide-react';
import Link from 'next/link';

export default async function Home() {
  const { userId } = await auth();
  const isAuth = !!userId;
  let linkToDocs = '/';
  if (userId) {
    const _documents = await db
      .select()
      .from(documents)
      .where(eq(documents.userId, userId));
    if (_documents.length >= 1) {
      linkToDocs = `/document/${_documents.findLast((x) => x.id)!.id}`;
    }
  }

  return (
    <div className="w-screen min-h-screen bg-gradient-to-r from-indigo-200 via-red-200 to-yellow-100">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center">
            <h1 className="mr-3 text-5xl font-semibold">
              <span className=" text-blue-400">Kamu arahkan, </span>AI tuliskan.
            </h1>
            <UserButton afterSignOutUrl="/"></UserButton>
          </div>
          <div className="flex mt-2 gap-1">
            {isAuth && (
              <>
                <Link href={linkToDocs}>
                  <Button>Menuju Ruang Kerja</Button>
                </Link>
                <TotalCredit />
              </>
            )}
          </div>
          <p className="max-w-xl mt-1 text-lg text-slate-600">
            Gunakan AI untuk pelajari dokumen mu lebih cepat. Chat dengan PDF,
            Buat makalah, rangkuman, essay, proposal penelitian secara instan!
          </p>
          <div className="w-full mt-4">
            {isAuth ? (
              <FileUpload />
            ) : (
              <Link href="/sign-in">
                <Button>
                  Login untuk memulai!
                  <LogIn className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
