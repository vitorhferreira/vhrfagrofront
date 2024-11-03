'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { LayoutDashboard } from '@/components/LayoutDashboard';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

// Interface para os dados do gasto
interface Gastovet {
  id?: number;
  motivo_gasto: string;
  qtd_cabecas: string;
  data_pagamento: string;
  valor: string;
  lote: string;
  pago: boolean; // Novo campo para status de pagamento
}

interface Lote {
  id: number;
  quantidade: number;
  peso: number;
  valor_individual: string;
  idade_media: string;
  data_compra: string;
  numero_lote: number;
}

// Função para formatar valor monetário (R$)
const formatarValorMonetario = (valor: string) => {
  valor = valor.replace(/\D/g, ''); // Remove caracteres não numéricos
  valor = (Number(valor) / 100).toFixed(2); // Divide por 100 e fixa em 2 casas decimais
  valor = valor.replace('.', ','); // Substitui ponto por vírgula
  valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Insere ponto a cada milhar
  return 'R$ ' + valor;
};

// Função para remover a máscara de valor antes de enviar para o backend
const removerMascaraValor = (valor: string) => {
  const valorNumerico = parseFloat(valor.replace(/\D/g, '')) / 100; // Divide por 100 após remover os caracteres não numéricos
  return valorNumerico.toFixed(2); // Retorna o valor em formato decimal com duas casas decimais
};

// Componente para o formulário de cadastro de gastovet
const CadastroGastovetForm = ({ ongastovetCriada, gastovetEdit }: { ongastovetCriada: () => void, gastovetEdit?: Gastovet }) => {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<Gastovet>();
  const [loading, setLoading] = useState(false);
  const [loteOption, setLoteOption] = useState<Lote[]>([]);
  const [selectedLote, setSelectedLote] = useState<string>('');
  const [quantidadeDisponivel, setQuantidadeDisponivel] = useState<number | null>(null);
  const [valor, setValor] = useState(''); // Estado para o valor com máscara
  const qtdCabecas = watch('qtd_cabecas');

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
    if (gastovetEdit) {
      setValue('motivo_gasto', gastovetEdit.motivo_gasto);
      setValue('qtd_cabecas', gastovetEdit.qtd_cabecas);
      setValue('data_pagamento', gastovetEdit.data_pagamento);
      setValor(formatarValorMonetario(gastovetEdit.valor)); // Formatar o valor existente
      setSelectedLote(gastovetEdit.lote);
      setValue('lote', gastovetEdit.lote);
    } else {
      setSelectedLote('');
      reset();
    }
  }, [gastovetEdit, setValue, reset]);

  const handleLoteChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const loteSelecionado = event.target.value;
    setSelectedLote(loteSelecionado);
    setValue('lote', loteSelecionado);

    const lote = loteOption.find((l) => l.numero_lote === loteSelecionado);
    if (lote) {
      setQuantidadeDisponivel(lote.quantidade);
    } else {
      setQuantidadeDisponivel(null);
    }
  };

  const isQuantidadeValida = () => {
    if (quantidadeDisponivel !== null && qtdCabecas !== undefined) {
      return Number(qtdCabecas) > 0 && Number(qtdCabecas) <= quantidadeDisponivel;
    }
    return true;
  };

  const onSubmit = async (data: Gastovet) => {
    if (!isQuantidadeValida()) {
      toast.error(`A quantidade de cabeças não pode exceder a quantidade disponível no lote (${quantidadeDisponivel}).`);
      return;
    }

    const valorSemMascara = removerMascaraValor(valor); // Remover a máscara do valor antes de enviar

    setLoading(true);
    try {
      const payload = {
        ...data,
        valor: valorSemMascara, // Enviar valor sem máscara
      };

      if (gastovetEdit) {
        await axios.put(`http://127.0.0.1:8000/api/gastovets/${gastovetEdit.id}`, payload);
        toast.success('Gasto atualizado com sucesso!');
        ongastovetCriada();
      } else {
        await axios.post('http://127.0.0.1:8000/api/cadgastovets', payload);
        toast.success('Gasto cadastrado com sucesso!');
        ongastovetCriada();
        reset();
        setValor(''); // Limpar o campo de valor após o reset
      }
    } catch (error) {
      console.error('Erro ao cadastrar Gasto:', error);
      toast.error('Erro ao cadastrar Gasto. Verifique os campos e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-3">
        <label htmlFor="motivo_gasto" className="form-label">Motivo do Gasto:</label>
        <select className="form-select" id="motivo_gasto" {...register('motivo_gasto', { required: true })}>
          <option value="" disabled>Selecione uma opção</option>
          <option value="Compra de gado">Frete</option>
          <option value="Vacina">Vacina</option>
          <option value="Gasto Veterinario">Gasto Veterinário</option>
          <option value="Produtos Veterinarios">Produtos Veterinários</option>
          <option value="Pasto">Pasto</option>
          <option value="Ração">Ração</option>
          <option value="Outros gastos">Outros gastos</option>
        </select>
        {errors.motivo_gasto && <div className="text-danger">O motivo do gasto é obrigatório.</div>}
      </div>
      <div className="mb-3">
        <label htmlFor="qtd_cabecas" className="form-label">Quantidade de Cabeças:</label>
        <input
          type="number"
          className="form-control"
          id="qtd_cabecas"
          {...register('qtd_cabecas', { 
            required: "Quantidade de cabeças é obrigatória", 
            min: { value: 1, message: "A quantidade deve ser maior que 0." }
          })}
          style={{ borderColor: errors.qtd_cabecas || !isQuantidadeValida() ? 'red' : undefined }}
        />
        {errors.qtd_cabecas && (
          <div className="text-danger">
            {errors.qtd_cabecas.message}
          </div>
        )}
        {!isQuantidadeValida() && (
          <div className="text-danger">
            Quantidade excede a quantidade disponível no lote ({quantidadeDisponivel} cabeças disponíveis).
          </div>
        )}
      </div>
      <div className="mb-3">
        <label htmlFor="data_pagamento" className="form-label">Data do Pagamento:</label>
        <input type="date" className="form-control" id="data_pagamento" {...register('data_pagamento', { required: true })} />
        {errors.data_pagamento && <div className="text-danger">Data do pagamento é obrigatória.</div>}
      </div>
      <div className="mb-3">
        <label htmlFor="valor" className="form-label">Valor:</label>
        <input 
          type="text" 
          className="form-control" 
          id="valor" 
          value={valor} // Valor com máscara
          onChange={(e) => setValor(formatarValorMonetario(e.target.value))} // Aplica a máscara enquanto digita
          required
        />
        {removerMascaraValor(valor) === '' && <p className="text-danger">O valor deve ser maior que zero.</p>}
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


// Componente para listar os gastos
const ListaGastovets = ({ gastovets, ongastovetEdit, ongastovetCriada }: { gastovets: Gastovet[], ongastovetEdit: (gastovet: Gastovet) => void, ongastovetCriada: () => void }) => {
  const [filteredgastovets, setFilteredgastovets] = useState<Gastovet[]>(gastovets);
  const [showModal, setShowModal] = useState(false);
  const [modalAtrasados, setModalAtrasados] = useState(false);
  const [gastovetToDelete, setGastovetToDelete] = useState<Gastovet | null>(null);
  const [statusFiltro, setStatusFiltro] = useState<string>(''); // Novo estado para o filtro de status de pagamento

  useEffect(() => {
    // Aplica o filtro com base no status selecionado
    if (statusFiltro === 'pago') {
      setFilteredgastovets(gastovets.filter((gastovet) => gastovet.pago));
    } else if (statusFiltro === 'naoPago') {
      setFilteredgastovets(gastovets.filter((gastovet) => !gastovet.pago));
    } else {
      setFilteredgastovets(gastovets); // Sem filtro, exibe todos
    }

    // Verificar se há pagamentos atrasados
    const temAtrasados = gastovets.some((g) => new Date(g.data_pagamento) < new Date() && !g.pago);
    if (temAtrasados) {
      setModalAtrasados(true);
    }
  }, [statusFiltro, gastovets]);

  const handleDeleteConfirmation = (gastovet: Gastovet) => {
    setGastovetToDelete(gastovet);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (gastovetToDelete) {
      try {
        const response = await axios.delete(`http://127.0.0.1:8000/api/gastovets/${gastovetToDelete.id}`);
        if (response.data.sucesso === true) {
          toast.success('Gasto deletado com sucesso');
          ongastovetCriada();
        } else {
          toast.error('Erro ao deletar Gasto');
        }
      } catch (error) {
        toast.error('Erro ao deletar Gasto');
      } finally {
        setShowModal(false);
        setGastovetToDelete(null);
      }
    }
  };

  const togglePagamento = async (gastovet: Gastovet) => {
    try {
      const url = gastovet.pago
        ? `http://127.0.0.1:8000/api/gastovets/${gastovet.id}/naopago`
        : `http://127.0.0.1:8000/api/gastovets/${gastovet.id}/pago`;
  
      const response = await axios.put(url);
      if (response.data.sucesso) {
        toast.success('Status de pagamento atualizado com sucesso');
        ongastovetCriada();
      } else {
        toast.error('Erro ao atualizar status de pagamento');
      }
    } catch (error) {
      toast.error('Erro ao atualizar status de pagamento');
    }
  };

  const filterGastovetByLote = (lote: string) => {
    if (lote !== '') {
      setFilteredgastovets(gastovets.filter((d) => d.lote.includes(lote)));
    } else {
      setFilteredgastovets(gastovets);
    }
  };

  return (
    <div>
      <h2>Lista de Despesas:</h2>

      {/* Filtro de status de pagamento */}
      <select
        className="form-select mb-3"
        value={statusFiltro}
        onChange={(e) => setStatusFiltro(e.target.value)}
      >
        <option value="">Todos</option>
        <option value="pago">Pago</option>
        <option value="naoPago">Não Pago</option>
      </select>

      <input
        placeholder="Filtrar por Lote"
        className="form-control mb-3"
        onChange={(e) => filterGastovetByLote(e.target.value)}
      />

      <ul>
        {filteredgastovets.map((gastovet) => {
          const dataPagamento = new Date(gastovet.data_pagamento);
          const atrasado = dataPagamento < new Date() && !gastovet.pago;
          return (
            <li
              key={gastovet.id}
              style={{
                margin: '15px 0',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: gastovet.pago ? '#d4edda' : atrasado ? '#f8d7da' : '#fff', // Verde claro se pago, vermelho claro se atrasado
                animation: atrasado ? 'blink 1s infinite' : 'none', // Piscar se atrasado
              }}
            >
              <h3 style={{ margin: '0', color: '#007bff' }}>Lote: {gastovet.lote}</h3>
              <strong>Motivo do Gasto:</strong> {gastovet.motivo_gasto}<br />
              <strong>Quantidade de Cabeças:</strong> {gastovet.qtd_cabecas}<br />
              <strong>Data do Pagamento:</strong> {dataPagamento.toLocaleDateString('pt-BR')}<br />
              <strong>Valor:</strong> {`R$ ${Number(gastovet.valor).toFixed(2).replace('.', ',')}`}<br />
              <strong>Status de Pagamento:</strong> {gastovet.pago ? 'Pago' : 'Não Pago'}<br />
              <div className="actions" style={{ marginTop: '10px' }}>
                <button className="btn btn-primary" style={{ marginRight: '10px' }} onClick={() => ongastovetEdit(gastovet)}>Editar</button>
                <button className="btn btn-danger" style={{ marginRight: '10px' }} onClick={() => handleDeleteConfirmation(gastovet)}>Excluir</button>
                <button className="btn btn-secondary" onClick={() => togglePagamento(gastovet)}>
                  {gastovet.pago ? 'Marcar como Não Pago' : 'Marcar como Pago'}
                </button>
              </div>
            </li>
          );
        })}
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
                <p>Você tem certeza que deseja excluir o gasto com o motivo <strong>{gastovetToDelete?.motivo_gasto}</strong>?</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="button" className="btn btn-danger" onClick={handleDelete}>Excluir</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Pagamentos Atrasados */}
      {modalAtrasados && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }} tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Atenção!</h5>
                <button type="button" className="btn-close" onClick={() => setModalAtrasados(false)} />
              </div>
              <div className="modal-body">
                <p>Você tem pagamentos atrasados. Por favor, verifique os detalhes dos gastos.</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalAtrasados(false)}>Fechar</button>
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
  const [gastovets, setgastovets] = useState<Gastovet[]>([]);
  const [gastovetEdit, setgastovetEdit] = useState<Gastovet | null>(null);

  useEffect(() => {
    carregargastovets();
  }, []);

  const carregargastovets = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/gastovets'); // URL da API a ser utilizada
      setgastovets(response.data);
    } catch (error) {
      console.error('Erro ao carregar Gastos:', error);
    }
  };

  const handlegastovetCriada = () => {
    carregargastovets();
    setgastovetEdit(null); // Limpar a gasto em edição após criar/editar
  };

  const handlegastovetEdit = (gastovet: Gastovet) => {
    setgastovetEdit(gastovet);
  };

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
                  <h3 className="card-title">Cadastro de Despesas</h3>
                  <CadastroGastovetForm ongastovetCriada={handlegastovetCriada} gastovetEdit={gastovetEdit} />
                </div>
              </div>

              {/* Componente de Lista de gastos */}
              <div className="card mb-4">
                <div className="card-body">
                  <ListaGastovets ongastovetEdit={handlegastovetEdit} ongastovetCriada={handlegastovetCriada} gastovets={gastovets} />
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
