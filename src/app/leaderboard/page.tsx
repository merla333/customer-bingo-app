// src/app/leaderboard/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import Link from 'next/link';

interface LeaderboardEntry {
  id: string;
  wins: number;
}

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const fetchLeaders = async () => {
      const snapshot = await getDocs(collection(db, 'leaderboard'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as { wins: number }) }));
      const sorted = data.sort((a, b) => b.wins - a.wins);
      setLeaders(sorted);
    };

    fetchLeaders();
  }, []);

  const getEmoji = (index: number, wins: number, topWins: number) => {
    if (wins === topWins) return '👑';
    if (index >= leaders.length - 2) return '💩';
    return '✨';
  };

  return (
    <div className="min-h-screen bg-green-50 text-green-900 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <Link href="/" className="text-blue-600 hover:underline text-sm">Home</Link>
      </div>

      {leaders.length === 0 ? (
        <p>No winners yet! Be the first to get BINGO!</p>
      ) : (
        <ul className="space-y-4">
          {leaders.map((user, index) => (
            <li
              key={user.id}
              className={`flex justify-between items-center p-4 rounded-lg border shadow transition-all ${
                user.wins === leaders[0].wins ? 'bg-yellow-100 text-yellow-900 text-xl font-bold' :
                index >= leaders.length - 2 ? 'bg-gray-100 text-gray-600 text-sm italic' :
                'bg-white'
              }`}
            >
              <span>
                {getEmoji(index, user.wins, leaders[0].wins)}{' '}
                {user.id.charAt(0).toUpperCase() + user.id.slice(1)}
              </span>
              <span className="ml-2">{user.wins} win{user.wins !== 1 ? 's' : ''}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
