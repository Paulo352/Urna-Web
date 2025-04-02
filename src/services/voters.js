import { collection, addDoc, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

export const registerVoter = async (voterData) => {
  try {
    // Verifica se o eleitor já existe
    const q = query(collection(db, 'voters'), where('matricula', '==', voterData.matricula));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      return { success: false, error: 'Eleitor já cadastrado' };
    }
    
    await addDoc(collection(db, 'voters'), {
      ...voterData,
      hasVoted: false,
      createdAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

export const getVoterByMatricula = async (matricula) => {
  const q = query(collection(db, 'voters'), where('matricula', '==', matricula));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) return null;
  
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
};

export const markVoterAsVoted = async (voterId) => {
  await updateDoc(doc(db, 'voters', voterId), { hasVoted: true, votedAt: new Date().toISOString() });
};

export const getAllVoters = async () => {
  const snapshot = await getDocs(collection(db, 'voters'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};