// src/app/consumo_racao/page.tsx
'use client'

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { LayoutDashboard } from '@/components/LayoutDashboard';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

// Interface para os dados do consumo de ração
interface ConsumoRacao {
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

// Função para formatar o valor estimado como moeda
const formatarValorEstimado = (valor: string) => {
  const numero = valor.replace(/\D/g, ""); // Remove caracteres não numéricos
  const numeroFormatado = (Number(numero) / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  return numeroFormatado;
};

// Componente para o formulário de cadastro de consumo de ração
const CadastroConsumoRacaoForm = ({ onConsumoRacaoCriada, consumoRacaoEdit }: { onConsumoRacaoCriada: () => void, consumoRacaoEdit?: ConsumoRacao }) => {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ConsumoRacao>();
  const [loading, setLoading] = useState(false);
  const [loteOption, setLoteOption] = useState<Lote[]>([]);
  const [selectedLote, setSelectedLote] = useState<string>("");
  const [valorEstimado, setValorEstimado] = useState<string>("");

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
      setValorEstimado(formatarValorEstimado(consumoRacaoEdit.valor_estimado)); // Define valor formatado
      setValue('data_inicial', consumoRacaoEdit.data_inicial);
      setValue('data_final', consumoRacaoEdit.data_final);
    } else {
      setSelectedLote("");
      reset();
    }
  }, [consumoRacaoEdit, setValue, reset]);

  const handleValorEstimadoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    const valorFormatado = formatarValorEstimado(valor);
    setValorEstimado(valorFormatado);
    setValue("valor_estimado", valorFormatado); // Atualiza valor formatado no formulário
  };

  const limparFormatacaoValor = (valor: string) => {
    return valor.replace(/[^\d,]/g, "").replace(",", "."); // Remove 'R$' e separadores de milhar
  };

  // Função para submeter o formulário
  const onSubmit = async (data: ConsumoRacao) => {
    setLoading(true);
    try {
      const dadosLimpos = {
        ...data,
        valor_estimado: limparFormatacaoValor(valorEstimado),
      };

      if (consumoRacaoEdit) {
        await axios.put(`http://127.0.0.1:8000/api/consumo_racao/${consumoRacaoEdit.id}`, dadosLimpos);
        toast.success('Consumo de ração atualizado com sucesso!');
        onConsumoRacaoCriada();
      } else {
        await axios.post('http://127.0.0.1:8000/api/cadconsumo_racao', dadosLimpos);
        toast.success('Consumo de ração cadastrado com sucesso!');
        onConsumoRacaoCriada();
        reset();
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
        <input 
          type="text" 
          className="form-control" 
          id="tipo_racao" 
          {...register('tipo_racao', { required: 'O tipo de ração é obrigatório' })}
        />
        {errors.tipo_racao && <div className="text-danger">{errors.tipo_racao.message}</div>}
      </div>
      <div className="mb-3">
        <label htmlFor="quantidade_kg" className="form-label">Quantidade (Kg):</label>
        <input 
          type="number" 
          className="form-control" 
          id="quantidade_kg" 
          {...register('quantidade_kg', { 
            required: 'A quantidade é obrigatória',
            min: { value: 1, message: 'A quantidade deve ser maior que 0' }
          })} 
        />
        {errors.quantidade_kg && <div className="text-danger">{errors.quantidade_kg.message}</div>}
      </div>
      <div className="mb-3">
        <label htmlFor="valor_estimado" className="form-label">Valor Estimado:</label>
        <input 
          type="text" 
          className="form-control" 
          id="valor_estimado" 
          value={valorEstimado} 
          onChange={handleValorEstimadoChange} 
        />
        {errors.valor_estimado && <div className="text-danger">{errors.valor_estimado.message}</div>}
      </div>
      <div className="mb-3">
        <label htmlFor="data_inicial" className="form-label">Data Inicial:</label>
        <input 
          type="date" 
          className="form-control" 
          id="data_inicial" 
          {...register('data_inicial', { required: 'A data inicial é obrigatória' })}
        />
        {errors.data_inicial && <div className="text-danger">{errors.data_inicial.message}</div>}
      </div>
      <div className="mb-3">
        <label htmlFor="data_final" className="form-label">Data Final:</label>
        <input 
          type="date" 
          className="form-control" 
          id="data_final" 
          {...register('data_final', { required: 'A data final é obrigatória' })}
        />
        {errors.data_final && <div className="text-danger">{errors.data_final.message}</div>}
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  );
};

// Componente para listar os consumos de ração
const ListaConsumoRacao = ({ consumosRacao, onConsumoRacaoEdit, onConsumoRacaoCriada }: { consumosRacao: ConsumoRacao[], onConsumoRacaoEdit: (consumoRacao: ConsumoRacao) => void, onConsumoRacaoCriada: () => void }) => {
  const [filteredConsumosRacao, setFilteredConsumosRacao] = useState<ConsumoRacao[]>(consumosRacao);
  const [showModal, setShowModal] = useState(false); // Controla a visibilidade do modal
  const [consumoRacaoToDelete, setConsumoRacaoToDelete] = useState<ConsumoRacao | null>(null); // Controla o consumo de ração a ser excluído

  useEffect(() => {
    setFilteredConsumosRacao(consumosRacao);
  }, [consumosRacao]);

  const handleDeleteConfirmation = (consumoRacao: ConsumoRacao) => {
    setConsumoRacaoToDelete(consumoRacao);
    setShowModal(true); // Exibe o modal de confirmação
  };

  const handleDelete = async () => {
    if (consumoRacaoToDelete) {
      try {
        const response = await axios.delete(`http://127.0.0.1:8000/api/consumo_racao/${consumoRacaoToDelete.id}`);
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
                <p>Você tem certeza que deseja excluir o consumo de ração <strong>{consumoRacaoToDelete?.tipo_racao}</strong>?</p>
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
  const [consumosRacao, setConsumosRacao] = useState<ConsumoRacao[]>([]);
  const [consumoRacaoEdit, setConsumoRacaoEdit] = useState<ConsumoRacao | null>(null);

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
  const handleConsumoRacaoEdit = (consumoRacao: ConsumoRacao) => {
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

export default Dashboard;