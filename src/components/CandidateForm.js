import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { addCandidate } from '../services/candidates';
import { toast } from 'react-hot-toast';

const CandidateForm = ({ onSuccess }) => {
  const { hasRole } = useAuth();
  const [formData, setFormData] = useState({
    number: '',
    name: '',
    party: '',
    position: 'Presidente'
  });
  const [loading, setLoading] = useState(false);

  const positions = [
    'Presidente',
    'Governador',
    'Senador',
    'Deputado Federal',
    'Deputado Estadual',
    'Vereador'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!hasRole('admin')) {
      toast.error('Apenas administradores podem cadastrar candidatos');
      return;
    }

    // Validações
    if (!/^\d{2}$/.test(formData.number)) {
      toast.error('Número deve ter exatamente 2 dígitos');
      return;
    }

    if (formData.name.length < 3) {
      toast.error('Nome deve ter pelo menos 3 caracteres');
      return;
    }

    setLoading(true);
    try {
      await addCandidate(formData);
      toast.success('Candidato cadastrado com sucesso!');
      setFormData({
        number: '',
        name: '',
        party: '',
        position: 'Presidente'
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(`Erro ao cadastrar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!hasRole('admin')) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Apenas administradores podem cadastrar candidatos.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Cadastrar Novo Candidato</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Número do Candidato */}
          <div>
            <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-1">
              Número *
            </label>
            <input
              type="text"
              id="number"
              name="number"
              value={formData.number}
              onChange={handleChange}
              maxLength="2"
              pattern="\d{2}"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="mt-1 text-sm text-gray-500">2 dígitos (ex: 13, 22)</p>
          </div>

          {/* Nome do Candidato */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nome Completo *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
              minLength="3"
            />
          </div>

          {/* Partido */}
          <div>
            <label htmlFor="party" className="block text-sm font-medium text-gray-700 mb-1">
              Partido/Coligação *
            </label>
            <input
              type="text"
              id="party"
              name="party"
              value={formData.party}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Cargo */}
          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
              Cargo *
            </label>
            <select
              id="position"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {positions.map(position => (
                <option key={position} value={position}>{position}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Cadastrando...
              </>
            ) : 'Cadastrar Candidato'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CandidateForm;