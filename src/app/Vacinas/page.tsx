'use client'

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { LayoutDashboard } from '@/components/LayoutDashboard';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

// Interface para os dados da vacina e do lote
interface vacina {
  id?: number;
  nome_vacina: string;
  data_aplicacao: string;
  quantidade_cabecas: number;
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
  const { register, handleSubmit, reset, setValue, watch } = useForm<vacina>();
  const [loading, setLoading] = useState(false);
  const [loteOption, setLoteOption] = useState<lote[]>([]);
  const [selectedLote, setSelectedLote] = useState<string>("");
  const [quantidadeDisponivel, setQuantidadeDisponivel] = useState<number | null>(null);
  const quantidadeCabecas = watch('quantidade_cabecas'); // Obter o valor do campo de quantidade de cabeças

  // Buscar lotes disponíveis
  useEffect(() => {
    const fetchLotes = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/lote');
        setLoteOption(response.data);
      } catch (error: any) {
        toast.error('Erro ao buscar lotes');
      }
    };
    fetchLotes();
  }, []);

  // Preencher os campos ao editar
  useEffect(() => {
    if (vacinaEdit) {
      setValue('nome_vacina', vacinaEdit.nome_vacina);
      setValue('data_aplicacao', vacinaEdit.data_aplicacao);
      setValue('quantidade_cabecas', vacinaEdit.quantidade_cabecas);
      setSelectedLote(vacinaEdit.numero_lote);
      setValue('numero_lote', vacinaEdit.numero_lote);
    } else {
      reset();
    }
  }, [vacinaEdit, setValue, reset]);

  // Função para verificar a quantidade disponível ao selecionar um lote
  const handleLoteChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const loteSelecionado = event.target.value;
    setSelectedLote(loteSelecionado);
    setValue('numero_lote', loteSelecionado);

    const lote = loteOption.find(l => l.numero_lote === loteSelecionado);
    if (lote) {
      setQuantidadeDisponivel(lote.quantidade);
    } else {
      setQuantidadeDisponivel(null);
    }
  };

  // Função para verificar se a quantidade de cabeças está disponível no lote selecionado
  const isQuantidadeValida = () => {
    if (quantidadeDisponivel !== null && quantidadeCabecas !== undefined) {
      return quantidadeCabecas <= quantidadeDisponivel;
    }
    return true; // Se não houver lote selecionado, considerar válido
  };

  // Função para submeter o formulário
  const onSubmit = async (data: vacina) => {
    if (!isQuantidadeValida()) {
      toast.error(`A quantidade de cabeças não pode exceder a quantidade disponível no lote (${quantidadeDisponivel}).`);
      return;
    }

    setLoading(true);
    try {
      if (vacinaEdit) {
        await axios.put(`http://127.0.0.1:8000/api/vacinas/${vacinaEdit.id}`, data);
        toast.success('Vacina atualizada com sucesso!');
        onvacinaCriada();
      } else {
        await axios.post('http://127.0.0.1:8000/api/cadvacinas', data);
        toast.success('Vacina cadastrada com sucesso!');
        onvacinaCriada();
        reset(); // Limpa o formulário
      }
    } catch (error) {
      console.error('Erro ao cadastrar vacina:', error);
      toast.error('Erro ao cadastrar vacina. Verifique os campos e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

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
        <input
          type="number"
          className="form-control"
          id="quantidade_cabecas"
          {...register('quantidade_cabecas', { required: true })}
          style={{ borderColor: !isQuantidadeValida() ? 'red' : undefined }}
        />
        {!isQuantidadeValida() && (
          <div className="text-danger">
            Quantidade excede a quantidade disponível no lote ({quantidadeDisponivel} cabeças disponíveis).
          </div>
        )}
      </div>
      <div className="mb-3">
        <label htmlFor="lote" className="form-label">Lote</label>
        <select className="form-select" name="lote" value={selectedLote} onChange={handleLoteChange}>
          <option value="">Selecione um Lote</option>
          {loteOption.map(lote => (
            <option key={lote.id} value={lote.numero_lote}>
              {`${lote.numero_lote} - ${lote.quantidade} cabeças disponíveis`}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading || !isQuantidadeValida()}>
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
  const [showModal, setShowModal] = useState(false); // Controla a visibilidade do modal
  const [vacinaToDelete, setVacinaToDelete] = useState<vacina | null>(null); // Vacina a ser excluída

  useEffect(() => {
    setFilteredvacinas(vacinas)
  }, [vacinas])

  const handleDeleteConfirmation = (vacina: vacina) => {
    setVacinaToDelete(vacina);
    setShowModal(true); // Exibe o modal de confirmação
  };

  const handleDelete = async () => {
    if (vacinaToDelete) {
      try {
        var response = await axios.delete(`http://127.0.0.1:8000/api/vacinas/${vacinaToDelete.id}`);
        if (response.data.sucesso = true) {
          toast.success('Vacina deletada com sucesso');
          onvacinaCriada();
        } else {
          toast.error('Erro ao deletar Vacina');
        }
      } catch (error) {
        toast.error('Erro ao deletar Vacina');
      } finally {
        setShowModal(false); // Fecha o modal após a ação
        setVacinaToDelete(null); // Limpa a vacina a ser excluída
      }
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
          <li key={vacina.id} style={{ margin: '15px 0', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff' }}>
            <h3 style={{ margin: '0', color: '#007bff' }}>Número do Lote: {vacina.numero_lote}</h3> {/* Destacar o número do lote */}
            <strong>Nome da Vacina:</strong> {vacina.nome_vacina}<br />
            <strong>Data da Aplicação:</strong> {new Date(vacina.data_aplicacao).toLocaleDateString('pt-BR')}<br />
            <strong>Quantidade de Cabeças:</strong> {vacina.quantidade_cabecas}<br />
            <div className="actions" style={{ marginTop: '10px' }}>
              <button className='btn btn-primary' style={{ marginRight: '10px', padding: '8px 12px', borderRadius: '4px', border: 'none', backgroundColor: '#007bff', color: '#fff', cursor: 'pointer' }} onClick={() => onvacinaEdit(vacina)}>Editar</button>
              <button className='btn btn-danger' style={{ padding: '8px 12px', borderRadius: '4px', border: 'none', backgroundColor: '#dc3545', color: '#fff', cursor: 'pointer' }} onClick={() => handleDeleteConfirmation(vacina)}>Excluir</button>
            </div>
          </li>
        ))}
      </ul>

      {/* Modal de Confirmação de Exclusão */}
      {showModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }} tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmar Exclusão</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <div className="modal-body">
                <p>Você tem certeza que deseja excluir a vacina <strong>{vacinaToDelete?.nome_vacina}</strong>?</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="button" className="btn btn-danger" onClick={handleDelete}>Excluir</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

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
