import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

export const registerVote = async (voteData) => {
  try {
    // Verifica se o eleitor já votou
    const voter = await getVoterByMatricula(voteData.matricula);
    if (voter?.hasVoted) {
      return { success: false, error: 'Este eleitor já votou' };
    }
    
    // Registra o voto
    await addDoc(collection(db, 'votes'), {
      ...voteData,
      timestamp: new Date().toISOString()
    });
    
    // Marca o eleitor como votante
    await markVoterAsVoted(voter.id);
    
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

export const getElectionResults = async () => {
  const votesSnapshot = await getDocs(collection(db, 'votes'));
  const candidatesSnapshot = await getDocs(collection(db, 'candidates'));
  
  const candidates = candidatesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const votes = votesSnapshot.docs.map(doc => doc.data());
  
  // Calcula resultados
  const results = {};
  candidates.forEach(candidate => {
    results[candidate.id] = {
      ...candidate,
      votes: votes.filter(vote => vote.candidateId === candidate.id).length
    };
  });
  
  // Votos brancos/nulos
  results['blank'] = {
    name: 'Voto em Branco',
    votes: votes.filter(vote => vote.candidateId === 'blank').length
  };
  
  results['null'] = {
    name: 'Voto Nulo',
    votes: votes.filter(vote => vote.candidateId === 'null').length
  };
  
  return results;
};

export const resetElection = async () => {
  // ATENÇÃO: Esta operação deve ser restrita apenas a administradores
  // Na prática, você precisaria de uma Cloud Function para isso
  console.warn('Reset election function called - implementar Cloud Function para segurança');
};