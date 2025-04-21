import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, LinkIcon } from '@heroicons/react/24/outline';

export default function Welcome() {
  const [lists, setLists] = useState([]);
  const [newCustomUrl, setNewCustomUrl] = useState('');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      const response = await fetch('/api/lists');
      if (!response.ok) throw new Error('Failed to fetch lists');
      const data = await response.json();
      setLists(data);
    } catch (error) {
      setError('Failed to load lists');
    }
  };

  const createList = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customUrl: newCustomUrl })
      });
      
      if (!response.ok) throw new Error('Failed to create list');
      
      const newList = await response.json();
      setLists([newList, ...lists]);
      setNewCustomUrl('');
      setIsCreating(false);
    } catch (error) {
      setError('Failed to create list');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
          The Urlist
        </h1>
        <p className="text-gray-600 text-lg">
          Create and share your curated lists of URLs
        </p>
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsCreating(true)}
        className="w-full mb-8 p-4 bg-white rounded-lg shadow-md border border-gray-200 hover:border-purple-500 transition-colors flex items-center justify-center text-gray-600 hover:text-purple-600"
      >
        <PlusIcon className="w-5 h-5 mr-2" />
        Create New List
      </motion.button>

      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <form onSubmit={createList} className="bg-white p-6 rounded-lg shadow-md">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom URL (optional)
                </label>
                <input
                  type="text"
                  value={newCustomUrl}
                  onChange={(e) => setNewCustomUrl(e.target.value)}
                  placeholder="my-awesome-list"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                  Create List
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 mb-8 bg-red-50 text-red-700 rounded-lg border border-red-200"
        >
          {error}
        </motion.div>
      )}

      <div className="grid gap-4">
        <AnimatePresence>
          {lists.map((list, index) => (
            <motion.a
              key={list.id}
              href={'/' + list.custom_url}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <LinkIcon className="w-5 h-5 text-purple-600 mr-3" />
                  <span className="text-lg font-medium text-gray-900">
                    /{list.custom_url}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {list.urls?.length || 0} URLs
                </span>
              </div>
            </motion.a>
          ))}
        </AnimatePresence>
        
        {lists.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-8 text-gray-500"
          >
            No lists yet. Create your first one!
          </motion.div>
        )}
      </div>
    </div>
  );
}