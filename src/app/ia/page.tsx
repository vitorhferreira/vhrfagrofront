"use client"; // Marca o componente como um Client Component

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { LayoutDashboard } from '@/components/LayoutDashboard';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

// Interface para os dados do lote e alimentação
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

// Interface simplificada para alimentação que armazena apenas o texto da recomendação
interface Alimentacao {
  recomendacao: string;
}

// Função principal do Dashboard com seleção de lote e recomendação de alimentação
const Dashboard = () => {
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [alimentacao, setAlimentacao] = useState<Alimentacao | null>(null);
  const [loteSelecionado, setLoteSelecionado] = useState<number | null>(null);

  useEffect(() => {
    carregarLotes();
  }, []);

  // Carregar lotes da API
  const carregarLotes = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/lote');
      setLotes(response.data);
    } catch (error) {
      console.error('Erro ao carregar lotes:', error);
    }
  };

  // Obter alimentação ideal com base no peso do lote selecionado
  const buscarAlimentacaoIdeal = async (peso: number) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/alimentacao_ideal/${peso}`);
      
      // Extração do texto de recomendação correto
      const recomendacao = response.data.recomendacao?.candidates?.[0]?.content?.parts?.[0]?.text || "Recomendação não disponível";
      setAlimentacao({ recomendacao });
    } catch (error) {
      console.error('Erro ao buscar alimentação ideal:', error);
      toast.error('Erro ao buscar alimentação ideal.');
    }
  };

  // Lidar com a seleção de um lote
  const handleLoteSelecionado = (loteId: number) => {
    const lote = lotes.find((l) => l.id === loteId);
    if (lote) {
      setLoteSelecionado(loteId);
      buscarAlimentacaoIdeal(lote.peso);
    }
  };

  // Dividir a recomendação em itens separados
  const formatarRecomendacao = () => {
    if (!alimentacao?.recomendacao) return [];

    // Divide a recomendação com base nos números
    return alimentacao.recomendacao
      .split(/(?=\d+\.\s)/)  // Divide cada item começando com "número + ponto + espaço"
      .map((item) => item.trim());  // Remove espaços extras no início e no final
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
                  value={loteSelecionado || ''}
                >
                  <option value="">Selecione um lote</option>
                  {lotes.map((lote) => (
                    <option key={lote.id} value={lote.id}>
                      Lote {lote.numero_lote} - Peso Médio: {lote.peso} Kg
                    </option>
                  ))}
                </select>
              </div>

              {/* Exibição da Alimentação Ideal */}
              {alimentacao && (
                <div className="alert alert-info" role="alert">
                  <h4 className="alert-heading">Alimentação Ideal</h4>
                  <ul>
                    {formatarRecomendacao().map((item, index) => (
                      <li key={index} dangerouslySetInnerHTML={{ __html: item }}></li>
                    ))}
                  </ul>
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
