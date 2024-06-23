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
  id?: number;
  nomedavacina: string;
  cpf: string;
  descricao: string;
  dataultimadose: string;
  dataproximadose: string;
}

interface MedicoData {
  id: number,
  nome: string,
  cpf: string,
  idade: number,
  profissao: string
}

// Componente para o formulário de cadastro de vacina
const CadastroVacinaForm = ({ onVacinaCriada, vacinaEdit }: { onVacinaCriada: () => void, vacinaEdit?: Vacina }) => {
  const { register, handleSubmit, reset, setValue } = useForm<Vacina>();
  const [loading, setLoading] = useState(false);
  const [pacienteOption, setPacienteOption] = useState<MedicoData[]>([]);
  const [selectedCpf, setSelectedCpf] = useState<string>("");

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

  useEffect(() => {
    if (vacinaEdit) {
      setValue('nomedavacina', vacinaEdit.nomedavacina);
      setValue('cpf', vacinaEdit.cpf);
      setValue('descricao', vacinaEdit.descricao);
      setValue('dataultimadose', vacinaEdit.dataultimadose);
      setValue('dataproximadose', vacinaEdit.dataproximadose);
      setSelectedCpf(vacinaEdit.cpf);
    } else {
      setSelectedCpf("");
      reset();
    }
  }, [vacinaEdit, setValue, reset]);


  // Função para submeter o formulário
  const onSubmit = async (data: Vacina) => {
    setLoading(true);
    try {
      if (vacinaEdit) {
        await axios.put(`http://127.0.0.1:8000/api/vacinas/${vacinaEdit.id}`, data); // URL da API para atualização
        toast.success('Vacina atualizada com sucesso!');
        onVacinaCriada();
      } else {
        await axios.post('http://127.0.0.1:8000/api/cadvacinas', data); // URL da API a ser utilizada
        toast.success('Vacina cadastrada com sucesso!');
        onVacinaCriada(); // Atualiza a lista de vacinas após cadastrar
        reset(); // Limpa o formulário
      }
    } catch (error) {
      console.error('Erro ao cadastrar vacina:', error);
      toast.error('Erro ao cadastrar vacina. Verifique os campos e tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  const handleCpfChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const cpf = event.target.value;
    setSelectedCpf(cpf);
    setValue('cpf', cpf);
  };
  useEffect(() => {
    register('cpf', { required: true }); // Registrar o campo cpf manualmente
  }, [register]);
  // Retorno do componente de formulário
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-3">
        <label htmlFor="nomedavacina" className="form-label">Nome da Vacina:</label>
        <input type="text" className="form-control" id="nomedavacina" {...register('nomedavacina', { required: true })} />
      </div>
      <div className="mb-3">
        <label htmlFor="cpf" className="form-label">CPF</label>
         <select className="form-select" name="cpf" value={selectedCpf} onChange={handleCpfChange}>
          <option value="">Selecione um Paciente</option>
          {pacienteOption.map(paciente => (
            <option key={paciente.id} value={paciente.cpf}>
              {paciente.nome}
            </option>
          ))}
        </select>
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

interface Vacina {
  id?: number;
  nomedavacina: string;
  cpf: string;
  descricao: string;
  dataultimadose: string;
  dataproximadose: string;
}
// Componente para listar as vacinas
const ListaVacinas = ({ vacinas, onVacinaEdit, onVacinaCriada }: { vacinas: Vacina[], onVacinaEdit: (vacina: Vacina) => void, onVacinaCriada: () => void }) => {
  // Retorno do componente de lista de vacinas
  const handleDelete = async (id: any) => {
    try {
      var response = await axios.delete(`http://127.0.0.1:8000/api/vacinas/${id}`);
      if (response.data.sucesso = true) {
        toast.success('Vacina deletada com sucesso');
        onVacinaCriada();
      }
      else {
        toast.error('Erro ao deletar Vacina');
        return
      }
    } catch (error) {
      toast.error('Erro ao deletar Vacina');
    }
  };


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
            <div className="actions">
              <button className='btn btn-primary' onClick={() => onVacinaEdit(vacina)}>Editar</button>
              <button className='btn btn-danger' onClick={() => handleDelete(vacina.id)}>Excluir</button>
            </div>
          </li>

        ))}
      </ul>
    </div>
  );
};
interface Vacina {
  id?: number;
  nomedavacina: string;
  cpf: string;
  descricao: string;
  dataultimadose: string;
  dataproximadose: string;
}

// Componente principal Dashboard
const Dashboard = () => {
  const router = useRouter();
  const [vacinas, setVacinas] = useState<Vacina[]>([]);
  const [vacinaEdit, setVacinaEdit] = useState<Vacina | null>(null);

  // Verificação de token (exemplo básico)
  useEffect(() => {
    carregarVacinas();
  }, []);

  // Função para carregar as vacinas
  const carregarVacinas = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/vacinas'); // URL da API a ser utilizada
      setVacinas(response.data);
    } catch (error) {
      console.error('Erro ao carregar vacinas:', error);
    }
  };
  const handleVacinaCriada = () => {
    carregarVacinas();
    setVacinaEdit(null); // Limpar a vacina em edição após criar/editar
  };
  const handleVacinaEdit = (vacina: Vacina) => {
    setVacinaEdit(vacina);
  };

  // Retorno do componente Dashboard
  return (
    <LayoutDashboard token=''>
      <div className="container-fluid">
        <div className="row">
          <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
            <div className="my-4">
              <h2 className="mb-4"></h2>

              {/* Componente de Formulário de Cadastro */}
              <div className="card mb-4">
                <div className="card-body">
                  <h3 className="card-title">Cadastro de Vacina</h3>
                  <CadastroVacinaForm onVacinaCriada={handleVacinaCriada} vacinaEdit={vacinaEdit} />
                </div>
              </div>

              {/* Componente de Lista de Vacinas */}
              <div className="card mb-4">
                <div className="card-body">
                  <ListaVacinas onVacinaEdit={handleVacinaEdit} onVacinaCriada={handleVacinaCriada} vacinas={vacinas} />
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
