'use client'
import { validaPermissao } from "@/services/token";
import { redirect } from "next/navigation";
import { destroyCookie, parseCookies } from "nookies";
import { ReactNode, useEffect } from "react";


interface IProps {
    children: ReactNode;
    token: string | undefined;
}

export const LayoutDashboard = (props: IProps) => {
    const cookie = parseCookies(undefined,'logado')

    useEffect(() => {
        console.log(cookie.logado)
        if (!cookie || cookie.logado !== 'true') {
          redirect('/login');
        }
    },[])
    
    return (
        <>
            <header className="navbar navbar-dark sticky-top bg-primary flex-md-nowrap p-0">
                <a className="navbar-brand col-md-3 col-lg-2 me-0 px-3" href="/dashboard">
                    <span className="fs-4 fw-bold">VHRF AGRO</span>
                </a>
                <button
                    className="navbar-toggler position-absolute d-md-none collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#sidebarMenu"
                    aria-controls="sidebarMenu"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="w-100"></div>
                <div className="navbar-nav">
                    <div className="nav-item text-nowrap">
                        <a className="nav-link px-3" href="/login" >Sair</a>
                    </div>
                </div>
            </header>

            <div className="container-fluid">
                <div className="row">
                    <nav id="sidebarMenu" className="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse">
                        <div className="position-sticky pt-3">
                            <ul className="nav flex-column">
                                <li className="nav-item mb-3">
                                    <a className={`nav-link`} href={'/lotes'}>
                                        <span data-feather="home"></span>
                                        Registrar Lote
                                    </a>
                                </li>
                                <li className="nav-item mb-3">
                                    <a className={`nav-link`} href={'/Vacinas'}>
                                        <span data-feather="home"></span>
                                        Vacinas
                                    </a>
                                </li>
                                <li className="nav-item mb-3">
                                    <a className={`nav-link`} href={'/gastosVet'}>
                                        <span data-feather="home"></span>
                                        Despesas e Pagamentos
                                    </a>
                                </li>
                                <li className="nav-item mb-3">
                                    <a className={`nav-link`} href={'/racao'}>
                                        <span data-feather="home"></span>
                                        Consumo de Ração
                                    </a>
                                </li>
                                <li className="nav-item mb-3">
                                    <a className={`nav-link`} /*href={'/agendamentos'}*/>
                                        <span data-feather="home"></span>
                                        Registrar Venda
                                    </a>
                                </li>
                                <li className="nav-item mb-3">
                                    <a className={`nav-link`} /*href={'/relatorios'}*/>
                                        <span data-feather="home"></span>
                                        Relatorios
                                    </a>
                                </li>

                                <li className="nav-item mb-3">
                                    <a className="btn btn-warning" href="/listausuario">Manutenção de Usuários</a>
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
