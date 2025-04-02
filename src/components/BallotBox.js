import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { registerVote } from '../services/elections';
import { getCandidatesByPosition } from '../services/candidates';
import { getVoterByMatricula, markVoterAsVoted } from '../services/voters';
import { toast } from 'react-hot-toast';

const BallotBox = () => {
  const [input, setInput] = useState('');
  const [matricula, setMatricula] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [currentPosition, setCurrentPosition] = useState('Presidente');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadCandidates = async () => {
      const data = await getCandidatesByPosition(currentPosition);
      setCandidates(data);
    };
    loadCandidates();
  }, [currentPosition]);

  const handleNumberClick = (number) => {
    if (input.length < 2) {
      const newInput = input + number;
      setInput(newInput);
      
      if (newInput.length === 2) {
        const candidate = candidates.find(c => c.number === newInput);
        setSelectedCandidate(candidate || { 
          number: newInput, 
          name: 'Nulo', 
          position: currentPosition 
        });
      }
    }
  };

  const handleConfirm = async () => {
    if (!matricula) {
      setMessage('Digite sua matrícula');
      return;
    }

    const voter = await getVoterByMatricula(matricula);
    if (!voter) {
      setMessage('Eleitor não cadastrado');
      return;
    }

    if (voter.hasVoted) {
      setMessage('Este eleitor já votou');
      return;
    }

    const voteData = {
      candidateId: selectedCandidate?.id || 'blank',
      matricula,
      position: currentPosition
    };

    const result = await registerVote(voteData);
    
    if (result.success) {
      await markVoterAsVoted(voter.id);
      toast.success('Voto registrado com sucesso!');
      setInput('');
      setSelectedCandidate(null);
      setMatricula('');
      setMessage('');
    } else {
      setMessage(result.error || 'Erro ao registrar voto');
    }
  };

  return (
    <div className="ballot-box">
      <h2>Urna Eletrônica</h2>
      
      <div className="position-selector">
        <select 
          value={currentPosition} 
          onChange={(e) => {
            setCurrentPosition(e.target.value);
            setInput('');
            setSelectedCandidate(null);
          }}
        >
          <option value="Presidente">Presidente</option>
          <option value="Governador">Governador</option>
          <option value="Senador">Senador</option>
        </select>
      </div>

      <div className="voter-auth">
        <input
          type="text"
          placeholder="Número de Matrícula"
          value={matricula}
          onChange={(e) => setMatricula(e.target.value)}
        />
      </div>

      <div className="display">
        <input type="text" value={input} readOnly />
      </div>

      {selectedCandidate && (
        <div className="candidate-info">
          <h3>{selectedCandidate.position}</h3>
          <p>{selectedCandidate.number} - {selectedCandidate.name}</p>
          {selectedCandidate.party && <p>{selectedCandidate.party}</p>}
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
        <button onClick={() => { 
          setInput(''); 
          setSelectedCandidate({ name: 'Voto em Branco', position: currentPosition });
        }}>
          BRANCO
        </button>
      </div>

      <button className="confirm-btn" onClick={handleConfirm}>
        CONFIRMAR
      </button>

      {message && <div className="message">{message}</div>}
    </div>
  );
};

export default BallotBox;