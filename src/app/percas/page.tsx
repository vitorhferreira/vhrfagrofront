'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { LayoutDashboard } from '@/components/LayoutDashboard';

interface Perda {
  motivo_perda: string;
  qtd_cabecas: number;
  lote: number; // ID do lote
  valor: string; // Valor da perda (string com a máscara)
}

interface Lote {
  id: number;
  numero_lote: string; // Número do lote
  quantidade: number;
  peso: number; // Peso do lote
  valor_individual: string; // Valor individual do lote
  idade_media: string; // Idade média do lote
  data_compra: string; // Data de compra do lote
}

// Função para formatar valor monetário (R$)
const formatarValorMonetario = (valor: string) => {
  valor = valor.replace(/\D/g, ''); // Remove caracteres não numéricos
  valor = (Number(valor) / 100).toFixed(2) + ''; // Divide por 100 e fixa em 2 casas decimais
  valor = valor.replace('.', ','); // Substitui ponto por vírgula
  valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Insere ponto a cada milhar
  return 'R$ ' + valor;
};

// Função para remover a máscara de valor antes de enviar para o backend
const removerMascaraValor = (valor: string) => Number(valor.replace(/\D/g, '')) / 100;

const CadastroPerdaForm = ({ onPerdaCriada }: { onPerdaCriada: () => void }) => {
  const { register, handleSubmit, setValue, formState: { errors }, watch } = useForm<Perda>();
  const [loteOptions, setLoteOptions] = useState<Lote[]>([]);
  const [quantidadeDisponivel, setQuantidadeDisponivel] = useState<number | null>(null);
  const [valorPerda, setValorPerda] = useState(''); // Estado para o valor com máscara

  useEffect(() => {
    const fetchLotes = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/lote');
        setLoteOptions(response.data);
      } catch (error) {
        toast.error('Erro ao buscar lotes.');
      }
    };
    fetchLotes();
  }, []);

  const handleLoteChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const loteSelecionadoId = Number(event.target.value);
    const lote = loteOptions.find(l => l.id === loteSelecionadoId);
    if (lote) {
      setQuantidadeDisponivel(lote.quantidade);
      setValue('lote', loteSelecionadoId); // Armazena o ID do lote
    } else {
      setQuantidadeDisponivel(null);
    }
  };

  const onSubmit = async (data: Perda) => {
    // Remove a máscara e converte o valor para centavos
    const valorSemMascara = removerMascaraValor(valorPerda);

    // Converte os valores de 'lote' e 'qtd_cabecas' para números
    const formattedData = {
      ...data,
      lote: Number(data.lote),
      qtd_cabecas: Number(data.qtd_cabecas),
      valor: valorSemMascara, // Enviar o valor sem a máscara e dividido por 100
    };

    if (quantidadeDisponivel !== null && formattedData.qtd_cabecas > quantidadeDisponivel) {
      toast.error(`A quantidade de cabeças não pode exceder a quantidade disponível no lote (${quantidadeDisponivel}).`);
      return;
    }

    try {
      // Buscar os dados do lote antes de atualizar a quantidade
      const loteSelecionado = loteOptions.find(l => l.id === formattedData.lote);

      if (!loteSelecionado) {
        console.error('Lote não encontrado, ID:', formattedData.lote); // Log para verificar o ID
        toast.error('Lote não encontrado.');
        return;
      }

      // Atualizar apenas a quantidade no lote
      await axios.post(`http://localhost:8000/api/lote/${formattedData.lote}`, {
        ...loteSelecionado, // Incluímos todos os outros dados do lote que não mudam
        quantidade: quantidadeDisponivel - formattedData.qtd_cabecas, // Somente a quantidade é alterada
      });

      // Insere o gasto na tabela de gastos, incluindo o número do lote
      await axios.post('http://127.0.0.1:8000/api/cadgastovets', {
        motivo_gasto: `Perda de cabeças no lote ${loteSelecionado.numero_lote}`,
        qtd_cabecas: formattedData.qtd_cabecas,
        data_pagamento: new Date().toISOString().split('T')[0],
        valor: formattedData.valor,
        lote: loteSelecionado?.numero_lote,
        id_lote: formattedData.lote,
        pago: true,
      });

      toast.success('Perda registrada com sucesso!');
      onPerdaCriada();
    } catch (error) {
      console.error('Erro ao atualizar o lote ou registrar perda:', error);
      toast.error('Erro ao registrar a perda.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-3">
        <label htmlFor="motivo_perda" className="form-label">Motivo da Perda:</label>
        <input
          type="text"
          className="form-control"
          id="motivo_perda"
          {...register('motivo_perda', { required: true })}
        />
        {errors.motivo_perda && <div className="text-danger">O motivo da perda é obrigatório.</div>}
      </div>
      <div className="mb-3">
        <label htmlFor="qtd_cabecas" className="form-label">Quantidade de Cabeças Perdidas:</label>
        <input
          type="number"
          className="form-control"
          id="qtd_cabecas"
          {...register('qtd_cabecas', { required: true, min: 1 })}
        />
        {errors.qtd_cabecas && <div className="text-danger">A quantidade de cabeças é obrigatória e deve ser maior que 0.</div>}
      </div>
      <div className="mb-3">
        <label htmlFor="lote" className="form-label">Lote:</label>
        <select className="form-select" id="lote" {...register('lote', { required: true })} onChange={handleLoteChange}>
          <option value="">Selecione um Lote</option>
          {loteOptions.map(lote => (
            <option key={lote.id} value={lote.id}>
              {`${lote.numero_lote} - ${lote.quantidade} cabeças disponíveis`}
            </option>
          ))}
        </select>
        {errors.lote && <div className="text-danger">Selecione um lote.</div>}
      </div>
      <div className="mb-3">
        <label htmlFor="valor" className="form-label">Valor da Perda:</label>
        <input
          type="text"
          className="form-control"
          id="valor"
          value={valorPerda}
          onChange={(e) => setValorPerda(formatarValorMonetario(e.target.value))} // Aplica a máscara ao digitar
        />
        {errors.valor && <div className="text-danger">O valor da perda é obrigatório.</div>}
      </div>
      <button type="submit" className="btn btn-primary">Registrar Perda</button>
    </form>
  );
};

const Page = () => {
  const handlePerdaCriada = () => {
    // Lógica para atualizar a lista de perdas ou realizar outra ação após registrar a perda
  };

  return (
    <LayoutDashboard token="">
      <div className="container-fluid">
        <div className="row">
          <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
            <div className="my-4">
              <h2 className="mb-4">Registrar Perdas</h2>
              <div className="card mb-4">
                <div className="card-body">
                  <CadastroPerdaForm onPerdaCriada={handlePerdaCriada} />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </LayoutDashboard>
  );
};

export default Page;
