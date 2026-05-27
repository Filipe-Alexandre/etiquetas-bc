// src/components/PainelPrecificacao.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../data/firebaseConfig';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

export function PainelPrecificacao({ fecharPainel, recarregarDados }) {
  const [senha, setSenha] = useState("");
  const [autenticado, setAutenticado] = useState(false);
  const [erroSenha, setErroSenha] = useState(false);

  const [produtosBase, setProdutosBase] = useState([]);
  const [precosEditados, setPrecosEditados] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [progresso, setProgresso] = useState(0);

  // A senha para acessar o painel (Defina a sua aqui)
  const SENHA_MESTRE = "182529";

  const verificarSenha = (e) => {
    e.preventDefault();
    if (senha === SENHA_MESTRE) {
      setAutenticado(true);
      carregarProdutos();
    } else {
      setErroSenha(true);
      setSenha("");
    }
  };

  const carregarProdutos = async () => {
    setCarregando(true);
    try {
      const querySnapshot = await getDocs(collection(db, "produtos"));
      const lista = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Ordena por categoria e depois por nome
      lista.sort((a, b) => {
        if (a.categoria < b.categoria) return -1;
        if (a.categoria > b.categoria) return 1;
        return (a.complemento || "").localeCompare(b.complemento || "");
      });
      
      setProdutosBase(lista);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      alert("Erro ao conectar com o banco de dados.");
    } finally {
      setCarregando(false);
    }
  };

  const handleChangePreco = (id, valorStr) => {
    // Permite digitar números e vírgula/ponto
    let valorFormatado = valorStr.replace(/[^0-9.,]/g, '');
    setPrecosEditados(prev => ({ ...prev, [id]: valorFormatado }));
  };

  const atualizarCatalogo = async () => {
    const idsEditados = Object.keys(precosEditados).filter(id => {
        const prodOriginal = produtosBase.find(p => p.id === id);
        if (!prodOriginal) return false;
        
        const valorNovo = parseFloat(precosEditados[id].replace(',', '.'));
        // Só atualiza se for um número válido e diferente do original
        return !isNaN(valorNovo) && valorNovo !== prodOriginal.precoBase;
    });

    if (idsEditados.length === 0) {
      alert("Nenhum preço foi alterado.");
      return;
    }

    if (!window.confirm(`Você está prestes a atualizar o preço de ${idsEditados.length} produto(s). Confirmar?`)) return;

    setSalvando(true);
    setProgresso(0);

    try {
      for (let i = 0; i < idsEditados.length; i++) {
        const id = idsEditados[i];
        const novoPreco = parseFloat(precosEditados[id].replace(',', '.'));
        const docRef = doc(db, "produtos", id);
        
        // Atualiza apenas o precoBase, mantendo nome, validade, etc.
        await setDoc(docRef, { precoBase: novoPreco }, { merge: true });
        
        setProgresso(Math.round(((i + 1) / idsEditados.length) * 100));
      }
      
      alert("Catálogo atualizado com sucesso!");
      recarregarDados();
      fecharPainel();
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar o catálogo no Firebase.");
    } finally {
      setSalvando(false);
      setProgresso(0);
    }
  };

  // TELA DE SENHA
  if (!autenticado) {
    return (
      <div className="painel-overlay">
        <div className="painel-modal modal-senha">
          <button className="btn-fechar-absoluto" onClick={fecharPainel}>✖</button>
          <h2 style={{ color: 'var(--marrom)', textAlign: 'center', marginBottom: '20px' }}>
            <i className="fa-solid fa-lock"></i> Área Restrita
          </h2>
          <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px', fontSize: '12px' }}>
            Digite a senha mestra para gerenciar o catálogo de preços no banco de dados.
          </p>
          <form onSubmit={verificarSenha} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input
              type="password"
              placeholder="Senha de Acesso"
              value={senha}
              onChange={(e) => { setSenha(e.target.value); setErroSenha(false); }}
              autoFocus
              style={{
                padding: '12px', borderRadius: '6px', border: `2px solid ${erroSenha ? 'red' : 'var(--laranja)'}`,
                fontFamily: 'var(--bold)', textAlign: 'center', fontSize: '18px', outline: 'none'
              }}
            />
            {erroSenha && <span style={{ color: 'red', fontSize: '11px', textAlign: 'center' }}>Senha incorreta!</span>}
            <button type="submit" className="btn-action btn-orange" style={{ padding: '12px' }}>
              DESBLOQUEAR
            </button>
          </form>
        </div>
      </div>
    );
  }

  // TELA DE PRECIFICAÇÃO
  return (
    <div className="painel-overlay">
      <div className="painel-modal">
        <div className="painel-header">
          <h2 style={{ color: 'var(--laranja)', margin: 0 }}>
            <i className="fa-solid fa-database"></i> Atualização de Preços
          </h2>
          
          <div className="painel-controls">
            <button 
                className={`btn-update-catalog ${salvando ? 'loading' : ''}`} 
                onClick={atualizarCatalogo}
                disabled={salvando || carregando}
                style={{ margin: 0, width: 'auto', minWidth: '220px', padding: '10px 20px' }}
            >
                <div className="progress-fill" style={{ width: `${progresso}%` }}></div>
                <span className="btn-content">
                    <i className={`fa-solid ${salvando ? 'fa-sync fa-spin' : 'fa-cloud-arrow-up'}`}></i>
                    {salvando ? ` SALVANDO ${progresso}%` : ' ATUALIZAR BANCO DE DADOS'}
                </span>
            </button>
            <button className="btn-fechar-painel" onClick={fecharPainel} disabled={salvando}>
              ✖ FECHAR
            </button>
          </div>
        </div>

        <div className="table-responsive">
          {carregando ? (
            <div style={{ textAlign: 'center', padding: '50px', color: 'var(--laranja)' }}>
              <h3><i className="fa-solid fa-spinner fa-spin"></i> Carregando base de dados...</h3>
            </div>
          ) : (
            <table className="validades-table">
              <thead>
                <tr>
                  <th>CATEGORIA</th>
                  <th>PRODUTO</th>
                  <th style={{ textAlign: 'center' }}>PREÇO ATUAL</th>
                  <th style={{ textAlign: 'center' }}>NOVO PREÇO (R$)</th>
                </tr>
              </thead>
              <tbody>
                {produtosBase.map(prod => {
                  const valorEditado = precosEditados[prod.id];
                  const valorAtualFormatado = Number(prod.precoBase).toFixed(2).replace('.', ',');
                  const temAlteracao = valorEditado !== undefined && valorEditado !== valorAtualFormatado && valorEditado !== "";

                  return (
                    <tr key={prod.id} className="validades-tr linha-normal">
                      <td className="col-cat"><b>{prod.categoria}</b></td>
                      <td className="col-prod">
                        <div className="prod-nome">{prod.complemento} {prod.gramatura}</div>
                        <span style={{ fontSize: '10px', color: '#999', fontFamily: 'var(--normal)' }}>ID: {prod.id}</span>
                      </td>
                      <td className="col-val-atual" style={{ textAlign: 'center' }}>
                        <span className="mobile-label">Preço Atual:</span>
                        <span>R$ {valorAtualFormatado}</span>
                      </td>
                      <td className="col-nova-val" style={{ textAlign: 'center' }}>
                        <span className="mobile-label">Novo Preço:</span>
                        <input
                          type="text"
                          className="input-nova-data"
                          placeholder={valorAtualFormatado}
                          value={valorEditado !== undefined ? valorEditado : ''}
                          onChange={(e) => handleChangePreco(prod.id, e.target.value)}
                          style={{ 
                              borderColor: temAlteracao ? 'var(--laranja)' : '#ccc',
                              color: temAlteracao ? 'var(--laranja)' : '#444',
                              fontWeight: temAlteracao ? '900' : 'normal'
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
