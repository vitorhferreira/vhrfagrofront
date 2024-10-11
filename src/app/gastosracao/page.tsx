'use client'

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { LayoutDashboard } from '@/components/LayoutDashboard';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

// Interface para os dados do consumo de ração
interface consumoRacao {
  id?: number;
  tipo_racao: string;
  quantidade_kg: string;
  valor_estimado: string;
  data_inicial: string;
  data_final: string;
}

interface Lote {
  id: number;
  quantidade: number;
  peso: number;
  valor_individual: string;
  idade_media: string;
  data_compra: string;
}

// Componente para o formulário de cadastro de consumo de ração
const CadastroConsumoRacaoForm = ({ onConsumoRacaoCriada, consumoRacaoEdit }: { onConsumoRacaoCriada: () => void, consumoRacaoEdit?: consumoRacao }) => {
  const { register, handleSubmit, reset, setValue, watch } = useForm<consumoRacao>();
  const [loading, setLoading] = useState(false);
  const [loteOption, setLoteOption] = useState<Lote[]>([]);
  const [selectedLote, setSelectedLote] = useState<string>("");

  useEffect(() => {
    const fetchLotes = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/lote');
        setLoteOption(response.data);
      } catch (error: any) {
        toast.error('Erro ao buscar Lote');
      }
    };
    fetchLotes();
  }, []);

  useEffect(() => {
    if (consumoRacaoEdit) {
      setValue('tipo_racao', consumoRacaoEdit.tipo_racao);
      setValue('quantidade_kg', consumoRacaoEdit.quantidade_kg);
      setValue('valor_estimado', consumoRacaoEdit.valor_estimado);
      setValue('data_inicial', consumoRacaoEdit.data_inicial);
      setValue('data_final', consumoRacaoEdit.data_final);
    } else {
      setSelectedLote("");
      reset();
    }
  }, [consumoRacaoEdit, setValue, reset]);

  // Função para verificar a quantidade disponível ao selecionar um lote


  // Função para submeter o formulário
  const onSubmit = async (data: consumoRacao) => {
    setLoading(true);
    try {
      if (consumoRacaoEdit) {
        await axios.put(`http://127.0.0.1:8000/api/consumo_racao/${consumoRacaoEdit.id}`, data);
        toast.success('Consumo de ração atualizado com sucesso!');
        onConsumoRacaoCriada();
      } else {
        await axios.post('http://127.0.0.1:8000/api/cadconsumo_racao', data);
        toast.success('Consumo de ração cadastrado com sucesso!');
        onConsumoRacaoCriada(); // Atualiza a lista após cadastrar
        reset(); // Limpa o formulário
      }
    } catch (error) {
      console.error('Erro ao cadastrar consumo de ração:', error);
      toast.error('Erro ao cadastrar consumo de ração. Verifique os campos e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-3">
        <label htmlFor="tipo_racao" className="form-label">Tipo de Ração:</label>
        <input type="text" className="form-control" id="tipo_racao" {...register('tipo_racao', { required: true })} />
      </div>
      <div className="mb-3">
        <label htmlFor="quantidade_kg" className="form-label">Quantidade (Kg):</label>
        <input type="number" className="form-control" id="quantidade_kg" {...register('quantidade_kg', { required: true })} />
      </div>
      <div className="mb-3">
        <label htmlFor="valor_estimado" className="form-label">Valor Estimado:</label>
        <input type="number" className="form-control" id="valor_estimado" {...register('valor_estimado', { required: true })} />
      </div>
      <div className="mb-3">
        <label htmlFor="data_inicial" className="form-label">Data Inicial:</label>
        <input type="date" className="form-control" id="data_inicial" {...register('data_inicial', { required: true })} />
      </div>
      <div className="mb-3">
        <label htmlFor="data_final" className="form-label">Data Final:</label>
        <input type="date" className="form-control" id="data_final" {...register('data_final', { required: true })} />
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  );
};

// Componente para listar os consumos de ração
const ListaConsumoRacao = ({ consumosRacao, onConsumoRacaoEdit, onConsumoRacaoCriada }: { consumosRacao: consumoRacao[], onConsumoRacaoEdit: (consumoRacao: consumoRacao) => void, onConsumoRacaoCriada: () => void }) => {
  const [filteredConsumosRacao, setFilteredConsumosRacao] = useState<consumoRacao[]>(consumosRacao);
  const [showModal, setShowModal] = useState(false); // Controla a visibilidade do modal
  const [consumoRacaoToDelete, setConsumoRacaoToDelete] = useState<consumoRacao | null>(null); // Controla o consumo de ração a ser excluído

  useEffect(() => {
    setFilteredConsumosRacao(consumosRacao)
  }, [consumosRacao])

  const handleDeleteConfirmation = (consumoRacao: consumoRacao) => {
    setConsumoRacaoToDelete(consumoRacao);
    setShowModal(true); // Exibe o modal de confirmação
  };

  const handleDelete = async () => {
    if (consumoRacaoToDelete) {
      try {
        var response = await axios.delete(`http://127.0.0.1:8000/api/consumo_racao/${consumoRacaoToDelete.id}`);
        if (response.data.sucesso === true) {
          toast.success('Consumo de ração deletado com sucesso');
          onConsumoRacaoCriada();
        } else {
          toast.error('Erro ao deletar consumo de ração');
        }
      } catch (error) {
        toast.error('Erro ao deletar consumo de ração');
      } finally {
        setShowModal(false); // Fecha o modal após a ação
        setConsumoRacaoToDelete(null); // Limpa o consumo de ração a ser excluído
      }
    }
  };

  const filterConsumoRacao = (lote: string) => {
    if (lote !== '') {
      setFilteredConsumosRacao(consumosRacao.filter(d => d.lote.includes(lote)))
    } else {
      setFilteredConsumosRacao(consumosRacao)
    }
  }

  return (
    <div>
      <h2>Lista de Consumos de Ração:</h2>
      <ul>
        {filteredConsumosRacao.map((consumoRacao) => (
          <li key={consumoRacao.id} style={{ margin: '15px 0', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff' }}>
            <h3 style={{ margin: '0', color: '#007bff' }}>Tipo de Ração: {consumoRacao.tipo_racao}</h3> {/* Destacar o lote */}
            <strong>Quantidade (Kg):</strong> {consumoRacao.quantidade_kg}<br />
            <strong>Valor Estimado:</strong> {`R$ ${Number(consumoRacao.valor_estimado).toFixed(2).replace('.', ',')}`}<br />
            <strong>Data Inicial:</strong> {new Date(consumoRacao.data_inicial).toLocaleDateString('pt-BR')}<br />
            <strong>Data Final:</strong> {new Date(consumoRacao.data_final).toLocaleDateString('pt-BR')}<br />
            <div className="actions" style={{ marginTop: '10px' }}>
              <button className='btn btn-primary' style={{ marginRight: '10px', padding: '8px 12px', borderRadius: '4px', border: 'none', backgroundColor: '#007bff', color: '#fff', cursor: 'pointer' }} onClick={() => onConsumoRacaoEdit(consumoRacao)}>Editar</button>
              <button className='btn btn-danger' style={{ padding: '8px 12px', borderRadius: '4px', border: 'none', backgroundColor: '#dc3545', color: '#fff', cursor: 'pointer' }} onClick={() => handleDeleteConfirmation(consumoRacao)}>Excluir</button>
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
                <p>Você tem certeza que deseja excluir o consumo de ração <strong>{consumoRacaoToDelete?.lote}</strong>?</p>
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
  const [consumosRacao, setConsumosRacao] = useState<consumoRacao[]>([]);
  const [consumoRacaoEdit, setConsumoRacaoEdit] = useState<consumoRacao | null>(null);

  // Verificação de token (exemplo básico)
  useEffect(() => {
    carregarConsumosRacao();
  }, []);

  // Função para carregar os consumos de ração
  const carregarConsumosRacao = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/consumo_racao'); // URL da API a ser utilizada
      setConsumosRacao(response.data);
    } catch (error) {
      console.error('Erro ao carregar consumos de ração:', error);
    }
  };
  const handleConsumoRacaoCriada = () => {
    carregarConsumosRacao();
    setConsumoRacaoEdit(null); // Limpar o consumo de ração em edição após criar/editar
  };
  const handleConsumoRacaoEdit = (consumoRacao: consumoRacao) => {
    setConsumoRacaoEdit(consumoRacao);
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
                  <h3 className="card-title">Cadastro de Consumo de Ração</h3>
                  <CadastroConsumoRacaoForm onConsumoRacaoCriada={handleConsumoRacaoCriada} consumoRacaoEdit={consumoRacaoEdit} />
                </div>
              </div>

              {/* Componente de Lista de Consumos de Ração */}
              <div className="card mb-4">
                <div className="card-body">
                  <ListaConsumoRacao onConsumoRacaoEdit={handleConsumoRacaoEdit} onConsumoRacaoCriada={handleConsumoRacaoCriada} consumosRacao={consumosRacao} />
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
