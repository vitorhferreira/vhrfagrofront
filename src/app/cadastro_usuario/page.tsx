'use client';

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
  cpfCnpj: string;
  email: string;
  senha: string;
  confirmarSenha: string;
}

const CadastroForm = ({ onUsuarioCadastrado }: { onUsuarioCadastrado: () => void }) => {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<Usuario>();
  const [loading, setLoading] = useState(false);
  const [cpfCnpj, setCpfCnpj] = useState(''); // Estado para o CPF/CNPJ
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [confirmarSenhaVisivel, setConfirmarSenhaVisivel] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false); // Modal de erro
  const [errorMessage, setErrorMessage] = useState(''); // Mensagem de erro
  const senha = watch('senha'); // Observar o campo de senha

  // Função de validação de senha
  const senhaValida = (senha: string) => {
    const regex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/;
    return regex.test(senha);
  };

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

  // Função de submissão do formulário
  const onSubmit = async (data: Usuario) => {
    setLoading(true);
    try {
      const { confirmarSenha, cpfCnpj, ...userData } = data; // Remove "confirmarSenha" antes de enviar
      const cpfCnpjSemMascara = removerMascara(cpfCnpj); // Remove a máscara do CPF/CNPJ

      // Envia os dados para o backend com o CPF/CNPJ sem máscara
      const response = await axios.post('http://127.0.0.1:8000/api/caduser', {
        ...userData,
        cpf: cpfCnpjSemMascara, // Envia como 'cpf' para o backend
      });

      // Caso de sucesso
      toast.success('Usuário cadastrado com sucesso!');
      onUsuarioCadastrado();
      reset(); // Limpa o formulário
      setCpfCnpj(''); // Reseta o campo de CPF/CNPJ
    } catch (error: any) {
      let mensagemErro = '';

      // Verificando erros de validação do CPF/CNPJ e email
      if (error.response && error.response.status === 422) {
        const backendError = error.response.data.error;

        if (backendError === 'CPF/CNPJ inválido') {
          mensagemErro += 'CPF/CNPJ inválido. ';
        }

        const validationErrors = error.response.data.errors;

        if (validationErrors?.email) {
          mensagemErro += 'E-mail já cadastrado. ';
        }
        if (validationErrors?.cpf) {
          mensagemErro += 'CPF/CNPJ já cadastrado. ';
        }

      }
      // Verifica se o erro é de CPF ou email já cadastrados (status 409)
      else if (error.response && error.response.status === 409) {
        const { cpfExistente, emailExistente } = error.response.data;

        if (cpfExistente && emailExistente) {
          mensagemErro = 'CPF e e-mail já estão cadastrados.';
        } else if (cpfExistente) {
          mensagemErro = 'CPF já está cadastrado.';
        } else if (emailExistente) {
          mensagemErro = 'E-mail já está cadastrado.';
        }
      }
      // Outros erros
      else {
        mensagemErro = 'Erro ao cadastrar usuário. Verifique os campos e tente novamente.';
      }

      setErrorMessage(mensagemErro);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
        <div className="mb-3">
          <label htmlFor="nome" className="form-label">Nome</label>
          <input
            type="text"
            className="form-control"
            id="nome"
            {...register('nome', { required: 'Nome é obrigatório' })}
          />
          {errors.nome && <span className="text-danger">{errors.nome.message}</span>}
        </div>

        <div className="mb-3">
          <label htmlFor="cpfCnpj" className="form-label">CPF ou CNPJ</label>
          <input
            type="text"
            className="form-control"
            id="cpfCnpj"
            value={cpfCnpj} // Usa o estado para o valor do campo
            {...register('cpfCnpj', { required: 'CPF ou CNPJ é obrigatório' })}
            onChange={(e) => setCpfCnpj(formatarCpfCnpj(e.target.value))} // Atualiza o estado e aplica a máscara
          />
          {errors.cpfCnpj && <span className="text-danger">{errors.cpfCnpj.message}</span>}
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="form-label">E-mail</label>
          <input
            type="email"
            className="form-control"
            id="email"
            {...register('email', { required: 'E-mail é obrigatório' })}
          />
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
                minLength: {
                  value: 8,
                  message: 'A senha deve ter no mínimo 8 caracteres.'
                },
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
    router.push('/cadastro_usuario');
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
