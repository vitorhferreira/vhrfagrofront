// src/app/dashboard/page.tsx
import { LayoutDashboard } from "@/components/LayoutDashboard";
import { cookies } from 'next/headers';
import { redirect } from "next/navigation";
import DashboardClient from "./dashboardClient"; // Importando o componente do gráfico

export default async function Page() {
    const cookie = cookies();
    const logado = cookie.get('logado');

    // Verificando se o usuário está logado
    if (!logado || logado.value !== 'true') {
        redirect('/login');
        return null; // Para evitar renderizar conteúdo se não autenticado
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

                {/* Rodapé com redes sociais e endereço */}
                <main className="col-md-12 ms-sm-auto col-lg-10 px-md-4 d-flex flex-column">
                    <footer className="bg-primary text-white py-4 mt-auto">
                        <div className="container">
                            <div className="row">
                                <div className="col-md-6">
                                    <h3>Redes Sociais:</h3>
                                    <h4>@VHRF AGRO</h4>
                                    <ul className="list-unstyled d-flex justify-content-start">
                                        <li className="me-3">
                                            <a href="#">
                                                <i className="bi bi-facebook fs-3"></i>
                                            </a>
                                        </li>
                                        <li className="me-3">
                                            <a href="#">
                                                <i className="bi bi-twitter fs-3"></i>
                                            </a>
                                        </li>
                                        <li className="me-3">
                                            <a href="#">
                                                <i className="bi bi-instagram fs-3"></i>
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                                <div className="col-md-6">
                                    <h3>Endereço:</h3>
                                    <p>Rua Fictícia, 123 - Umuarama/PR</p>
                                    <p>CEP: 12345-678 - Telefone: (44) 3456-7890</p>
                                </div>
                            </div>
                        </div>
                    </footer>
                </main>
            </LayoutDashboard>
        </>
    );
}
