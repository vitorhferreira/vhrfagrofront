'use client'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { LayoutDashboard } from '@/components/LayoutDashboard';
import { verificaTokenExpirado } from '@/services/token';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

// Interface para os dados do agendamento
interface Agendamento {
  id: number;
  cpf: string;
  medico: string;
  data: string;
  telefone: string;
  hora: string;
  local: string;
}

// Componente para o formulário de cadastro de agendamento
const CadastroAgendamentoForm = ({ onAgendamentoCriado }: { onAgendamentoCriado: () => void }) => {
  const { register, handleSubmit, reset } = useForm<Agendamento>();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: Agendamento) => {
    setLoading(true);
    try {
      await axios.post('http://127.0.0.1:8000/api/agendamentos', data); // URL da API a ser utilizada
      toast.success('Agendamento cadastrado com sucesso!');
      onAgendamentoCriado(); // Atualiza a lista de agendamentos após cadastrar
      reset(); // Limpa o formulário
    } catch (error) {
      console.error('Erro ao cadastrar agendamento:', error);
      toast.error('Erro ao cadastrar agendamento. Verifique os campos e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-3">
        <label htmlFor="cpf" className="form-label">CPF</label>
        <input type="text" className="form-control" id="cpf" {...register('cpf', { required: true })} />
      </div>
      <div className="mb-3">
        <label htmlFor="medico" className="form-label">Médico</label>
        <input type="text" className="form-control" id="medico" {...register('medico', { required: true })} />
      </div>
      <div className="mb-3">
        <label htmlFor="data" className="form-label">Data</label>
        <input type="date" className="form-control" id="data" {...register('data', { required: true })} />
      </div>
      <div className="mb-3">
        <label htmlFor="telefone" className="form-label">Telefone</label>
        <input type="text" className="form-control" id="telefone" {...register('telefone', { required: true })} />
      </div>
      <div className="mb-3">
        <label htmlFor="hora" className="form-label">Hora</label>
        <input type="time" className="form-control" id="hora" {...register('hora', { required: true })} />
      </div>
      <div className="mb-3">
        <label htmlFor="local" className="form-label">Local</label>
        <input type="text" className="form-control" id="local" {...register('local', { required: true })} />
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  );
};

// Componente para listar os agendamentos
const ListaAgendamentos = ({ agendamentos }: { agendamentos: Agendamento[] }) => {
  return (
    <div>
      <h2>Lista de Agendamentos</h2>
      <ul>
        {agendamentos.map((agendamento) => (
          <li key={agendamento.id}>
            <strong>CPF:</strong> {agendamento.cpf}<br />
            <strong>Médico:</strong> {agendamento.medico}<br />
            <strong>Data:</strong> {agendamento.data}<br />
            <strong>Telefone:</strong> {agendamento.telefone}<br />
            <strong>Hora:</strong> {agendamento.hora}<br />
            <strong>Local:</strong> {agendamento.local}<br />
          </li>
        ))}
      </ul>
    </div>
  );
};

// Componente principal Dashboard
const Dashboard = () => {
  const router = useRouter();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const token = 'example_token'; // Substitua pelo seu método de obtenção de token

  // Verificação de token e carregamento inicial de agendamentos
  useEffect(() => {
    if (!token || verificaTokenExpirado(token)) {
      router.push('/login');
    } else {
      carregarAgendamentos(); // Carregar agendamentos ao montar o componente
    }
  }, [token]);

  const carregarAgendamentos = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/agendamentos'); // URL da API a ser utilizada
      setAgendamentos(response.data);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    }
  };

  if (!token || verificaTokenExpirado(token)) {
    return null; // Redireciona para login se não autenticado
  }

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
                  <h3 className="card-title">Cadastro de Agendamento</h3>
                  <CadastroAgendamentoForm onAgendamentoCriada={carregarAgendamentos} />
                </div>
              </div>

              {/* Componente de Lista de Agendamentos */}
              <div className="card mb-4">
                <div className="card-body">
                  <ListaAgendamentos agendamentos={agendamentos} />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </LayoutDashboard>
  );
};

export default Dashboard;
