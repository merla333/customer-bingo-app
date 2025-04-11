// src/app/page.tsx

'use client';

import Link from 'next/link';

const users = ['mia', 'kris', 'theo', 'katie'];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-green-50 p-6 text-green-900">
      <h1 className="text-3xl font-bold text-center mb-8">🌿 Customer Bingo 🌿</h1>
      <div className="max-w-md mx-auto">
        <p className="text-center text-sm mb-6">Select your name to open your personal board:</p>
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

        <Link
          href="/tiles"
          className="block text-center bg-green-700 hover:bg-green-800 text-white py-2 px-4 rounded transition-all"
        >
          ➕ Add / Edit Tiles
        </Link>
      </div>
    </div>
  );
}
