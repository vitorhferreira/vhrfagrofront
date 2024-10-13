'use client';

import { useState, useEffect, SyntheticEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // useSearchParams para obter o token da URL
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css'; // Importar ícones do Bootstrap

const RedefinirSenha = () => {
  const router = useRouter();
  const searchParams = useSearchParams(); // Obter os parâmetros de consulta da URL
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [token, setToken] = useState('');
  const [erro, setErro] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  // Obter o token da URL quando a página carregar
  useEffect(() => {
    const tokenFromURL = searchParams.get('token');
    if (tokenFromURL) {
      setToken(tokenFromURL); // Preencher o campo de token
    }
  }, [searchParams]);

  const validarSenha = (senha: string) => {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;
    return regex.test(senha);
  };

  const handleRedefinirSenha = async (e: SyntheticEvent) => {
    e.preventDefault();

    if (!validarSenha(senha)) {
      setErro('A senha deve ter pelo menos 1 letra maiúscula, 1 número e 1 caractere especial.');
      return;
    }

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    setErro('');

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/redefinir-senha', {
        token: token,
        senha: senha,
      });

      if (response.status === 200) {
        setSuccessMessage('Senha redefinida com sucesso!');
        setTimeout(() => {
          router.push('/login'); // Redireciona para a tela de login após redefinir a senha
        }, 3000);
      }
    } catch (error) {
      setErro('Erro ao redefinir senha. Verifique se o token é válido.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex flex-column align-items-center mt-5">
      <div className="card p-4" style={{ maxWidth: '500px', width: '100%' }}>
        {/* Centralizar a imagem */}
        <div className="d-flex justify-content-center mb-4">
          <img
            src="/logotcc.jpeg"
            alt="logo"
            style={{ width: '80px', height: 'auto' }}
          />
        </div>
        <h2 className="text-center mb-4">Redefinir Senha</h2>
        {erro && <div className="alert alert-danger">{erro}</div>}
        {successMessage && <div className="alert alert-success">{successMessage}</div>}

        <form onSubmit={handleRedefinirSenha}>
          {/* Campo oculto para o token */}
          <input
            type="hidden"
            id="token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          />

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
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
              <span
                className="input-group-text"
                style={{ cursor: 'pointer' }}
                onClick={() => setSenhaVisivel(!senhaVisivel)}
              >
                <i className={`bi ${senhaVisivel ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </span>
            </div>
            <div className="invalid-feedback">Por favor, digite sua senha!</div>
          </div>

          <div className="col-md-12 mt-3">
            <label htmlFor="confirmarSenha" className="form-label">
              Confirmar Senha:
            </label>
            <div className="input-group">
              <input
                type={senhaVisivel ? 'text' : 'password'}
                className="form-control"
                placeholder="Confirme sua senha!"
                id="confirmarSenha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                required
              />
              <span
                className="input-group-text"
                style={{ cursor: 'pointer' }}
                onClick={() => setSenhaVisivel(!senhaVisivel)}
              >
                <i className={`bi ${senhaVisivel ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </span>
            </div>
            <div className="invalid-feedback">Por favor, confirme sua senha!</div>
          </div>

          {/* Separar o botão de redefinir senha */}
          <div className="mt-4">
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? 'Redefinindo...' : 'Redefinir Senha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RedefinirSenha;
