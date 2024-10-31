// src/app/editaruser/page.tsx
'use client'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { LayoutDashboard } from '@/components/LayoutDashboard';
import { toast } from 'react-toastify';
import styles from './edita.module.css';

// Função de formatação de CPF/CNPJ
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

// Função para remover a máscara do CPF/CNPJ antes de enviar ao backend
const removerMascara = (valor: string) => valor.replace(/\D/g, '');

const EditUser = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || ''; // Obtém o ID da URL

  const [user, setUser] = useState({ id: '', nome: '', cpf: '', email: '', idade: '' });

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/user');
      const user = response.data.find((user) => user.id === parseInt(id));
      if (user) {
        user.cpf = formatarCpfCnpj(user.cpf); // Formata o CPF/CNPJ ao buscar o usuário
      }
      setUser(user);
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const userToUpdate = {
        ...user,
        cpf: removerMascara(user.cpf) // Envia o CPF sem máscara para o backend
      };

      const response = await axios.put(`http://127.0.0.1:8000/api/user/${id}`, userToUpdate);

      if (parseInt(response.data.sucesso) === 98) {
        toast.warning('CPF já cadastrado na base de dados');
        return;
      }
      if (parseInt(response.data.sucesso) === 99) {
        toast.warning('CPF inválido');
        return;
      }

      toast.success('Usuário atualizado com sucesso!');
      router.push('/listausuario');
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast.error('Erro ao atualizar usuário. Tente novamente.');
    }
  };

  return (
    <LayoutDashboard token=''>
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="card w-50 shadow">
          <div className="card-body p-5">
            <h2 className="text-primary text-center mb-4">Editar Usuário</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="nome" className="form-label">Nome:</label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={user.nome}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="cpf" className="form-label">CPF:</label>
                <input
                  type="text"
                  id="cpf"
                  name="cpf"
                  value={user.cpf}
                  className="form-control"
                  readOnly // Define o campo como não editável
                />
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">E-mail:</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={user.email}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="d-flex justify-content-end">
                <a className="btn btn-secondary mx-2" href="/listausuario">Voltar</a>
                <button type="submit" className="btn btn-primary">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </LayoutDashboard>
  );
};

export default EditUser;
