'use client'
import { SyntheticEvent, useCallback, useEffect, useRef, useState } from 'react';
import styles from './style.module.css';
import axios from 'axios';
import { Toast } from '@/components/Toast';
import { Loading } from '@/components/Loading';
import { useRouter } from 'next/navigation';
import { destroyCookie, setCookie } from 'nookies';

const Login = () => {
    const router = useRouter();
    const refForm = useRef<any>();
    const [toast, setToast] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {setCookie(undefined, 'logado', 'false');},[])

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

    return (
        <>
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
                        src="https://png.pngtree.com/template/20190316/ourmid/pngtree-medical-health-logo-image_79571.jpg" 
                        alt="logo de vacina" 
                        width={500} 
                        height={300} 
                    />
                    <div className="d-flex flex-column align-items-center">
                        <h1 className="text-primary">Sistema de Saúde </h1>
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
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Digite sua senha!"
                                id="senha"
                                required
                            />
                            <div className="invalid-feedback">
                                Por favor digite sua senha!
                            </div>
                        </div>
                        <div className="col-md-12 mt-3">
                            <button
                                className="btn btn-primary w-100"
                                type="submit"
                                id="botao"
                            >
                                Entrar
                            </button>
                        </div>
                        <div className="col-md-12 mt-3">
                            <button
                                className="btn btn-outline-primary w-100"
                                type="button"
                                onClick={() => {
                                    router.push('/cadastro_usuario');
                                }}
                            >
                                Cadastrar seu Usuário
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Login;
