import { 
  PlusIcon,
  XMarkIcon,
  BookOpenIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';

const FloatingNotes = ({ videoUrl }) => {
  const [user] = useAuthState(auth);
  const [state, setState] = useState({
    isOpen: false,
    note: '',
    savedNotes: [],
    isLoading: false,
    activeTab: 'new',
    currentVideoDoc: null,
    error: null
  });

  const {
    isOpen,
    note,
    savedNotes,
    isLoading,
    activeTab,
    currentVideoDoc,
    error
  } = state;

  const updateState = (newState) => {
    setState(prev => ({ ...prev, ...newState }));
  };

  // Find the userVideo document for this video URL
  useEffect(() => {
    const findUserVideoDoc = async () => {
      if (!user || !videoUrl) return;
      
      try {
        const userVideosRef = collection(db, 'userVideos');
        const q = query(
          userVideosRef,
          where('userId', '==', user.uid),
          where('videoUrl', '==', videoUrl)
        );
        
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          updateState({ 
            currentVideoDoc: {
              id: doc.id,
              ...doc.data()
            },
            error: null
          });
        }
      } catch (err) {
        console.error("Error finding user video document:", err);
        updateState({ error: 'Failed to load video data' });
      }
    };

    findUserVideoDoc();
  }, [user, videoUrl]);

  // Fetch notes when panel opens
  useEffect(() => {
    if (isOpen && currentVideoDoc) {
      fetchNotes();
    }
  }, [isOpen, currentVideoDoc]);

  const fetchNotes = async () => {
    if (!user || !currentVideoDoc) {
      console.warn('Missing required data for fetching notes');
      return;
    }

    try {
      updateState({ isLoading: true, error: null });
      
      const q = query(
        collection(db, "notes"),
        where("userId", "==", user.uid),
        where("videoDocId", "==", currentVideoDoc.id),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      
      const notes = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          content: data.content,
          videoTitle: data.videoTitle || currentVideoDoc.title,
          formattedDate: new Date(data.createdAt).toLocaleString()
        };
      });

      updateState({ 
        savedNotes: notes,
        isLoading: false
      });

    } catch (err) {
      console.error('Error fetching notes:', err);
      updateState({ 
        isLoading: false,
        error: err.code === 'failed-precondition' 
          ? 'Missing Firestore index' 
          : 'Failed to load notes'
      });
      
      if (err.code === 'failed-precondition') {
        console.error('Required Firestore index:', {
          collection: 'notes',
          fields: [
            { field: 'userId', order: 'asc' },
            { field: 'videoDocId', order: 'asc' },
            { field: 'createdAt', order: 'desc' }
          ]
        });
      }
    }
  };

  const saveNote = async () => {
    if (!note.trim() || !user || !currentVideoDoc) return;
    
    try {
      updateState({ isLoading: true, error: null });
      
      await addDoc(collection(db, 'notes'), {
        content: note,
        userId: user.uid,
        videoUrl: videoUrl,
        videoDocId: currentVideoDoc.id,
        videoTitle: currentVideoDoc.title,
        createdAt: new Date().toISOString()
      });
      
      updateState({ 
        note: '',
        activeTab: 'saved'
      });
      
      await fetchNotes();
    } catch (err) {
      console.error("Error saving note:", err);
      updateState({ 
        isLoading: false,
        error: 'Failed to save note'
      });
    }
  };

  const togglePanel = () => {
    updateState({ isOpen: !isOpen });
  };

  const changeTab = (tab) => {
    updateState({ activeTab: tab });
  };

  const handleNoteChange = (e) => {
    updateState({ note: e.target.value });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={togglePanel}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all ${
          isOpen ? 'bg-purple-700' : 'bg-purple-600 hover:bg-purple-700'
        }`}
        aria-label={isOpen ? 'Close notes' : 'Open notes'}
      >
        {isOpen ? (
          <XMarkIcon className="w-6 h-6 text-white" />
        ) : (
          <PlusIcon className="w-6 h-6 text-white" />
        )}
      </button>

      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 bg-white rounded-lg shadow-xl overflow-hidden animate-fade-in-up">
          {error && (
            <div className="bg-red-100 text-red-700 p-2 text-sm">
              {error} {error === 'Missing Firestore index' && '- Check console for details'}
            </div>
          )}
          
          <div className="flex border-b border-gray-200">
            <button
              className={`flex items-center justify-center gap-1 flex-1 py-2 font-medium ${
                activeTab === 'new' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'
              }`}
              onClick={() => changeTab('new')}
            >
              <PencilIcon className="w-4 h-4" />
              New Note
            </button>
            <button
              className={`flex items-center justify-center gap-1 flex-1 py-2 font-medium ${
                activeTab === 'saved' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'
              }`}
              onClick={() => changeTab('saved')}
            >
              <BookOpenIcon className="w-4 h-4" />
              Saved
            </button>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {activeTab === 'new' ? (
              <div className="p-4">
                <textarea
                  value={note}
                  onChange={handleNoteChange}
                  placeholder="Write your note here..."
                  className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows="4"
                  disabled={isLoading}
                />
                <button
                  onClick={saveNote}
                  disabled={isLoading || !note.trim() || !currentVideoDoc}
                  className={`w-full py-2 rounded-lg text-white flex items-center justify-center gap-2 ${
                    isLoading || !note.trim() || !currentVideoDoc
                      ? 'bg-purple-400 cursor-not-allowed' 
                      : 'bg-purple-600 hover:bg-purple-700'
                  } transition-colors`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : !currentVideoDoc ? (
                    'Loading video data...'
                  ) : (
                    'Save Note'
                  )}
                </button>
              </div>
            ) : (
              <div className="p-4">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <svg className="animate-spin h-8 w-8 text-purple-600" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : savedNotes.length > 0 ? (
                  <div className="space-y-3">
                    {savedNotes.map((note) => (
                      <div key={note.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="font-medium text-purple-600 mb-1">{note.videoTitle}</h4>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {note.formattedDate}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpenIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No notes saved for this video yet</p>
                    {!currentVideoDoc && (
                      <p className="text-xs mt-2">Could not find video reference</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingNotes;