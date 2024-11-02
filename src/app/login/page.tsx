'use client';
import { SyntheticEvent, useCallback, useEffect, useRef, useState } from 'react';
import styles from './style.module.css';
import axios from 'axios';
import { Toast } from '@/components/Toast';
import { Loading } from '@/components/Loading';
import { useRouter } from 'next/navigation';
import { destroyCookie, setCookie } from 'nookies';
import 'bootstrap-icons/font/bootstrap-icons.css'; // Importar ícones do Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'; // Importando o CSS do Bootstrap

// Função para remover a máscara antes de enviar ao backend
const removerMascara = (valor: string) => valor.replace(/\D/g, '');

// Função de formatação do CPF/CNPJ para exibir no frontend
const formatarCpfCnpj = (valor: string) => {
    valor = valor.replace(/\D/g, ''); // Remove tudo que não for dígito
    if (valor.length <= 11) {
        // CPF
        valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
        valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
        valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
        // CNPJ
        valor = valor.replace(/^(\d{2})(\d)/, '$1.$2');
        valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
        valor = valor.replace(/\.(\d{3})(\d)/, '.$1/$2');
        valor = valor.replace(/(\d{4})(\d)/, '$1-$2');
    }
    return valor;
};

const Login = () => {
    const router = useRouter();
    const refForm = useRef<any>();
    const [toast, setToast] = useState(false);
    const [loading, setLoading] = useState(false); // Modal de carregamento geral
    const [senhaVisivel, setSenhaVisivel] = useState(false);
    const [forgotPasswordModal, setForgotPasswordModal] = useState(false);
    const [cpfCnpj, setCpfCnpj] = useState(''); // Estado para o CPF/CNPJ
    const [email, setEmail] = useState('');
    const [emailToast, setEmailToast] = useState(false);
    const [emailErrorModal, setEmailErrorModal] = useState(false); // Estado para mostrar o modal de erro
    const [emailSuccessModal, setEmailSuccessModal] = useState(false); // Estado para mostrar o modal de sucesso
    const [isEmailLoading, setIsEmailLoading] = useState(false); // Controle para mostrar o modal de carregamento

    useEffect(() => { setCookie(undefined, 'logado', 'false'); }, []);

    // Função de login
    const submitForm = useCallback((e: SyntheticEvent) => {
        e.preventDefault();
    
        if (refForm.current.checkValidity()) {
            setLoading(true);
    
            const target = e.target as typeof e.target & {
                senha: { value: string };
            };
    
            // Remover a máscara antes de enviar o CPF ao backend
            const cpfCnpjSemMascara = removerMascara(cpfCnpj);
    
            axios.post('http://127.0.0.1:8000/api/login', {
                cpf: cpfCnpjSemMascara,
                senha: target.senha.value,
            })
                .then((resposta) => {
                    // Configura os cookies logado e userId com base na resposta do backend
                    const { id, tipo_usuario } = resposta.data.user;
    
                    setCookie(null, 'logado', 'true', {
                        maxAge: 30 * 24 * 60 * 60,
                        path: '/',
                    });
                    setCookie(null, 'userId', id, {
                        maxAge: 30 * 24 * 60 * 60,
                        path: '/',
                    });
                    setCookie(null, 'tipo_usuario', tipo_usuario, {
                        maxAge: 30 * 24 * 60 * 60,
                        path: '/',
                    });
    
                    router.push('/dashboard'); // Redireciona após login
                    setLoading(false);
                })
                .catch((err) => {
                    console.log(err);
                    setToast(true);
                    setLoading(false);
                });
        } else {
            refForm.current.classList.add('was-validated');
        }
    }, [cpfCnpj]);

    // Função para solicitar redefinição de senha
    const handleForgotPassword = async () => {
        setIsEmailLoading(true); // Inicia o modal de carregamento

        try {
            await axios.post('http://127.0.0.1:8000/api/solicitar-redefinicao-senha', { email });
            setEmailSuccessModal(true); // Mostra o modal de sucesso
            setForgotPasswordModal(false);
        } catch (error: any) {
            console.log('Erro ao enviar o e-mail de redefinição:', error);

            if (error.response && error.response.status === 400) {
                setEmailErrorModal(true); // Mostra o modal de erro quando já existe um e-mail enviado
            } else {
                // Caso outro erro ocorra, também mostramos o modal de erro
                console.log('Erro não tratado:', error.message);
                setEmailErrorModal(true);
            }
        } finally {
            setIsEmailLoading(false); // Para o modal de carregamento
        }
    };

    return (
        <>
            <link rel="icon" href="/logotcc.jpeg" />
            <Loading loading={loading} />
            <Toast
                show={toast}
                message="Dados Inválidos"
                colors="danger"
                onClose={() => {
                    setToast(false);
                }}
            />
            <div className={styles.main}>
                <div className={styles.border}>
                    <img
                        className={styles.logo}
                        src="/logotcc.jpeg"
                        alt="logo"
                        width={500}
                        height={300}
                    />
                    <div className="d-flex flex-column align-items-center">
                        <h1 className="text-primary"></h1>
                        <p className="text-secondary">
                            Preencha os campos para entrar no sistema!
                        </p>
                    </div>
                    <hr />
                    <form
                        className="needs-validation align-items-center"
                        noValidate
                        onSubmit={submitForm}
                        ref={refForm}
                    >
                        <div className="col-md-12">
                            <label htmlFor="cpf" className="form-label">
                                CPF:
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Digite seu CPF!"
                                id="cpf"
                                value={cpfCnpj} // Valor do CPF/CNPJ com máscara
                                onChange={(e) => setCpfCnpj(formatarCpfCnpj(e.target.value))} // Aplica a máscara
                                required
                            />
                            <div className="invalid-feedback">
                                Por favor digite seu CPF!
                            </div>
                        </div>
                        <div className="col-md-12 mt-1">
                            <label htmlFor="senha" className="form-label">
                                Senha:
                            </label>
                            <div className="input-group">
                                <input
                                    type={senhaVisivel ? 'text' : 'password'}
                                    className="form-control"
                                    placeholder="Digite sua senha!"
                                    id="senha"
                                    required
                                />
                                <span className="input-group-text" style={{ cursor: 'pointer' }} onClick={() => setSenhaVisivel(!senhaVisivel)}>
                                    <i className={`bi ${senhaVisivel ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                </span>
                            </div>
                            <div className="invalid-feedback">
                                Por favor, digite sua senha!
                            </div>
                        </div>
                        <div className="col-md-12 mt-3">
                            <button
                                className="btn w-100"
                                type="submit"
                                id="botao"
                                style={{ backgroundColor: 'green', color: 'yellow', borderColor: 'green' }}
                            >
                                Entrar
                            </button>
                        </div>
                        <div className="col-md-12 mt-3">
                            <button
                                className="btn btn-outline-success w-100"
                                type="button"
                                onClick={() => setForgotPasswordModal(true)}
                            >
                                <i className="bi bi-lock-fill"></i> Esqueci a Senha
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Modal de Esqueci a Senha */}
            <div className={`modal fade ${forgotPasswordModal ? 'show' : ''}`} style={{ display: forgotPasswordModal ? 'block' : 'none' }} tabIndex={-1} role="dialog">
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Esqueci a Senha</h5>
                        </div>
                        <div className="modal-body">
                            <p>Digite seu e-mail para receber o link de redefinição:</p>
                            <input
                                type="email"
                                className="form-control"
                                placeholder="Seu e-mail"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-primary"
                                onClick={handleForgotPassword}
                            >
                                <i className="bi bi-envelope-fill"></i> Enviar
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setForgotPasswordModal(false)}
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Carregando (exibido durante a requisição de redefinição de senha) */}
            <div className={`modal fade ${isEmailLoading ? 'show' : ''}`} style={{ display: isEmailLoading ? 'block' : 'none' }} tabIndex={-1} role="dialog">
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <div className="modal-body text-center">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Carregando...</span>
                            </div>
                            <p>Aguarde, estamos processando seu pedido...</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Sucesso no Envio do E-mail */}
            <div className={`modal fade ${emailSuccessModal ? 'show' : ''}`} style={{ display: emailSuccessModal ? 'block' : 'none' }} tabIndex={-1} role="dialog">
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">E-mail Enviado</h5>
                        </div>
                        <div className="modal-body">
                            <p>O link de redefinição de senha foi enviado com sucesso! Ele é válido por 30 minutos.</p>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setEmailSuccessModal(false)}
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Erro no Envio do E-mail */}
            <div className={`modal fade ${emailErrorModal ? 'show' : ''}`} style={{ display: emailErrorModal ? 'block' : 'none' }} tabIndex={-1} role="dialog">
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Erro no Envio do E-mail</h5>
                        </div>
                        <div className="modal-body">
                            <p>Já foi enviado um e-mail de redefinição de senha recentemente. Por favor, tente novamente após 30 minutos.</p>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setEmailErrorModal(false)}
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;
