'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { LayoutDashboard } from '@/components/LayoutDashboard';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FaCheck } from 'react-icons/fa';

// Interfaces
interface Vacina {
  id?: number;
  nome_vacina: string;
  data_aplicacao: string;
  quantidade_cabecas: number;
  numero_lote: string;
  numero_identificacao?: string;
}

interface Lote {
  id: number;
  quantidade: number;
  numero_lote: number;
}

interface Animal {
  id: number;
  numero_identificacao: string;
  id_lote: number;
}

const CadastroVacinaForm = ({ onVacinaCriada, vacinaEdit }: { onVacinaCriada: () => void, vacinaEdit?: Vacina }) => {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<Vacina>();
  const [loading, setLoading] = useState(false);
  const [loteOption, setLoteOption] = useState<Lote[]>([]);
  const [animalOption, setAnimalOption] = useState<Animal[]>([]);
  const [filteredAnimals, setFilteredAnimals] = useState<string[]>([]);
  const [selectedLoteId, setSelectedLoteId] = useState<number | null>(null);
  const [selectedAnimals, setSelectedAnimals] = useState<string[]>([]);
  const [isAnimalListOpen, setIsAnimalListOpen] = useState(false);

  const quantidadeCabecas = watch('quantidade_cabecas');

  useEffect(() => {
    const fetchLotes = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/lote');
        setLoteOption(response.data);
      } catch {
        toast.error('Erro ao buscar lotes');
      }
    };

    const fetchAnimals = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/animal?timestamp=${new Date().getTime()}`);
        setAnimalOption(response.data);
      } catch {
        toast.error('Erro ao buscar animais');
      }
    };

    fetchLotes();
    fetchAnimals();
  }, []);

  useEffect(() => {
    if (vacinaEdit) {
      setValue('nome_vacina', vacinaEdit.nome_vacina);
      setValue('data_aplicacao', vacinaEdit.data_aplicacao);
      setValue('quantidade_cabecas', vacinaEdit.quantidade_cabecas);
      setSelectedLoteId(Number(vacinaEdit.numero_lote)); 
      setValue('numero_lote', vacinaEdit.numero_lote);
      setSelectedAnimals(vacinaEdit.numero_identificacao ? vacinaEdit.numero_identificacao.split(',') : []);
      setValue('numero_identificacao', vacinaEdit.numero_identificacao || "");
    } else {
      reset();
    }
  }, [vacinaEdit, setValue, reset]);

  const handleLoteChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const loteSelecionado = event.target.value;
    const selectedLote = loteOption.find(lote => lote.numero_lote.toString() === loteSelecionado);
    
    if (selectedLote) {
      setSelectedLoteId(selectedLote.id);
      setValue('numero_lote', selectedLote.numero_lote.toString());

      const uniqueAnimals = Array.from(
        new Set(
          animalOption
            .filter(animal => animal.id_lote === selectedLote.id)
            .map(animal => animal.numero_identificacao)
        )
      );

      setFilteredAnimals(uniqueAnimals);
      setSelectedAnimals([]);
    }
  };

  const toggleAnimalList = () => {
    setIsAnimalListOpen(!isAnimalListOpen);
  };

  const handleAnimalSelection = (numero_identificacao: string) => {
    setSelectedAnimals(prevSelected => {
      const updatedSelection = prevSelected.includes(numero_identificacao)
        ? prevSelected.filter(animal => animal !== numero_identificacao)
        : [...prevSelected, numero_identificacao];
      setValue('numero_identificacao', updatedSelection.join(','));
      return updatedSelection;
    });
  };

  const isQuantidadeValida = () => {
    return quantidadeCabecas && quantidadeCabecas > 0;
  };

  const onSubmit = async (data: Vacina) => {
    if (!isQuantidadeValida()) {
      toast.error('A quantidade de cabeças deve ser maior que 0.');
      return;
    }

    if (selectedAnimals.length === 0) {
      toast.error('É necessário selecionar pelo menos um animal.');
      return;
    }

    const payload = {
      ...data,
      numero_lote: selectedLoteId,
      numero_identificacao: selectedAnimals.join(','),
    };

    setLoading(true);
    try {
      if (vacinaEdit) {
        await axios.put(`http://127.0.0.1:8000/api/vacinas/${vacinaEdit.id}`, payload);
        toast.success('Vacina atualizada com sucesso!');
        onVacinaCriada();
      } else {
        await axios.post('http://127.0.0.1:8000/api/cadvacinas', payload);
        toast.success('Vacina cadastrada com sucesso!');
        onVacinaCriada();
        reset();
        setSelectedAnimals([]);
      }
    } catch (error) {
      console.error('Erro ao cadastrar vacina:', error);
      toast.error('Erro ao cadastrar vacina. Verifique os campos e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const selectAllAnimals = () => {
    setSelectedAnimals(filteredAnimals);
    setValue('numero_identificacao', filteredAnimals.join(','));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-3">
        <label htmlFor="nome_vacina" className="form-label">Nome da Vacina:</label>
        <input type="text" className="form-control" id="nome_vacina" {...register('nome_vacina', { required: true })} />
        {errors.nome_vacina && <div className="text-danger">Nome da vacina é obrigatório.</div>}
      </div>
      <div className="mb-3">
        <label htmlFor="data_aplicacao" className="form-label">Data da Aplicação:</label>
        <input type="date" className="form-control" id="data_aplicacao" {...register('data_aplicacao', { required: true })} />
        {errors.data_aplicacao && <div className="text-danger">Data da aplicação é obrigatória.</div>}
      </div>
      <div className="mb-3">
        <label htmlFor="quantidade_cabecas" className="form-label">Quantidade de Cabeças:</label>
        <input
          type="number"
          className="form-control"
          id="quantidade_cabecas"
          {...register('quantidade_cabecas', { required: true, min: 1 })}
          style={{ borderColor: errors.quantidade_cabecas ? 'red' : undefined }}
        />
        {errors.quantidade_cabecas && (
          <div className="text-danger">{errors.quantidade_cabecas.message}</div>
        )}
      </div>

      <div className="mb-3">
        <label htmlFor="lote" className="form-label">Lote</label>
        <select className="form-select" name="lote" onChange={handleLoteChange} required>
          <option value="">Selecione um Lote</option>
          {loteOption.map(lote => (
            <option key={lote.id} value={lote.numero_lote.toString()}>
              {`${lote.numero_lote} - ${lote.quantidade} cabeças disponíveis`}
            </option>
          ))}
        </select>
      </div>

      {selectedLoteId && (
        <div className="mb-3 position-relative text-center">
          <label htmlFor="animal" className="form-label">Animal</label>
          <button
            type="button"
            className="form-control"
            onClick={toggleAnimalList}
          >
            {selectedAnimals.length > 0
              ? `${selectedAnimals.length} animal(is) selecionado(s)`
              : 'Selecione os animais'}
          </button>

          {isAnimalListOpen && (
            <div className="animal-list bg-white border rounded shadow-sm p-3 mt-2">
              <button
                type="button"
                className="btn btn-outline-secondary mb-2"
                onClick={selectAllAnimals}
              >
                Selecionar Todos
              </button>
              {filteredAnimals.map(animal => (
                <div
                  key={animal}
                  className="d-flex align-items-center justify-content-center"
                  onClick={() => handleAnimalSelection(animal)}
                  style={{ cursor: 'pointer' }}
                >
                  <input
                    type="checkbox"
                    className="me-2"
                    checked={selectedAnimals.includes(animal)}
                    readOnly
                  />
                  <span>{animal}</span>
                  {selectedAnimals.includes(animal) && <FaCheck className="ms-2 text-success" />}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <input
        type="hidden"
        {...register('numero_identificacao')}
        value={selectedAnimals.join(',')}
      />

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  );
};

// Lista de Vacinas
const ListaVacinas = ({ vacinas, onVacinaEdit, onVacinaCriada }: { vacinas: Vacina[], onVacinaEdit: (vacina: Vacina) => void, onVacinaCriada: () => void }) => {
  const [filteredVacinas, setFilteredVacinas] = useState<Vacina[]>(vacinas);
  const [showModal, setShowModal] = useState(false);
  const [vacinaToDelete, setVacinaToDelete] = useState<Vacina | null>(null);

  useEffect(() => {
    setFilteredVacinas(vacinas);
  }, [vacinas]);

  const handleDeleteConfirmation = (vacina: Vacina) => {
    setVacinaToDelete(vacina);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (vacinaToDelete) {
      try {
        const response = await axios.delete(`http://127.0.0.1:8000/api/vacinas/${vacinaToDelete.id}`);
        if (response.data.sucesso === true) {
          toast.success('Vacina deletada com sucesso');
          onVacinaCriada();
        } else {
          toast.error('Erro ao deletar vacina');
        }
      } catch (error) {
        toast.error('Erro ao deletar vacina');
      } finally {
        setShowModal(false);
        setVacinaToDelete(null);
      }
    }
  };

  const filterVacina = (numero_lote: string) => {
    if (numero_lote !== '') {
      setFilteredVacinas(vacinas.filter(d => d.numero_lote.includes(numero_lote)));
    } else {
      setFilteredVacinas(vacinas);
    }
  };

  return (
    <div>
      <h2>Lista de Vacinas:</h2>
      <input
        placeholder="Filtrar por Número do lote"
        className="form-control mb-3"
        onChange={(e) => filterVacina(e.target.value)}
      />
      <ul>
        {filteredVacinas.map((vacina) => (
          <li key={vacina.id} style={{ margin: '15px 0', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff' }}>
            <h3 style={{ margin: '0', color: '#007bff' }}>Número do Lote: {vacina.numero_lote}</h3>
            <strong>Nome da Vacina:</strong> {vacina.nome_vacina}<br />
            <strong>Data da Aplicação:</strong> {new Date(vacina.data_aplicacao).toLocaleDateString('pt-BR')}<br />
            <strong>Quantidade de Cabeças:</strong> {vacina.quantidade_cabecas}<br />
            <strong>Animais:</strong> {vacina.numero_identificacao ? vacina.numero_identificacao.split(',').join(', ') : 'Nenhum'}<br />
            <div className="actions" style={{ marginTop: '10px' }}>
              <button className="btn btn-primary" style={{ marginRight: '10px' }} onClick={() => onVacinaEdit(vacina)}>
                Editar
              </button>
              <button className="btn btn-danger" onClick={() => handleDeleteConfirmation(vacina)}>
                Excluir
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
  const [vacinas, setVacinas] = useState<Vacina[]>([]);
  const [vacinaEdit, setVacinaEdit] = useState<Vacina | null>(null);

  useEffect(() => {
    carregarVacinas();
  }, []);

  const carregarVacinas = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/vacinas');
      setVacinas(response.data);
    } catch (error) {
      console.error('Erro ao carregar vacinas:', error);
    }
  };

  const handleVacinaCriada = () => {
    carregarVacinas();
    setVacinaEdit(null);
  };

  const handleVacinaEdit = (vacina: Vacina) => {
    setVacinaEdit(vacina);
  };

  return (
    <LayoutDashboard token=''>
      <div className="container-fluid">
        <div className="row">
          <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
            <div className="my-4">
              <h2 className="mb-4">Cadastro de Vacinas</h2>
              <div className="card mb-4">
                <div className="card-body">
                  <CadastroVacinaForm onVacinaCriada={handleVacinaCriada} vacinaEdit={vacinaEdit} />
                </div>
              </div>
              <div className="card mb-4">
                <div className="card-body">
                  <ListaVacinas onVacinaEdit={handleVacinaEdit} onVacinaCriada={handleVacinaCriada} vacinas={vacinas} />
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

             
