'use client';
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useTable } from 'react-table';
import { LayoutDashboard } from '@/components/LayoutDashboard';
import * as XLSX from 'xlsx'; // Para exportar a tabela em Excel

// Interface para os dados do relatório de consumo de ração
interface ConsumoRacao {
  id: number;
  tipo_racao: string;
  quantidade_kg: string;
  valor_estimado: string;
  numero_lote: string;
  data_inicial: string;
  data_final: string;
  created_at: string;
  updated_at: string;
}

// Função para formatar valores monetários
const formatCurrency = (value: string) => {
  return `R$ ${parseFloat(value).toFixed(2).replace('.', ',')}`;
};

// Função para formatar quantidade em Kg
const formatWeight = (value: string) => {
  return `${parseFloat(value).toFixed(2).replace('.', ',')} Kg`;
};

// Função principal que renderiza a tabela de consumo de ração
const ConsumoRacaoRelatorioPage = () => {
  const [consumoRacao, setConsumoRacao] = useState<ConsumoRacao[]>([]);
  const [loading, setLoading] = useState(true);

  // Função para buscar os dados de consumo de ração da API
  const fetchConsumoRacao = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/consumo_racao');
      setConsumoRacao(response.data);
    } catch (error) {
      toast.error('Erro ao buscar consumo de ração');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsumoRacao();
  }, []);

  // Definindo as colunas da tabela usando useMemo para evitar re-renderizações desnecessárias
  const columns = useMemo(
    () => [
      {
        Header: 'Tipo de Ração',
        accessor: 'tipo_racao',
        Cell: ({ value }: { value: string }) => <span style={{ fontWeight: 'bold' }}>{value}</span>,
      },
      {
        Header: 'Quantidade (Kg)',
        accessor: 'quantidade_kg',
        Cell: ({ value }: { value: string }) => formatWeight(value),
      },
      {
        Header: 'Valor Estimado',
        accessor: 'valor_estimado',
        Cell: ({ value }: { value: string }) => <span style={{ color: '#ff6600' }}>{formatCurrency(value)}</span>,
      },
      {
        Header: 'Lote',
        accessor: 'numero_lote',
        Cell: ({ value }: { value: string }) => <span style={{ fontWeight: 'bold' }}>{value}</span>,
      },
      {
        Header: 'Data Inicial',
        accessor: 'data_inicial',
        Cell: ({ value }: { value: string }) => new Date(value).toLocaleDateString(),
      },
      {
        Header: 'Data Final',
        accessor: 'data_final',
        Cell: ({ value }: { value: string }) => new Date(value).toLocaleDateString(),
      },
    ],
    []
  );

  // Função para exportar os dados para Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(consumoRacao);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Consumo de Ração');
    XLSX.writeFile(workbook, 'consumo_racao.xlsx');
  };

  // Configurando a tabela com os dados de consumo de ração
  const tableInstance = useTable({ columns, data: consumoRacao });

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;

  return (
    <LayoutDashboard token="">
      <div className="container-fluid">
        <div className="row">
          <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
            <h2 className="my-4">Relatório de Consumo de Ração</h2>
            <button className="btn btn-success mb-3" onClick={exportToExcel}>
              Exportar para Excel
            </button>
            {loading ? (
              <p>Carregando...</p>
            ) : (
              <table {...getTableProps()} className="table table-striped table-bordered">
                <thead className="thead-dark">
                  {headerGroups.map((headerGroup, headerGroupIndex) => (
                    <tr {...headerGroup.getHeaderGroupProps()} key={`headerGroup-${headerGroupIndex}`}>
                      {headerGroup.headers.map((column, columnIndex) => (
                        <th {...column.getHeaderProps()} key={`column-${columnIndex}`}>
                          {column.render('Header')}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                  {rows.map((row, rowIndex) => {
                    prepareRow(row);
                    return (
                      <tr {...row.getRowProps()} key={`row-${rowIndex}`}>
                        {row.cells.map((cell, cellIndex) => (
                          <td {...cell.getCellProps()} key={`cell-${rowIndex}-${cellIndex}`}>
                            {cell.render('Cell')}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </main>
        </div>
      </div>
    </LayoutDashboard>
  );
};

export default ConsumoRacaoRelatorioPage;
