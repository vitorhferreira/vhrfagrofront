'use client'
import { useState, useEffect, use } from 'react';
import axios from 'axios';
import Link from 'next/link';
import styles from './edita.module.css';
 import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

const EditUser = ({searchParams} : {searchParams: {id: string}}) => {
    const router = useRouter();

    const id =searchParams.id

    const [user, setUser] = useState({ id: '', nome: '', cpf: '', idade: '' });

    useEffect(() => {
        fetchUser()
    }, []);

    const fetchUser = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/user');
            const user = response.data.find(user => user.id === parseInt(id));
            console.log(user)
            setUser(user);
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
        }
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setUser({ ...user, [name]: e.target.value });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
           const response =  await axios.put(`http://localhost:8000/api/user/${id}`, user);
          
           if(parseInt(response.data.sucesso) == 98){
            toast.warning('CPF já cadastrado na base de dados');
            return
            }
           if(parseInt(response.data.sucesso) == 99){
            toast.warning('CPF invalido');
            return
            }
       
           router.push('/listausuario');
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Editar Usuário</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
                <label className={styles.label}>
                    Nome:
                    <input type="text" name="nome" value={user.nome} onChange={handleChange} className={styles.input} />
                </label>
                <br />
                <label className={styles.label}>
                    CPF:
                    <input type="text" name="cpf" value={user.cpf} onChange={handleChange} className={styles.input} />
                </label>
                <br />
                <button type="submit" className={styles.button}>Salvar</button>
            </form>
        </div>
    );
};

export default EditUser;
