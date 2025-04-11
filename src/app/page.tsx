'use client';

import Link from 'next/link';

const users = ['mia', 'kris', 'theo', 'katie'];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-green-50 p-6 text-green-900">
      <h1 className="text-3xl font-bold text-center mb-6">🌿 Customer Bingo 🌿</h1>

      <div className="max-w-md mx-auto">
        <p className="text-center text-sm mb-3">Select your name to open your personal board:</p>
        <p className="text-center text-xs italic mb-6 text-gray-700">
          You can look at someone else&apos;s card, but don&apos;t fuck with it
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {users.map((user) => (
            <Link
              key={user}
              href={`/play/${user}`}
              className="bg-white border border-green-300 rounded-lg p-4 text-center shadow hover:bg-green-100 transition-all"
            >
              {user.charAt(0).toUpperCase() + user.slice(1)}
            </Link>
          ))}
        </div>

        <div className="flex flex-col items-center gap-3">
          <Link href="/tiles" className="text-blue-600 hover:underline text-sm">
            ➕ Add / Edit Tiles
          </Link>
          <Link href="/leaderboard" className="text-blue-600 hover:underline text-sm">
            🏆 See Leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
}
