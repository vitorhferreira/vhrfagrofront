'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { LayoutDashboard } from '@/components/LayoutDashboard';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

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
  recebido: boolean;
  documento?: string;
}

interface Lote {
  id: number;
  numero_lote: string;
  quantidade: number;
}

// Função de formatação do CPF/CNPJ
const formatarCpfCnpj = (valor: string) => {
  valor = valor.replace(/\D/g, ''); // Remove tudo que não for dígito
  if (valor.length <= 11) {
    valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
    valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
    valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  } else {
    valor = valor.replace(/^(\d{2})(\d)/, '$1.$2');
    valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    valor = valor.replace(/\.(\d{3})(\d)/, '.$1/$2');
    valor = valor.replace(/(\d{4})(\d)/, '$1-$2');
  }
  return valor;
};

// Função de formatação de valor em reais
const formatarValor = (valor: string) => {
  valor = valor.replace(/\D/g, '');
  valor = (Number(valor) / 100).toFixed(2) + '';
  valor = valor.replace('.', ',');
  valor = valor.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
  return `R$ ${valor}`;
};

// Componente para o formulário de cadastro de venda
const CadastroVendaForm = ({ onVendaCriada, vendaEdit }: { onVendaCriada: () => void, vendaEdit?: Venda }) => {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<Venda>();
  const [loading, setLoading] = useState(false);
  const [loteOption, setLoteOption] = useState<Lote[]>([]);
  const [quantidadeDisponivel, setQuantidadeDisponivel] = useState<number | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false); // Controle do modal de erro
  const [errorMessage, setErrorMessage] = useState(''); // Mensagem de erro
  const quantidadeVendida = watch('quantidade_vendida');
  const pesoMedioVenda = watch('peso_medio_venda');
  const prazoPagamento = watch('prazo_pagamento');
  const cpfCnpjComprador = watch('cpf_cnpj_comprador');
  const valorUnitario = watch('valor_unitario');

  // Carregar os lotes ao montar o componente
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
      setValue('documento', vendaEdit.documento);
    } else {
      reset();
    }
  }, [vendaEdit, setValue, reset]);

  const handleLoteChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const loteSelecionado = event.target.value;
    const lote = loteOption.find(l => l.numero_lote === loteSelecionado);
    if (lote) {
      setQuantidadeDisponivel(lote.quantidade);
    } else {
      setQuantidadeDisponivel(null);
    }
    setValue('numero_lote', loteSelecionado);
  };

  const isQuantidadeValida = () => {
    if (quantidadeDisponivel !== null && quantidadeVendida !== undefined) {
      return Number(quantidadeVendida) > 0 && Number(quantidadeVendida) <= quantidadeDisponivel;
    }
    return true;
  };

  const isValorValido = () => {
    return pesoMedioVenda > 0 && prazoPagamento > 0;
  };

  const onSubmit = async (data: Venda) => {
    if (!isQuantidadeValida()) {
      toast.error(`A quantidade vendida não pode exceder a quantidade disponível no lote (${quantidadeDisponivel}).`);
      return;
    }

    if (!isValorValido()) {
      toast.error(`O peso ou prazo de pagamento devem ser maiores que zero.`);
      return;
    }

    setLoading(true);
    try {
      const lote_id = loteOption.find((lote) => lote.numero_lote === data.numero_lote)?.id;
      if (!lote_id) {
        toast.error('Lote não encontrado');
        return;
      }

      const formData = new FormData();
      formData.append('lote_id', lote_id.toString());
      formData.append('numero_lote', data.numero_lote);
      formData.append('peso_medio_venda', data.peso_medio_venda);
      formData.append('comprador', data.comprador);
      formData.append('cpf_cnpj_comprador', data.cpf_cnpj_comprador);
      formData.append('valor_unitario', valorUnitario.replace('R$ ', '').replace(/\./g, '').replace(',', '.'));
      formData.append('quantidade_vendida', data.quantidade_vendida);
      formData.append('prazo_pagamento', data.prazo_pagamento);
      formData.append('data_compra', data.data_compra);

      const documento = watch('documento');
      if (documento && documento.length > 0) {
        formData.append('documento', documento[0]);
      }

      if (vendaEdit) {
        await axios.post(`http://127.0.0.1:8000/api/vendas/${vendaEdit.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Venda atualizada com sucesso!');
      } else {
        await axios.post('http://127.0.0.1:8000/api/vendas', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Venda cadastrada com sucesso!');
      }

      onVendaCriada();
      reset();
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        const backendError = error.response.data.error;
        if (backendError === 'CPF/CNPJ do comprador inválido') {
          setErrorMessage(backendError);
          setShowErrorModal(true);
        }
      } else {
        toast.error('Erro ao cadastrar venda. Verifique os campos e tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <label htmlFor="numero_lote" className="form-label">Número do Lote:</label>
          <select
            className="form-control"
            id="numero_lote"
            {...register('numero_lote', { required: true })}
            onChange={handleLoteChange}
          >
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
          <input 
            type="number" 
            className="form-control" 
            id="peso_medio_venda" 
            {...register('peso_medio_venda', { required: true, min: 1 })} 
          />
          {pesoMedioVenda <= 0 && (
            <div className="text-danger">Peso deve ser maior que 0.</div>
          )}
        </div>
        <div className="mb-3">
          <label htmlFor="comprador" className="form-label">Comprador:</label>
          <input type="text" className="form-control" id="comprador" {...register('comprador', { required: true })} />
        </div>
        <div className="mb-3">
          <label htmlFor="cpf_cnpj_comprador" className="form-label">CPF/CNPJ do Comprador:</label>
          <input 
            type="text" 
            className="form-control" 
            id="cpf_cnpj_comprador" 
            {...register('cpf_cnpj_comprador', { required: true })} 
            value={cpfCnpjComprador ? formatarCpfCnpj(cpfCnpjComprador) : ''} 
            onChange={(e) => setValue('cpf_cnpj_comprador', formatarCpfCnpj(e.target.value))}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="valor_unitario" className="form-label">Valor Unitário (R$):</label>
          <input 
            type="text" 
            className="form-control" 
            id="valor_unitario" 
            {...register('valor_unitario', { required: true })} 
            value={valorUnitario ? formatarValor(valorUnitario) : ''} 
            onChange={(e) => setValue('valor_unitario', formatarValor(e.target.value))}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="quantidade_vendida" className="form-label">Quantidade Vendida:</label>
          <input
            type="number"
            className="form-control"
            id="quantidade_vendida"
            {...register('quantidade_vendida', { required: true, min: 1 })}
            style={{ borderColor: !isQuantidadeValida() ? 'red' : undefined }}
          />
          {!isQuantidadeValida() && (
            <div className="text-danger">
              Quantidade excede a quantidade disponível no lote ({quantidadeDisponivel} cabeças disponíveis).
            </div>
          )}
        </div>
        <div className="mb-3">
          <label htmlFor="prazo_pagamento" className="form-label">Prazo de Pagamento (dias):</label>
          <input 
            type="number" 
            className="form-control" 
            id="prazo_pagamento" 
            {...register('prazo_pagamento', { required: true, min: 1 })} 
          />
          {prazoPagamento <= 0 && (
            <div className="text-danger">Prazo de pagamento deve ser maior que 0.</div>
          )}
        </div>
        <div className="mb-3">
          <label htmlFor="data_compra" className="form-label">Data da Venda:</label>
          <input type="date" className="form-control" id="data_compra" {...register('data_compra', { required: true })} />
        </div>
        <div className="mb-3">
          <label htmlFor="documento" className="form-label">Documento (Opcional):</label>
          <input type="file" className="form-control" id="documento" {...register('documento')} />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading || !isQuantidadeValida() || !isValorValido()}>
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
      </form>

      {/* Modal de erro */}
      {showErrorModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Erro</h5>
                <button type="button" className="btn-close" onClick={() => setShowErrorModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>{errorMessage}</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowErrorModal(false)}>Fechar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


// Função para verificar se a venda está em atraso
const verificarAtraso = (dataCompra: string, prazoPagamento: string) => {
  const dataCompraDate = new Date(dataCompra);
  const prazoDias = Number(prazoPagamento);
  const dataLimite = new Date(dataCompraDate);
  dataLimite.setDate(dataLimite.getDate() + prazoDias);

  return dataLimite < new Date(); // Retorna true se a data limite for menor que a data atual (atraso)
};

// Componente para listar as vendas
const ListaVendas = ({ vendas, onVendaEdit, onVendaCriada }: { vendas: Venda[], onVendaEdit: (venda: Venda) => void, onVendaCriada: () => void }) => {
  const [showModal, setShowModal] = useState(false);
  const [vendaToDelete, setVendaToDelete] = useState<Venda | null>(null);

  const handleDeleteConfirmation = (venda: Venda) => {
    setVendaToDelete(venda);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (vendaToDelete) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/vendas/${vendaToDelete.id}`);
        toast.success('Venda excluída com sucesso.');
        onVendaCriada();
      } catch (error) {
        toast.error('Erro ao excluir venda.');
      } finally {
        setShowModal(false);
      }
    }
  };

  const toggleRecebido = async (venda: Venda) => {
    try {
      const url = venda.recebido
        ? `http://127.0.0.1:8000/api/vendas/${venda.id}/naorecebido`
        : `http://127.0.0.1:8000/api/vendas/${venda.id}/recebido`;

      const response = await axios.put(url);
      if (response.data.sucesso) {
        toast.success('Status de recebimento atualizado com sucesso');
        onVendaCriada();
      } else {
        toast.error('Erro ao atualizar status de recebimento');
      }
    } catch (error) {
      toast.error('Erro ao atualizar status de recebimento');
    }
  };

  return (
    <div>
      <h2>Lista de Vendas:</h2>
      <ul>
        {vendas.map((venda) => {
          const emAtraso = verificarAtraso(venda.data_compra, venda.prazo_pagamento) && !venda.recebido;

          return (
            <li
              key={venda.id}
              style={{
                margin: '15px 0',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: venda.recebido ? '#d4edda' : emAtraso ? '#f8d7da' : '#fff', // Verde se recebido, vermelho se em atraso
              }}
            >
              <h3 style={{ margin: '0', color: '#007bff' }}>Lote: {venda.numero_lote}</h3>
              <strong>Peso Médio de Venda (Kg):</strong> {venda.peso_medio_venda}<br />
              <strong>Comprador:</strong> {venda.comprador}<br />
              <strong>CPF/CNPJ:</strong> {venda.cpf_cnpj_comprador}<br />
              <strong>Valor Unitário:</strong> {`R$ ${Number(venda.valor_unitario).toFixed(2).replace('.', ',')}`}<br />
              <strong>Quantidade Vendida:</strong> {venda.quantidade_vendida}<br />
              <strong>Prazo de Pagamento:</strong> {venda.prazo_pagamento} dias<br />
              <strong>Data da Venda:</strong> {new Date(venda.data_compra).toLocaleDateString('pt-BR')}<br />
              {venda.documento && (
                <div>
                  <strong>Documento:</strong> <a href={`http://127.0.0.1:8000/storage/${venda.documento}`} download>Baixar Documento</a><br />
                </div>
              )}
              <strong>Status de Recebimento:</strong> {venda.recebido ? 'Recebido' : emAtraso ? 'Em Atraso' : 'Não Recebido'}<br />
              <div className="actions" style={{ marginTop: '10px' }}>
                <button className='btn btn-danger' style={{ marginRight: '10px' }} onClick={() => handleDeleteConfirmation(venda)}>Excluir</button>
                <button className='btn btn-secondary' onClick={() => toggleRecebido(venda)}>
                  {venda.recebido ? 'Marcar como Não Recebido' : 'Marcar como Recebido'}
                </button>
              </div>
            </li>
          );
        })}
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
    setVendaEdit(null);
  };

  const handleVendaEdit = (venda: Venda) => {
    setVendaEdit(venda);
  };

  return (
    <LayoutDashboard token=''>
      <div className="container-fluid">
        <div className="row">
          <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
            <div className="my-4">
              <h2 className="mb-4">Cadastro de Vendas</h2>

              <div className="card mb-4">
                <div className="card-body">
                  <CadastroVendaForm onVendaCriada={handleVendaCriada} vendaEdit={vendaEdit} />
                </div>
              </div>

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
