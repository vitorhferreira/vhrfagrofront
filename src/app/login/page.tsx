'use client'
import { SyntheticEvent, useCallback, useEffect, useRef, useState } from 'react';
import styles from './style.module.css';
import axios from 'axios';
import { Toast } from '@/components/Toast';
import { Loading } from '@/components/Loading';
import { useRouter } from 'next/navigation';
import { destroyCookie, setCookie } from 'nookies';
import 'bootstrap-icons/font/bootstrap-icons.css'; // Importar ícones do Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'; // Importando o CSS do Bootstrap

const Login = () => {
    const router = useRouter();
    const refForm = useRef<any>();
    const [toast, setToast] = useState(false);
    const [loading, setLoading] = useState(false);
    const [senhaVisivel, setSenhaVisivel] = useState(false);
    const [forgotPasswordModal, setForgotPasswordModal] = useState(false);
    const [email, setEmail] = useState('');
    const [emailToast, setEmailToast] = useState(false);

    useEffect(() => { setCookie(undefined, 'logado', 'false'); }, [])

    // Função de login
    const submitForm = useCallback((e: SyntheticEvent) => {
        e.preventDefault();

        if (refForm.current.checkValidity()) {
            setLoading(true);

            const target = e.target as typeof e.target & {
                cpf: { value: string };
                senha: { value: string };
            };

            axios.post('http://127.0.0.1:8000/api/login', {
                cpf: target.cpf.value,
                senha: target.senha.value,
            })
                .then((resposta) => {
                    setCookie(undefined, 'logado', 'true');
                    router.push('/dashboard');
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
    }, []);

    // Função para solicitar redefinição de senha
    const handleForgotPassword = async () => {
        try {
            await axios.post('http://127.0.0.1:8000/api/solicitar-redefinicao-senha', { email });
            setEmailToast(true);
            setForgotPasswordModal(false);
        } catch (error) {
            console.error(error);
            alert('Erro ao enviar o e-mail de redefinição de senha. Tente novamente.');
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
            <Toast
                show={emailToast}
                message="E-mail de redefinição enviado com sucesso!"
                colors="success"
                onClose={() => {
                    setEmailToast(false);
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
                                type="number"
                                className="form-control"
                                placeholder="Digite seu CPF!"
                                id="cpf"
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
        </>
    );
};

export default Login;
