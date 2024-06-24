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
  id?: number;
  cpf: string;
  medico: string;
  data: string;
  telefone: string;
  hora: string;
  local: string;
}
interface MedicoData{
  id: number,
  nome: string,
  cpf: string,
  idade: number,
  profissao: string
}

interface Paciente{
  id: number,
  nome: string,
  cpf: string,
  idade: number
}
// Componente para o formulário de cadastro de agendamento
const CadastroAgendamentoForm = ({ onAgendamentoCriado, agendaEdit }: { onAgendamentoCriado: () => void,   agendaEdit?: Agendamento} ) => {
  const { register, handleSubmit, reset, setValue } = useForm<Agendamento>();
  const [loading, setLoading] = useState(false);
  const [medicoOption, setMedicoOption] = useState<MedicoData[]>([]);
  const [pacienteOption, setPacienteOption] = useState<MedicoData[]>([]);
  const [selectedCpf, setSelectedCpf] = useState<string>("");
  const [selectedMedico, setSelectedMedico] = useState<string>("");

  useEffect(() => {
   
    if (agendaEdit) {
      console.log(agendaEdit)
      setValue('cpf', agendaEdit.cpf);
      setValue('medico', agendaEdit.medico);
      setValue('data', agendaEdit.data);
      setValue('telefone', agendaEdit.telefone);
      setValue('hora', agendaEdit.hora);
      setValue('local', agendaEdit.local);
      setSelectedCpf(agendaEdit.cpf);
      setSelectedMedico(agendaEdit.medico);
    } else {
      reset();
    }
  }, [agendaEdit, setValue, reset]);


  useEffect(() => {
    const fetchFuncionarios = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/medico');
        setMedicoOption(response.data);
      } catch (error: any) {
        toast.error('Erro ao buscar Medicos');
      }
    };

    fetchFuncionarios();
  }, []);

  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/pacientes');
        setPacienteOption(response.data);
      } catch (error: any) {
        toast.error('Erro ao buscar Pacientes');
      }
    };
    fetchPacientes();
  }, []);


  const onSubmit = async (data: Agendamento) => {
    setLoading(true);
    try {
      if(agendaEdit){
        await axios.put(`http://127.0.0.1:8000/api/agendamentos/${agendaEdit.id}`, data); // URL da API para atualização
        toast.success('Agendamento atualizada com sucesso!');
        onAgendamentoCriado();
        // setValue('medico', '');
        // setValue('cpf', '');
      }else{
        await axios.post('http://127.0.0.1:8000/api/cadagendamentos', data); // URL da API a ser utilizada
        toast.success('Agendamento cadastrado com sucesso!');
        onAgendamentoCriado(); // Atualiza a lista de agendamentos após cadastrar
        reset(); // Limpa o formulário
        setValue('medico', '');
        setValue('cpf', '');
      }
    
    } catch (error) {
      console.error('Erro ao cadastrar agendamento:', error);
      toast.error('Erro ao cadastrar agendamento. Verifique os campos e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCpfChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const cpf = event.target.value;
    setSelectedCpf(cpf);
    setValue('cpf', cpf);
  };

  const handleMedicoChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const medico = event.target.value;
    setSelectedMedico(medico);
    setValue('medico', medico);
  };
  useEffect(() => {
    register('cpf', { required: true }); // Registrar o campo cpf manualmente
  }, [register]);

  useEffect(() => {
    register('medico', { required: true }); // Registrar o campo medico manualmente
  }, [register]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>

      <div className="mb-3">
        <label htmlFor="cpf" className="form-label">CPF</label>
        <select className="form-select" name="cpf" value={selectedCpf} onChange={handleCpfChange}>
          <option value="">Selecione um Paciente</option>
          {pacienteOption.map(paciente => (
            <option key={paciente.id} value={paciente.cpf}>
              {`${paciente.cpf} - ${paciente.nome}`}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
      <label htmlFor="medico" className="form-label">Médicos</label>
        <select className="form-select" name="medico" value={selectedMedico} onChange={handleMedicoChange}>
          <option value="">Selecione um Médico</option>
          {medicoOption.map(medico => (
            <option key={medico.id} value={medico.nome}>
              {medico.nome}
            </option>
          ))}
        </select>
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
const ListaAgendamentos = ({ agendamentos, onAgendaEdit, onAgendamentoCriado }: { agendamentos: Agendamento[], onAgendaEdit: (agendamento: Agendamento) => void, onAgendamentoCriado: () => void  }) => {
  
  const handleDelete = async (id: any) => {
    try {
      var response = await axios.delete(`http://127.0.0.1:8000/api/agendamentos/${id}`);
      if (response.data.sucesso = true) {
        toast.success('Agendamento deletada com sucesso');
        onAgendamentoCriado();
      }
      else {
        toast.error('Erro ao deletar Agendamento');
        return
      }
    } catch (error) {
      toast.error('Erro ao deletar Agendamento');
    }
  };

  
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
            <div className="actions">
              <button className='btn btn-primary' onClick={() => onAgendaEdit(agendamento)}>Editar</button>
              <button className='btn btn-danger' onClick={() => handleDelete(agendamento.id)}>Excluir</button>
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
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [agendaEdit, setAgendaEdit] = useState<Agendamento | null>(null);
  // const token = 'example_token'; // Substitua pelo seu método de obtenção de token

  // Verificação de token e carregamento inicial de agendamentos
  // useEffect(() => {
  //   if (!token || verificaTokenExpirado(token)) {
  //     router.push('/login');
  //   } else {
  //     carregarAgendamentos(); // Carregar agendamentos ao montar o componente
  //   }
  // }, [token]);
  useEffect(() => {
    carregarAgendamentos(); 
  }, []);

  const carregarAgendamentos = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/agendamentos'); // URL da API a ser utilizada
      setAgendamentos(response.data);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    }
  };

  const handleAgendamentoCriada = () => {
    carregarAgendamentos();
    setAgendaEdit(null); // Limpar a vacina em edição após criar/editar
  };

  const handleAgendaEdit = (agendamento: Agendamento) => {
    setAgendaEdit(agendamento);
  };

  // if (!token || verificaTokenExpirado(token)) {
  //   return null; // Redireciona para login se não autenticado
  // }

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
                  <h3 className="card-title">Cadastro de Agendamento</h3>
                  <CadastroAgendamentoForm onAgendamentoCriado={handleAgendamentoCriada} agendaEdit={agendaEdit} />
                </div>
              </div>

              {/* Componente de Lista de Agendamentos */}
              <div className="card mb-4">
                <div className="card-body">
                  <ListaAgendamentos agendamentos={agendamentos}  onAgendaEdit={handleAgendaEdit}  onAgendamentoCriado={handleAgendamentoCriada} />
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
