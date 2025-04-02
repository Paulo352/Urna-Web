import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const addCandidate = async (candidateData) => {
  try {
    await addDoc(collection(db, 'candidates'), candidateData);
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

export const getCandidates = async () => {
  const snapshot = await getDocs(collection(db, 'candidates'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateCandidate = async (id, candidateData) => {
  await updateDoc(doc(db, 'candidates', id), candidateData);
};

export const deleteCandidate = async (id) => {
  await deleteDoc(doc(db, 'candidates', id));
};