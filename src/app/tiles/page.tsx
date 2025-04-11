// src/app/tiles/page.tsx

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where
} from 'firebase/firestore';

export default function ManageTilesPage() {
  const [newTile, setNewTile] = useState('');
  const [tiles, setTiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTiles();
  }, []);

  const fetchTiles = async () => {
    const snapshot = await getDocs(collection(db, 'tiles'));
    const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setTiles(list);
    setLoading(false);
  };

  const addTile = async () => {
    if (!newTile.trim()) return;
    if (newTile.length > 40) {
      alert('Tile must be 40 characters or fewer.');
      return;
    }
    await addDoc(collection(db, 'tiles'), { text: newTile.trim() });
    setNewTile('');
    fetchTiles();
  };

  const deleteTile = async (id: string, text: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${text}"?`);
    if (!confirmDelete) return;

    // Check if tile is in use on any board
    const boardsSnapshot = await getDocs(collection(db, 'boards'));
    const inUse = boardsSnapshot.docs.some((docSnap) => {
      const data = docSnap.data();
      return data.tiles?.some((tile: any) => tile.id === id);
    });

    if (inUse) {
      alert('This tile is currently in use and cannot be deleted.');
      return;
    }

    await deleteDoc(doc(db, 'tiles', id));
    fetchTiles();
  };

  return (
    <div className="min-h-screen bg-green-50 p-6 text-green-900">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-center w-full">Add / Edit Tiles</h1>
        <Link href="/" className="absolute right-4 top-6 text-blue-600 hover:underline text-sm">
          Home
        </Link>
      </div>

      <div className="max-w-xl mx-auto mb-6">
        <input
          type="text"
          value={newTile}
          onChange={(e) => setNewTile(e.target.value)}
          maxLength={40}
          placeholder="Enter new tile text (max 40 characters)"
          className="w-full p-2 border border-green-300 rounded mb-2"
        />
        <button
          onClick={addTile}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-all"
        >
          Add Tile
        </button>
      </div>

      <div className="max-w-xl mx-auto">
        <h2 className="text-lg font-semibold mb-2">Current Tiles:</h2>
        {loading ? (
          <p>Loading tiles...</p>
        ) : (
          <ul className="space-y-2">
            {tiles.map((tile) => (
              <li
                key={tile.id}
                className="flex justify-between items-center bg-white p-2 border border-green-200 rounded"
              >
                <span className="text-sm">{tile.text}</span>
                <button
                  onClick={() => deleteTile(tile.id, tile.text)}
                  className="text-red-600 text-xs hover:underline"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
