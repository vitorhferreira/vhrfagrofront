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
    cpf: string; // Supondo que 'cpf' seja um campo válido
    idade: number;
    // Adicione outros campos conforme necessário
}

const Users = () => {
    const [users, setUsers] = useState<User[]>([]);
    const router = useRouter();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/pacientes');
            console.log(response)
            setUsers(response.data);
            
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
        }
    };

    const deleteUser = async (id: any) => {

        try {
            await axios.delete(`http://127.0.0.1:8000/api/pacientes/${id}`);
            fetchUsers(); // Recarregar a lista de usuários após a exclusão
            toast.success('Usuário deletado com sucesso!');
        } catch (error) {
            console.error('Erro ao excluir usuário:', error);
        }
    };

    return (
        <div className={styles.container}>
            <h1>Lista de Usuários</h1>
            <table className={styles.table}>
                <thead className={styles.thead}>
                    <tr>
                        <th className={styles.th}>Nome</th>
                        <th className={styles.th}>CPF</th>
                        <th className={styles.th}>Idade</th>
                        <th className={styles.th}>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td className={styles.td}>{user.nome}</td>
                            <td className={styles.td}>{user.cpf}</td>
                            <td className={styles.td}>{user.idade}</td>
                            <td className={styles.td}>
                            <button className='btn btn-primary' onClick={()=> router.push(`/editaruser?id=${user.id}`)}>
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
    );
};

export default Users;
