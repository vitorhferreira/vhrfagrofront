'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { LayoutDashboard } from '@/components/LayoutDashboard';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Modal from 'react-modal';

// Registrar os componentes necessários para o gráfico
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Interface para os dados de um animal
interface Animal {
  id?: number;
  numero_identificacao: string;
  id_lote?: number;
  numero_lote: string;
  peso: string;
  data: string;
  anotacoes?: string;
}

// Interface para os dados de um lote
interface Lote {
  id: number;
  numero_lote: string;
  quantidade: number;
}

// Componente para o cadastro de animais
const CadastroAnimalForm = ({ onAnimalCriado, closeModal, animais }: { onAnimalCriado: () => void, closeModal?: () => void, animais: Animal[] }) => {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<Animal>();
  const [loading, setLoading] = useState(false);
  const [loteOption, setLoteOption] = useState<Lote[]>([]);
  const [quantidadeDisponivel, setQuantidadeDisponivel] = useState<number | null>(null);
  const [idLote, setIdLote] = useState<number | null>(null);
  const [identificacaoExistente, setIdentificacaoExistente] = useState(false);

  // Carregar lotes
  useEffect(() => {
    const fetchLotes = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/lote');
        setLoteOption(response.data);
      } catch (error) {
        toast.error('Erro ao buscar lotes');
      }
    };
    fetchLotes();
  }, []);

  const handleLoteChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const loteSelecionado = event.target.value;
    setValue('numero_lote', loteSelecionado);

    const lote = loteOption.find(l => l.numero_lote === loteSelecionado);
    if (lote) {
      setQuantidadeDisponivel(lote.quantidade);
      setIdLote(lote.id); // Captura o id_lote correspondente
    } else {
      setQuantidadeDisponivel(null);
      setIdLote(null);
    }
  };

  const handleNumeroIdentificacaoChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const identificacao = event.target.value;
    setValue('numero_identificacao', identificacao);
    setIdentificacaoExistente(false);

    // Verifica se o número de identificação já existe
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/animal/${identificacao}`);
      if (response.data) {
        setIdentificacaoExistente(true);
        // Preencher o número do lote automaticamente
        setValue('numero_lote', response.data.numero_lote); // Preenchendo o lote correspondente
        const lote = loteOption.find(l => l.numero_lote === response.data.numero_lote);
        if (lote) {
          setIdLote(lote.id);
          setQuantidadeDisponivel(lote.quantidade);
        }
      }
    } catch (error) {
      setIdentificacaoExistente(false);
    }
  };

  const onSubmit = async (data: Animal) => {
    if (quantidadeDisponivel !== null && quantidadeDisponivel <= 0) {
      toast.error('A quantidade no lote já está esgotada.');
      return;
    }

    if (!idLote) {
      toast.error('Lote não selecionado.');
      return;
    }

    if (identificacaoExistente) {
        toast.error('Este número de identificação já existe. Por favor, insira um número diferente.');
        return;
      }

    setLoading(true);
    try {
      const formData = {
        numero_identificacao: data.numero_identificacao,
        id_lote: idLote, // Enviando o id_lote
        numero_lote: data.numero_lote,
        peso: data.peso,
        data: data.data,
        anotacoes: data.anotacoes || '',
      };

      await axios.post('http://127.0.0.1:8000/api/animal', formData);
      toast.success('Animal cadastrado com sucesso!');

      onAnimalCriado();
      reset();
      if (closeModal) closeModal(); // Fecha o modal se estiver presente
    } catch (error) {
      toast.error('Erro ao cadastrar animal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-3">
        <label htmlFor="numero_identificacao" className="form-label">Novo Número de Identificação:</label>
        <input
          type="text"
          className="form-control"
          id="numero_identificacao"
          {...register('numero_identificacao', { required: true })}
          onChange={handleNumeroIdentificacaoChange} // Manter a verificação de existência
        />
        {identificacaoExistente && <p className="text-danger">Este número de identificação já existe.</p>}
      </div>
      <div className="mb-3">
        <label htmlFor="numero_lote" className="form-label">Número do Lote:</label>
        <select className="form-control" id="numero_lote" {...register('numero_lote', { required: true })} onChange={handleLoteChange}>
          <option value="">Selecione o lote</option>
          {loteOption.map((lote) => (
            <option key={lote.id} value={lote.numero_lote}>
              {`${lote.numero_lote} - ${lote.quantidade} disponíveis`}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-3">
        <label htmlFor="peso" className="form-label">Peso (Kg):</label>
        <input
          type="number"
          className="form-control"
          id="peso"
          {...register('peso', { required: true, min: 0 })}
        />
        {errors.peso && <p className="text-danger">O peso deve ser maior que 0.</p>}
      </div>
      <div className="mb-3">
        <label htmlFor="data" className="form-label">Data:</label>
        <input
          type="date"
          className="form-control"
          id="data"
          {...register('data', { required: true })}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="anotacoes" className="form-label">Anotações (Opcional):</label>
        <textarea className="form-control" id="anotacoes" {...register('anotacoes')} />
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Salvando...' : 'Cadastrar'}
      </button>
    </form>
  );
};

// Componente para a atualização de animais
const AtualizacaoAnimalForm = ({ onAnimalAtualizado, animalEdit, closeModal, animais }: { onAnimalAtualizado: () => void, animalEdit?: Animal, closeModal?: () => void, animais: Animal[] }) => {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<Animal>();
  const [loading, setLoading] = useState(false);
  const [loteOption, setLoteOption] = useState<Lote[]>([]);
  const [quantidadeDisponivel, setQuantidadeDisponivel] = useState<number | null>(null);
  const [idLote, setIdLote] = useState<number | null>(null);
  const [animaisLote, setAnimaisLote] = useState<string[]>([]);

  // Carregar lotes
  useEffect(() => {
    const fetchLotes = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/lote');
        setLoteOption(response.data);
      } catch (error) {
        toast.error('Erro ao buscar lotes');
      }
    };
    fetchLotes();
  }, []);

  useEffect(() => {
    if (animalEdit) {
      setValue('numero_identificacao', animalEdit.numero_identificacao);
      setValue('numero_lote', animalEdit.numero_lote);
      setValue('peso', animalEdit.peso);
      setValue('data', animalEdit.data);
      setValue('anotacoes', animalEdit.anotacoes || '');
      handleLoteChange({ target: { value: animalEdit.numero_lote } } as any);
    } else {
      reset();
    }
  }, [animalEdit, setValue, reset]);

  const handleLoteChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const loteSelecionado = event.target.value;
    setValue('numero_lote', loteSelecionado);

    const lote = loteOption.find(l => l.numero_lote === loteSelecionado);
    if (lote) {
      setQuantidadeDisponivel(lote.quantidade);
      setIdLote(lote.id);
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/animal`);
        
        // Filtra apenas os animais com o id_lote correspondente ao lote selecionado e remove duplicatas
        const animaisDoLote = response.data
          .filter((animal: Animal) => animal.id_lote === lote.id)
          .map((animal: Animal) => animal.numero_identificacao);
        
        // Remove duplicatas de números de identificação
        const animaisUnicos = Array.from(new Set(animaisDoLote));
        setAnimaisLote(animaisUnicos);
      } catch (error) {
        toast.error('Erro ao buscar animais do lote');
      }
    } else {
      setQuantidadeDisponivel(null);
      setIdLote(null);
      setAnimaisLote([]);
    }
  };

  const onSubmit = async (data: Animal) => {
    if (quantidadeDisponivel !== null && quantidadeDisponivel <= 0) {
      toast.error('A quantidade no lote já está esgotada.');
      return;
    }

    if (!idLote) {
      toast.error('Lote não selecionado.');
      return;
    }

    setLoading(true);
    try {
      const formData = {
        numero_identificacao: data.numero_identificacao,
        id_lote: idLote, // Enviando o id_lote
        numero_lote: data.numero_lote,
        peso: data.peso,
        data: data.data,
        anotacoes: data.anotacoes || '',
      };

      await axios.post(`http://127.0.0.1:8000/api/animal`, formData);
      toast.success('Animal atualizado com sucesso!');

      onAnimalAtualizado();
      reset();
      if (closeModal) closeModal(); // Fecha o modal se estiver presente
    } catch (error) {
      toast.error('Erro ao atualizar animal.');
    } finally {
      setLoading(false);
    }
  };

  return (
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
              {`${lote.numero_lote} - ${lote.quantidade} disponíveis`}
            </option>
          ))}
        </select>
      </div>
      {animaisLote.length > 0 && (
        <div className="mb-3">
          <label htmlFor="numero_identificacao" className="form-label">Número de Identificação:</label>
          <select
            className="form-control"
            id="numero_identificacao"
            {...register('numero_identificacao', { required: true })}
          >
            <option value="">Selecione o animal</option>
            {animaisLote.map((numero_identificacao) => (
              <option key={numero_identificacao} value={numero_identificacao}>
                {numero_identificacao}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="mb-3">
        <label htmlFor="peso" className="form-label">Peso (Kg):</label>
        <input
          type="number"
          className="form-control"
          id="peso"
          {...register('peso', { required: true, min: 0 })}
        />
        {errors.peso && <p className="text-danger">O peso deve ser maior que 0.</p>}
      </div>
      <div className="mb-3">
        <label htmlFor="data" className="form-label">Data:</label>
        <input
          type="date"
          className="form-control"
          id="data"
          {...register('data', { required: true })}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="anotacoes" className="form-label">Anotações (Opcional):</label>
        <textarea className="form-control" id="anotacoes" {...register('anotacoes')} />
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Salvando...' : 'Atualizar'}
      </button>
    </form>
  );
};

// Função para obter o histórico de peso de um animal
const getHistoricoPeso = async (numero_identificacao: string) => {
  const response = await axios.get(`http://127.0.0.1:8000/api/animal/historico/${numero_identificacao}`);
  return response.data;
};

// Componente do gráfico de histórico de peso com botão de fechar
const GraficoHistorico = ({ historico, anotacoes, onClose }: { historico: any[], anotacoes: string, onClose: () => void }) => {
  const data = {
    labels: historico.map(h => new Date(h.data).toLocaleDateString('pt-BR')),
    datasets: [
      {
        label: 'Peso (Kg)',
        data: historico.map(h => h.peso),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div style={{ width: '80%', margin: '0 auto', position: 'relative', paddingBottom: '20px' }}>
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          backgroundColor: 'red',
          color: 'white',
          border: 'none',
          padding: '5px 10px',
          cursor: 'pointer',
        }}
      >
        Fechar
      </button>
      <Line data={data} />
    </div>
  );
};
// Componente principal da página de cadastro e listagem de animais
const DashboardAnimais = () => {
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [animalEdit, setAnimalEdit] = useState<Animal | null>(null);
  const [filtroIdentificacao, setFiltroIdentificacao] = useState<string>('');
  const [filtroLote, setFiltroLote] = useState<string>('');
  const [historicoPeso, setHistoricoPeso] = useState<any[]>([]);
  const [mostrarGrafico, setMostrarGrafico] = useState(false);
  const [animalAnotacoes, setAnimalAnotacoes] = useState<string>('');
  const [modalAberto, setModalAberto] = useState(false);
  const [modalCadastroAberto, setModalCadastroAberto] = useState(false);
  
  // Estados para o modal de confirmação de exclusão
  const [modalConfirmacaoAberto, setModalConfirmacaoAberto] = useState(false);
  const [animalParaExcluir, setAnimalParaExcluir] = useState<Animal | null>(null);

  useEffect(() => {
    carregarAnimais();
  }, []);

  const carregarAnimais = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/animal');
      setAnimais(response.data);
    } catch (error) {
      toast.error('Erro ao carregar animais.');
    }
  };

  const handleAnimalCriado = () => {
    carregarAnimais();
    setAnimalEdit(null);
  };

  const handleAnimalEdit = (animal: Animal) => {
    setAnimalEdit(animal);
  };

  const handleFiltrar = async () => {
    try {
      const historico = await getHistoricoPeso(filtroIdentificacao);
      if (historico.length === 0) {
        setModalAberto(true); // Exibir modal se o animal não existir
        return; // Para evitar que continue
      } else {
        setHistoricoPeso(historico);
        setAnimalAnotacoes(historico[historico.length - 1]?.anotacoes || ''); // Anotações do último registro
        setMostrarGrafico(true); // Exibe o gráfico após o filtro
      }
    } catch (error) {
      setModalAberto(true); // Exibir modal se o animal não existir
    }
  };

  const handleFiltrarLote = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/animal/`);
      setAnimais(response.data);
      if (response.data.length === 0) {
        toast.info('Nenhum animal encontrado para o lote.'); // Mensagem quando não houver animais
      }
    } catch (error) {
      toast.error('Erro ao carregar animais do lote.');
    }
  };

  const handleDeleteAnimal = async (id: number) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/animal/${id}`);
      toast.success('Animal excluído com sucesso!');
      carregarAnimais(); // Atualiza a lista após a exclusão
    } catch (error) {
      toast.error('Erro ao excluir animal.');
    }
  };

  const confirmarExclusao = () => {
    if (animalParaExcluir) {
      handleDeleteAnimal(animalParaExcluir.id!); // Exclui o animal selecionado
      setModalConfirmacaoAberto(false); // Fecha o modal
    }
  };

  const fecharModal = () => setModalAberto(false);

  // Funcionalidade para abrir o modal de cadastro
  const abrirModalCadastro = () => {
    setModalCadastroAberto(true);
  };

  const fecharModalCadastro = () => {
    setModalCadastroAberto(false);
  };

  return (
    <LayoutDashboard token="">
      <div className="container-fluid">
        <div className="row">
          <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
            <div className="my-4" style={{ position: 'relative' }}>
              <h2 className="mb-4">Atualização de Animal</h2>
              <button
                className="btn btn-success mb-4"
                onClick={abrirModalCadastro}
                title="Cadastrar Animal" // Tooltip
                style={{ position: 'absolute', right: '20px', top: '20px' }} // Para adicionar o tooltip
              >
                +
              </button>

              <div className="card mb-4">
                <div className="card-body">
                  <AtualizacaoAnimalForm
                    onAnimalAtualizado={handleAnimalCriado}
                    animalEdit={animalEdit}
                    closeModal={fecharModalCadastro}
                    animais={animais}
                  />
                </div>
              </div>



              {mostrarGrafico && (
                <div className="card mb-4">
                  <div className="card-body">
                    <h3>Histórico de Peso</h3>
                    <GraficoHistorico historico={historicoPeso} anotacoes={animalAnotacoes} onClose={() => setMostrarGrafico(false)} />
                  </div>
                </div>
              )}


            </div>
          </main>
        </div>

        {/* Modal de animal não encontrado */}
        <Modal
            isOpen={modalAberto}
            onRequestClose={fecharModal}
            ariaHideApp={false}
            contentLabel="Animal Não Encontrado"
            style={{
                content: {
                maxWidth: '400px',
                margin: 'auto',
                top: '50%',
                transform: 'translateY(-50%)',
                },
            }}
            >
            <h2 style={{ fontSize: '18px' }}>Animal não encontrado</h2>
            <p style={{ fontSize: '14px' }}>O animal com o número de identificação "{filtroIdentificacao}" não está cadastrado.</p>
            <button className="btn btn-primary" onClick={fecharModal}>Fechar</button>
         </Modal>

        {/* Modal para cadastro de novo animal */}
        <Modal
        isOpen={modalCadastroAberto}
        onRequestClose={fecharModalCadastro}
        ariaHideApp={false}
        contentLabel="Cadastrar Novo Animal"
        style={{
            content: {
            maxWidth: '600px',
            margin: 'auto',
            top: '100px',
            },
        }}
        >
        <h2>Cadastrar Novo Animal</h2>
        <CadastroAnimalForm onAnimalCriado={handleAnimalCriado} closeModal={fecharModalCadastro} animais={animais} />
        <div className="d-flex justify-content-between mt-3">
            <button className="btn btn-secondary" onClick={fecharModalCadastro}>Cancelar</button>
        </div>
        </Modal>

        {/* Modal de confirmação de exclusão */}
        <Modal
        isOpen={modalConfirmacaoAberto}
        onRequestClose={() => setModalConfirmacaoAberto(false)}
        ariaHideApp={false}
        contentLabel="Confirmação de Exclusão"
        style={{
            content: {
            maxWidth: '300px',
            margin: 'auto',
            top: '50%',
            transform: 'translateY(-50%)',
            },
        }}
        >
        <h2 style={{ fontSize: '18px' }}>Confirmação de Exclusão</h2>
        <p style={{ fontSize: '14px' }}>Você tem certeza que deseja excluir este animal?</p>
        <div className="d-flex justify-content-between">
            <button className="btn btn-secondary" onClick={() => setModalConfirmacaoAberto(false)}>Cancelar</button>
            <button className="btn btn-danger" onClick={confirmarExclusao}>Excluir</button>
        </div>
        </Modal>
      </div>
    </LayoutDashboard>
  );
};

export default DashboardAnimais;
