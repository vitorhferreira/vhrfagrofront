'use client'

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { LayoutDashboard } from '@/components/LayoutDashboard';
import { verificaTokenExpirado } from '@/services/token';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

// Interface para os dados do gasto
interface gastovet {
  id?: number;
  motivo_gasto: string;
  qtd_cabecas: string;
  data_pagamento: string;
  valor: string;
  lote: string;
}

interface Lote {
  id: number;
  quantidade: number;
  peso: number;
  valor_individual: string;
  idade_media: string;
  data_compra: string;
  numero_lote: number;
}

// Componente para o formulário de cadastro de gastovet
const CadastrogastovetForm = ({ ongastovetCriada, gastovetEdit }: { ongastovetCriada: () => void, gastovetEdit?: gastovet }) => {
  const { register, handleSubmit, reset, setValue } = useForm<gastovet>();
  const [loading, setLoading] = useState(false);
  const [pacienteOption, setLoteOption] = useState<Lote[]>([]);
  const [selectedlote, setSelectedlote] = useState<string>("");

  useEffect(() => {
    const fetchLotes = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/lote');
        setLoteOption(response.data);
      } catch (error: any) {
        toast.error('Erro ao buscar Lote');
      }
    };
    fetchLotes();
  }, []);

  useEffect(() => {
    if (gastovetEdit) {
      setValue('motivo_gasto', gastovetEdit.motivo_gasto);
      setValue('qtd_cabecas', gastovetEdit.qtd_cabecas);
      setValue('data_pagamento', gastovetEdit.data_pagamento);
      setValue('valor', gastovetEdit.valor);
      setSelectedlote(gastovetEdit.lote);
      setValue('lote', gastovetEdit.lote); 
    } else {
      setSelectedlote("");
      reset();
    }
  }, [gastovetEdit, setValue, reset]);


  // Função para submeter o formulário
  const onSubmit = async (data: gastovet) => {
    setLoading(true);
    try {
      if (gastovetEdit) {
        await axios.put(`http://127.0.0.1:8000/api/gastovets/${gastovetEdit.id}`, data); // URL da API para atualização
        toast.success('Gasto atualizado com sucesso!');
        ongastovetCriada();
      } else {
        await axios.post('http://127.0.0.1:8000/api/cadgastovets', data); // URL da API a ser utilizada
        toast.success('Gasto cadastrado com sucesso!');
        ongastovetCriada(); // Atualiza a lista de gastovets após cadastrar
        reset(); // Limpa o formulário
      }
    } catch (error) {
      console.error('Erro ao cadastrar Gasto:', error);
      toast.error('Erro ao cadastrar Gasto. Verifique os campos e tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  const handleloteChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const lote = event.target.value;
    setSelectedlote(lote);
    setValue('lote', lote);
  };
  useEffect(() => {
    register('lote', { required: true }); // Registrar o campo qtd_cabecas manualmente
  }, [register]);
  // Retorno do componente de formulário
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-3">
        <label htmlFor="motivo_gasto" className="form-label">Motivo do Gasto:</label>
        <select className="form-select" id="motivo_gasto" {...register('motivo_gasto', { required: true })}>
          <option value="" disabled selected>Selecione uma opção</option>
          <option value="Compra de gado">Compra de gado</option>
          <option value="Vacina">Vacina</option>
          <option value="Gasto Veterinario">Gasto Veterinário</option>
          <option value="Produtos Veterinarios">Produtos Veterinários</option>
          <option value="Pasto">Pasto</option>
          <option value="Ração">Ração</option>
          <option value="Outros gastos">Outros gastos</option>
        </select>
      </div>
      <div className="mb-3">
        <label htmlFor="qtd_cabecas" className="form-label">Quantidade de Cabeças:</label>
        <input type="number" className="form-control" id="qtd_cabecas" {...register('qtd_cabecas', { required: true })} />
      </div>
      <div className="mb-3">
        <label htmlFor="data_pagamento" className="form-label">Data do Pagamento:</label>
        <input type="date" className="form-control" id="data_pagemento" {...register('data_pagamento', { required: true })} />
      </div>
      <div className="mb-3">
        <label htmlFor="valor" className="form-label">Valor:</label>
        <input type="number" className="form-control" id="valor" {...register('valor', { required: true })} />
      </div>
      <div className="mb-3">
        <label htmlFor="lote" className="form-label">Lote</label>
         <select className="form-select" name="lote" value={selectedlote} onChange={handleloteChange}>
          <option value="lote">Selecione um Lote</option>
          {pacienteOption.map(lote => (
            <option key={lote.id} value={lote.numero_lote}>
              {`${lote.numero_lote}`}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  );
};

interface gastovet {
  id?: number;
  motivo_gasto: string;
  qtd_cabecas: string;
  data_pagamento: string;
  valor: string;
  lote: string;
}
// Componente para listar as gastovets
const Listagastovets = ({ gastovets, ongastovetEdit, ongastovetCriada }: { gastovets: gastovet[], ongastovetEdit: (gastovet: gastovet) => void, ongastovetCriada: () => void }) => {
  const [filteredgastovets, setFilteredgastovets] = useState<gastovet[]>(gastovets);
  useEffect(() => {
    setFilteredgastovets(gastovets)
  }, [gastovets])
  // Retorno do componente de lista de gastovets
  const handleDelete = async (id: any) => {
    try {
      var response = await axios.delete(`http://127.0.0.1:8000/api/gastovets/${id}`);
      if (response.data.sucesso = true) {
        toast.success('Gasto deletado com sucesso');
        ongastovetCriada();
      }
      else {
        toast.error('Erro ao deletar Gasto');
        return
      }
    } catch (error) {
      toast.error('Erro ao deletar Gasto');
    }
  };

  const filtergastovet = (lote: string) => {
    if (lote !== '') {
      setFilteredgastovets(gastovets.filter(d => d.lote.includes(lote)))
    } else {
      setFilteredgastovets(gastovets)
    }
  }

  return (
    <div>
      <h2>Lista de Gastos:</h2>
      <input placeholder="Filtrar por Lote" className="form-control mb-3" onChange={(e) => filtergastovet(e.target.value)} />
      <ul>
        {filteredgastovets.map((gastovet) => (
          <li key={gastovet.id}>
            <strong>Motivo do Gasto:</strong> {gastovet.motivo_gasto}<br />
            <strong>Quantidade de cabeças:</strong> {gastovet.qtd_cabecas}<br />
            <strong>Data Do Pagamento:</strong> {gastovet.data_pagamento}<br />
            <strong>Valor:</strong> {gastovet.valor}<br />
            <strong>Lote:</strong> {gastovet.lote}<br />
            <div className="actions">
              <button className='btn btn-primary' onClick={() => ongastovetEdit(gastovet)}>Editar</button>
              <button className='btn btn-danger' onClick={() => handleDelete(gastovet.id)}>Excluir</button>
            </div>
          </li>

        ))}
      </ul>
    </div>
  );
};
interface gastovet {
  id?: number;
  motivo_gasto: string;
  qtd_cabecas: string;
  data_pagamento: string;
  valor: string;
  lote: string;
}

// Componente principal Dashboard
const Dashboard = () => {
  const router = useRouter();
  const [gastovets, setgastovets] = useState<gastovet[]>([]);
  const [gastovetEdit, setgastovetEdit] = useState<gastovet | null>(null);

  // Verificação de token (exemplo básico)
  useEffect(() => {
    carregargastovets();
  }, []);

  // Função para carregar as gastovets
  const carregargastovets = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/gastovets'); // URL da API a ser utilizada
      setgastovets(response.data);
    } catch (error) {
      console.error('Erro ao carregar Gastos:', error);
    }
  };
  const handlegastovetCriada = () => {
    carregargastovets();
    setgastovetEdit(null); // Limpar a gasto em edição após criar/editar
  };
  const handlegastovetEdit = (gastovet: gastovet) => {
    setgastovetEdit(gastovet);
  };

  // Retorno do componente Dashboard
  return (
    <LayoutDashboard token=''>
      <div className="container-fluid">
        <div className="row">
          <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
            <div className="my-4">
              <h2 className="mb-4"></h2>

              {/* Componente de Formulário de Cadastro */}
              <div className="card mb-4">
                <div className="card-body">
                  <h3 className="card-title">Cadastro de Despesas</h3>
                  <CadastrogastovetForm ongastovetCriada={handlegastovetCriada} gastovetEdit={gastovetEdit} />
                </div>
              </div>

              {/* Componente de Lista de gastovets */}
              <div className="card mb-4">
                <div className="card-body">
                  <Listagastovets ongastovetEdit={handlegastovetEdit} ongastovetCriada={handlegastovetCriada} gastovets={gastovets} />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </LayoutDashboard>
  );
};

export default Dashboard; // Exporta o componente Dashboard