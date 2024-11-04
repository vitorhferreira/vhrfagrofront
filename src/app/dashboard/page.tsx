// src/app/dashboard/page.tsx
import { LayoutDashboard } from "@/components/LayoutDashboard";
import { cookies } from 'next/headers';
import { redirect } from "next/navigation";
import DashboardClient from "./dashboardClient"; // Importando o componente do gráfico

export default async function Page() {
    const cookie = await cookies(); // Aguarde a leitura do cookie
    const logado = cookie.get('logado');

    // Verificando se o usuário está logado
    if (!logado || logado.value !== 'true') {
        return (
            <div>
                <p>Usuário não está logado.</p>
            </div>
        );
    }

    return (
        <>
            <LayoutDashboard token={logado.value}>
                <div className="container-fluid">
                    <div className="row">
                        <main className="col-md-12 ms-sm-auto col-lg-10 px-md-4 d-flex flex-column">
                            <div className="my-4">
                                <h2>Dashboard</h2>
                                <DashboardClient token={logado.value} /> {/* Componente do gráfico */}
                            </div>
                        </main>
                    </div>
                </div>

                {/* Rodapé clean */}
                <main className="col-md-12 ms-sm-auto col-lg-10 px-md-4 d-flex flex-column">
                    <footer className="py-3 mt-auto">
                        <div className="container">
                            <div className="row">
                                <div className="col-md-6">
                                    
                                </div>
                                <div className="col-md-6 text-md-end">
                                    <h6>Endereço:</h6>
                                    <p className="mb-0" style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                                        Rua Fictícia, 123 - Umuarama/PR
                                    </p>
                                    <p className="mb-0" style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                                        CEP: 12345-678 - Telefone: (44) 3456-7890
                                    </p>
                                    <h6>Desenvolvido por Vitor e Renan</h6>
                                </div>
                            </div>
                        </div>
                    </footer>
                </main>
            </LayoutDashboard>
        </>
    );
}
