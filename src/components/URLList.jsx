import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';

export default function URLList({ customUrl }) {
  const [list, setList] = useState(null);
  const [newUrl, setNewUrl] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showUrlForm, setShowUrlForm] = useState(false);

  useEffect(() => {
    fetchList();
  }, [customUrl]);

  const fetchList = async () => {
    try {
      const response = await fetch(`/api/lists?id=${customUrl}`);
      if (!response.ok) throw new Error('List not found');
      const data = await response.json();
      setList(data);
    } catch (error) {
      setError('Failed to load list');
    }
  };

  const addUrl = async (e) => {
    e.preventDefault();
    if (!newUrl) return;

    try {
      const response = await fetch('/api/lists', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listId: list.id, url: newUrl })
      });
      
      if (!response.ok) throw new Error('Failed to add URL');
      
      const addedUrl = await response.json();
      setList({
        ...list,
        urls: [...list.urls, addedUrl]
      });
      setNewUrl('');
      setShowUrlForm(false);
    } catch (error) {
      setError('Failed to add URL');
    }
  };

  const updateUrl = async (urlId, newUrlValue) => {
    try {
      const response = await fetch('/api/lists', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urlId, newUrl: newUrlValue })
      });
      
      if (!response.ok) throw new Error('Failed to update URL');
      
      const updatedUrl = await response.json();
      setList({
        ...list,
        urls: list.urls.map(url => 
          url.id === urlId ? updatedUrl : url
        )
      });
      setEditingId(null);
    } catch (error) {
      setError('Failed to update URL');
    }
  };

  const deleteUrl = async (urlId) => {
    try {
      await fetch(`/api/lists?urlId=${urlId}`, { method: 'DELETE' });
      setList({
        ...list,
        urls: list.urls.filter(url => url.id !== urlId)
      });
    } catch (error) {
      setError('Failed to delete URL');
    }
  };

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto p-4"
      >
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          {error}
        </div>
      </motion.div>
    );
  }

  if (!list) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <motion.a
            href="/"
            className="text-gray-600 hover:text-gray-800 flex items-center"
            whileHover={{ x: -4 }}
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Lists
          </motion.a>
          <h1 className="text-3xl font-bold text-gray-900">/{list.custom_url}</h1>
        </div>
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowUrlForm(true)}
        className="w-full mb-8 p-4 bg-white rounded-lg shadow-md border border-gray-200 hover:border-purple-500 transition-colors flex items-center justify-center text-gray-600 hover:text-purple-600"
      >
        <PlusIcon className="w-5 h-5 mr-2" />
        Add New URL
      </motion.button>

      <AnimatePresence>
        {showUrlForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <form onSubmit={addUrl} className="bg-white p-6 rounded-lg shadow-md">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL
                </label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowUrlForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                  Add URL
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        <AnimatePresence>
          {list.urls.map((url) => (
            <motion.div
              key={url.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 bg-white rounded-lg shadow-md flex items-center justify-between group"
            >
              {editingId === url.id ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const newUrl = e.target.elements.url.value;
                    if (newUrl && newUrl !== url.url) {
                      updateUrl(url.id, newUrl);
                    } else {
                      setEditingId(null);
                    }
                  }}
                  className="flex-1 flex gap-2"
                >
                  <input
                    name="url"
                    type="url"
                    defaultValue={url.url}
                    className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="submit"
                    className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="px-3 py-1 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <>
                  <a
                    href={url.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-900 hover:text-purple-600 transition-colors"
                  >
                    <LinkIcon className="w-5 h-5 mr-3 text-gray-400" />
                    {url.url}
                  </a>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setEditingId(url.id)}
                      className="p-1 text-gray-500 hover:text-purple-600"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => deleteUrl(url.id)}
                      className="p-1 text-gray-500 hover:text-red-600"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </motion.button>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {list.urls.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-8 text-gray-500 bg-white rounded-lg shadow-md"
          >
            No URLs in this list yet. Add your first one!
          </motion.div>
        )}
      </div>
    </div>
  );
}