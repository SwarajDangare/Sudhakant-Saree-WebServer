'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DeleteSectionButtonProps {
  sectionId: string;
  sectionName: string;
}

export default function DeleteSectionButton({ sectionId, sectionName }: DeleteSectionButtonProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setIsDeleting(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/sections/${sectionId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete section');
      }

      // Refresh the page to show updated list
      router.refresh();
      setShowConfirm(false);
    } catch (err) {
      console.error('Error deleting section:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete section');
      setIsDeleting(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Section</h3>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <p className="text-gray-600 mb-6">
            Are you sure you want to delete the section <span className="font-semibold">"{sectionName}"</span>?
            <br /><br />
            <span className="text-red-600 font-medium">
              This will also delete all categories and products under this section. This action cannot be undone.
            </span>
          </p>

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => {
                setShowConfirm(false);
                setError('');
              }}
              disabled={isDeleting}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="text-red-600 hover:text-red-900"
    >
      Delete
    </button>
  );
}
