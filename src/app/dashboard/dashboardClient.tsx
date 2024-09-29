// src/app/dashboard/dashboardClient.tsx
'use client'; // Marque este componente como cliente

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Registrar os componentes do ChartJS
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DashboardClient = ({ token }) => {
    const [data, setData] = useState({
        labels: [],
        datasets: [],
    });
    const [lotes, setLotes] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/lote', {
                    headers: {
                        Authorization: `Bearer ${token}`, // Se precisar do token
                    }
                });

                const lotesData = response.data; // Adaptar para o formato que você espera
                setLotes(lotesData);

                // Preparar os dados para o gráfico
                setData({
                    labels: lotesData.map(lote => lote.numero_lote), // Usar o número do lote como rótulo
                    datasets: [
                        {
                            label: 'Quantidade',
                            data: lotesData.map(lote => lote.quantidade),
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1,
                        },
                        {
                            label: 'Peso (kg)',
                            data: lotesData.map(lote => lote.peso),
                            backgroundColor: 'rgba(255, 206, 86, 0.2)',
                            borderColor: 'rgba(255, 206, 86, 1)',
                            borderWidth: 1,
                        },
                        {
                            label: 'Valor Individual (R$)',
                            data: lotesData.map(lote => lote.valor_individual),
                            backgroundColor: 'rgba(153, 102, 255, 0.2)',
                            borderColor: 'rgba(153, 102, 255, 1)',
                            borderWidth: 1,
                        },
                        {
                            label: 'Idade Média (meses)',
                            data: lotesData.map(lote => lote.idade_media),
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            borderColor: 'rgba(255, 99, 132, 1)',
                            borderWidth: 1,
                        }
                    ],
                });
            } catch (error) {
                console.error("Erro ao buscar dados:", error);
            }
        };

        fetchData();
    }, [token]);

    return (
        <div>
            <h2>Gráfico de Lotes</h2>
            <Bar data={data} />
            
            <h2>Detalhes dos Lotes</h2>
            <table className="table">
                <thead>
                    <tr>
                        <th>Número do Lote</th>
                        <th>Quantidade</th>
                        <th>Peso (kg)</th>
                        <th>Valor Individual (R$)</th>
                        <th>Idade Média (meses)</th>
                    </tr>
                </thead>
                <tbody>
                    {lotes.map((lote) => (
                        <tr key={lote.numero_lote}>
                            <td>{lote.numero_lote}</td>
                            <td>{lote.quantidade}</td>
                            <td>{lote.peso}</td>
                            <td>{lote.valor_individual}</td>
                            <td>{lote.idade_media}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DashboardClient;
