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
  updateDoc
} from 'firebase/firestore';

interface Tile {
  id: string;
  text: string;
}

export default function ManageTilesPage() {
  const [newTile, setNewTile] = useState('');
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTile, setEditingTile] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    fetchTiles();
  }, []);

  const fetchTiles = async () => {
    const snapshot = await getDocs(collection(db, 'tiles'));
    const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Tile));
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

    const boardsSnapshot = await getDocs(collection(db, 'boards'));
    const inUse = boardsSnapshot.docs.some((docSnap) => {
      const data = docSnap.data();
      return data.tiles?.some((tile: { id: string }) => tile.id === id);
    });

    if (inUse) {
      alert('This tile is currently in use and cannot be deleted.');
      return;
    }

    await deleteDoc(doc(db, 'tiles', id));
    fetchTiles();
  };

  const saveEdit = async (id: string) => {
    if (!editText.trim()) return;
    if (editText.length > 40) {
      alert('Tile must be 40 characters or fewer.');
      return;
    }

    const boardsSnapshot = await getDocs(collection(db, 'boards'));
    const inUse = boardsSnapshot.docs.some((docSnap) => {
      const data = docSnap.data();
      return data.tiles?.some((tile: { id: string }) => tile.id === id);
    });

    if (inUse) {
      alert('This tile is currently in use and cannot be edited.');
      return;
    }

    await updateDoc(doc(db, 'tiles', id), { text: editText.trim() });
    setEditingTile(null);
    setEditText('');
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
                {editingTile === tile.id ? (
                  <>
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      maxLength={40}
                      className="flex-1 p-1 border border-green-300 rounded mr-2"
                    />
                    <button
                      onClick={() => saveEdit(tile.id)}
                      className="text-blue-600 text-xs hover:underline mr-2"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingTile(null);
                        setEditText('');
                      }}
                      className="text-gray-600 text-xs hover:underline"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-sm flex-1 cursor-pointer" onClick={() => {
                      setEditingTile(tile.id);
                      setEditText(tile.text);
                    }}>
                      {tile.text}
                    </span>
                    <button
                      onClick={() => deleteTile(tile.id, tile.text)}
                      className="text-red-600 text-xs hover:underline"
                    >
                      Delete
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}