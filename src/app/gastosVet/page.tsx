'use client'

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { LayoutDashboard } from '@/components/LayoutDashboard';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

// Interface para os dados do gasto
interface gastovet {
  id?: number;
  motivo_gasto: string;
  qtd_cabecas: string;
  data_pagamento: string;
  valor: string;
  lote: string;
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

// Componente para o formulário de cadastro de gastovet
const CadastrogastovetForm = ({ ongastovetCriada, gastovetEdit }: { ongastovetCriada: () => void, gastovetEdit?: gastovet }) => {
  const { register, handleSubmit, reset, setValue, watch } = useForm<gastovet>();
  const [loading, setLoading] = useState(false);
  const [loteOption, setLoteOption] = useState<Lote[]>([]);
  const [selectedLote, setSelectedLote] = useState<string>("");
  const [quantidadeDisponivel, setQuantidadeDisponivel] = useState<number | null>(null);
  const qtdCabecas = watch('qtd_cabecas'); // Obter o valor da quantidade de cabeças

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
      setValue('valor', gastovetEdit.valor);
      setSelectedLote(gastovetEdit.lote);
      setValue('lote', gastovetEdit.lote); 
    } else {
      setSelectedLote("");
      reset();
    }
  }, [gastovetEdit, setValue, reset]);

  // Função para verificar a quantidade disponível ao selecionar um lote
  const handleLoteChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const loteSelecionado = event.target.value;
    setSelectedLote(loteSelecionado);
    setValue('lote', loteSelecionado);

    const lote = loteOption.find(l => l.numero_lote === loteSelecionado);
    if (lote) {
      setQuantidadeDisponivel(lote.quantidade);
    } else {
      setQuantidadeDisponivel(null);
    }
  };

  // Função para verificar se a quantidade de cabeças está disponível no lote selecionado
  const isQuantidadeValida = () => {
    if (quantidadeDisponivel !== null && qtdCabecas !== undefined) {
      return Number(qtdCabecas) <= quantidadeDisponivel;
    }
    return true; // Se não houver lote selecionado, considerar válido
  };

  // Função para submeter o formulário
  const onSubmit = async (data: gastovet) => {
    if (!isQuantidadeValida()) {
      toast.error(`A quantidade de cabeças não pode exceder a quantidade disponível no lote (${quantidadeDisponivel}).`);
      return;
    }

    setLoading(true);
    try {
      if (gastovetEdit) {
        await axios.put(`http://127.0.0.1:8000/api/gastovets/${gastovetEdit.id}`, data);
        toast.success('Gasto atualizado com sucesso!');
        ongastovetCriada();
      } else {
        await axios.post('http://127.0.0.1:8000/api/cadgastovets', data);
        toast.success('Gasto cadastrado com sucesso!');
        ongastovetCriada(); // Atualiza a lista de gastos após cadastrar
        reset(); // Limpa o formulário
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
          <option value="" disabled selected>Selecione uma opção</option>
          <option value="Compra de gado">Compra de gado</option>
          <option value="Vacina">Vacina</option>
          <option value="Gasto Veterinario">Gasto Veterinário</option>
          <option value="Produtos Veterinarios">Produtos Veterinários</option>
          <option value="Pasto">Pasto</option>
          <option value="Ração">Ração</option>
          <option value="Outros gastos">Outros gastos</option>
        </select>
      </div>
      <div className="mb-3">
        <label htmlFor="qtd_cabecas" className="form-label">Quantidade de Cabeças:</label>
        <input
          type="number"
          className="form-control"
          id="qtd_cabecas"
          {...register('qtd_cabecas', { required: true })}
          style={{ borderColor: !isQuantidadeValida() ? 'red' : undefined }}
        />
        {!isQuantidadeValida() && (
          <div className="text-danger">
            Quantidade excede a quantidade disponível no lote ({quantidadeDisponivel} cabeças disponíveis).
          </div>
        )}
      </div>
      <div className="mb-3">
        <label htmlFor="data_pagamento" className="form-label">Data do Pagamento:</label>
        <input type="date" className="form-control" id="data_pagamento" {...register('data_pagamento', { required: true })} />
      </div>
      <div className="mb-3">
        <label htmlFor="valor" className="form-label">Valor:</label>
        <input type="number" className="form-control" id="valor" {...register('valor', { required: true })} />
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

// Componente para listar as gastovets
const Listagastovets = ({ gastovets, ongastovetEdit, ongastovetCriada }: { gastovets: gastovet[], ongastovetEdit: (gastovet: gastovet) => void, ongastovetCriada: () => void }) => {
  const [filteredgastovets, setFilteredgastovets] = useState<gastovet[]>(gastovets);
  const [showModal, setShowModal] = useState(false); // Controla a visibilidade do modal
  const [gastovetToDelete, setGastovetToDelete] = useState<gastovet | null>(null); // Controla a despesa a ser excluída

  useEffect(() => {
    setFilteredgastovets(gastovets)
  }, [gastovets])

  const handleDeleteConfirmation = (gastovet: gastovet) => {
    setGastovetToDelete(gastovet);
    setShowModal(true); // Exibe o modal de confirmação
  };

  const handleDelete = async () => {
    if (gastovetToDelete) {
      try {
        var response = await axios.delete(`http://127.0.0.1:8000/api/gastovets/${gastovetToDelete.id}`);
        if (response.data.sucesso = true) {
          toast.success('Gasto deletado com sucesso');
          ongastovetCriada();
        } else {
          toast.error('Erro ao deletar Gasto');
        }
      } catch (error) {
        toast.error('Erro ao deletar Gasto');
      } finally {
        setShowModal(false); // Fecha o modal após a ação
        setGastovetToDelete(null); // Limpa a despesa a ser excluída
      }
    }
  };

  const filtergastovet = (lote: string) => {
    if (lote !== '') {
      setFilteredgastovets(gastovets.filter(d => d.lote.includes(lote)))
    } else {
      setFilteredgastovets(gastovets)
    }
  }

  return (
    <div>
      <h2>Lista de Gastos:</h2>
      <input placeholder="Filtrar por Lote" className="form-control mb-3" onChange={(e) => filtergastovet(e.target.value)} />
      <ul>
        {filteredgastovets.map((gastovet) => (
          <li key={gastovet.id} style={{ margin: '15px 0', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff' }}>
            <h3 style={{ margin: '0', color: '#007bff' }}>Lote: {gastovet.lote}</h3> {/* Destacar o lote */}
            <strong>Motivo do Gasto:</strong> {gastovet.motivo_gasto}<br />
            <strong>Quantidade de Cabeças:</strong> {gastovet.qtd_cabecas}<br />
            <strong>Data do Pagamento:</strong> {new Date(gastovet.data_pagamento).toLocaleDateString('pt-BR')}<br />
            <strong>Valor:</strong> {`R$ ${Number(gastovet.valor).toFixed(2).replace('.', ',')}`}<br />
            <div className="actions" style={{ marginTop: '10px' }}>
              <button className='btn btn-primary' style={{ marginRight: '10px', padding: '8px 12px', borderRadius: '4px', border: 'none', backgroundColor: '#007bff', color: '#fff', cursor: 'pointer' }} onClick={() => ongastovetEdit(gastovet)}>Editar</button>
              <button className='btn btn-danger' style={{ padding: '8px 12px', borderRadius: '4px', border: 'none', backgroundColor: '#dc3545', color: '#fff', cursor: 'pointer' }} onClick={() => handleDeleteConfirmation(gastovet)}>Excluir</button>
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
    </div>
  );
};

// Componente principal Dashboard
const Dashboard = () => {
  const router = useRouter();
  const [gastovets, setgastovets] = useState<gastovet[]>([]);
  const [gastovetEdit, setgastovetEdit] = useState<gastovet | null>(null);

  // Verificação de token (exemplo básico)
  useEffect(() => {
    carregargastovets();
  }, []);

  // Função para carregar as gastovets
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
  const handlegastovetEdit = (gastovet: gastovet) => {
    setgastovetEdit(gastovet);
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
                  <h3 className="card-title">Cadastro de Despesas</h3>
                  <CadastrogastovetForm ongastovetCriada={handlegastovetCriada} gastovetEdit={gastovetEdit} />
                </div>
              </div>

              {/* Componente de Lista de gastovets */}
              <div className="card mb-4">
                <div className="card-body">
                  <Listagastovets ongastovetEdit={handlegastovetEdit} ongastovetCriada={handlegastovetCriada} gastovets={gastovets} />
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
