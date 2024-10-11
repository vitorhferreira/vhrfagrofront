// src/app/dashboard/dashboardClient.tsx
'use client'; // Marque este componente como cliente

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Tooltip, Legend, ArcElement, Title } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels'; // Importar o plugin para exibir rótulos
import 'bootstrap/dist/css/bootstrap.min.css'; // Importar Bootstrap

ChartJS.register(Tooltip, Legend, ArcElement, Title, ChartDataLabels);

const DashboardClient = ({ token }) => {
    const [dataLotes, setDataLotes] = useState(null);
    const [somaQuantidade, setSomaQuantidade] = useState(0); // Estado para a soma das quantidades
    const [dataRelatorio, setDataRelatorio] = useState(null);
    const [somaLucros, setSomaLucros] = useState(0);
    const [dataVendas, setDataVendas] = useState(null);
    const [somaReceber, setSomaReceber] = useState(0);
    const [lotes, setLotes] = useState([]);
    const [relatorios, setRelatorios] = useState([]);
    const [vendas, setVendas] = useState([]);

    useEffect(() => {
        const fetchLotes = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/lote', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });

                const lotesData = response.data;
                setLotes(lotesData);

                // Calcular a soma das quantidades
                const totalQuantidade = lotesData.reduce((acc, lote) => acc + lote.quantidade, 0);
                setSomaQuantidade(totalQuantidade); // Atualizar o estado com a soma

                setDataLotes({
                    labels: lotesData.map(lote => `Lote ${lote.numero_lote}`),
                    datasets: [{
                        label: 'Peso Disponível (kg)',
                        data: lotesData.map(lote => lote.quantidade * lote.peso),
                        backgroundColor: [
                            'rgba(75, 192, 192, 0.6)',
                            'rgba(255, 99, 132, 0.6)',
                            'rgba(255, 206, 86, 0.6)',
                            'rgba(153, 102, 255, 0.6)',
                        ],
                    }]
                });
            } catch (error) {
                console.error("Erro ao buscar dados dos lotes:", error);
            }
        };

        const fetchRelatorio = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/relatorio', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });

                const relatorioData = response.data;
                setRelatorios(relatorioData);

                const totalLucros = relatorioData.reduce((acc, rel) => acc + parseFloat(rel.lucro), 0);
                setSomaLucros(totalLucros);

                setDataRelatorio({
                    labels: relatorioData.map(rel => `Lote ${rel.lote_id}`),
                    datasets: [{
                        label: 'Lucro',
                        data: relatorioData.map(rel => rel.lucro),
                        backgroundColor: [
                            'rgba(75, 192, 192, 0.6)',
                            'rgba(255, 99, 132, 0.6)',
                            'rgba(255, 206, 86, 0.6)',
                            'rgba(153, 102, 255, 0.6)',
                        ],
                    }]
                });
            } catch (error) {
                console.error("Erro ao buscar dados do relatório:", error);
            }
        };

        const fetchVendas = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/vendas', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });

                const vendasData = response.data;
                setVendas(vendasData);

                const totalReceber = vendasData.reduce((acc, venda) => acc + (parseFloat(venda.valor_unitario) * venda.quantidade_vendida), 0);
                setSomaReceber(totalReceber);

                setDataVendas({
                    labels: vendasData.map(venda => `Lote ${venda.lote_id}`),
                    datasets: [{
                        label: 'Valor a Receber',
                        data: vendasData.map(venda => parseFloat(venda.valor_unitario) * venda.quantidade_vendida),
                        backgroundColor: [
                            'rgba(153, 102, 255, 0.6)',
                            'rgba(75, 192, 192, 0.6)',
                            'rgba(255, 206, 86, 0.6)',
                            'rgba(255, 99, 132, 0.6)',
                        ],
                    }]
                });
            } catch (error) {
                console.error("Erro ao buscar dados de vendas:", error);
            }
        };

        fetchLotes();
        fetchRelatorio();
        fetchVendas();
    }, [token]);

    if (!dataLotes || !dataRelatorio || !dataVendas) {
        return <div>Carregando dados...</div>;
    }

    const optionsWithDataLabels = {
        plugins: {
            tooltip: { enabled: true },
            legend: { display: true },
            datalabels: {
                display: true,
                color: 'black',
                font: { weight: 'bold', size: 12 },
                formatter: (value) => `R$ ${value.toLocaleString()}`, // Formatar valores em R$
            },
            title: { display: true },
        },
    };

    return (
        <div>
            {/* Exibição destacada do número de cabeças no pasto */}
            <div className="container text-center mb-5">
                <div className="card shadow-lg p-4 bg-light">
                    <h1 className="display-4 text-success">Cabeças no Pasto</h1>
                    <h2 className="text-success font-weight-bold" style={{ fontSize: '3.5rem' }}>
                        {somaQuantidade}
                    </h2>
                    <p className="text-muted">Total de cabeças atualmente no pasto</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                
                {/* Peso Disponível no Pasto (Gráfico maior) */}
                <div style={{ width: '300px', height: '300px' }}> {/* Aumentei o tamanho aqui */}
                    <Pie
                        data={dataLotes}
                        options={{
                            plugins: {
                                tooltip: { enabled: true },
                                legend: { display: true },
                                datalabels: {
                                    display: true,
                                    color: 'black',
                                    font: { weight: 'bold', size: 12 },
                                    formatter: (value) => `${value} kg`, // Formatar com kg
                                },
                                title: { display: true, text: 'Peso Disponível (kg)' }
                            }
                        }}
                    />
                </div>

                {/* Lucro por Lote */}
                <div style={{ width: '200px', height: '200px' }}>
                    <Pie data={dataRelatorio} options={{ ...optionsWithDataLabels, title: { display: true, text: 'Lucro por Lote' } }} />
                </div>

                {/* Quantidade Vendida por Lote */}
                <div style={{ width: '200px', height: '200px' }}>
                    <Pie
                        data={{
                            labels: relatorios.map(rel => `Lote ${rel.lote_id}`),
                            datasets: [{
                                label: 'Quantidade Vendida',
                                data: relatorios.map(rel => rel.quantidade_vendida),
                                backgroundColor: [
                                    'rgba(153, 102, 255, 0.6)',
                                    'rgba(75, 192, 192, 0.6)',
                                    'rgba(255, 206, 86, 0.6)',
                                    'rgba(255, 99, 132, 0.6)',
                                ],
                            }]
                        }}
                        options={{
                            plugins: {
                                tooltip: { enabled: true },
                                legend: { display: true },
                                datalabels: {
                                    display: true,
                                    color: 'black',
                                    font: { weight: 'bold', size: 12 },
                                    formatter: (value) => `${value} vendidas`, // Formatar com "vendidas"
                                },
                                title: { display: true, text: 'Quantidade Vendida por Lote' }
                            }
                        }}
                    />
                </div>

                {/* Gastos Totais por Lote */}
                <div style={{ width: '200px', height: '200px' }}>
                    <Pie
                        data={{
                            labels: relatorios.map(rel => `Lote ${rel.lote_id}`),
                            datasets: [{
                                label: 'Gastos Totais',
                                data: relatorios.map(rel => rel.total_gastos),
                                backgroundColor: [
                                    'rgba(255, 206, 86, 0.6)',
                                    'rgba(75, 192, 192, 0.6)',
                                    'rgba(255, 99, 132, 0.6)',
                                    'rgba(153, 102, 255, 0.6)',
                                ],
                            }]
                        }}
                        options={{
                            plugins: {
                                tooltip: { enabled: true },
                                legend: { display: true },
                                datalabels: {
                                    display: true,
                                    color: 'black',
                                    font: { weight: 'bold', size: 12 },
                                    formatter: (value) => `R$ ${value.toLocaleString()}`, // Formatar valores em R$
                                },
                                title: { display: true, text: 'Gastos por Lote' }
                            }
                        }}
                    />
                </div>

                {/* Quantidade a Receber por Lote */}
                <div style={{ width: '200px', height: '200px' }}>
                    <Pie
                        data={dataVendas}
                        options={{ ...optionsWithDataLabels, title: { display: true, text: 'Quantidade a Receber' } }}
                    />
                </div>

                {/* Soma de Todos os Lucros */}
                <div style={{ width: '200px', height: '200px' }}>
                    <Pie
                        data={{
                            labels: ['Lucros Totais'],
                            datasets: [{
                                label: 'Lucros',
                                data: [somaLucros],
                                backgroundColor: ['rgba(54, 162, 235, 0.6)'],
                            }]
                        }}
                        options={{ ...optionsWithDataLabels, title: { display: true, text: 'Soma dos Lucros' } }}
                    />
                </div>
            </div>

            <h2>Detalhes dos Lotes</h2>
            <table className="table table-striped table-bordered table-hover">
                <thead className="thead-dark">
                    <tr>
                        <th>Número do Lote</th>
                        <th>Quantidade</th>
                        <th>Peso (kg)</th>
                        <th>Valor Individual (R$)</th>
                        <th>Idade Média (meses)</th>
                    </tr>
                </thead>
                <tbody>
                    {lotes.length ? lotes.map((lote) => (
                        <tr key={lote.numero_lote}>
                            <td>{lote.numero_lote}</td>
                            <td>{lote.quantidade}</td>
                            <td>{lote.peso}</td>
                            <td>{lote.valor_individual}</td>
                            <td>{lote.idade_media}</td>
                        </tr>
                    )) : <tr><td colSpan="5">Nenhum lote disponível</td></tr>}
                </tbody>
            </table>
        </div>
    );
};

export default DashboardClient;
