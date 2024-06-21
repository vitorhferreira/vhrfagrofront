'use client'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { LayoutDashboard } from '@/components/LayoutDashboard';
import { verificaTokenExpirado } from '@/services/token';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

// Interface para os dados do médico
interface Medico {
  id: number;
  nome: string;
  idade: number;
  profissao: string;
  created_at: string;
  updated_at: string;
}

// Componente para o formulário de cadastro de médicos
const CadastroMedicoForm = ({ onMedicoCriado }: { onMedicoCriado: () => void }) => {
  const { register, handleSubmit, reset } = useForm<Medico>();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: Medico) => {
    setLoading(true);
    try {
      await axios.post('http://127.0.0.1:8000/api/medicos', data); // URL da API a ser utilizada
      toast.success('Médico cadastrado com sucesso!');
      onMedicoCriado(); // Atualiza a lista de médicos após cadastrar
      reset(); // Limpa o formulário
    } catch (error) {
      console.error('Erro ao cadastrar médico:', error);
      toast.error('Erro ao cadastrar médico. Verifique os campos e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-3">
        <label htmlFor="nome" className="form-label">Nome</label>
        <input type="text" className="form-control" id="nome" {...register('nome', { required: true })} />
      </div>
      <div className="mb-3">
        <label htmlFor="idade" className="form-label">Idade</label>
        <input type="number" className="form-control" id="idade" {...register('idade', { required: true })} />
      </div>
      <div className="mb-3">
        <label htmlFor="profissao" className="form-label">Profissão</label>
        <input type="text" className="form-control" id="profissao" {...register('profissao', { required: true })} />
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  );
};

// Componente para listar os médicos
const ListaMedicos = ({ medicos }: { medicos: Medico[] }) => {
  return (
    <div>
      <h2>Lista de Médicos</h2>
      <ul>
        {medicos.map((medico) => (
          <li key={medico.id}>
            <strong>Nome:</strong> {medico.nome}<br />
            <strong>Idade:</strong> {medico.idade}<br />
            <strong>Profissão:</strong> {medico.profissao}<br />
            <strong>Criado em:</strong> {medico.created_at}<br />
            <strong>Atualizado em:</strong> {medico.updated_at}<br />
          </li>
        ))}
      </ul>
    </div>
  );
};

// Componente principal Dashboard
const Dashboard = () => {
  const router = useRouter();
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const token = 'example_token'; // Substitua pelo seu método de obtenção de token

  // Verificação de token e carregamento inicial de médicos
  useEffect(() => {
    if (!token || verificaTokenExpirado(token)) {
      router.push('/login');
    } else {
      carregarMedicos(); // Carregar médicos ao montar o componente
    }
  }, [token]);

  const carregarMedicos = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/medicos'); // URL da API a ser utilizada
      setMedicos(response.data);
    } catch (error) {
      console.error('Erro ao carregar médicos:', error);
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
                  <h3 className="card-title">Cadastro de Médico</h3>
                  <CadastroMedicoForm onMedicoCriado={carregarMedicos} />
                </div>
              </div>

              {/* Componente de Lista de Médicos */}
              <div className="card mb-4">
                <div className="card-body">
                  <ListaMedicos medicos={medicos} />
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
