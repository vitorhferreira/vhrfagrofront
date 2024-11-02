'use client';
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useTable } from 'react-table';
import { LayoutDashboard } from '@/components/LayoutDashboard';
import * as XLSX from 'xlsx'; // Para exportar a tabela em Excel

// Interface para os dados do relatório de vacinas
interface Vacina {
  id: number;
  nome_vacina: string;
  data_aplicacao: string;
  numero_lote: string;
  quantidade_cabecas: number;
  numero_identificacao: string;
  created_at: string;
  updated_at: string;
}

// Função principal que renderiza a tabela de vacinas
const VacinaRelatorioPage = () => {
  const [vacinas, setVacinas] = useState<Vacina[]>([]);
  const [loading, setLoading] = useState(true);

  // Função para buscar os dados de vacinas da API
  const fetchVacinas = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/vacinas');
      setVacinas(response.data);
    } catch (error) {
      toast.error('Erro ao buscar vacinas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVacinas();
  }, []);

  // Definindo as colunas da tabela usando useMemo para evitar re-renderizações desnecessárias
  const columns = useMemo(
    () => [
      {
        Header: 'Nome da Vacina',
        accessor: 'nome_vacina',
        Cell: ({ value }: { value: string }) => <span style={{ fontWeight: 'bold' }}>{value}</span>,
      },
      {
        Header: 'Data de Aplicação',
        accessor: 'data_aplicacao',
        Cell: ({ value }: { value: string }) => new Date(value).toLocaleDateString(),
      },
      {
        Header: 'Número do Lote',
        accessor: 'numero_lote',
      },
      {
        Header: 'Quantidade de Cabeças',
        accessor: 'quantidade_cabecas',
      },
      {
        Header: 'Número de Identificação',
        accessor: 'numero_identificacao',
      },
    ],
    []
  );

  // Função para exportar os dados para Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(vacinas);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vacinas');
    XLSX.writeFile(workbook, 'vacinas.xlsx');
  };

  // Configurando a tabela com os dados de vacinas
  const tableInstance = useTable({ columns, data: vacinas });

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;

  return (
    <LayoutDashboard token="">
      <div className="container-fluid">
        <div className="row">
          <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
            <h2 className="my-4">Relatório de Vacinas</h2>
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

export default VacinaRelatorioPage;
