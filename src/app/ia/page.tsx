"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { LayoutDashboard } from '@/components/LayoutDashboard';
import { toast } from 'react-toastify';

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
  data_pagamento?: string;
}

interface Alimentacao {
  recomendacao: string;
}

const Dashboard = () => {
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [alimentacao, setAlimentacao] = useState<Alimentacao | null>(null);
  const [loteSelecionado, setLoteSelecionado] = useState<Lote | null>(null);
  const [raca, setRaca] = useState<string>('Nelore');
  const [pastagem, setPastagem] = useState<string>('');
  const [clima, setClima] = useState<string>('Seco');
  const [carregando, setCarregando] = useState<boolean>(false);

  useEffect(() => {
    carregarLotes();
  }, []);

  const carregarLotes = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/lote');
      setLotes(response.data);
    } catch (error) {
      console.error('Erro ao carregar lotes:', error);
    }
  };

  const buscarAlimentacaoIdeal = async () => {
    if (!loteSelecionado) {
      toast.error("Selecione um lote antes de pesquisar.");
      return;
    }

    setCarregando(true);

    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/alimentacao_ideal/${loteSelecionado.peso}/${loteSelecionado.idade_media}/${raca}/${pastagem}/${clima}`
      );

      const recomendacao = response.data.recomendacao?.candidates?.[0]?.content?.parts?.[0]?.text || "Recomendação não disponível";
      setAlimentacao({ recomendacao });
    } catch (error) {
      console.error('Erro ao buscar alimentação ideal:', error);
      toast.error('Erro ao buscar alimentação ideal.');
    } finally {
      setCarregando(false);
    }
  };

  const handleLoteSelecionado = (loteId: number) => {
    const lote = lotes.find((l) => l.id === loteId);
    if (lote) {
      setLoteSelecionado(lote);
      setAlimentacao(null);
    }
  };

  const formatarRecomendacao = () => {
    if (!alimentacao?.recomendacao) return [];

    const regex = /##\s*([^#*]+)\s*|\*\*\s*([^*]+)\s*\*\*/g;
    const result: Array<{ type: string; content: string }> = [];
    let match;
    let lastIndex = 0;

    while ((match = regex.exec(alimentacao.recomendacao)) !== null) {
      if (match.index > lastIndex) {
        result.push({ type: 'text', content: alimentacao.recomendacao.slice(lastIndex, match.index).trim() });
      }
      if (match[1]) {
        result.push({ type: 'subtitle', content: match[1].trim() });
      } else if (match[2]) {
        result.push({ type: 'title', content: match[2].trim() });
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < alimentacao.recomendacao.length) {
      result.push({ type: 'text', content: alimentacao.recomendacao.slice(lastIndex).trim() });
    }

    return result;
  };

  return (
    <LayoutDashboard token={''}>
      <div className="container-fluid">
        <div className="row">
          <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
            <div className="my-4">
              <h2 className="mb-4">Recomendação de Alimentação</h2>

              {/* Dropdown para Seleção de Lote */}
              <div className="mb-4">
                <label htmlFor="selectLote" className="form-label">Selecione o Lote:</label>
                <select
                  id="selectLote"
                  className="form-select"
                  onChange={(e) => handleLoteSelecionado(Number(e.target.value))}
                  value={loteSelecionado?.id || ''}
                >
                  <option value="">Selecione um lote</option>
                  {lotes.map((lote) => (
                    <option key={lote.id} value={lote.id}>
                      Lote {lote.numero_lote} - Peso Médio: {lote.peso} Kg - Idade Média: {lote.idade_media} meses
                    </option>
                  ))}
                </select>
              </div>

              {/* Campo para Raça */}
              <div className="mb-3">
                <label htmlFor="raca" className="form-label">Raça:</label>
                <select
                  id="raca"
                  className="form-select"
                  value={raca}
                  onChange={(e) => setRaca(e.target.value)}
                >
                  <option value="Nelore">Nelore</option>
                  <option value="Angus">Angus</option>
                  <option value="Hereford">Hereford</option>
                  <option value="Brahman">Brahman</option>
                  <option value="Simental">Simental</option>
                  <option value="Tabapuã">Tabapuã</option>
                  <option value="Senepol">Senepol</option>
                  <option value="Canchim">Canchim</option>
                  <option value="Charolês">Charolês</option>
                  <option value="Brangus">Brangus (cruzamento de Angus e Nelore)</option>
                  <option value="Bonsmara">Bonsmara</option>
                  <option value="Guzerá">Guzerá</option>
                  <option value="Indubrasil">Indubrasil</option>
                  <option value="Holandesa">Holandesa</option>
                  <option value="Jersey">Jersey</option>
                </select>
              </div>

              {/* Campo para Tipo de Pastagem */}
              <div className="mb-3">
                <label htmlFor="pastagem" className="form-label">Tipo de Pastagem:</label>
                <input
                  type="text"
                  id="pastagem"
                  className="form-control"
                  value={pastagem}
                  onChange={(e) => setPastagem(e.target.value)}
                />
              </div>

              {/* Seleção de Clima */}
              <div className="mb-3">
                <label htmlFor="clima" className="form-label">Clima:</label>
                <select
                  id="clima"
                  className="form-select"
                  value={clima}
                  onChange={(e) => setClima(e.target.value)}
                >
                  <option value="Seco">Seco</option>
                  <option value="Chuvoso">Chuvoso</option>
                  <option value="Quente">Quente</option>
                  <option value="Úmido">Úmido</option>
                  <option value="Frio">Frio</option>
                  <option value="Ventoso">Ventoso</option>
                </select>
              </div>

              {/* Botão para realizar a busca */}
              <button
                className="btn btn-primary mt-3"
                onClick={buscarAlimentacaoIdeal}
                disabled={!loteSelecionado || carregando}
              >
                {carregando ? "Carregando..." : "Pesquisar"}
              </button>

              {/* Exibição da Alimentação Ideal */}
              {alimentacao && (
                <div className="alert alert-info mt-4" role="alert">
                  <h4 className="alert-heading">Alimentação Ideal</h4>
                  <div>
                    {formatarRecomendacao().map((item, index) => (
                      <div key={index}>
                        {item.type === 'title' && <h5 className="fw-bold">{item.content}</h5>}
                        {item.type === 'subtitle' && <h6 className="fw-semibold">{item.content}</h6>}
                        {item.type === 'text' && <p>{item.content}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </LayoutDashboard>
  );
};

export default Dashboard;
