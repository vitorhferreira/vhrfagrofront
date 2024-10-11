'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { LayoutDashboard } from '@/components/LayoutDashboard';
import { toast } from 'react-toastify';

interface User {
    id: number;
    nome: string;
    cpf: string;
    email: string; // Adicionado campo de email
    idade: number;
}

const Users = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [deleteAlert, setDeleteAlert] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [userIdToDelete, setUserIdToDelete] = useState<number | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/user');
            setUsers(response.data);
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
        }
    };

    const deleteUser = async () => {
        if (userIdToDelete !== null) {
            try {
                await axios.delete(`http://127.0.0.1:8000/api/user/${userIdToDelete}`);
                toast.success('Usuário deletado com sucesso!');
                fetchUsers();
                setDeleteAlert(true);
            } catch (error) {
                toast.error('Erro ao deletar usuário!');
            } finally {
                setShowModal(false);
                setUserIdToDelete(null); // Reset the userIdToDelete
            }
        }
    };

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (deleteAlert) {
            timeout = setTimeout(() => {
                setDeleteAlert(false);
            }, 3000);
        }
        return () => clearTimeout(timeout);
    }, [deleteAlert]);

    return (
        <LayoutDashboard token=''>
            <div className="container-fluid">
                <div className="row">
                    <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
                        {deleteAlert && (
                            <div className="alert alert-success alert-dismissible fade show" role="alert">
                                Usuário deletado com sucesso!
                                <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={() => setDeleteAlert(false)}></button>
                            </div>
                        )}
                        <div className="my-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h1 className="text-primary">Lista de Usuários</h1>
                                <div>
                                    <a className="btn btn-secondary mx-2" href="/dashboard">Voltar</a>
                                    <a className="btn btn-primary mx-2" href="/cadastro_usuario">Cadastro</a>
                                </div>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-striped table-hover table-bordered">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>Nome</th>
                                            <th>CPF</th>
                                            <th>Email</th> {/* Adicionado o campo de email na tabela */}
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(user => (
                                            <tr key={user.id}>
                                                <td>{user.nome}</td>
                                                <td>{user.cpf}</td>
                                                <td>{user.email}</td> {/* Exibindo o email */}
                                                <td>
                                                    <button className='btn btn-outline-primary me-2' onClick={() => router.push(`/editaruser?id=${user.id}`)}>
                                                        Editar
                                                    </button>
                                                    <button className='btn btn-outline-danger' onClick={() => {
                                                        setUserIdToDelete(user.id);
                                                        setShowModal(true);
                                                    }}>
                                                        Excluir
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Modal de Confirmação */}
                        <div className={`modal fade ${showModal ? 'show' : ''}`} style={{ display: showModal ? 'block' : 'none' }} tabIndex={-1} role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                            <div className="modal-dialog" role="document">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title" id="exampleModalLabel">Confirmar Exclusão</h5>
                                        <button type="button" className="btn-close" onClick={() => setShowModal(false)} aria-label="Close"></button>
                                    </div>
                                    <div className="modal-body">
                                        Você tem certeza de que deseja excluir este usuário?
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                                        <button type="button" className="btn btn-danger" onClick={deleteUser}>Excluir</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </LayoutDashboard>
    );
};

export default Users;
