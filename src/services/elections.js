import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

export const registerVote = async (voteData) => {
  try {
    await addDoc(collection(db, 'votes'), {
      ...voteData,
      timestamp: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

export const getElectionResults = async () => {
  try {
    const votesSnapshot = await getDocs(collection(db, 'votes'));
    const candidatesSnapshot = await getDocs(collection(db, 'candidates'));
    
    const candidates = candidatesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const votes = votesSnapshot.docs.map(doc => doc.data());
    
    const results = {};
    candidates.forEach(candidate => {
      results[candidate.id] = {
        ...candidate,
        votes: votes.filter(vote => vote.candidateId === candidate.id).length
      };
    });
    
    results['blank'] = {
      name: 'Voto em Branco',
      votes: votes.filter(vote => vote.candidateId === 'blank').length
    };
    
    results['null'] = {
      name: 'Voto Nulo',
      votes: votes.filter(vote => vote.candidateId === 'null').length
    };
    
    return results;
  } catch (error) {
    return { success: false, error };
  }
};

export const resetElection = async () => {
  // Implementação segura deve ser feita via Cloud Function
  console.warn('Reset deve ser implementado via Cloud Function para segurança');
};
