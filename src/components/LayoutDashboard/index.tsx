'use client';
import { useEffect } from "react";
import { parseCookies } from "nookies";
import { redirect } from "next/navigation";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faSyringe, faFileInvoiceDollar, faDrumstickBite, faExclamationTriangle, faCashRegister, faChartBar, faUserCog, faUser } from '@fortawesome/free-solid-svg-icons'; // Importando o ícone de usuário

interface IProps {
    children: React.ReactNode;
    token: string | undefined;
}

export const LayoutDashboard = (props: IProps) => {
    const cookie = parseCookies(undefined, 'logado');

    useEffect(() => {
        if (!cookie || cookie.logado !== 'true') {
            redirect('/login');
        }
    }, []);

    return (
        <>
            <link rel="icon" href="/logotcc.jpeg" />
            <header className="navbar navbar-dark sticky-top bg-primary flex-md-nowrap p-0">
                <a className="navbar-brand col-md-3 col-lg-2 me-0 px-3" href="/dashboard">
                    <img src="/favicon.png"
                        alt="logo" style={{ width: '80px', height: 'auto' }} />
                </a>
                <button className="navbar-toggler position-absolute d-md-none collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#sidebarMenu" aria-controls="sidebarMenu" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="w-100"></div>
                <div className="navbar-nav">
                    <div className="nav-item text-nowrap">
                        <a className="nav-link px-3" href="/login">
                            <i className="bi bi-box-arrow-right" style={{ marginRight: '5px' }}></i> 
                            Sair
                        </a>
                    </div>
                </div>
            </header>

            <div className="container-fluid">
                <div className="row">
                    <nav id="sidebarMenu" className="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse">
                        <div className="position-sticky pt-3">
                            <ul className="nav flex-column" style={{ marginTop: '60px' }}>
                                <li className="nav-item mb-3">
                                    <a className="nav-link" href={'/lotes'}>
                                        <FontAwesomeIcon icon={faBox} size="lg" style={{ marginRight: '10px' }} />
                                        Registrar Lote
                                    </a>
                                </li>
                                <li className="nav-item mb-3">
                                    <a className="nav-link" href={'/individual'}>
                                        <FontAwesomeIcon icon={faUser} size="lg" style={{ marginRight: '10px' }} /> {/* Ícone de usuário */}
                                        Acompanhamento Individual
                                    </a>
                                </li>
                                <li className="nav-item mb-3">
                                    <a className="nav-link" href={'/Vacinas'}>
                                        <FontAwesomeIcon icon={faSyringe} size="lg" style={{ marginRight: '10px' }} />
                                        Vacinas
                                    </a>
                                </li>
                                <li className="nav-item mb-3">
                                    <a className="nav-link" href={'/gastosVet'}>
                                        <FontAwesomeIcon icon={faFileInvoiceDollar} size="lg" style={{ marginRight: '10px' }} />
                                        Despesas e Pagamentos
                                    </a>
                                </li>
                                <li className="nav-item mb-3">
                                    <a className="nav-link" href={'/percas'}>
                                        <FontAwesomeIcon icon={faExclamationTriangle} size="lg" style={{ marginRight: '10px' }} /> {/* Ícone de alerta */}
                                        Percas
                                    </a>
                                </li>
                                <li className="nav-item mb-3">
                                    <a className="nav-link" href={'/gastosracao'}>
                                        <FontAwesomeIcon icon={faDrumstickBite} size="lg" style={{ marginRight: '10px' }} />
                                        Consumo de Ração
                                    </a>
                                </li>
                                <li className="nav-item mb-3">
                                    <a className="nav-link" href={'/vendas'}>
                                        <FontAwesomeIcon icon={faCashRegister} size="lg" style={{ marginRight: '10px' }} />
                                        Registrar Venda
                                    </a>
                                </li>
                                <li className="nav-item mb-3">
                                    <a className="nav-link" href={'/relatorio'}>
                                        <FontAwesomeIcon icon={faChartBar} size="lg" style={{ marginRight: '10px' }} />
                                        Relatórios
                                    </a>
                                </li>
                                <li className="nav-item mb-3">
                                    <a className="btn btn-warning" href="/listausuario">
                                        <FontAwesomeIcon icon={faUserCog} size="lg" style={{ marginRight: '10px' }} />
                                        Manutenção de Usuários
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </nav>

                    <main className="col-md-12 ms-sm-auto col-lg-12 px-md-4">
                        {props.children}
                    </main>
                </div>
            </div>
        </>
    );
};
