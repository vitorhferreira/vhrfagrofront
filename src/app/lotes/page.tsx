'use client'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { LayoutDashboard } from '@/components/LayoutDashboard';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

// Interface para os dados do lote
interface Lote {
  id: number;
  quantidade: number;
  peso: number;
  valor_individual: string;
  idade_media: string;
  data_compra: string;
  numero_lote: number;
  documento?: string;
  pago?: boolean;
  data_pagamento?: string; // Novo campo para data de pagamento
}

// Função para formatar valor monetário (R$)
const formatarValorMonetario = (valor: string) => {
  valor = valor.replace(/\D/g, '');
  valor = (Number(valor) / 100).toFixed(2) + '';
  valor = valor.replace('.', ',');
  valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return 'R$ ' + valor;
};

// Função para remover a máscara de valor antes de enviar para o backend
const removerMascaraValor = (valor: string) => {
  const valorNumerico = parseFloat(valor.replace(/\D/g, '')) / 100;
  return valorNumerico.toFixed(2);
};

// Função para alternar o status de pagamento
const togglePagamento = async (lote: Lote, onloteCriada: () => void) => {
  try {
    const url = lote.pago
      ? `http://127.0.0.1:8000/api/lotes/${lote.id}/naopago`
      : `http://127.0.0.1:8000/api/lotes/${lote.id}/pago`;

    const response = await axios.put(url);
    if (response.data.sucesso) {
      toast.success('Status de pagamento atualizado com sucesso');
      onloteCriada();
    } else {
      toast.error('Erro ao atualizar status de pagamento');
    }
  } catch (error) {
    toast.error('Erro ao atualizar status de pagamento');
  }
};

const CadastroLoteForm = ({ onloteCriado, loteEdit }: { onloteCriado: () => void, loteEdit?: Lote }) => {
  const { register, handleSubmit, reset, setValue, watch } = useForm<Lote>();
  const [loading, setLoading] = useState(false);
  const [lotesExistentes, setLotesExistentes] = useState<Lote[]>([]);
  const [valorIndividual, setValorIndividual] = useState('');
  const [dataPagamento, setDataPagamento] = useState('');

  useEffect(() => {
    const fetchLotes = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/lote');
        setLotesExistentes(response.data);
      } catch (error) {
        toast.error('Erro ao carregar lotes existentes.');
      }
    };
    fetchLotes();
  }, []);

  useEffect(() => {
    if (loteEdit) {
      setValue('quantidade', loteEdit.quantidade);
      setValue('peso', loteEdit.peso);
      setValorIndividual(formatarValorMonetario(loteEdit.valor_individual));
      setValue('idade_media', loteEdit.idade_media);
      setValue('data_compra', loteEdit.data_compra);
      setValue('numero_lote', loteEdit.numero_lote);
      setDataPagamento(loteEdit.data_pagamento || '');
    } else {
      reset();
    }
  }, [loteEdit, setValue, reset]);

  const verificarNumeroLoteDuplicado = (numero_lote: number) => {
    return lotesExistentes.some((lote) => lote.numero_lote === numero_lote && (!loteEdit || lote.id !== loteEdit.id));
  };

  const onSubmit = async (data: Lote) => {
    if (data.quantidade <= 0 || data.peso <= 0 || removerMascaraValor(valorIndividual) === '' || data.idade_media <= 0) {
      toast.error('Todos os valores numéricos devem ser maiores que zero.');
      return;
    }

    if (verificarNumeroLoteDuplicado(data.numero_lote)) {
      toast.error('O número do lote já existe. Escolha outro número.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('quantidade', data.quantidade.toString());
      formData.append('peso', data.peso.toString());
      formData.append('valor_individual', removerMascaraValor(valorIndividual));
      formData.append('idade_media', data.idade_media);
      formData.append('data_compra', data.data_compra);
      formData.append('numero_lote', parseInt(data.numero_lote.toString(), 10).toString());
      formData.append('data_pagamento', dataPagamento);

      const documento = watch('documento');
      if (documento && documento.length > 0) {
        formData.append('documento', documento[0]);
      }

      if (loteEdit) {
        await axios.post(`http://127.0.0.1:8000/api/lote/${loteEdit.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Lote atualizado com sucesso!');
        onloteCriado();
      } else {
        await axios.post('http://127.0.0.1:8000/api/cadlote', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Lote cadastrado com sucesso!');
        onloteCriado();
        reset();
        setValorIndividual('');
      }
    } catch (error) {
      console.error('Erro ao cadastrar lote:', error);
      toast.error('Erro ao cadastrar lote. Verifique os campos e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-3">
        <label htmlFor="quantidade" className="form-label">Quantidade</label>
        <input type="number" className="form-control" id="quantidade" {...register('quantidade', { required: true, min: 1 })} />
        {watch('quantidade') <= 0 && <p className="text-danger">A quantidade deve ser maior que zero.</p>}
      </div>
      <div className="mb-3">
        <label htmlFor="peso" className="form-label">Peso Médio (Kg)</label>
        <input type="number" className="form-control" id="peso" {...register('peso', { required: true, min: 1 })} />
        {watch('peso') <= 0 && <p className="text-danger">O peso deve ser maior que zero.</p>}
      </div>
      <div className="mb-3">
        <label htmlFor="valor_individual" className="form-label">Valor Individual</label>
        <input
          type="text"
          className="form-control"
          id="valor_individual"
          value={valorIndividual}
          onChange={(e) => setValorIndividual(formatarValorMonetario(e.target.value))}
          required
        />
        {removerMascaraValor(valorIndividual) === '' && <p className="text-danger">O valor deve ser maior que zero.</p>}
      </div>
      <div className="mb-3">
        <label htmlFor="idade_media" className="form-label">Idade Média (Meses)</label>
        <input type="number" className="form-control" id="idade_media" {...register('idade_media', { required: true, min: 1 })} />
        {watch('idade_media') <= 0 && <p className="text-danger">A idade média deve ser maior que zero.</p>}
      </div>
      <div className="mb-3">
        <label htmlFor="data_compra" className="form-label">Data da Compra</label>
        <input type="date" className="form-control" id="data_compra" {...register('data_compra', { required: true })} />
      </div>
      <div className="mb-3">
        <label htmlFor="data_pagamento" className="form-label">Data de Pagamento</label>
        <input
          type="date"
          className="form-control"
          id="data_pagamento"
          value={dataPagamento}
          onChange={(e) => setDataPagamento(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label htmlFor="numero_lote" className="form-label">Número do Lote</label>
        <input type="number" className="form-control" id="numero_lote" {...register('numero_lote', { required: true, min: 1 })} />
        {verificarNumeroLoteDuplicado(watch('numero_lote')) && <p className="text-danger">Número do lote já existe.</p>}
      </div>
      <div className="mb-3">
        <label htmlFor="documento" className="form-label">Documento (Opcional)</label>
        <input type="file" className="form-control" id="documento" {...register('documento')} />
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  ); 
};

// Componente para listar os lotes
const Listalotes = ({ lotes, onloteEdit, onloteCriada }: { lotes: Lote[], onloteEdit: (lote: Lote) => void, onloteCriada: () => void }) => {
  const [filteredLotes, setFilteredLotes] = useState<Lote[]>(lotes);
  const [showModal, setShowModal] = useState(false);
  const [loteToDelete, setLoteToDelete] = useState<Lote | null>(null);

  useEffect(() => {
    setFilteredLotes(lotes);
  }, [lotes]);

  const handleDeleteConfirmation = (lote: Lote) => {
    setLoteToDelete(lote);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (loteToDelete) {
      try {
        const response = await axios.delete(`http://127.0.0.1:8000/api/lote/${loteToDelete.id}`);
        if (response.data.sucesso === true) {
          toast.success('Lote deletado com sucesso');
          onloteCriada();
        } else {
          toast.error('Erro ao deletar lote');
        }
      } catch (error) {
        toast.error('Erro ao deletar lote');
      } finally {
        setShowModal(false);
        setLoteToDelete(null);
      }
    }
  };

  const filterLotesByNumero = (numero: string) => {
    if (numero.trim() === '') {
      setFilteredLotes(lotes);
    } else {
      setFilteredLotes(lotes.filter((lote) => lote.numero_lote.toString().includes(numero)));
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
      <h2 style={{ textAlign: 'center' }}>Lista de Lotes</h2>
      <input
        type="text"
        placeholder="Filtrar por Número do Lote"
        className="form-control mb-3"
        onChange={(e) => filterLotesByNumero(e.target.value)}
      />
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {filteredLotes.map((lote) => (
          <li
            key={lote.id}
            style={{
              margin: '15px 0',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              backgroundColor: lote.pago ? '#d4edda' : '#fff',
            }}
          >
            <h3 style={{ margin: '0', color: '#007bff' }}>Número do Lote: {lote.numero_lote}</h3>
            <strong>Quantidade:</strong> {lote.quantidade}
            <br />
            <strong>Peso:</strong> {`${lote.peso} Kg`}
            <br />
            <strong>Valor Individual:</strong> {`R$ ${Number(lote.valor_individual).toFixed(2).replace('.', ',')}`}
            <br />
            <strong>Idade Média:</strong> {lote.idade_media}
            <br />
            <strong>Data da Compra:</strong> {new Date(lote.data_compra).toLocaleDateString('pt-BR')}
            <br />
            <strong>Data de Pagamento:</strong> {lote.data_pagamento ? new Date(lote.data_pagamento).toLocaleDateString('pt-BR') : 'Não definido'}
            <br />
            <strong>Status de Pagamento:</strong> {lote.pago ? 'Pago' : 'Não Pago'}
            <br />
            <div className="actions" style={{ marginTop: '10px' }}>
              <button className="btn btn-primary" style={{ marginRight: '10px' }} onClick={() => onloteEdit(lote)}>
                Editar
              </button>
              <button className="btn btn-danger" style={{ marginRight: '10px' }} onClick={() => handleDeleteConfirmation(lote)}>
                Excluir
              </button>
              <button className="btn btn-secondary" onClick={() => togglePagamento(lote, onloteCriada)}>
                {lote.pago ? 'Marcar como Não Pago' : 'Marcar como Pago'}
              </button>
            </div>
          </li>
        ))}
      </ul>
      {showModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }} tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmar Exclusão</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <div className="modal-body">
                <p>Você tem certeza que deseja excluir o lote <strong>{loteToDelete?.numero_lote}</strong>?</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-danger" onClick={handleDelete}>
                  Excluir
                </button>
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
  const [lotes, setlotes] = useState<Lote[]>([]);
  const [loteEdit, setloteEdit] = useState<Lote | null>(null);

  useEffect(() => {
    carregarlotes();
  }, []);

  const carregarlotes = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/lote');
      setlotes(response.data);
    } catch (error) {
      console.error('Erro ao carregar lotes:', error);
    }
  };

  const handleloteCriada = () => {
    carregarlotes();
    setloteEdit(null);
  };

  const handleloteEdit = (lote: Lote) => {
    setloteEdit(lote);
  };

  return (
    <LayoutDashboard token={''}>
      <div className="container-fluid">
        <div className="row">
          <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
            <div className="my-4">
              <h2 className="mb-4"></h2>

              {/* Componente de Formulário de Cadastro */}
              <div className="card mb-4">
                <div className="card-body">
                  <h3 className="card-title">Cadastro de Lotes</h3>
                  <CadastroLoteForm onloteCriado={handleloteCriada} loteEdit={loteEdit} />
                </div>
              </div>

              {/* Componente de Lista de Lotes */}
              <div className="card mb-4">
                <div className="card-body">
                  <Listalotes onloteEdit={handleloteEdit} onloteCriada={handleloteCriada} lotes={lotes} />
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
