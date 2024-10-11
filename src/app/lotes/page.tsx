'use client'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { LayoutDashboard } from '@/components/LayoutDashboard';
import { verificaTokenExpirado } from '@/services/token';
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

}

// Componente para o formulário de cadastro de lotes
const CadastroLoteForm = ({ onloteCriado, loteEdit }: { onloteCriado: () => void, loteEdit?: Lote }) => {
  const { register, handleSubmit, reset, setValue } = useForm<Lote>();
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (loteEdit) {
      setValue('quantidade', loteEdit.quantidade);
      setValue('peso', loteEdit.peso);
      setValue('valor_individual', loteEdit.valor_individual);
      setValue('idade_media', loteEdit.idade_media);
      setValue('data_compra', loteEdit.data_compra);
      setValue('numero_lote', loteEdit.numero_lote);

    } else {
      reset();
    }
  }, [loteEdit, setValue, reset]);



  const onSubmit = async (data: Lote) => {
    setLoading(true);
    try {
      if (loteEdit) {
        const response = await axios.put(`http://127.0.0.1:8000/api/lote/${loteEdit.id}`, data); // URL da API para atualização

        if (parseInt(response.data.sucesso) == 99) {
          toast.warning('Lote invalido');
          return
        }

        toast.success('lote atualizado com sucesso!');
        onloteCriado();
      } else {
        const response = await axios.post('http://127.0.0.1:8000/api/cadlote', data); // URL da API a ser utilizada

        if (parseInt(response.data.sucesso) == 99) {
          toast.warning('Lote invalido');
          return
        }

        toast.success('Lote cadastrado com sucesso!');
        onloteCriado(); // Atualiza a lista de lotes após cadastrar
        reset(); // Limpa o formulário
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
        <input type="number" className="form-control" id="quantidade" {...register('quantidade', { required: true })} />
      </div>
      <div className="mb-3">
        <label htmlFor="peso" className="form-label">Peso Médio (Kg)</label>
        <input type="number" className="form-control" id="peso" {...register('peso', { required: true })} />
      </div>
      <div className="mb-3">
        <label htmlFor="valor_individual" className="form-label">Valor individual</label>
        <input type="number" className="form-control" id="valor_individual" {...register('valor_individual', { required: true })} />
      </div>
      <div className="mb-3">
        <label htmlFor="idade_media" className="form-label">Idade Média (Em Meses)</label>
        <input type="number" className="form-control" id="idade_media" {...register('idade_media', { required: true })} />
      </div>
      <div className="mb-3">
        <label htmlFor="data_compra" className="form-label">Data da Compra</label>
        <input type="date" className="form-control" id="data_compra" {...register('data_compra', { required: true })} />
      </div>
      <div className="mb-3">
        <label htmlFor="numero_lote" className="form-label">Numero do Lote</label>
        <input type="number" className="form-control" id="numero_lote" {...register('numero_lote', { required: true })} />
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  );
};

// Componente para listar os médicos
const Listalotes = ({ lotes, onloteEdit, onloteCriada }: { lotes: Lote[], onloteEdit: (lote: Lote) => void, onloteCriada: () => void }) => {
  const [showModal, setShowModal] = useState(false); // Controla a visibilidade do modal
  const [loteToDelete, setLoteToDelete] = useState<Lote | null>(null); // Lote a ser excluído
  const handleDeleteConfirmation = (lote: Lote) => {
    setLoteToDelete(lote);
    setShowModal(true); // Exibe o modal de confirmação
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
        setShowModal(false); // Fecha o modal após a ação
        setLoteToDelete(null); // Limpa o lote a ser excluído
      }
    }
  };

  return (
        <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
          <h2 style={{ textAlign: 'center' }}>Lista de Lotes</h2>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {lotes.map((lote) => (
              <li key={lote.id} style={{ margin: '15px 0', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff' }}>
                <h3 style={{ margin: '0', color: '#007bff' }}>Número do Lote: {lote.numero_lote}</h3> {/* Destacar o número do lote */}
                <strong>Quantidade:</strong> {lote.quantidade}<br />
                <strong>Peso:</strong> {`${lote.peso} Kg`}<br />
                <strong>Valor Individual:</strong> {`R$ ${Number(lote.valor_individual).toFixed(2).replace('.', ',')}`}<br />
                <strong>Idade Média:</strong> {lote.idade_media}<br />
                <strong>Data da Compra:</strong> {new Date(lote.data_compra).toLocaleDateString('pt-BR')}<br />
                <div className="actions" style={{ marginTop: '10px' }}>
                  <button className='btn btn-primary' style={{ marginRight: '10px', padding: '8px 12px', borderRadius: '4px', border: 'none', backgroundColor: '#007bff', color: '#fff', cursor: 'pointer' }} onClick={() => onloteEdit(lote)}>Editar</button>
                  <button className='btn btn-danger' style={{ padding: '8px 12px', borderRadius: '4px', border: 'none', backgroundColor: '#dc3545', color: '#fff', cursor: 'pointer' }} onClick={() => handleDeleteConfirmation(lote)}>Excluir</button>
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
  const [lotes, setlotes] = useState<Lote[]>([]);
  const [loteEdit, setloteEdit] = useState<Lote | null>(null);
  // const token = 'example_token'; // Substitua pelo seu método de obtenção de token

  // Verificação de token e carregamento inicial de médicos
  // useEffect(() => {
  //   if (!token || verificaTokenExpirado(token)) {
  //     router.push('/login');
  //   } else {
  //     carregarlotes(); // Carregar médicos ao montar o componente
  //   }
  // }, [token]);
  useEffect(() => {


    carregarlotes(); // Carregar lotes ao montar o componente

  }, []);


  const carregarlotes = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/lote'); // URL da API a ser utilizada
      setlotes(response.data);
    } catch (error) {
      console.error('Erro ao carregar lotes:', error);
    }
  };

  // if (!token || verificaTokenExpirado(token)) {
  //   return null; // Redireciona para login se não autenticado
  // }
  const handleloteCriada = () => {
    carregarlotes()
    setloteEdit(null); // Limpar a vacina em edição após criar/editar
  };
  const handleloteEdit = (lote: Lote) => {
    setloteEdit(lote);
  };

  return (
    // <LayoutDashboard token={token}>
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
