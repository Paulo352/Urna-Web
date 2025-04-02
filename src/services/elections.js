import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

// Adicione esta função que estava faltando
export const getAllVoters = async () => {
  const snapshot = await getDocs(collection(db, 'voters'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Mantenha as outras funções existentes
export const getElectionResults = async () => {
  // ... implementação existente
};

export const registerVote = async (voteData) => {
  // ... implementação existente
};

export const resetElection = async () => {
  // ... implementação existente
};