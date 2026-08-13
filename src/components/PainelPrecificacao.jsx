// src/components/PainelPrecificacao.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../data/firebaseConfig';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

export function PainelPrecificacao({ fecharPainel, recarregarDados }) {
  // Estados de Autenticação
  const [senha, setSenha] = useState("");
  const [autenticado, setAutenticado] = useState(false);
  const [erroSenha, setErroSenha] = useState(false);

  // Estados do Catálogo
  const [produtosBase, setProdutosBase] = useState([]);
  const [precosEditados, setPrecosEditados] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [progresso, setProgresso] = useState(0);

  // ==================================================
  // ESTADOS DO FORMULÁRIO DE EDIÇÃO (NOVO)
  // ==================================================
  const [produtoEmEdicao, setProdutoEmEdicao] = useState(null);
  const [formCategoria, setFormCategoria] = useState("");
  const [formComplemento, setFormComplemento] = useState("");
  const [formGramatura, setFormGramatura] = useState("");
  const [formPreco, setFormPreco] = useState("");
  const [salvandoForm, setSalvandoForm] = useState(false);

  const SENHA_MESTRE = "182529"; //senha inativa

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

  // Mapeia categorias únicas existentes no banco de dados para alimentar o Dropdown
  const categoriasUnicas = Array.from(new Set(produtosBase.map(p => p.categoria))).filter(Boolean).sort();

  // Carrega o produto selecionado na lista para o formulário superior
  const carregarNoFormulario = (produto) => {
    setProdutoEmEdicao(produto);
    setFormCategoria(produto.categoria || "");
    setFormComplemento(produto.complemento || "");
    setFormGramatura(produto.gramatura || "");
    setFormPreco(Number(produto.precoBase).toFixed(2).replace('.', ','));
    
    // Rola a tela para o topo para ver o formulário preenchido
    const formElement = document.getElementById('painel-edicao-mestre');
    if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
  };

  const limparFormulario = () => {
    setProdutoEmEdicao(null);
    setFormCategoria("");
    setFormComplemento("");
    setFormGramatura("");
    setFormPreco("");
  };

  // Grava as alterações completas do formulário no Firebase
  const salvarEdicaoCompleta = async () => {
    if (!produtoEmEdicao) return;
    if (!formCategoria || !formComplemento || !formGramatura || !formPreco) {
      return alert("Por favor, preencha todos os campos do formulário!");
    }

    const precoFinal = parseFloat(formPreco.replace(',', '.'));
    if (isNaN(precoFinal)) return alert("Digite um preço válido!");

    setSalvandoForm(true);
    try {
      const docRef = doc(db, "produtos", produtoEmEdicao.id);
      await setDoc(docRef, {
        categoria: formCategoria.toUpperCase(),
        complemento: formComplemento.toUpperCase(),
        gramatura: formGramatura.toUpperCase(),
        precoBase: precoFinal
      }, { merge: true });

      alert("Produto atualizado com sucesso!");
      limparFormulario();
      carregarProdutos();
      if (recarregarDados) recarregarDados();
    } catch (error) {
      console.error("Erro ao atualizar o produto:", error);
      alert("Falha ao salvar modificações do produto.");
    } finally {
      setSalvandoForm(false);
    }
  };

  const handleChangePreco = (id, valorStr) => {
    let valorFormatado = valorStr.replace(/[^0-9.,]/g, '');
    setPrecosEditados(prev => ({ ...prev, [id]: valorFormatado }));
  };

  const atualizarCatalogo = async () => {
    const idsEditados = Object.keys(precosEditados).filter(id => {
        const prodOriginal = produtosBase.find(p => p.id === id);
        if (!prodOriginal) return false;
        const valorNovo = parseFloat(precosEditados[id].replace(',', '.'));
        return !isNaN(valorNovo) && valorNovo !== prodOriginal.precoBase;
    });

    if (idsEditados.length === 0) {
      alert("Nenhum preço em lote foi alterado.");
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
        
        await setDoc(docRef, { precoBase: novoPreco }, { merge: true });
        setProgresso(Math.round(((i + 1) / idsEditados.length) * 100));
      }
      
      alert("Catálogo atualizado com sucesso!");
      setPrecosEditados({});
      carregarProdutos();
      if (recarregarDados) recarregarDados();
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

  // TELA DE PRECIFICAÇÃO COMPLETA
  return (
    <div className="painel-overlay">
      <div className="painel-modal" style={{ maxWidth: '900px' }}>
        
        {/* HEADER COM BOTÃO ESTILIZADO (Ponto 1) */}
        <div className="painel-header" style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'space-between' }}>
          <h2 style={{ color: 'var(--laranja)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fa-solid fa-database"></i> Gerenciador de Produtos
          </h2>
          
          <div className="painel-controls" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {/* BOTÃO ROBUSTO */}
            <button 
                className={`btn-action btn-orange ${salvando ? 'loading' : ''}`} 
                onClick={atualizarCatalogo}
                disabled={salvando || carregando}
                style={{ 
                  margin: 0, 
                  padding: '10px 20px',
                  fontWeight: '900',
                  boxShadow: '0 4px 6px rgba(241, 89, 33, 0.2)',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
            >
                {salvando && <div className="progress-fill" style={{ width: `${progresso}%`, background: 'rgba(0,0,0,0.15)', position: 'absolute', top: 0, left: 0, bottom: 0, transition: 'width 0.2s' }}></div>}
                <span className="btn-content" style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className={`fa-solid ${salvando ? 'fa-sync fa-spin' : 'fa-cloud-arrow-up'}`}></i>
                    {salvando ? ` SALVANDO LOTE ${progresso}%` : 'ATUALIZAR PREÇOS DA TABELA'}
                </span>
            </button>
            <button className="btn-fechar-painel" onClick={fecharPainel} disabled={salvando} style={{ padding: '10px 20px', height: 'auto' }}>
              ✖ FECHAR
            </button>
          </div>
        </div>

        {/* FORMULÁRIO COMPLETO DE EDIÇÃO (Ponto 3) */}
        <div id="painel-edicao-mestre" className="hide-print" style={{ 
          background: produtoEmEdicao ? '#fff3cd' : '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px', 
          border: `2px solid ${produtoEmEdicao ? 'var(--laranja)' : '#ddd'}`, 
          marginBottom: '25px',
          transition: 'all 0.3s ease'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: 'var(--marrom)', fontSize: '12pt', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-pen-to-square"></i> 
            {produtoEmEdicao ? `Editando: ${produtoEmEdicao.complemento}` : "Clique em EDITAR na tabela abaixo para alterar um produto"}
          </h3>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'flex-end', opacity: produtoEmEdicao ? 1 : 0.5, pointerEvents: produtoEmEdicao ? 'auto' : 'none' }}>
            
            <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#555' }}>CATEGORIA (DROPDOWN)</label>
              <select 
                value={formCategoria} 
                onChange={e => setFormCategoria(e.target.value)} 
                style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', width: '100%', background: '#fff', fontWeight: 'bold', outline: 'none' }}
              >
                <option value="">Selecione...</option>
                {categoriasUnicas.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div style={{ flex: '2 1 250px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#555' }}>NOME / COMPLEMENTO</label>
              <input 
                type="text" 
                value={formComplemento} 
                onChange={e => setFormComplemento(e.target.value)} 
                placeholder="Ex: TABLETE AO LEITE"
                style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', width: '100%', background: '#fff', textTransform: 'uppercase', outline: 'none' }}
              />
            </div>

            <div style={{ flex: '1 1 120px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#555' }}>GRAMATURA</label>
              <input 
                type="text" 
                value={formGramatura} 
                onChange={e => setFormGramatura(e.target.value)} 
                placeholder="Ex: 90g ou 1 UN"
                style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', width: '100%', background: '#fff', textTransform: 'uppercase', outline: 'none' }}
              />
            </div>

            <div style={{ flex: '1 1 120px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#555' }}>PREÇO (R$)</label>
              <input 
                type="text" 
                value={formPreco} 
                onChange={e => setFormPreco(e.target.value.replace(/[^0-9.,]/g, ''))} 
                placeholder="0,00"
                style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', width: '100%', background: '#fff', outline: 'none', fontWeight: 'bold' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', flex: '1 1 100%' }}>
              <button 
                onClick={salvarEdicaoCompleta} 
                disabled={salvandoForm}
                className="btn-action btn-orange"
                style={{ padding: '12px 20px', borderRadius: '4px', fontSize: '10pt', cursor: 'pointer', border: 'none', width: '100%' }}
              >
                <i className="fa-solid fa-floppy-disk"></i> {salvandoForm ? 'SALVANDO...' : 'SALVAR PRODUTO'}
              </button>
              <button 
                onClick={limparFormulario}
                style={{ padding: '12px 20px', borderRadius: '4px', fontSize: '10pt', cursor: 'pointer', border: '1px solid #ccc', background: '#fff', color: '#555', fontWeight: 'bold' }}
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>

        {/* TABELA DE PRODUTOS COM BOTÃO DE AÇÃO (Ponto 2) */}
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
                  <th style={{ textAlign: 'center' }}>EDIÇÃO RÁPIDA (R$)</th>
                  <th style={{ textAlign: 'center' }}>AÇÕES COMPLETA</th>
                </tr>
              </thead>
              <tbody>
                {produtosBase.map(prod => {
                  const valorEditado = precosEditados[prod.id];
                  const valorAtualFormatado = Number(prod.precoBase).toFixed(2).replace('.', ',');
                  const temAlteracao = valorEditado !== undefined && valorEditado !== valorAtualFormatado && valorEditado !== "";
                  
                  // Se o item estiver sendo editado no momento, destaca a linha
                  const isEditando = produtoEmEdicao?.id === prod.id;

                  return (
                    <tr key={prod.id} className="validades-tr linha-normal" style={{ background: isEditando ? '#fff3cd' : 'transparent', transition: 'background 0.3s' }}>
                      <td className="col-cat" style={{ verticalAlign: 'middle' }}><b>{prod.categoria}</b></td>
                      <td className="col-prod" style={{ verticalAlign: 'middle' }}>
                        <div className="prod-nome" style={{ fontWeight: isEditando ? 'bold' : 'normal' }}>{prod.complemento} {prod.gramatura}</div>
                      </td>
                      <td className="col-val-atual" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                        <span className="mobile-label">Preço Atual:</span>
                        <span>R$ {valorAtualFormatado}</span>
                      </td>
                      <td className="col-nova-val" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
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
                              fontWeight: temAlteracao ? '900' : 'normal',
                              width: '90px'
                          }}
                        />
                      </td>
                      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                        <button
                          onClick={() => carregarNoFormulario(prod)}
                          style={{
                            background: isEditando ? 'var(--laranja)' : 'var(--bg-sidebar)',
                            color: isEditando ? '#fff' : 'var(--marrom)',
                            border: `1px solid ${isEditando ? 'var(--laranja)' : '#ccc'}`,
                            padding: '8px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            margin: '0 auto',
                            transition: 'all 0.2s'
                          }}
                        >
                          <i className="fa-solid fa-pencil"></i> {isEditando ? 'EDITANDO...' : 'EDITAR TUDO'}
                        </button>
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
