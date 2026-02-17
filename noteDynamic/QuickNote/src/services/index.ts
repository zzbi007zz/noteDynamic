export {
  app as firebaseApp,
  auth as firebaseAuth,
  db as firestoreDb,
  storage as firebaseStorage,
} from './firebase';

export {
  signInWithEmail,
  signUpWithEmail,
  updateUserProfile,
  signOutUser,
  createDocument,
  getDocuments,
  updateDocument,
  deleteDocument,
} from './firebase';

export {shareHandler, ShareHandler} from './share-handler';
