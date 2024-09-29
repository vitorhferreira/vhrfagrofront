'use client'

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { LayoutDashboard } from '@/components/LayoutDashboard';
import { verificaTokenExpirado } from '@/services/token';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

// Interface para os dados do gasto
interface vacina {
  id?: number;
  nome_vacina: string;
  data_aplicacao: string;
  quantidade_cabecas:number;
  numero_lote: string;
}

interface lote {
  id: number;
  quantidade: number;
  peso: number;
  valor_individual: string;
  idade_media: string;
  data_compra: string;
  numero_lote: number;
}

// Componente para o formulário de cadastro de vacina
const CadastrovacinaForm = ({ onvacinaCriada, vacinaEdit }: { onvacinaCriada: () => void, vacinaEdit?: vacina }) => {
  const { register, handleSubmit, reset, setValue } = useForm<vacina>();
  const [loading, setLoading] = useState(false);
  const [pacienteOption, setloteOption] = useState<lote[]>([]);
  const [selectedlote, setSelectedlote] = useState<string>("");

  useEffect(() => {
    const fetchnumero_lotes = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/lote');
        setloteOption(response.data);
      } catch (error: any) {
        toast.error('Erro ao buscar lote');
      }
    };
    fetchnumero_lotes();
  }, []);

  useEffect(() => {
    if (vacinaEdit) {
      setValue('nome_vacina', vacinaEdit.nome_vacina);
      setValue('data_aplicacao', vacinaEdit.data_aplicacao);
      setValue('quantidade_cabecas', vacinaEdit.quantidade_cabecas);
      setSelectedlote(vacinaEdit.numero_lote);
      setValue('numero_lote', vacinaEdit.numero_lote); 
    } else {
      setSelectedlote("");
      reset();
    }
  }, [vacinaEdit, setValue, reset]);


  // Função para submeter o formulário
  const onSubmit = async (data: vacina) => {
    setLoading(true);
    try {
      if (vacinaEdit) {
        await axios.put(`http://127.0.0.1:8000/api/vacinas/${vacinaEdit.id}`, data); // URL da API para atualização
        toast.success('Vacina atualizada com sucesso!');
        onvacinaCriada();
      } else {
        await axios.post('http://127.0.0.1:8000/api/cadvacinas', data); // URL da API a ser utilizada
        toast.success('Vacina cadastrada com sucesso!');
        onvacinaCriada(); // Atualiza a lista de vacinas após cadastrar
        reset(); // Limpa o formulário
      }
    } catch (error) {
      console.error('Erro ao cadastrar Vacina:', error);
      toast.error('Erro ao cadastrar Vacina. Verifique os campos e tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  const handleloteChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const lote = event.target.value;
    setSelectedlote(lote);
    setValue('numero_lote', lote);
  };
  useEffect(() => {
    register('numero_lote', { required: true }); // Registrar o campo data_aplicacao manualmente
  }, [register]);
  // Retorno do componente de formulário
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-3">
        <label htmlFor="nome_vacina" className="form-label">Nome da Vacina:</label>
        <input type="text" className="form-control" id="nome_vacina" {...register('nome_vacina', { required: true })} />
      </div>
      <div className="mb-3">
        <label htmlFor="data_aplicacao" className="form-label">Data da Aplicação:</label>
        <input type="date" className="form-control" id="data_aplicacao" {...register('data_aplicacao', { required: true })} />
      </div>
      <div className="mb-3">
        <label htmlFor="quantidade_cabecas" className="form-label">Quantidade de Cabeças:</label>
        <input type="number" className="form-control" id="quantidade_cabecas" {...register('quantidade_cabecas', { required: true })} />
      </div>
      <div className="mb-3">
        <label htmlFor="lote" className="form-label">Lote</label>
         <select className="form-select" name="lote" value={selectedlote} onChange={handleloteChange}>
          <option value="lote">Selecione um Lote</option>
          {pacienteOption.map(lote => (
            <option key={lote.id} value={lote.numero_lote}>
              {`${lote.numero_lote}`}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  );
};

interface vacina {
  id?: number;
  nome_vacina: string;
  data_aplicacao: string;
  quantidade_cabecas:number;
  numero_lote: string;
}

// Componente para listar as vacinas
const Listavacinas = ({ vacinas, onvacinaEdit, onvacinaCriada }: { vacinas: vacina[], onvacinaEdit: (vacina: vacina) => void, onvacinaCriada: () => void }) => {
  const [filteredvacinas, setFilteredvacinas] = useState<vacina[]>(vacinas);
  useEffect(() => {
    setFilteredvacinas(vacinas)
  }, [vacinas])
  // Retorno do componente de lista de vacinas
  const handleDelete = async (id: any) => {
    try {
      var response = await axios.delete(`http://127.0.0.1:8000/api/vacinas/${id}`);
      if (response.data.sucesso = true) {
        toast.success('Vacina deletada com sucesso');
        onvacinaCriada();
      }
      else {
        toast.error('Erro ao deletar Vacina');
        return
      }
    } catch (error) {
      toast.error('Erro ao deletar Vacina');
    }
  };

  const filtervacina = (numero_lote: string) => {
    if (numero_lote !== '') {
      setFilteredvacinas(vacinas.filter(d => d.numero_lote.includes(numero_lote)))
    } else {
      setFilteredvacinas(vacinas)
    }
  }

  return (
    <div>
      <h2>Lista de Vacinas:</h2>
      <input placeholder="Filtrar por Numero do lote" className="form-control mb-3" onChange={(e) => filtervacina(e.target.value)} />
      <ul>
        {filteredvacinas.map((vacina) => (
          <li key={vacina.id}>
            <strong>Nome da Vacina:</strong> {vacina.nome_vacina}<br />
            <strong>Data da Aplicação:</strong> {vacina.data_aplicacao}<br />
            <strong>Quantidade de cabeças:</strong> {vacina.quantidade_cabecas}<br />
            <strong>Numero do Lote:</strong> {vacina.numero_lote}<br />
            <div className="actions">
              <button className='btn btn-primary' onClick={() => onvacinaEdit(vacina)}>Editar</button>
              <button className='btn btn-danger' onClick={() => handleDelete(vacina.id)}>Excluir</button>
            </div>
          </li>

        ))}
      </ul>
    </div>
  );
};
interface vacina {
  id?: number;
  nome_vacina: string;
  data_aplicacao: string;
  quantidade_cabecas:number;
  numero_lote: string;
}


// Componente principal Dashboard
const Dashboard = () => {
  const router = useRouter();
  const [vacinas, setvacinas] = useState<vacina[]>([]);
  const [vacinaEdit, setvacinaEdit] = useState<vacina | null>(null);

  // Verificação de token (exemplo básico)
  useEffect(() => {
    carregarvacinas();
  }, []);

  // Função para carregar as vacinas
  const carregarvacinas = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/vacinas'); // URL da API a ser utilizada
      setvacinas(response.data);
    } catch (error) {
      console.error('Erro ao carregar Gastos:', error);
    }
  };
  const handlevacinaCriada = () => {
    carregarvacinas();
    setvacinaEdit(null); // Limpar a gasto em edição após criar/editar
  };
  const handlevacinaEdit = (vacina: vacina) => {
    setvacinaEdit(vacina);
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
                  <h3 className="card-title">Cadastro de Vacinas</h3>
                  <CadastrovacinaForm onvacinaCriada={handlevacinaCriada} vacinaEdit={vacinaEdit} />
                </div>
              </div>

              {/* Componente de Lista de vacinas */}
              <div className="card mb-4">
                <div className="card-body">
                  <Listavacinas onvacinaEdit={handlevacinaEdit} onvacinaCriada={handlevacinaCriada} vacinas={vacinas} />
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