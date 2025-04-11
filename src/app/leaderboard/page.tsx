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
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const snapshot = await getDocs(collection(db, 'leaderboard'));
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as { wins: number }),
      }));
      const sorted = list.sort((a, b) => b.wins - a.wins);
      setEntries(sorted);
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="min-h-screen bg-green-50 p-6 text-green-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-center w-full">🏆 Leaderboard</h1>
        <Link href="/" className="absolute right-4 top-6 text-blue-600 hover:underline text-sm">
          Home
        </Link>
      </div>

      <div className="max-w-md mx-auto">
        {entries.length === 0 ? (
          <p className="text-center text-gray-600">No wins recorded yet.</p>
        ) : (
          <ul className="space-y-2">
            {entries.map((entry, index) => (
              <li
                key={entry.id}
                className="bg-white p-3 border border-green-200 rounded shadow-sm flex justify-between items-center"
              >
                <span className="font-semibold text-green-800">
                  {index + 1}. {entry.id.charAt(0).toUpperCase() + entry.id.slice(1)}
                </span>
                <span className="text-sm text-gray-700">{entry.wins} win{entry.wins !== 1 ? 's' : ''}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
