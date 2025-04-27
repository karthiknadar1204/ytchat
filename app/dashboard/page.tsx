'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Plus } from 'lucide-react';

export default function DashboardPage() {
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { collections, addCollection } = useStore();

  const handleAddCollection = () => {
    if (newCollectionName.trim()) {
      addCollection(newCollectionName);
      setNewCollectionName('');
      setIsModalOpen(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Collections</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-2 rounded-full hover:bg-gray-200"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        
        {/* Collections List */}
        <div className="space-y-2">
          {collections.map((collection) => (
            <div
              key={collection.id}
              className="p-2 rounded hover:bg-gray-200 cursor-pointer"
            >
              {collection.name}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p>Select a collection or create a new one to get started.</p>
        </div>
      </div>

      {/* New Collection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-lg font-semibold mb-4">Create New Collection</h3>
            <input
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="Collection name"
              className="w-full p-2 border rounded mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCollection}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 