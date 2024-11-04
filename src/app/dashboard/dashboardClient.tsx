// src/app/dashboard/dashboardClient.tsx
'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const DashboardClient = ({ token }) => {
    const [somaQuantidade, setSomaQuantidade] = useState(0);
    const [totalInvestido, setTotalInvestido] = useState(0);
    const [lucroTotal, setLucroTotal] = useState(0);
    const [vendasUltimos30Dias, setVendasUltimos30Dias] = useState({ quantidade: 0, valor: 0 });
    const [lotes, setLotes] = useState([]);

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

                const totalQuantidade = lotesData.reduce((acc, lote) => acc + lote.quantidade, 0);
                setSomaQuantidade(totalQuantidade);

                const total = lotesData.reduce((acc, lote) => acc + lote.quantidade * parseFloat(lote.valor_individual), 0);
                setTotalInvestido(total);
            } catch (error) {
                console.error("Erro ao buscar dados dos lotes:", error);
            }
        };

        const fetchLucroTotal = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/relatorio', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });

                const relatorioData = response.data;
                const lucro = relatorioData.reduce((acc, rel) => acc + parseFloat(rel.lucro), 0);
                setLucroTotal(lucro);
            } catch (error) {
                console.error("Erro ao buscar dados de lucro:", error);
            }
        };

        const fetchVendasUltimos30Dias = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/vendas', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });

                const vendasData = response.data;
                const now = new Date();
                const vendasRecentes = vendasData.filter(venda => {
                    const vendaDate = new Date(venda.data_compra);
                    return (now - vendaDate) / (1000 * 60 * 60 * 24) <= 30;
                });

                const quantidade = vendasRecentes.reduce((acc, venda) => acc + venda.quantidade_vendida, 0);
                const valor = vendasRecentes.reduce((acc, venda) => acc + parseFloat(venda.valor_unitario) * venda.quantidade_vendida, 0);
                setVendasUltimos30Dias({ quantidade, valor });
            } catch (error) {
                console.error("Erro ao buscar dados de vendas:", error);
            }
        };

        fetchLotes();
        fetchLucroTotal();
        fetchVendasUltimos30Dias();
    }, [token]);

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

            {/* Cartões com os dados financeiros */}
            <div className="container text-center mb-5">
                <div className="row">
                    {/* Cartão Total Investido */}
                    <div className="col-md-4">
                        <div className="card shadow-lg p-4 mb-4 bg-light">
                            <h2 className="text-success">Total Investido</h2>
                            <p className="display-4 text-success font-weight-bold">
                                R$ {totalInvestido.toLocaleString()}
                            </p>
                            <p className="text-muted">Investimento total nos lotes</p>
                        </div>
                    </div>

                    {/* Cartão Lucro Total */}
                    <div className="col-md-4">
                        <div className="card shadow-lg p-4 mb-4 bg-light">
                            <h2 className="text-primary">Lucro Total</h2>
                            <p className="display-4 text-primary font-weight-bold">
                                R$ {lucroTotal.toLocaleString()}
                            </p>
                            <p className="text-muted">Lucro acumulado dos lotes</p>
                        </div>
                    </div>

                    {/* Cartão Vendas nos Últimos 30 Dias */}
                    <div className="col-md-4">
                        <div className="card shadow-lg p-4 mb-4 bg-light">
                            <h2 className="text-warning">Vendas Últimos 30 Dias</h2>
                            <p className="display-5 text-warning font-weight-bold">
                                Quantidade: {vendasUltimos30Dias.quantidade}
                            </p>
                            <p className="display-5 text-warning font-weight-bold">
                                Valor: R$ {vendasUltimos30Dias.valor.toLocaleString()}
                            </p>
                            <p className="text-muted">Dados das vendas recentes</p>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default DashboardClient;
