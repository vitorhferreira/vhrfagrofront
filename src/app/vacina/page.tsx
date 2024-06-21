// Importações necessárias
'use client'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { LayoutDashboard } from '@/components/LayoutDashboard';
import { verificaTokenExpirado } from '@/services/token';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

// Interface para os dados da vacina
interface Vacina {
  id: number;
  nomedavacina: string;
  cpf: string;
  descricao: string;
  dataultimadose: string;
  dataproximadose: string;
}

// Componente para o formulário de cadastro de vacina
const CadastroVacinaForm = ({ onVacinaCriada }: { onVacinaCriada: () => void }) => {
  const { register, handleSubmit, reset } = useForm<Vacina>();
  const [loading, setLoading] = useState(false);

  // Função para submeter o formulário
  const onSubmit = async (data: Vacina) => {
    setLoading(true);
    try {
      await axios.post('http://127.0.0.1:8000/api/vacinas', data); // URL da API a ser utilizada
      toast.success('Vacina cadastrada com sucesso!');
      onVacinaCriada(); // Atualiza a lista de vacinas após cadastrar
      reset(); // Limpa o formulário
    } catch (error) {
      console.error('Erro ao cadastrar vacina:', error);
      toast.error('Erro ao cadastrar vacina. Verifique os campos e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Retorno do componente de formulário
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-3">
        <label htmlFor="nomedavacina" className="form-label">Nome da Vacina:</label>
        <input type="text" className="form-control" id="nomedavacina" {...register('nomedavacina', { required: true })} />
      </div>
      <div className="mb-3">
        <label htmlFor="cpf" className="form-label">CPF:</label>
        <input type="text" className="form-control" id="cpf" {...register('cpf', { required: true })} />
      </div>
      <div className="mb-3">
        <label htmlFor="descricao" className="form-label">Descrição:</label>
        <textarea className="form-control" id="descricao" {...register('descricao', { required: true })}></textarea>
      </div>
      <div className="mb-3">
        <label htmlFor="dataultimadose" className="form-label">Data Última Dose:</label>
        <input type="date" className="form-control" id="dataultimadose" {...register('dataultimadose', { required: true })} />
      </div>
      <div className="mb-3">
        <label htmlFor="dataproximadose" className="form-label">Data Próxima Dose:</label>
        <input type="date" className="form-control" id="dataproximadose" {...register('dataproximadose', { required: true })} />
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  );
};

// Componente para listar as vacinas
const ListaVacinas = ({ vacinas }: { vacinas: Vacina[] }) => {
  // Retorno do componente de lista de vacinas
  return (
    <div>
      <h2>Lista de Vacinas:</h2>
      <ul>
        {vacinas.map((vacina) => (
          <li key={vacina.id}>
            <strong>Nome da Vacina:</strong> {vacina.nomedavacina}<br />
            <strong>CPF:</strong> {vacina.cpf}<br />
            <strong>Descrição:</strong> {vacina.descricao}<br />
            <strong>Data Última Dose:</strong> {vacina.dataultimadose}<br />
            <strong>Data Próxima Dose:</strong> {vacina.dataproximadose}<br />
          </li>
        ))}
      </ul>
    </div>
  );
};

// Componente principal Dashboard
const Dashboard = () => {
  const router = useRouter();
  const [vacinas, setVacinas] = useState<Vacina[]>([]);
  const token = 'example_token'; // Substitua pelo seu método de obtenção de token

  // Verificação de token (exemplo básico)
  useEffect(() => {
    if (!token || verificaTokenExpirado(token)) {
      router.push('/login');
    } else {
      carregarVacinas(); // Carregar vacinas ao montar o componente
    }
  }, [token]);

  // Função para carregar as vacinas
  const carregarVacinas = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/vacinas'); // URL da API a ser utilizada
      setVacinas(response.data);
    } catch (error) {
      console.error('Erro ao carregar vacinas:', error);
    }
  };

  if (!token || verificaTokenExpirado(token)) {
    return null; // Redireciona para login se não autenticado
  }

  // Retorno do componente Dashboard
  return (
    <LayoutDashboard token={token}>
      <div className="container-fluid">
        <div className="row">
          <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
            <div className="my-4">
              <h2 className="mb-4"></h2>

              {/* Componente de Formulário de Cadastro */}
              <div className="card mb-4">
                <div className="card-body">
                  <h3 className="card-title">Cadastro de Vacina</h3>
                  <CadastroVacinaForm onVacinaCriada={carregarVacinas} />
                </div>
              </div>

              {/* Componente de Lista de Vacinas */}
              <div className="card mb-4">
                <div className="card-body">
                  <ListaVacinas vacinas={vacinas} />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </LayoutDashboard>
  );
};

export default Dashboard; // Exporta o componente Dashboard
