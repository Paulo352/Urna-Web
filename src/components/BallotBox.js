import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { registerVote } from '../services/elections';
import { getCandidates } from '../services/candidates';

export default function BallotBox() {
  const { currentUser, hasRole } = useAuth();
  const [input, setInput] = useState('');
  const [matricula, setMatricula] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [message, setMessage] = useState('');

  // Carrega candidatos
  useEffect(() => {
    const loadCandidates = async () => {
      const data = await getCandidates();
      setCandidates(data);
    };
    loadCandidates();
  }, []);

  const handleNumberClick = (number) => {
    if (input.length < 2) {
      setInput(input + number);
      checkCandidate(input + number);
    }
  };

  const checkCandidate = (number) => {
    if (number.length === 2) {
      const candidate = candidates.find(c => c.number === number);
      setSelectedCandidate(candidate || { number, name: 'Nulo', party: '' });
    }
  };

  const handleConfirm = async () => {
    if (!matricula) {
      setMessage('Digite sua matrícula');
      return;
    }

    if (!input && !selectedCandidate) {
      setMessage('Selecione um candidato ou vote em branco');
      return;
    }

    const voteData = {
      candidateId: selectedCandidate ? selectedCandidate.id : 'blank',
      matricula,
      position: selectedCandidate?.position || 'Presidente'
    };

    const result = await registerVote(voteData);
    
    if (result.success) {
      setMessage('Voto registrado com sucesso!');
      setInput('');
      setSelectedCandidate(null);
      setMatricula('');
    } else {
      setMessage(result.error || 'Erro ao registrar voto');
    }
  };

  return (
    <div className="ballot-box">
      <h2>Urna Eletrônica</h2>
      
      {!currentUser && (
        <div className="voter-auth">
          <input
            type="text"
            placeholder="Número de Matrícula"
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
          />
        </div>
      )}

      <div className="display">
        <input type="text" value={input} readOnly />
      </div>

      {selectedCandidate && (
        <div className="candidate-info">
          <h3>{selectedCandidate.position || 'Presidente'}</h3>
          <p>{selectedCandidate.number} - {selectedCandidate.name}</p>
          <p>{selectedCandidate.party}</p>
        </div>
      )}

      <div className="keypad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(num => (
          <button key={num} onClick={() => handleNumberClick(num.toString())}>
            {num}
          </button>
        ))}
        <button onClick={() => { setInput(''); setSelectedCandidate(null); }}>
          CORRIGE
        </button>
        <button onClick={() => { setInput(''); setSelectedCandidate({ name: 'Voto em Branco' }); }}>
          BRANCO
        </button>
      </div>

      <button className="confirm-btn" onClick={handleConfirm}>
        CONFIRMAR
      </button>

      {message && <div className="message">{message}</div>}
    </div>
  );
}