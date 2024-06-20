// src/app/cadastro/page.tsx
'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Corrigindo importação para useRouter
import axios from 'axios';

const Cadastro = () => {
    const router = useRouter();

    const [nome, setNome] = useState<string>('');
    const [cpf, setCpf] = useState<number | string>(''); // CPF agora é do tipo número ou string
    const [senha, setSenha] = useState<string>('');
    const [idade, setIdade] = useState<number>(0);
    const [cadastrado, setCadastrado] = useState<boolean>(false); // Estado para controlar exibição da mensagem de cadastro

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log('Formulário enviado:', { nome, cpf, senha, idade });
        
        // Exemplo de requisição usando axios para enviar os dados para a API
        try {
            const response = await axios.post('/api/cadastro', {
                nome,
                cpf,
                senha,
                idade
            });
            console.log('Cadastro realizado com sucesso!', response.data);
            setCadastrado(true); // Define o estado para exibir mensagem de cadastro
            // Limpa os campos após o cadastro
            setNome('');
            setCpf('');
            setSenha('');
            setIdade(0);
            setTimeout(() => {
                setCadastrado(false); // Após 3 segundos, esconde a mensagem de cadastro
                router.push('/login'); // Redireciona para a página de login após o cadastro
            }, 3000);
        } catch (error) {
            console.error('Erro ao cadastrar usuário:', error);
            // Tratamento de erro, exibição de mensagem, etc.
        }
    };

    const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, ''); // Remove caracteres não numéricos
        if (value.length <= 11) { // Limita o tamanho do CPF para 11 dígitos
            setCpf(value);
        }
    };

    return (
        <div className="container mt-5">
            <div className="card">
                <div className="card-body">
                    <h2 className="text-primary">Cadastro de Usuário</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="nome" className="form-label">Nome</label>
                            <input
                                type="text"
                                className="form-control"
                                id="nome"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="cpf" className="form-label">CPF</label>
                            <input
                                type="number"
                                className="form-control"
                                id="cpf"
                                value={cpf}
                                onChange={handleCpfChange} // Usa a função de mudança de CPF personalizada
                                maxLength={11} // Limita o campo de CPF a 11 caracteres visíveis
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="senha" className="form-label">Senha</label>
                            <input
                                type="password"
                                className="form-control"
                                id="senha"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="idade" className="form-label">Idade</label>
                            <input
                                type="number"
                                className="form-control"
                                id="idade"
                                value={idade || ''}
                                onChange={(e) => setIdade(parseInt(e.target.value))}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary">Cadastrar</button>
                    </form>
                    {cadastrado && (
                        <div className="alert alert-success mt-3" role="alert">
                            Usuário cadastrado com sucesso! Redirecionando para o login...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Cadastro;
