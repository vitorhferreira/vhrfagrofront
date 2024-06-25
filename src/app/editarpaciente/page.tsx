'use client'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import styles from './edita.module.css';

const EditPaciente = ({ searchParams }: { searchParams: { id: string } }) => {
    const router = useRouter();
    const id = searchParams.id;
    const [paciente, setPaciente] = useState({ id: '', nome: '', cpf: '', nascimento: '' });

    useEffect(() => {
        fetchPaciente();
    }, []);

    const fetchPaciente = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/pacientes');
            const paciente = response.data.find((paciente: { id: any }) => paciente.id === parseInt(id));
            setPaciente(paciente);
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
        }
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setPaciente({ ...paciente, [name]: value });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:8000/api/pacientes/${id}`, paciente);
            router.push('/listapaciente');
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Editar Paciente</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
                <label className={styles.label}>
                    Nome:
                    <input 
                        type="text" 
                        name="nome" 
                        value={paciente.nome} 
                        onChange={handleChange} 
                        className={styles.input} 
                    />
                </label>
                <label className={styles.label}>
                    CPF:
                    <input 
                        type="text" 
                        name="cpf" 
                        value={paciente.cpf} 
                        onChange={handleChange} 
                        className={styles.input} 
                    />
                </label>
                <label className={styles.label}>
                    Data de Nascimento:
                    <input 
                        type="date" 
                        name="nascimento" 
                        value={paciente.nascimento} 
                        onChange={handleChange} 
                        className={styles.input} 
                    />
                </label>
                <button type="submit" className={styles.button}>Salvar</button>
            </form>
        </div>
    );
};

export default EditPaciente;
