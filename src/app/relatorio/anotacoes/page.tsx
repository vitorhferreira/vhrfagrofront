'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { LayoutDashboard } from '@/components/LayoutDashboard';
import { toast } from 'react-toastify';
import Modal from 'react-modal';

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

// Página de Filtro por Lote
const FiltroLote = () => {
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [filtroLote, setFiltroLote] = useState<string>('');
  const [modalAberto, setModalAberto] = useState(false);
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

  const handleFiltrarLote = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/animal/`);
      setAnimais(response.data);
      if (response.data.length === 0) {
        toast.info('Nenhum animal encontrado para o lote.');
      }
    } catch (error) {
      toast.error('Erro ao carregar animais do lote.');
    }
  };

  const confirmarExclusao = (animal: Animal) => {
    setAnimalParaExcluir(animal);
    setModalAberto(true);
  };

  const handleExcluirAnimal = async () => {
    if (!animalParaExcluir?.id) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/animal/${animalParaExcluir.id}`);
      toast.success('Animal excluído com sucesso!');
      setAnimais(animais.filter(animal => animal.id !== animalParaExcluir.id));
      setModalAberto(false);
      setAnimalParaExcluir(null);
    } catch (error) {
      toast.error('Erro ao excluir animal.');
      setModalAberto(false);
    }
  };

  return (
    <LayoutDashboard token="">
      <div className="container-fluid">
        <div className="row">
          <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
            <div className="my-4">
              <h2>Filtro por Lote</h2>
              <div className="mb-4">
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Digite o número do lote"
                  value={filtroLote}
                  onChange={(e) => setFiltroLote(e.target.value)}
                />
                <select
                  className="form-control mb-2"
                  onChange={(e) => setFiltroLote(e.target.value)}
                >
                  <option value="">Selecione o número do lote</option>
                  {Array.from(new Set(animais.map(animal => animal.numero_lote))).map((lote) => (
                    <option key={lote} value={lote}>
                      {lote}
                    </option>
                  ))}
                </select>
                <button className="btn btn-primary" onClick={handleFiltrarLote}>Filtrar</button>
              </div>

              <div className="card mb-4">
                <div className="card-body">
                  <h3>Lista de Animais</h3>
                  <table className="table table-bordered">
                    <thead>
                        <tr>
                        <th>Número de Identificação</th><th>Número do Lote</th><th>Peso Atual (Kg)</th><th>Data</th><th>Anotações</th><th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {animais.filter(animal => animal.numero_lote === filtroLote).map(animal => (
                        <tr key={animal.id}>
                            <td>{animal.numero_identificacao}</td><td>{animal.numero_lote}</td><td>{`${animal.peso} kg`}</td><td>{new Date(animal.data).toLocaleDateString('pt-BR')}</td><td>{animal.anotacoes}</td>
                            <td>
                            <button className="btn btn-danger btn-sm" onClick={() => confirmarExclusao(animal)}>Excluir</button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Modal de confirmação de exclusão */}
      <Modal
        isOpen={modalAberto}
        onRequestClose={() => setModalAberto(false)}
        contentLabel="Confirmação de Exclusão"
        ariaHideApp={false}
        style={{
          content: {
            maxWidth: '400px',
            margin: 'auto',
            top: '50%',
            transform: 'translateY(-50%)',
          },
        }}
      >
        <h2>Confirmação de Exclusão</h2>
        <p>Tem certeza que deseja excluir o animal "{animalParaExcluir?.numero_identificacao}"?</p>
        <div className="d-flex justify-content-end">
          <button className="btn btn-secondary me-2" onClick={() => setModalAberto(false)}>Cancelar</button>
          <button className="btn btn-danger" onClick={handleExcluirAnimal}>Excluir</button>
        </div>
      </Modal>
    </LayoutDashboard>
  );
};

export default FiltroLote;
