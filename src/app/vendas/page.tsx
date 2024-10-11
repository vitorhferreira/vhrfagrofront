'use client'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { LayoutDashboard } from '@/components/LayoutDashboard';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

// Interface para os dados da venda
interface Venda {
  id?: number;
  lote_id?: number;
  numero_lote: string;
  peso_medio_venda: string;
  comprador: string;
  cpf_cnpj_comprador: string;
  valor_unitario: string;
  quantidade_vendida: string;
  prazo_pagamento: string;
  data_compra: string;
}

interface Lote {
  id: number;
  numero_lote: string;
  quantidade: number;
}

// Componente para o formulário de cadastro de venda
const CadastroVendaForm = ({ onVendaCriada, vendaEdit }: { onVendaCriada: () => void, vendaEdit?: Venda }) => {
  const { register, handleSubmit, reset, setValue, watch } = useForm<Venda>();
  const [loading, setLoading] = useState(false);
  const [loteOption, setLoteOption] = useState<Lote[]>([]);
  const [selectedLote, setSelectedLote] = useState<string>('');
  const [quantidadeDisponivel, setQuantidadeDisponivel] = useState<number | null>(null);
  const quantidadeVendida = watch('quantidade_vendida'); // Obter o valor da quantidade vendida

  useEffect(() => {
    const fetchLotes = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/lote');
        setLoteOption(response.data);
      } catch (error: any) {
        toast.error('Erro ao buscar Lote');
      }
    };
    fetchLotes();
  }, []);

  useEffect(() => {
    if (vendaEdit) {
      setValue('numero_lote', vendaEdit.numero_lote);
      setValue('peso_medio_venda', vendaEdit.peso_medio_venda);
      setValue('comprador', vendaEdit.comprador);
      setValue('cpf_cnpj_comprador', vendaEdit.cpf_cnpj_comprador);
      setValue('valor_unitario', vendaEdit.valor_unitario);
      setValue('quantidade_vendida', vendaEdit.quantidade_vendida);
      setValue('prazo_pagamento', vendaEdit.prazo_pagamento);
      setValue('data_compra', vendaEdit.data_compra);
      handleLoteChange({ target: { value: vendaEdit.numero_lote } } as any); // Atualizar o lote selecionado
    } else {
      reset();
    }
  }, [vendaEdit, setValue, reset]);

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

  // Função para verificar se a quantidade vendida está disponível no lote selecionado
  const isQuantidadeValida = () => {
    if (quantidadeDisponivel !== null && quantidadeVendida !== undefined) {
      return Number(quantidadeVendida) <= quantidadeDisponivel;
    }
    return true; // Se não houver lote selecionado, considerar válido
  };

  // Função para submeter o formulário
  const onSubmit = async (data: Venda) => {
    if (!isQuantidadeValida()) {
      toast.error(`A quantidade vendida não pode exceder a quantidade disponível no lote (${quantidadeDisponivel}).`);
      return;
    }

    setLoading(true);
    try {
      const lote_id = loteOption.find((lote) => lote.numero_lote === data.numero_lote)?.id;
      if (!lote_id) {
        toast.error('Lote não encontrado');
        return;
      }

      const vendaData = {
        ...data,
        lote_id,
      };

      if (vendaEdit) {
        await axios.put(`http://127.0.0.1:8000/api/vendas/${vendaEdit.id}`, vendaData);
        toast.success('Venda atualizada com sucesso!');
        onVendaCriada();
      } else {
        await axios.post('http://127.0.0.1:8000/api/vendas', vendaData);
        toast.success('Venda cadastrada com sucesso!');
        onVendaCriada(); // Atualiza a lista após cadastrar
        reset(); // Limpa o formulário
      }
    } catch (error) {
      console.error('Erro ao cadastrar venda:', error);
      toast.error('Erro ao cadastrar venda. Verifique os campos e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-3">
        <label htmlFor="numero_lote" className="form-label">Número do Lote:</label>
        <select className="form-control" id="numero_lote" {...register('numero_lote', { required: true })} onChange={handleLoteChange}>
          <option value="">Selecione o lote</option>
          {loteOption.map((lote) => (
            <option key={lote.id} value={lote.numero_lote}>
              {`${lote.numero_lote} - ${lote.quantidade} cabeças disponíveis`}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-3">
        <label htmlFor="peso_medio_venda" className="form-label">Peso Médio de Venda (Kg):</label>
        <input type="number" className="form-control" id="peso_medio_venda" {...register('peso_medio_venda', { required: true })} />
      </div>
      <div className="mb-3">
        <label htmlFor="comprador" className="form-label">Comprador:</label>
        <input type="text" className="form-control" id="comprador" {...register('comprador', { required: true })} />
      </div>
      <div className="mb-3">
        <label htmlFor="cpf_cnpj_comprador" className="form-label">CPF/CNPJ do Comprador:</label>
        <input type="text" className="form-control" id="cpf_cnpj_comprador" {...register('cpf_cnpj_comprador', { required: true })} />
      </div>
      <div className="mb-3">
        <label htmlFor="valor_unitario" className="form-label">Valor Unitário (R$):</label>
        <input type="number" className="form-control" id="valor_unitario" {...register('valor_unitario', { required: true })} />
      </div>
      <div className="mb-3">
        <label htmlFor="quantidade_vendida" className="form-label">Quantidade Vendida:</label>
        <input
          type="number"
          className="form-control"
          id="quantidade_vendida"
          {...register('quantidade_vendida', { required: true })}
          style={{ borderColor: !isQuantidadeValida() ? 'red' : undefined }}
        />
        {!isQuantidadeValida() && (
          <div className="text-danger">
            Quantidade excede a quantidade disponível no lote ({quantidadeDisponivel} cabeças disponíveis).
          </div>
        )}
      </div>
      <div className="mb-3">
        <label htmlFor="prazo_pagamento" className="form-label">Prazo de Pagamento:</label>
        <input type="text" className="form-control" id="prazo_pagamento" {...register('prazo_pagamento')} />
      </div>
      <div className="mb-3">
        <label htmlFor="data_compra" className="form-label">Data da Compra:</label>
        <input type="date" className="form-control" id="data_compra" {...register('data_compra', { required: true })} />
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading || !isQuantidadeValida()}>
        {loading ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  );
};

// Componente para listar as vendas
const ListaVendas = ({ vendas, onVendaEdit, onVendaCriada }: { vendas: Venda[], onVendaEdit: (venda: Venda) => void, onVendaCriada: () => void }) => {
  const [showModal, setShowModal] = useState(false);
  const [vendaToDelete, setVendaToDelete] = useState<Venda | null>(null);

  // Função para abrir o modal de confirmação
  const handleDeleteConfirmation = (venda: Venda) => {
    setVendaToDelete(venda);
    setShowModal(true);
  };

  // Função para excluir a venda
  const handleDelete = async () => {
    if (vendaToDelete) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/vendas/${vendaToDelete.id}`);
        toast.success('Venda excluída com sucesso');
        onVendaCriada(); // Atualiza a lista após excluir
      } catch (error) {
        toast.error('Erro ao excluir venda');
      } finally {
        setShowModal(false); // Fecha o modal
      }
    }
  };

  return (
    <div>
      <h2>Lista de Vendas:</h2>
      <ul>
        {vendas.map((venda) => (
          <li key={venda.id} style={{ margin: '15px 0', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff' }}>
            <h3 style={{ margin: '0', color: '#007bff' }}>Lote: {venda.numero_lote}</h3>
            <strong>Peso Médio de Venda (Kg):</strong> {venda.peso_medio_venda}<br />
            <strong>Comprador:</strong> {venda.comprador}<br />
            <strong>CPF/CNPJ:</strong> {venda.cpf_cnpj_comprador}<br />
            <strong>Valor Unitário:</strong> {`R$ ${Number(venda.valor_unitario).toFixed(2).replace('.', ',')}`}<br />
            <strong>Quantidade Vendida:</strong> {venda.quantidade_vendida}<br />
            <strong>Prazo de Pagamento:</strong> {venda.prazo_pagamento}<br />
            <strong>Data da Compra:</strong> {new Date(venda.data_compra).toLocaleDateString('pt-BR')}<br />
            <div className="actions" style={{ marginTop: '10px' }}>
              <button className='btn btn-primary' style={{ marginRight: '10px' }} onClick={() => onVendaEdit(venda)}>Editar</button>
              <button className='btn btn-danger' onClick={() => handleDeleteConfirmation(venda)}>Excluir</button>
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
                <p>Você tem certeza que deseja excluir a venda do lote <strong>{vendaToDelete?.numero_lote}</strong>?</p>
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
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [vendaEdit, setVendaEdit] = useState<Venda | null>(null);

  // Carregar vendas
  useEffect(() => {
    carregarVendas();
  }, []);

  const carregarVendas = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/vendas');
      setVendas(response.data);
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
    }
  };

  const handleVendaCriada = () => {
    carregarVendas();
    setVendaEdit(null); // Limpar o estado de edição após criar/editar
  };

  const handleVendaEdit = (venda: Venda) => {
    setVendaEdit(venda);
  };

  // Retorno do componente Dashboard
  return (
    <LayoutDashboard token=''>
      <div className="container-fluid">
        <div className="row">
          <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
            <div className="my-4">
              <h2 className="mb-4">Cadastro de Vendas</h2>

              {/* Componente de Formulário de Cadastro */}
              <div className="card mb-4">
                <div className="card-body">
                  <CadastroVendaForm onVendaCriada={handleVendaCriada} vendaEdit={vendaEdit} />
                </div>
              </div>

              {/* Componente de Lista de Vendas */}
              <div className="card mb-4">
                <div className="card-body">
                  <ListaVendas onVendaEdit={handleVendaEdit} onVendaCriada={handleVendaCriada} vendas={vendas} />
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
