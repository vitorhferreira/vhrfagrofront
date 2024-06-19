import { validaPermissao } from "@/services/token"
import { ReactNode } from "react"

interface IProps {
    children: ReactNode
    token: string | undefined
}

export const LayoutDashboard = (props: IProps) => {
    return (
        <>
            <header
                className="navbar navbar-dark sticky-top bg-dark flex-md-nowrap p-0"
            >
                <a className="navbar-brand col-md-3 col-lg-2 me-0 px-3"
                    href="/dashboard">
                    Sistema de Saude
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
                        <a className="nav-link px-3" href="/login">Sair</a>
                    </div>
                </div>
            </header>

            <div className="container-fluid">
                <div className="row">
                    <nav
                        id="sidebarMenu"
                        className="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse"
                    >
                        <div className="position-sticky pt-3">
                            <ul className="nav flex-column">
                                <li className="nav-item">
                                    <a
                                        className={`nav-link`}
                                        href={'/dashboard'}
                                    >
                                        <span data-feather="home"></span>
                                        Suas Vacinas
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a
                                        className={`nav-link`}
                                        href={'/agendamentos'}
                                    >
                                        <span data-feather="home"></span>
                                        Agendamentos
                                    </a>
                                </li>
                                {
                                    validaPermissao(props.token,
                                        ['admin', 'visitante']
                                    ) &&
                                    <li className="nav-item">
                                        <a
                                            className={`nav-link`}
                                            href={'/usuarios'}
                                        >
                                            <span data-feather="home"></span>
                                            Usuários
                                        </a>
                                    </li>
                                }
                            </ul>
                        </div>
                    </nav>

                    <main
                        className="col-md-9 ms-sm-auto col-lg-10 px-md-4"
                    >
                        {props.children}
                    </main>

                </div>
            </div>
        </>
    )
}