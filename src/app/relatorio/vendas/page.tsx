'use client';
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useTable } from 'react-table';
import { LayoutDashboard } from '@/components/LayoutDashboard';
import * as XLSX from 'xlsx'; // Para exportar a tabela em Excel

// Interface para os dados do relatório
interface Relatorio {
  id: number;
  lote_id: number;
  valor_compra: string;
  peso_comprado: string;
  quantidade_comprada: number;
  valor_venda: string;
  peso_vendido: string;
  quantidade_vendida: number;
  total_gastos: string;
  total_vacinas: number;
  lucro: string;
  created_at: string;
  updated_at: string;
  numero_lote: string;
}

// Função para formatar valores monetários
const formatCurrency = (value: string) => {
  return `R$ ${parseFloat(value).toFixed(2).replace('.', ',')}`;
};

// Função para formatar peso em Kg
const formatWeight = (value: string) => {
  return `${parseFloat(value).toFixed(2).replace('.', ',')} Kg`;
};

// Função principal que renderiza a tabela de relatórios
const RelatorioPage = () => {
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [loading, setLoading] = useState(true);

  // Função para buscar os relatórios da API
  const fetchRelatorios = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/relatorio');
      setRelatorios(response.data);
    } catch (error) {
      toast.error('Erro ao buscar relatórios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRelatorios();
  }, []);

  // Definindo as colunas da tabela usando useMemo para evitar re-renderizações desnecessárias
  const columns = useMemo(
    () => [
      {
        Header: 'Lote',
        accessor: 'numero_lote',
        Cell: ({ value }: { value: string }) => <span style={{ fontWeight: 'bold' }}>{value}</span>,
      },
      {
        Header: 'Valor de Compra',
        accessor: 'valor_compra',
        Cell: ({ value }: { value: string }) => <span style={{ color: '#ff6600' }}>{formatCurrency(value)}</span>,
      },
      {
        Header: 'Peso Comprado',
        accessor: 'peso_comprado',
        Cell: ({ value }: { value: string }) => formatWeight(value),
      },
      {
        Header: 'Quantidade Comprada',
        accessor: 'quantidade_comprada',
      },
      {
        Header: 'Valor de Venda',
        accessor: 'valor_venda',
        Cell: ({ value }: { value: string }) => <span style={{ color: '#ff6600' }}>{formatCurrency(value)}</span>,
      },
      {
        Header: 'Peso Vendido',
        accessor: 'peso_vendido',
        Cell: ({ value }: { value: string }) => formatWeight(value),
      },
      {
        Header: 'Quantidade Vendida',
        accessor: 'quantidade_vendida',
      },
      {
        Header: 'Data_venda',
        accessor: 'updated_at',
        Cell: ({ value }) => {
          const date = new Date(value);
          const formattedDate = date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
          return formattedDate;
        },
      },
      {
        Header: 'Total de Gastos',
        accessor: 'total_gastos',
        Cell: ({ value }: { value: string }) => <span style={{ color: '#ff6600' }}>{formatCurrency(value)}</span>,
      },
      {
        Header: 'Total de Vacinas',
        accessor: 'total_vacinas',
      },
      {
        Header: 'Lucro',
        accessor: 'lucro',
        Cell: ({ value }: { value: string }) => (
          <span style={{ fontWeight: 'bold', color: parseFloat(value) > 0 ? 'green' : 'red' }}>
            {formatCurrency(value)}
          </span>
        ),
      },
    ],
    []
  );

  // Função para exportar os dados para Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(relatorios);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatórios');
    XLSX.writeFile(workbook, 'relatorios.xlsx');
  };

  // Configurando a tabela com os dados de relatório
  const tableInstance = useTable({ columns, data: relatorios });

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;

  return (
    <LayoutDashboard token="">
      <div className="container-fluid">
        <div className="row">
          <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
            <h2 className="my-4">Relatório de Vendas</h2>
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

export default RelatorioPage;
