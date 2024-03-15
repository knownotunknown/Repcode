import React, { useState, useEffect, useContext } from 'react';
import { auth } from '../../firebaseConfig';
import '../../app/globals.css'; 
import { useMutation, useQueryClient } from 'react-query';
import { AuthContext } from "@/auth/AuthContext";

const CollectionModal = ({ isOpen, onClose, isEditMode = false, collectionToEdit = null, showToast }: { isOpen: boolean, isEditMode?:any, collectionToEdit?:any, onClose: any, showToast:any }) => {
  const [collectionName, setCollectionName] = useState(isEditMode && collectionToEdit ? collectionToEdit.title : '');
  const queryClient = useQueryClient();
  const { user } = useContext(AuthContext); 

  const mutation = useMutation(
    async (collectionData: any) => {
      onClose(); // Close the modal
      const url = isEditMode ? `/api/updateCollection?collectionId=${collectionToEdit.id}` : '/api/createCollection';
      const method = isEditMode ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(collectionData),
      });
      if (!response.ok) throw new Error('Failed to submit collection');
      return response.json();
    },
    {
      onSuccess: () => {
        // Invalidate and refetch collections list
        queryClient.invalidateQueries(['collections', user?.email]);
        showToast(
          <>
            <span className="inline-block mr-2 bg-success rounded-full" style={{ width: '10px', height: '10px' }}></span>
            {isEditMode ? 'Collection updated successfully' : 'Collection created successfully'}
          </>
        );
      },
      onError: (error: any) => {
        console.error('Failed to submit collection:', error);
        // Optionally, show an error toast
      },
    }
  );


  const handleSubmit = (e: any) => {
    e.preventDefault();
    mutation.mutate({
      title: collectionName,
      userEmail: user?.email, 
    });
  };

  if (!isOpen) return null;

  const modalClass = isOpen ? "modalEnter" : "";
  return (
    <div className={`${isOpen ? '' : 'hidden'} fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full`} style={{ opacity: isOpen ? 1 : 0 }}>
    <div className={`relative top-0 mx-auto p-5 w-96 shadow-lg rounded-md bg-neutral ${modalClass}`} style={{ animationDuration: '0.5s' }}>
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-white">{isEditMode ? 'Edit Collection' : 'New Collection'}</h3>
          <div className="mt-2 px-7 py-3">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <label htmlFor="collectionName" className="block text-sm font-medium text-white">Collection Name:</label>
              <input type="text" id="collectionName" name="collectionName" value={collectionName} onChange={(e) => setCollectionName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              <button type="button" onClick={handleSubmit} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              {isEditMode ? 'Update' : 'Create'}
              </button>
            </form>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="inline-flex justify-center py-2 px-4 shadow-sm text-sm font-medium rounded-md text-white bg-error">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionModal;


