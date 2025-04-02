import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getElectionResults } from '../services/elections';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { CSVLink } from 'react-csv';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ElectionResults = () => {
  const { hasRole } = useAuth();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResults = async () => {
      const data = await getElectionResults();
      setResults(data);
      setLoading(false);
    };
    loadResults();
  }, []);

  const prepareChartData = () => {
    if (!results) return { labels: [], datasets: [] };

    const sortedResults = Object.entries(results)
      .sort((a, b) => b[1].votes - a[1].votes);

    return {
      labels: sortedResults.map(([_, data]) => 
        `${data.number ? `${data.number} - ` : ''}${data.name}`
      ),
      datasets: [{
        label: 'Votos',
        data: sortedResults.map(([_, data]) => data.votes),
        backgroundColor: [
          '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'
        ],
      }]
    };
  };

  const prepareCSVData = () => {
    if (!results) return [];
    
    return Object.entries(results).map(([id, data]) => ({
      'Cargo': data.position || 'N/A',
      'Número': data.number || (id === 'blank' ? 'BR' : (id === 'null' ? 'NL' : 'N/A')),
      'Nome': data.name || (id === 'blank' ? 'Voto em Branco' : (id === 'null' ? 'Voto Nulo' : 'N/A')),
      'Partido': data.party || 'N/A',
      'Votos': data.votes || 0
    }));
  };

  if (loading) {
    return <div>Carregando resultados...</div>;
  }

  if (!results) {
    return <div>Nenhum resultado disponível</div>;
  }

  const chartData = prepareChartData();
  const csvData = prepareCSVData();

  return (
    <div className="election-results">
      <h2>Resultados da Eleição</h2>
      
      <div className="chart-container">
        <Bar
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: 'Resultados da Eleição',
              },
            },
          }}
        />
      </div>

      <div className="results-actions">
        <CSVLink 
          data={csvData} 
          filename="resultados-eleicao.csv"
          className="export-btn"
        >
          Exportar para CSV
        </CSVLink>
      </div>

      <div className="results-table">
        <table>
          <thead>
            <tr>
              <th>Cargo</th>
              <th>Número</th>
              <th>Nome</th>
              <th>Partido</th>
              <th>Votos</th>
              <th>%</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(results)
              .sort((a, b) => b[1].votes - a[1].votes)
              .map(([id, data]) => {
                const totalVotes = Object.values(results).reduce((sum, item) => sum + (item.votes || 0), 0);
                const percentage = totalVotes > 0 ? ((data.votes / totalVotes) * 100).toFixed(2) : 0;
                
                return (
                  <tr key={id}>
                    <td>{data.position || '-'}</td>
                    <td>{data.number || (id === 'blank' ? 'BR' : (id === 'null' ? 'NL' : '-'))}</td>
                    <td>{data.name || (id === 'blank' ? 'Voto em Branco' : (id === 'null' ? 'Voto Nulo' : '-'))}</td>
                    <td>{data.party || '-'}</td>
                    <td>{data.votes || 0}</td>
                    <td>{percentage}%</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ElectionResults;