'use client';
import { useEffect, useState } from "react";
import { parseCookies } from "nookies";
import { useRouter, usePathname } from "next/navigation";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faSyringe, faFileInvoiceDollar, faDrumstickBite, faExclamationTriangle, faCashRegister, faChartBar, faUserCog, faUser, faCaretDown, faRobot, faSearch } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

interface IProps {
    children: React.ReactNode;
    token: string | undefined;
}

interface IUser {
    id: number;
    nome: string;
    cpf: string;
    email: string;
    tipo_usuario: string;
}

export const LayoutDashboard = (props: IProps) => {
    const router = useRouter();
    const pathname = usePathname(); // Obtenha o caminho atual
    const cookies = parseCookies();
    const userId = cookies.userId;
    const logado = cookies.logado === 'true';
    const [showReports, setShowReports] = useState(false);
    const [user, setUser] = useState<IUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!logado || !userId) {
            router.push('/login');
        } else {
            axios.get<IUser>(`http://127.0.0.1:8000/api/user/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${props.token}`
                }
            })
            .then(response => {
                const userData = response.data;
                console.log("Dados do usuário:", userData);
                setUser(userData);
                setLoading(false);

                // Verifique se o usuário tem permissão para acessar a rota atual
                const forbiddenRoutes = ['/vendas', '/listausuario', '/relatorio'];
                if (userData.tipo_usuario === 'funcionario' && forbiddenRoutes.some(route => pathname.startsWith(route))) {
                    alert('Acesso negado!');
                    router.push('/dashboard'); // Redireciona para uma página permitida
                }
            })
            .catch(error => {
                console.error("Erro ao buscar dados do usuário:", error);
                router.push('/login');
            });
        }
    }, [logado, userId, pathname]); // Adicione `pathname` às dependências

    const toggleReports = () => setShowReports(!showReports);

    // Renderiza os componentes apenas após o carregamento completo
    if (loading) return null;

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
                    <nav id="sidebarMenu" className="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse" style={{ overflowY: 'auto', maxHeight: '100vh' }}>
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
                                        <FontAwesomeIcon icon={faUser} size="lg" style={{ marginRight: '10px' }} />
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
                                    <a className="nav-link" href={'/ia'}>
                                        <FontAwesomeIcon icon={faRobot} size="lg" style={{ marginRight: '10px' }} />
                                        IA Recomendação de Alimentação
                                    </a>
                                </li>
                                <li className="nav-item mb-3">
                                    <a className="nav-link" href={'/percas'}>
                                        <FontAwesomeIcon icon={faExclamationTriangle} size="lg" style={{ marginRight: '10px' }} />
                                        Percas
                                    </a>
                                </li>
                                <li className="nav-item mb-3">
                                    <a className="nav-link" href={'/gastosracao'}>
                                        <FontAwesomeIcon icon={faDrumstickBite} size="lg" style={{ marginRight: '10px' }} />
                                        Consumo de Ração
                                    </a>
                                </li>

                                {/* Campos visíveis apenas para o administrador */}
                                {user && user.tipo_usuario === 'admin' && (
                                    <>
                                        <li className="nav-item mb-3">
                                            <a className="nav-link" href={'/vendas'}>
                                                <FontAwesomeIcon icon={faCashRegister} size="lg" style={{ marginRight: '10px' }} />
                                                Registrar Venda
                                            </a>
                                        </li>
                                        <li className="nav-item mb-3">
                                            <button className="btn nav-link d-flex align-items-center" onClick={toggleReports}>
                                                <FontAwesomeIcon icon={faChartBar} size="lg" style={{ marginRight: '10px' }} />
                                                Relatórios
                                                <FontAwesomeIcon icon={faCaretDown} style={{ marginLeft: '5px' }} />
                                            </button>
                                            {showReports && (
                                                <ul className="nav flex-column ms-3">
                                                    <li className="nav-item mb-2">
                                                        <a className="nav-link" href={'/relatorio/vendas'}>
                                                            Relatório de Vendas
                                                        </a>
                                                    </li>
                                                    <li className="nav-item mb-2">
                                                        <a className="nav-link" href={'/relatorio/vacinas'}>
                                                            Relatório de Vacinas
                                                        </a>
                                                    </li>
                                                    <li className="nav-item mb-2">
                                                        <a className="nav-link" href={'/relatorio/pesos'}>
                                                            Relatório de Pesos
                                                        </a>
                                                    </li>
                                                    <li className="nav-item mb-2">
                                                        <a className="nav-link" href={'/relatorio/anotacoes'}>
                                                            Relatório de Anotações Individuais
                                                        </a>
                                                    </li>
                                                    <li className="nav-item mb-2">
                                                        <a className="nav-link" href={'/relatorio/racao'}>
                                                            Relatório de Consumo de Rações
                                                        </a>
                                                    </li>
                                                    <li className="nav-item mb-2">
                                                        <a className="nav-link" href={'/relatorio/CustoUnitario'}>
                                                            Custo Unitario
                                                        </a>
                                                    </li>
                                                </ul>
                                            )}
                                        </li>
                                        <li className="nav-item mb-3">
                                            <a className="nav-link" href="/listausuario">
                                                <FontAwesomeIcon icon={faUserCog} size="lg" style={{ marginRight: '10px' }} />
                                                Manutenção de Usuários
                                            </a>
                                        </li>
                                        <li className="nav-item mb-3">
                                            <a className="nav-link" href="https://www.cepea.esalq.usp.br/br/indicador/boi-gordo.aspx" target="_blank" rel="noopener noreferrer">
                                                <FontAwesomeIcon icon={faSearch} size="lg" style={{ marginRight: '10px' }} />
                                                Consultar Arroba Boi Gordo
                                            </a>
                                        </li>
                                    </>
                                )}
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