// src/app/components/BingoBoard.tsx

'use client';

import { useEffect, useState, useCallback } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface BingoBoardProps {
  username?: string;
}

interface BingoTile {
  id: string;
  text: string;
}

const winPatterns = [
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24],
  [0, 5, 10, 15, 20],
  [1, 6, 11, 16, 21],
  [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23],
  [4, 9, 14, 19, 24],
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20]
];

function checkBingo(selected: number[]) {
  return winPatterns.some(pattern => pattern.every(i => selected.includes(i)));
}

export default function BingoBoard({ username = 'guest' }: BingoBoardProps) {
  const [tiles, setTiles] = useState<BingoTile[]>([]);
  const [selected, setSelected] = useState<number[]>([12]);
  const [won, setWon] = useState(false);
  const [someoneWon, setSomeoneWon] = useState<string | null>(null);
  const [refreshedAt, setRefreshedAt] = useState<string | null>(null);
  const router = useRouter();

  const generateNewBoard = useCallback(async () => {
    const confirmed = window.confirm('Are you sure you want to refresh your board? This will clear your current progress.');
    if (!confirmed) return;

    const snapshot = await getDocs(collection(db, 'tiles'));
    const tileList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BingoTile[];

    if (tileList.length < 24) {
      setTimeout(() => {
        alert('Not enough tiles yet! Add more on the main page.');
        router.push('/');
      }, 100);
      return;
    }

    const shuffled = [...tileList].sort(() => 0.5 - Math.random()).slice(0, 24);
    const finalTiles = [...shuffled.slice(0, 12), { id: 'free', text: 'Free Space 🌟' }, ...shuffled.slice(12)];

    const boardRef = doc(db, 'boards', username);
    await setDoc(boardRef, {
      tiles: finalTiles,
      selected: [12],
      winner: false,
      refreshedAt: serverTimestamp()
    });

    const now = new Date();
    const formatted = now.toLocaleDateString() + ' at ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setRefreshedAt(formatted);

    setTiles(finalTiles);
    setSelected([12]);
    setWon(false);
  }, [router, username]);

  useEffect(() => {
    const load = async () => {
      const boardRef = doc(db, 'boards', username);
      const boardSnap = await getDoc(boardRef);

      const allBoardsSnap = await getDocs(collection(db, 'boards'));
      const winner = allBoardsSnap.docs.find(doc => doc.data().winner === true && doc.id !== username);
      if (winner) setSomeoneWon(winner.id);

      if (boardSnap.exists()) {
        const data = boardSnap.data();
        setTiles(data.tiles);
        setSelected(data.selected || [12]);
        setWon(checkBingo(data.selected || [12]));

        if (data.refreshedAt && data.refreshedAt.toDate) {
          const date = data.refreshedAt.toDate();
          const formatted = date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setRefreshedAt(formatted);
        }
      } else {
        await generateNewBoard();
      }
    };

    load();
  }, [router, username, generateNewBoard]);

  const toggleTile = async (index: number) => {
    if (index === 12 || won) return;
    const newSelected = selected.includes(index)
      ? selected.filter(i => i !== index)
      : [...selected, index];
    setSelected(newSelected);

    const boardRef = doc(db, 'boards', username);
    await updateDoc(boardRef, { selected: newSelected });

    const hasBingo = checkBingo(newSelected);
    if (hasBingo && !won) {
      setWon(true);
      await updateDoc(boardRef, { winner: true });
    }
  };

  const capitalizedName = username.charAt(0).toUpperCase() + username.slice(1);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="text-center w-full">
          <h2 className="text-xl font-bold">{capitalizedName} Bingo Card</h2>
          <p className="text-sm italic text-gray-700">Get those bitches</p>
        </div>
        <Link href="/" className="text-blue-600 hover:underline text-sm absolute right-4 top-4">
          Home
        </Link>
      </div>

      {refreshedAt && (
        <div className="text-center text-sm text-gray-600 mb-2">
          Game started on {refreshedAt}
        </div>
      )}

      {someoneWon && !won && (
        <div className="bg-yellow-200 border border-yellow-400 text-yellow-900 p-4 mb-4 rounded text-center">
          🌟 {someoneWon} got BINGO! You can view your card, then generate a new one when you&apos;re ready.
        </div>
      )}

      {won && (
        <div className="fixed inset-0 flex items-center justify-center bg-green-900 bg-opacity-90 text-white text-2xl font-bold text-center z-50 p-4">
          🎉 You got BINGO! 🎉
        </div>
      )}

      <div className="grid grid-cols-5 gap-2 max-w-md mx-auto mb-4">
        {tiles.map((tile, index) => (
          <div
            key={tile.id}
            onClick={() => toggleTile(index)}
            className={`p-2 text-center border rounded cursor-pointer text-sm transition-all duration-200 ${
              selected.includes(index) ? 'bg-green-300 border-green-700' : 'bg-white border-gray-300'
            } ${index === 12 ? 'font-bold' : ''}`}
          >
            {tile.text}
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={generateNewBoard}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-all"
        >
          Refresh Board
        </button>
      </div>
    </div>
  );
}