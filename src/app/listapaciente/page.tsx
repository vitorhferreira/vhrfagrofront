'use client'
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import styles from './users.module.css';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

interface User {
    id: number;
    nome: string;
    cpf: string;
    nascimento: date;
}

const Users = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [deleteAlert, setDeleteAlert] = useState(false); // Estado para controlar o alerta de exclusão
    const router = useRouter();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/pacientes');
            setUsers(response.data);
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
        }
    };

    const deleteUser = async (id: any) => {
        try {
            await axios.delete(`http://127.0.0.1:8000/api/pacientes/${id}`);
            
            toast.success('Paciente deletado com sucesso!');
            fetchUsers(); // Recarregar a lista de usuários após a exclusão
            setDeleteAlert(true); // Mostrar o alerta de exclusão
        } catch (error) {
            toast.error('Erro ao deletar paciente!');
        }
    };

    // Efeito para esconder o alerta após alguns segundos
    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (deleteAlert) {
            timeout = setTimeout(() => {
                setDeleteAlert(false);
            }, 3000); // Esconder o alerta após 3 segundos
        }
        return () => clearTimeout(timeout);
    }, [deleteAlert]);

    return (
        <>
        <div className={styles.container}>
            {deleteAlert && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                    Paciente deletado com sucesso!
                    <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={() => setDeleteAlert(false)}></button>
                </div>
            )}
            <a className="btn btn-secondary" href="/dashboard">Voltar</a>
            <a className="btn btn-primary" href="/cadastro">Cadastro</a>
            <h1>Lista de Pacientes</h1>
            <table className={styles.table}>
                <thead className={styles.thead}>
                    <tr>
                        <th className={styles.th}>Nome</th>
                        <th className={styles.th}>CPF</th>
                        <th className={styles.th}>Data de Nascimento</th>
                        <th className={styles.th}>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td className={styles.td}>{user.nome}</td>
                            <td className={styles.td}>{user.cpf}</td>
                            <td className={styles.td}>{user.nascimento}</td>
                            <td className={styles.td}>
                                <button className='btn btn-primary' onClick={() => router.push(`/editarpaciente?id=${user.id}`)}>
                                    Editar
                                </button>
                                <button
                                    className={`${styles.button} ${styles.buttonDelete}`}
                                    onClick={() => deleteUser(user.id)}
                                >
                                    Excluir
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        </>
    );
};

export default Users;
