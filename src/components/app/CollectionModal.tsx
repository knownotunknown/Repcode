import React, { useState, useEffect, useContext } from 'react';
import { auth } from '../../firebaseConfig';
import '../../app/globals.css'; 
import { useQuery, useMutation, useQueryClient } from 'react-query'; 
import { AuthContext } from "@/auth/AuthContext";

const CollectionModal = ({ isOpen, onClose, isEditMode = false, collectionToEdit = null, showToast }: { isOpen: boolean, isEditMode?:any, collectionToEdit?:any, onClose: any, showToast:any }) => {
  const [collectionName, setCollectionName] = useState(isEditMode && collectionToEdit ? collectionToEdit.title : '');
  const queryClient = useQueryClient();
  const { user } = useContext(AuthContext); 

  const fetchUserSettings = async () => {
    if (!user) throw new Error("No user found");
    const response = await fetch(`/api/getUserSettings?userEmail=${user.email}`);
    if (!response.ok) throw new Error("Failed to fetch user settings");
    return response.json();
  };
  
  const { isLoading: userLoading, data: theUser, error: userError } = useQuery(['userSettings', user?.email], fetchUserSettings, {
    enabled: !!user, 
  })

  const mutation = useMutation(
    async ({ title, userEmail, headers }: { title: any, userEmail: any, headers: HeadersInit }) => {
      onClose(); // Close the modal
      const url = isEditMode ? `/api/updateCollection?collectionId=${collectionToEdit.id}` : '/api/createCollection';
      const method = isEditMode ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method: method,
        headers: headers,
        body: JSON.stringify({
          title: title,
          userEmail: userEmail
        }),
      });
      if (!response.ok) throw new Error('Failed to submit collection');
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['collections', user?.email]);
        queryClient.invalidateQueries(['collectionDetails']);
        queryClient.invalidateQueries(['userSettings', user?.email]);
  
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


const handleSubmit = async (e: any) => {
  e.preventDefault();

  // Retrieve the Firebase authentication token
  const token = await auth.currentUser?.getIdToken();

  if (!token) {
    console.error('Authentication token is not available.');
    return;
  }

  // Include the token in the Authorization header
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  mutation.mutate({
    title: collectionName,
    userEmail: user?.email,
    headers: headers  // Pass headers to the mutation function
  });
};

  if (!isOpen) return null;

  const modalClass = isOpen ? "modalEnter" : "";


  if (theUser.membershipType === 'free' && theUser?.collections?.length >= 4) {
    return (
      <div className={`${isOpen ? '' : 'hidden'} fixed inset-0 bg-base_100 bg-opacity-50 overflow-y-auto h-full w-full`} style={{ opacity: isOpen ? 1 : 0 }}>
      <div className={`relative top-0 mx-auto p-5 w-96 shadow-lg rounded-md bg-base_100 ${modalClass}`} style={{ animationDuration: '0.5s' }}>
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-secondary">Free Tier limit reached.</h3>
          <div className="mt-2 px-7 py-3">
            <p>You may only create up to 4 collections on the Free Tier. To create more, please upgrade your membership.</p>
          </div>
          <div className="flex justify-end gap-3 px-7 py-3">
            <button type="button" onClick={onClose} className="inline-flex justify-center items-center gap-x-3 text-center bg-error border border-error text-neutral text-lg font-medium rounded-md focus:outline-none focus:ring-1 focus:ring-gray-600 py-1 px-4 transition-transform duration-200 hover:scale-95">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
    )
  } 
  else {
    
  return (
    <div className={`${isOpen ? '' : 'hidden'} fixed inset-0 bg-base_100 bg-opacity-50 overflow-y-auto h-full w-full`} style={{ opacity: isOpen ? 1 : 0 }}>
      <div className={`relative top-0 mx-auto p-5 w-96 shadow-lg rounded-md bg-base_100 ${modalClass}`} style={{ animationDuration: '0.5s' }}>
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-secondary">{isEditMode ? 'Edit Collection' : 'New Collection'}</h3>
          <div className="mt-2 px-7 py-3">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <label htmlFor="collectionName" className="block text-sm font-medium text-secondary">Collection Name:</label>
              <input type="text" id="collectionName" name="collectionName" value={collectionName} onChange={(e) => setCollectionName(e.target.value)} className="text-secondary mt-1 block w-full px-3 py-2 bg-base_100 border border-primary2 rounded-md shadow-sm focus:outline-none focus:border-blue transition-colors duration-300 sm:text-sm" />
            </form>
          </div>
          <div className="flex justify-end gap-3 px-7 py-3">
            <button type="button" onClick={onClose} className="inline-flex justify-center items-center gap-x-3 text-center bg-error border border-error text-neutral text-lg font-medium rounded-md focus:outline-none focus:ring-1 focus:ring-gray-600 py-1 px-4 transition-transform duration-200 hover:scale-95">
              Close
            </button>
            <button type="button" onClick={handleSubmit} disabled={!collectionName.trim()} className={`inline-flex justify-center items-center gap-x-3 text-center ${collectionName.trim() ? 'bg-success border border-success text-neutral' : 'bg-disabled border border-disabled text-feintwhite'} text-lg font-medium rounded-md focus:outline-none focus:ring-1 py-1 px-4 transition-transform duration-200 hover:scale-95`}>
              {isEditMode ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  }
};

export default CollectionModal;

