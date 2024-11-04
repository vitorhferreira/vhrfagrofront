'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { LayoutDashboard } from '@/components/LayoutDashboard';
import * as XLSX from 'xlsx'; // Para exportar a tabela em Excel

// Interface para os dados do cálculo de custo
interface CustoLote {
  numero_lote: string;
  custo_por_cabeca: number;
}

// Função principal que renderiza a tela de custo por cabeça
const CustoPorCabecaPage = () => {
  const [custos, setCustos] = useState<CustoLote[]>([]);
  const [loading, setLoading] = useState(true);

  // Função para buscar os dados de custo por cabeça da API
  const fetchCustos = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/lote/custo-por-cabeca');
      setCustos(response.data);
    } catch (error) {
      toast.error('Erro ao buscar custo por cabeça');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustos();
  }, []);

  // Função para exportar os dados para Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(custos);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Custos por Lote');
    XLSX.writeFile(workbook, 'custos_por_cabeca.xlsx');
  };

  // Função para formatar os valores como moeda em reais (R$)
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <LayoutDashboard token="">
      <div className="container-fluid">
        <div className="row">
          <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
            <h2 className="my-4" style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>Custo por Cabeça por Lote</h2>
            <button className="btn btn-success mb-3" onClick={exportToExcel} style={{ fontFamily: 'Arial, sans-serif' }}>
              Exportar para Excel
            </button>
            {loading ? (
              <p>Carregando...</p>
            ) : (
              <table className="table table-hover table-bordered" style={{ fontFamily: 'Arial, sans-serif', fontSize: '16px' }}>
                <thead className="table-dark">
                  <tr>
                    <th>Número do Lote</th>
                    <th>Custo por Cabeça (R$)</th>
                  </tr>
                </thead>
                <tbody>
                  {custos.map((custo, index) => (
                    <tr key={index}>
                      <td>{custo.numero_lote}</td>
                      <td>{formatCurrency(custo.custo_por_cabeca)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </main>
        </div>
      </div>
    </LayoutDashboard>
  );
};

export default CustoPorCabecaPage;
