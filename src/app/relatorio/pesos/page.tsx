'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { LayoutDashboard } from '@/components/LayoutDashboard';
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
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

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

// Página de Filtro de Animal
const FiltroAnimal = () => {
  const [animais, setAnimais] = useState([]);
  const [filtroIdentificacao, setFiltroIdentificacao] = useState<string>('');
  const [historicoPeso, setHistoricoPeso] = useState<any[]>([]);
  const [mostrarGrafico, setMostrarGrafico] = useState(false);
  const [animalAnotacoes, setAnimalAnotacoes] = useState<string>('');
  const [modalAberto, setModalAberto] = useState(false);

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

  const handleFiltrar = async () => {
    try {
      const historico = await getHistoricoPeso(filtroIdentificacao);
      if (historico.length === 0) {
        setModalAberto(true);
        return;
      } else {
        setHistoricoPeso(historico);
        setAnimalAnotacoes(historico[historico.length - 1]?.anotacoes || '');
        setMostrarGrafico(true);
      }
    } catch (error) {
      setModalAberto(true);
    }
  };

  const fecharModal = () => setModalAberto(false);

  return (
    <LayoutDashboard token="">
      <div className="container-fluid">
        <div className="row">
          <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
            <div className="my-4">
              <h2>Filtro por Identificação de Animal</h2>
              <div className="mb-4">
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Digite o número de identificação"
                  value={filtroIdentificacao}
                  onChange={(e) => setFiltroIdentificacao(e.target.value)}
                />
                <select
                  className="form-control mb-2"
                  onChange={(e) => setFiltroIdentificacao(e.target.value)}
                >
                  <option value="">Selecione o número de identificação</option>
                  {Array.from(new Set(animais.map(animal => animal.numero_identificacao))).map((identificacao) => (
                    <option key={identificacao} value={identificacao}>
                      {`${identificacao} - Lote ${animais.find(animal => animal.numero_identificacao === identificacao)?.numero_lote}`}
                    </option>
                  ))}
                </select>
                <button className="btn btn-primary" onClick={handleFiltrar}>Filtrar</button>
              </div>

              {mostrarGrafico && (
                <div className="card mb-4">
                  <div className="card-body">
                    <h3>Histórico de Peso</h3>
                    <GraficoHistorico historico={historicoPeso} anotacoes={animalAnotacoes} onClose={() => setMostrarGrafico(false)} />
                  </div>
                </div>
              )}

              <Modal
                isOpen={modalAberto}
                onRequestClose={fecharModal}
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
            </div>
          </main>
        </div>
      </div>
    </LayoutDashboard>
  );
};

export default FiltroAnimal;
