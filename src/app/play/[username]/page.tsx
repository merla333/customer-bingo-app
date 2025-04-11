'use client';

import { useParams } from 'next/navigation';
import BingoBoard from '../components/BingoBoard';

export default function UserPlayPage() {
  const params = useParams();
  const username = params?.username as string;

  return (
    <main className="min-h-screen bg-blue-50 p-4">
      <h2 className="text-xl font-bold text-center mb-4">
        Bingo for {username ?? 'Player'}
      </h2>
      <BingoBoard username={username} />
    </main>
  );
}
