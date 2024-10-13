'use client'

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { LayoutDashboard } from '@/components/LayoutDashboard';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import 'bootstrap-icons/font/bootstrap-icons.css'; // Importar ícones do Bootstrap

// Interface para os dados do usuário
interface Usuario {
  nome: string;
  cpf: string;
  email: string; // Novo campo de e-mail
  senha: string;
  confirmarSenha: string;
}

const CadastroForm = ({ onUsuarioCadastrado }: { onUsuarioCadastrado: () => void }) => {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<Usuario>();
  const [loading, setLoading] = useState(false);
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [confirmarSenhaVisivel, setConfirmarSenhaVisivel] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false); // Modal de erro
  const [errorMessage, setErrorMessage] = useState(''); // Mensagem de erro
  const senha = watch('senha'); // Obter valor do campo "senha"

  const senhaValida = (senha: string) => {
    // Verifica se a senha atende aos critérios: maiúsculas, números e caracteres especiais
    const regex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/;
    return regex.test(senha);
  };

  const verificarUsuarioExistente = async (cpf: string, email: string) => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/verificarUsuario', { cpf, email });
      
      if (response.data.cpfExistente || response.data.emailExistente) {
        return {
          cpfExistente: response.data.cpfExistente,
          emailExistente: response.data.emailExistente
        };
      }

      return null; // Caso o CPF e o email não estejam cadastrados
    } catch (error) {
      console.error('Erro ao verificar usuário:', error);
      return { error: 'Erro ao verificar usuário.' };
    }
  };

  const onSubmit = async (data: Usuario) => {
    setLoading(true);
    try {
      // Verificar se o CPF ou o e-mail já estão cadastrados
      const usuarioExistente = await verificarUsuarioExistente(data.cpf, data.email);

      if (usuarioExistente?.cpfExistente || usuarioExistente?.emailExistente) {
        // Exibir modal de erro
        if (usuarioExistente.cpfExistente && usuarioExistente.emailExistente) {
          setErrorMessage('CPF e e-mail já estão cadastrados.');
        } else if (usuarioExistente.cpfExistente) {
          setErrorMessage('CPF já está cadastrado.');
        } else if (usuarioExistente.emailExistente) {
          setErrorMessage('E-mail já está cadastrado.');
        }
        setShowErrorModal(true);
        setLoading(false);
        return;
      }

      // Remover a confirmação de senha dos dados enviados ao servidor
      const { confirmarSenha, ...userData } = data;

      const response = await axios.post('http://127.0.0.1:8000/api/caduser', userData);

      if (parseInt(response.data.sucesso) === 99) {
        toast.warning('CPF inválido');
        return;
      }

      toast.success('Usuário cadastrado com sucesso!');
      onUsuarioCadastrado();
      reset(); // Limpa o formulário
    } catch (error) {
      console.error('Erro ao cadastrar usuário:', error);
      toast.error('Erro ao cadastrar usuário. Verifique os campos e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
        <div className="mb-3">
          <label htmlFor="nome" className="form-label">Nome</label>
          <input type="text" className="form-control" id="nome" {...register('nome', { required: 'Nome é obrigatório' })} />
          {errors.nome && <span className="text-danger">{errors.nome.message}</span>}
        </div>

        <div className="mb-3">
          <label htmlFor="cpf" className="form-label">CPF</label>
          <input type="text" className="form-control" id="cpf" {...register('cpf', { required: 'CPF é obrigatório' })} />
          {errors.cpf && <span className="text-danger">{errors.cpf.message}</span>}
        </div>

        {/* Novo campo de email */}
        <div className="mb-3">
          <label htmlFor="email" className="form-label">E-mail</label>
          <input type="email" className="form-control" id="email" {...register('email', { required: 'E-mail é obrigatório' })} />
          {errors.email && <span className="text-danger">{errors.email.message}</span>}
        </div>

        <div className="mb-3">
          <label htmlFor="senha" className="form-label">Senha</label>
          <div className="input-group">
            <input
              type={senhaVisivel ? 'text' : 'password'}
              className="form-control"
              id="senha"
              {...register('senha', {
                required: 'Senha é obrigatória',
                validate: {
                  validPassword: value =>
                    senhaValida(value) || 'A senha deve conter pelo menos uma letra maiúscula, um número e um caractere especial.'
                }
              })}
            />
            <span className="input-group-text" style={{ cursor: 'pointer' }} onClick={() => setSenhaVisivel(!senhaVisivel)}>
              <i className={`bi ${senhaVisivel ? 'bi-eye-slash' : 'bi-eye'}`}></i>
            </span>
          </div>
          {errors.senha && <span className="text-danger">{errors.senha.message}</span>}
        </div>

        <div className="mb-3">
          <label htmlFor="confirmarSenha" className="form-label">Confirmar Senha</label>
          <div className="input-group">
            <input
              type={confirmarSenhaVisivel ? 'text' : 'password'}
              className="form-control"
              id="confirmarSenha"
              {...register('confirmarSenha', {
                required: 'Confirmação de senha é obrigatória',
                validate: (value) => value === senha || 'As senhas não correspondem'
              })}
            />
            <span className="input-group-text" style={{ cursor: 'pointer' }} onClick={() => setConfirmarSenhaVisivel(!confirmarSenhaVisivel)}>
              <i className={`bi ${confirmarSenhaVisivel ? 'bi-eye-slash' : 'bi-eye'}`}></i>
            </span>
          </div>
          {errors.confirmarSenha && <span className="text-danger">{errors.confirmarSenha.message}</span>}
        </div>

        <div className="d-flex justify-content-end">
          <a className="btn btn-secondary mx-2" href="/listausuario">Voltar</a>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Salvando...' : 'Cadastrar'}
          </button>
        </div>
      </form>

      {/* Modal de erro */}
      {showErrorModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Erro</h5>
                <button type="button" className="btn-close" onClick={() => setShowErrorModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>{errorMessage}</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowErrorModal(false)}>Fechar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Componente principal Cadastro
const Cadastro = () => {
  const router = useRouter();

  const handleUsuarioCadastrado = () => {
    // Lógica após o cadastro do usuário, se necessário
    router.push('/login'); // Redireciona para a página de login após o cadastro
  };

  return (
    <LayoutDashboard token=''>
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="card w-50 shadow">
          <div className="card-body p-5">
            <h2 className="text-primary text-center mb-4">Cadastro de Usuário</h2>
            <CadastroForm onUsuarioCadastrado={handleUsuarioCadastrado} />
          </div>
        </div>
      </div>
    </LayoutDashboard>
  );
};

export default Cadastro;
