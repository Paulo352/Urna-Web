import { useAuth } from '../../contexts/AuthContext';
import { getAllVoters, getElectionResults } from '../../services/elections';
import { getCandidates } from '../../services/candidates';
import AdminPanel from '../../components/AdminPanel';

export default function AdminDashboard() {
  const { currentUser, hasRole } = useAuth();
  const [voters, setVoters] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (hasRole('admin')) {
      const loadData = async () => {
        const votersData = await getAllVoters();
        const candidatesData = await getCandidates();
        const resultsData = await getElectionResults();
        
        setVoters(votersData);
        setCandidates(candidatesData);
        setResults(resultsData);
      };
      loadData();
    }
  }, [hasRole]);

  if (!hasRole('admin')) {
    return <div>Acesso negado. Somente administradores podem acessar esta página.</div>;
  }

  return (
    <div className="admin-container">
      <h1>Painel de Administração</h1>
      
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
          <h3>Votos Registrados</h3>
          <p>{results ? Object.values(results).reduce((acc, curr) => acc + curr.votes, 0) : 0}</p>
        </div>
      </div>

      <ElectionResults results={results} />
    </div>
  );
}