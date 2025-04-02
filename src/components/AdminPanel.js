import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getAllVoters, resetElection } from '../services/elections';
import { getCandidates, addCandidate, deleteCandidate } from '../services/candidates';
import { registerVoter } from '../services/voters';
import { toast } from 'react-hot-toast';

const AdminPanel = () => {
  const { hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [voters, setVoters] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const [newCandidate, setNewCandidate] = useState({
    number: '',
    name: '',
    party: '',
    position: 'Presidente'
  });

  const [newVoter, setNewVoter] = useState({
    matricula: '',
    name: '',
    turma: ''
  });

  useEffect(() => {
    if (hasRole('admin')) {
      loadData();
    }
  }, [hasRole]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [votersData, candidatesData, resultsData] = await Promise.all([
        getAllVoters(),
        getCandidates(),
        getElectionResults()
      ]);
      
      setVoters(votersData);
      setCandidates(candidatesData);
      setResults(resultsData);
    } catch (error) {
      toast.error('Erro ao carregar dados: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    try {
      await addCandidate(newCandidate);
      toast.success('Candidato cadastrado com sucesso!');
      setNewCandidate({
        number: '',
        name: '',
        party: '',
        position: 'Presidente'
      });
      loadData();
    } catch (error) {
      toast.error('Erro ao cadastrar: ' + error.message);
    }
  };

  const handleDeleteCandidate = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este candidato?')) {
      try {
        await deleteCandidate(id);
        toast.success('Candidato excluído!');
        loadData();
      } catch (error) {
        toast.error('Erro ao excluir: ' + error.message);
      }
    }
  };

  const handleAddVoter = async (e) => {
    e.preventDefault();
    try {
      await registerVoter(newVoter);
      toast.success('Eleitor cadastrado com sucesso!');
      setNewVoter({
        matricula: '',
        name: '',
        turma: ''
      });
      loadData();
    } catch (error) {
      toast.error('Erro ao cadastrar: ' + error.message);
    }
  };

  const handleResetElection = async () => {
    if (window.confirm('⚠️ ATENÇÃO! Isso apagará TODOS os votos. Continuar?')) {
      try {
        await resetElection();
        toast.success('Votação reiniciada com sucesso!');
        loadData();
      } catch (error) {
        toast.error('Erro ao reiniciar: ' + error.message);
      }
    }
  };

  if (!hasRole('admin')) {
    return (
      <div className="p-4 bg-red-100 text-red-800 rounded-lg">
        Acesso restrito apenas a administradores
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={`tab ${activeTab === 'voters' ? 'active' : ''}`}
          onClick={() => setActiveTab('voters')}
        >
          Eleitores
        </button>
        <button 
          className={`tab ${activeTab === 'candidates' ? 'active' : ''}`}
          onClick={() => setActiveTab('candidates')}
        >
          Candidatos
        </button>
        <button 
          className={`tab ${activeTab === 'results' ? 'active' : ''}`}
          onClick={() => setActiveTab('results')}
        >
          Resultados
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <div className="tab-content">
          <h2>Visão Geral</h2>
          <div className="stats">
            <div className="stat-card">
              <h3>Eleitores Cadastrados</h3>
              <p>{voters.length}</p>
            </div>
            <div className="stat-card">
              <h3>Candidatos</h3>
              <p>{candidates.length}</p>
            </div>
            <div className="stat-card">
              <h3>Votos Computados</h3>
              <p>{results ? Object.values(results).reduce((sum, item) => sum + (item.votes || 0), 0) : 0}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'voters' && (
        <div className="tab-content">
          <h2>Gerenciamento de Eleitores</h2>
          <form onSubmit={handleAddVoter}>
            <h3>Cadastrar Novo Eleitor</h3>
            <div className="form-group">
              <label>Matrícula</label>
              <input
                type="text"
                value={newVoter.matricula}
                onChange={(e) => setNewVoter({...newVoter, matricula: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Nome Completo</label>
              <input
                type="text"
                value={newVoter.name}
                onChange={(e) => setNewVoter({...newVoter, name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Turma/Curso</label>
              <input
                type="text"
                value={newVoter.turma}
                onChange={(e) => setNewVoter({...newVoter, turma: e.target.value})}
                required
              />
            </div>
            <button type="submit">Cadastrar Eleitor</button>
          </form>

          <div className="voters-list">
            <h3>Eleitores Cadastrados</h3>
            <table>
              <thead>
                <tr>
                  <th>Matrícula</th>
                  <th>Nome</th>
                  <th>Turma</th>
                  <th>Votou?</th>
                </tr>
              </thead>
              <tbody>
                {voters.map(voter => (
                  <tr key={voter.id}>
                    <td>{voter.matricula}</td>
                    <td>{voter.name}</td>
                    <td>{voter.turma}</td>
                    <td>{voter.hasVoted ? '✅' : '❌'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'candidates' && (
        <div className="tab-content">
          <h2>Gerenciamento de Candidatos</h2>
          <form onSubmit={handleAddCandidate}>
            <h3>Cadastrar Novo Candidato</h3>
            <div className="form-group">
              <label>Número</label>
              <input
                type="text"
                value={newCandidate.number}
                onChange={(e) => setNewCandidate({...newCandidate, number: e.target.value})}
                maxLength="2"
                required
              />
            </div>
            <div className="form-group">
              <label>Nome</label>
              <input
                type="text"
                value={newCandidate.name}
                onChange={(e) => setNewCandidate({...newCandidate, name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Partido</label>
              <input
                type="text"
                value={newCandidate.party}
                onChange={(e) => setNewCandidate({...newCandidate, party: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Cargo</label>
              <select
                value={newCandidate.position}
                onChange={(e) => setNewCandidate({...newCandidate, position: e.target.value})}
                required
              >
                <option value="Presidente">Presidente</option>
                <option value="Governador">Governador</option>
                <option value="Senador">Senador</option>
                <option value="Deputado">Deputado</option>
              </select>
            </div>
            <button type="submit">Cadastrar Candidato</button>
          </form>

          <div className="candidates-list">
            <h3>Candidatos Cadastrados</h3>
            <table>
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Nome</th>
                  <th>Partido</th>
                  <th>Cargo</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map(candidate => (
                  <tr key={candidate.id}>
                    <td>{candidate.number}</td>
                    <td>{candidate.name}</td>
                    <td>{candidate.party}</td>
                    <td>{candidate.position}</td>
                    <td>
                      <button 
                        onClick={() => handleDeleteCandidate(candidate.id)}
                        className="danger"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'results' && results && (
        <div className="tab-content">
          <h2>Resultados da Votação</h2>
          <div className="results-actions">
            <button onClick={handleResetElection} className="danger">
              Zerar Votação
            </button>
          </div>
          <div className="results-container">
            {Object.entries(results).map(([id, candidate]) => (
              <div key={id} className="result-item">
                <h3>{candidate.position || 'Votos Gerais'} - {candidate.name} ({candidate.votes} votos)</h3>
                <div className="vote-bar">
                  <div 
                    className="vote-progress" 
                    style={{ width: `${(candidate.votes / Object.values(results).reduce((sum, item) => sum + (item.votes || 0), 0)) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;