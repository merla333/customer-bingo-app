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
  serverTimestamp,
  increment,
  onSnapshot
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
  const [showBingoScreen, setShowBingoScreen] = useState(false);
  const [shouldShowWinner, setShouldShowWinner] = useState(false);
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

    const clearedRef = doc(db, 'clearedWinners', username);
    await setDoc(clearedRef, { cleared: true });

    setTiles(finalTiles);
    setSelected([12]);
    setWon(false);
    setShowBingoScreen(false);
    setSomeoneWon(null);
    setShouldShowWinner(false);

    const now = new Date();
    const formatted = now.toLocaleDateString() + ' at ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setRefreshedAt(formatted);
  }, [router, username]);

  useEffect(() => {
    const boardRef = doc(db, 'boards', username);
    const gameStatusRef = doc(db, 'gameStatus', 'current');
    const clearedRef = doc(db, 'clearedWinners', username);

    const loadBoard = async () => {
      const boardSnap = await getDoc(boardRef);
      const clearedSnap = await getDoc(clearedRef);

      if (boardSnap.exists()) {
        const data = boardSnap.data();
        setTiles(data.tiles);
        setSelected(data.selected || [12]);
        const hasWon = checkBingo(data.selected || [12]);
        setWon(hasWon);
        setShowBingoScreen(hasWon);

        if (data.refreshedAt && data.refreshedAt.toDate) {
          const date = data.refreshedAt.toDate();
          const formatted = date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setRefreshedAt(formatted);
        }
      } else {
        await generateNewBoard();
      }
    };

    const unsubscribe = onSnapshot(gameStatusRef, async (winnerSnap) => {
      const winnerData = winnerSnap.data();
      const clearedSnap = await getDoc(clearedRef);
      if (winnerData?.winner && winnerData.winner !== username) {
        setSomeoneWon(winnerData.winner);
        if (!clearedSnap.exists()) {
          setShouldShowWinner(true);
        }
      }
    });

    loadBoard();
    return () => unsubscribe();
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
      setShowBingoScreen(true);

      await updateDoc(boardRef, { winner: true });

      const leaderboardRef = doc(db, 'leaderboard', username);
      await updateDoc(leaderboardRef, { wins: increment(1) }).catch(async () => {
        await setDoc(leaderboardRef, { wins: 1 });
      });

      const gameStatusRef = doc(db, 'gameStatus', 'current');
      await setDoc(gameStatusRef, {
        winner: username,
        timestamp: serverTimestamp()
      });
    }
  };

  const capitalizedName = (name: string) => name.charAt(0).toUpperCase() + name.slice(1);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="text-center w-full">
          <h2 className="text-xl font-bold">{capitalizedName(username)} Bingo Card</h2>
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

      {!won && shouldShowWinner && someoneWon && (
        <div className="bg-yellow-200 border border-yellow-400 text-yellow-900 p-4 mb-4 rounded text-center">
          🌟 {capitalizedName(someoneWon)} beat you! Refresh your card to play the next round.
        </div>
      )}

      {showBingoScreen && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-green-900 bg-opacity-90 text-white text-center z-50 p-4 space-y-4">
          <div className="text-2xl font-bold">🎉 You got BINGO! 🎉</div>
          <button
            onClick={generateNewBoard}
            className="bg-white text-green-800 px-4 py-2 rounded font-semibold hover:bg-green-100"
          >
            Start New Game
          </button>
          <Link
            href="/leaderboard"
            className="text-white underline text-sm hover:text-green-200"
          >
            See Leaderboard
          </Link>
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
