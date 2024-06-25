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
  cpf: string;
  idade: number;
  profissao: string;
  created_at: string;
  updated_at: string;

}

// Componente para o formulário de cadastro de médicos
const CadastroMedicoForm = ({ onMedicoCriado, medicoEdit }: { onMedicoCriado: () => void, medicoEdit?: Medico }) => {
  const { register, handleSubmit, reset, setValue } = useForm<Medico>();
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (medicoEdit) {
      setValue('nome', medicoEdit.nome);
      setValue('cpf', medicoEdit.cpf);
      setValue('idade', medicoEdit.idade);
      setValue('profissao', medicoEdit.profissao);
    } else {
      reset();
    }
  }, [medicoEdit, setValue, reset]);



  const onSubmit = async (data: Medico) => {
    setLoading(true);
    try {
      if (medicoEdit) {
        const response = await axios.put(`http://127.0.0.1:8000/api/medico/${medicoEdit.id}`, data); // URL da API para atualização

        if (parseInt(response.data.sucesso) == 99) {
          toast.warning('CPF invalido');
          return
        }

        toast.success('Medico atualizada com sucesso!');
        onMedicoCriado();
      } else {
        const response = await axios.post('http://127.0.0.1:8000/api/cadmedico', data); // URL da API a ser utilizada

        if (parseInt(response.data.sucesso) == 99) {
          toast.warning('CPF invalido');
          return
        }

        toast.success('Médico cadastrado com sucesso!');
        onMedicoCriado(); // Atualiza a lista de médicos após cadastrar
        reset(); // Limpa o formulário
      }
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
        <label htmlFor="cpf" className="form-label">CPF</label>
        <input type="text" className="form-control" id="cpf" {...register('cpf', { required: true })} />
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
const ListaMedicos = ({ medicos, onMedicoEdit, onMedicoCriada }: { medicos: Medico[], onMedicoEdit: (medico: Medico) => void, onMedicoCriada: () => void }) => {

  const handleDelete = async (id: any) => {
    try {
      var response = await axios.delete(`http://127.0.0.1:8000/api/medico/${id}`);

      if (response.data.sucesso = true) {
        toast.success('Medico deletado com sucesso');
        onMedicoCriada();
      }
      else {
        toast.error('Erro ao deletar Medico');
        return
      }
    } catch (error) {
      toast.error('Erro ao deletar Medico');
    }
  };

  return (
    <div>
      <h2>Lista de Médicos</h2>
      <ul>
        {medicos.map((medico) => (
          <li key={medico.id}>
            <strong>Nome:</strong> {medico.nome}<br />
            <strong>CPF:</strong> {medico.cpf}<br />
            <strong>Idade:</strong> {medico.idade}<br />
            <strong>Profissão:</strong> {medico.profissao}<br />
            <strong>Criado em:</strong> {medico.created_at}<br />
            <strong>Atualizado em:</strong> {medico.updated_at}<br />
            <div className="actions">
              <button className='btn btn-primary' onClick={() => onMedicoEdit(medico)}>Editar</button>
              <button className='btn btn-danger' onClick={() => handleDelete(medico.id)}>Excluir</button>
            </div>
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
  const [medicoEdit, setMedicoEdit] = useState<Medico | null>(null);
  // const token = 'example_token'; // Substitua pelo seu método de obtenção de token

  // Verificação de token e carregamento inicial de médicos
  // useEffect(() => {
  //   if (!token || verificaTokenExpirado(token)) {
  //     router.push('/login');
  //   } else {
  //     carregarMedicos(); // Carregar médicos ao montar o componente
  //   }
  // }, [token]);
  useEffect(() => {


    carregarMedicos(); // Carregar médicos ao montar o componente

  }, []);


  const carregarMedicos = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/medico'); // URL da API a ser utilizada
      setMedicos(response.data);
    } catch (error) {
      console.error('Erro ao carregar médicos:', error);
    }
  };

  // if (!token || verificaTokenExpirado(token)) {
  //   return null; // Redireciona para login se não autenticado
  // }
  const handleMedicoCriada = () => {
    carregarMedicos()
    setMedicoEdit(null); // Limpar a vacina em edição após criar/editar
  };
  const handleMedicoEdit = (medico: Medico) => {
    setMedicoEdit(medico);
  };

  return (
    // <LayoutDashboard token={token}>
    <LayoutDashboard token={''}>
      <div className="container-fluid">
        <div className="row">
          <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
            <div className="my-4">
              <h2 className="mb-4"></h2>

              {/* Componente de Formulário de Cadastro */}
              <div className="card mb-4">
                <div className="card-body">
                  <h3 className="card-title">Cadastro de Médico</h3>
                  <CadastroMedicoForm onMedicoCriado={handleMedicoCriada} medicoEdit={medicoEdit} />
                </div>
              </div>

              {/* Componente de Lista de Médicos */}
              <div className="card mb-4">
                <div className="card-body">
                  <ListaMedicos onMedicoEdit={handleMedicoEdit} onMedicoCriada={handleMedicoCriada} medicos={medicos} />
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
