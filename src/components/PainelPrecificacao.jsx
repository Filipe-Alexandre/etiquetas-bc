// src/components/PainelPrecificacao.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../data/firebaseConfig';
import { collection, getDocs, doc, setDoc, addDoc } from 'firebase/firestore';

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
  // ESTADOS DO FORMULÁRIO (MODAL DE PRODUTO)
  // ==================================================
  const [formAberto, setFormAberto] = useState(false);
  const [produtoEmEdicao, setProdutoEmEdicao] = useState(null);
  const [formCategoria, setFormCategoria] = useState("");
  const [formComplemento, setFormComplemento] = useState("");
  const [formGramatura, setFormGramatura] = useState("");
  const [formPreco, setFormPreco] = useState("");
  const [salvandoForm, setSalvandoForm] = useState(false);

  // ==================================================
  // ESTADOS DA MODAL DE NOVA CATEGORIA (MODAL SOBRE MODAL)
  // ==================================================
  const [modalCategoriaAberta, setModalCategoriaAberta] = useState(false);
  const [novaCategoriaInput, setNovaCategoriaInput] = useState("");

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
        // 1. Ordena por Categoria
        if (a.categoria < b.categoria) return -1;
        if (a.categoria > b.categoria) return 1;

        // 2. Se a categoria for igual, ordena pelo Complemento (nome)
        const compA = a.complemento || "";
        const compB = b.complemento || "";
        
        if (compA !== compB) {
          return compA.localeCompare(compB);
        }

        // 3. Se o complemento também for igual, ordena pela Gramatura
        const gramA = a.gramatura || "";
        const gramB = b.gramatura || "";
        
        // O { numeric: true } garante que "100g" venha DEPOIS de "20g" em vez de antes.
        return gramA.localeCompare(gramB, undefined, { numeric: true });
      });
      
      setProdutosBase(lista);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      alert("Erro ao conectar com o banco de dados.");
    } finally {
      setCarregando(false);
    }
  };

  const categoriasUnicas = Array.from(new Set(produtosBase.map(p => p.categoria))).filter(Boolean).sort();

  // Aciona a Modal para NOVO Produto
  const abrirFormularioNovo = () => {
    setProdutoEmEdicao(null);
    setFormCategoria("");
    setFormComplemento("");
    setFormGramatura("");
    setFormPreco("");
    setFormAberto(true);
  };

  // Carrega o produto selecionado na lista para a Modal
  const carregarNoFormulario = (produto) => {
    setProdutoEmEdicao(produto);
    setFormCategoria(produto.categoria || "");
    setFormComplemento(produto.complemento || "");
    setFormGramatura(produto.gramatura || "");
    setFormPreco(Number(produto.precoBase).toFixed(2).replace('.', ','));
    
    setFormAberto(true);
  };

  const limparFormulario = () => {
    setProdutoEmEdicao(null);
    setFormCategoria("");
    setFormComplemento("");
    setFormGramatura("");
    setFormPreco("");
    setFormAberto(false);
  };

  // Grava as alterações ou CRIA o novo produto no Firebase
  const salvarEdicaoCompleta = async () => {
    if (!formCategoria || !formComplemento || !formGramatura || !formPreco) {
      return alert("Por favor, preencha todos os campos do formulário!");
    }

    const precoFinal = parseFloat(formPreco.replace(',', '.'));
    if (isNaN(precoFinal)) return alert("Digite um preço válido!");

    setSalvandoForm(true);
    try {
      if (produtoEmEdicao) {
        // MODO EDIÇÃO
        const docRef = doc(db, "produtos", produtoEmEdicao.id);
        await setDoc(docRef, {
          categoria: formCategoria.toUpperCase(),
          complemento: formComplemento.toUpperCase(),
          gramatura: formGramatura.toUpperCase(),
          precoBase: precoFinal
        }, { merge: true });
        alert("Produto atualizado com sucesso!");
      } else {
        // MODO CRIAÇÃO DE NOVO PRODUTO
        await addDoc(collection(db, "produtos"), {
          categoria: formCategoria.toUpperCase(),
          complemento: formComplemento.toUpperCase(),
          gramatura: formGramatura.toUpperCase(),
          precoBase: precoFinal
        });
        alert("Novo produto cadastrado com sucesso!");
      }

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

  // TELA PRINCIPAL DA PRECIFICAÇÃO
  return (
    <>
      <div className="painel-overlay">
        <div className="painel-modal" style={{ maxWidth: '900px' }}>
          
          <div className="painel-header" style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'space-between' }}>
            <h2 style={{ color: 'var(--laranja)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="fa-solid fa-database"></i> Gerenciador de Produtos
            </h2>
            
            <div className="painel-controls" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* NOVO BOTÃO CADASTRAR DIRETO NO HEADER */}
              <button 
                  className="btn-action" 
                  onClick={abrirFormularioNovo}
                  disabled={salvando || carregando}
                  style={{ 
                    margin: 0, 
                    padding: '10px 20px',
                    fontWeight: '900',
                    background: '#03A9F4',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px rgba(3, 169, 244, 0.2)'
                  }}
              >
                  <i className="fa-solid fa-plus"></i> CADASTRAR
              </button>

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

          {/* TABELA DE PRODUTOS */}
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
                    
                    return (
                      <tr key={prod.id} className="validades-tr linha-normal" style={{ borderBottom: '1px solid #eee' }}>
                        <td className="col-cat" style={{ verticalAlign: 'middle', padding: '10px' }}><b>{prod.categoria}</b></td>
                        <td className="col-prod" style={{ verticalAlign: 'middle', padding: '10px' }}>
                          <div className="prod-nome">{prod.complemento} {prod.gramatura}</div>
                        </td>
                        <td className="col-val-atual" style={{ textAlign: 'center', verticalAlign: 'middle', padding: '10px' }}>
                          <span className="mobile-label">Preço Atual:</span>
                          <span style={{ color: 'var(--laranja)', fontWeight: 'bold' }}>R$ {valorAtualFormatado}</span>
                        </td>
                        <td className="col-nova-val" style={{ textAlign: 'center', verticalAlign: 'middle', padding: '10px' }}>
                          <span className="mobile-label">Novo Preço:</span>
                          <input
                            type="text"
                            className="input-nova-data"
                            placeholder={valorAtualFormatado}
                            value={valorEditado !== undefined ? valorEditado : ''}
                            onChange={(e) => handleChangePreco(prod.id, e.target.value)}
                            style={{ 
                                padding: '5px',
                                borderRadius: '4px',
                                borderColor: temAlteracao ? 'var(--laranja)' : '#ccc',
                                borderStyle: 'solid',
                                borderWidth: '1px',
                                color: temAlteracao ? 'var(--laranja)' : '#444',
                                fontWeight: temAlteracao ? '900' : 'normal',
                                width: '80px',
                                textAlign: 'center'
                            }}
                          />
                        </td>
                        <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '10px' }}>
                          <button
                            onClick={() => carregarNoFormulario(prod)}
                            style={{
                              background: '#03A9F4',
                              color: '#fff',
                              border: 'none',
                              padding: '8px 12px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '5px',
                              margin: '0 auto',
                              transition: 'all 0.2s'
                            }}
                          >
                            <i className="fa-solid fa-pencil"></i> EDITAR
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

      {/* ========================================================
          MODAL 1: CADASTRO / EDIÇÃO DE PRODUTO
      ======================================================== */}
      {formAberto && (
        <div className="modal-secundaria-overlay" onClick={limparFormulario} style={{ zIndex: 99999 }}>
          <div className="modal-secundaria-content" onClick={(e) => e.stopPropagation()} style={{ background: '#fff', padding: '25px', borderRadius: '8px', width: '100%', maxWidth: '500px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', gap: '15px', boxSizing: 'border-box' }}>
            <h3 style={{ margin: 0, color: produtoEmEdicao ? '#0288D1' : 'var(--laranja)', fontSize: '14pt', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              <i className={`fa-solid ${produtoEmEdicao ? 'fa-pen-to-square' : 'fa-circle-plus'}`}></i> 
              {produtoEmEdicao ? ` Editar Produto` : " Cadastrar Novo Produto"}
            </h3>

            <div className="modal-input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#555' }}>CATEGORIA</label>
                <span 
                  onClick={() => setModalCategoriaAberta(true)} 
                  style={{ fontSize: '10px', color: 'var(--laranja)', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  ➕ NOVA CATEGORIA
                </span>
              </div>
              <select value={formCategoria} onChange={e => setFormCategoria(e.target.value)} style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '4px', width: '100%', outline: 'none' }}>
                <option value="">Selecione a categoria...</option>
                {categoriasUnicas.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                {/* Isso garante que a categoria recém-criada apareça selecionada */}
                {formCategoria && !categoriasUnicas.includes(formCategoria) && (
                  <option value={formCategoria} style={{ color: 'var(--laranja)', fontWeight: 'bold' }}>
                    {formCategoria}
                  </option>
                )}
              </select>
            </div>

            <div className="modal-input-group">
              <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#555' }}>NOME / COMPLEMENTO</label>
              <input type="text" value={formComplemento} onChange={e => setFormComplemento(e.target.value)} placeholder="Ex: TABLETE AO LEITE" style={{ textTransform: 'uppercase', padding: '12px', border: '1px solid #ccc', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }} />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <div className="modal-input-group" style={{ flex: 1 }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#555' }}>GRAMATURA</label>
                <input type="text" value={formGramatura} onChange={e => setFormGramatura(e.target.value)} placeholder="Ex: 90g" style={{ textTransform: 'uppercase', padding: '12px', border: '1px solid #ccc', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }} />
              </div>
              <div className="modal-input-group" style={{ flex: 1 }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#555' }}>PREÇO (R$)</label>
                <input type="text" value={formPreco} onChange={(e) => {
                  let valor = e.target.value.replace(/\D/g, '');
                  if (!valor) valor = '0';
                  setFormPreco((Number(valor) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
                }} placeholder="0,00" style={{ fontWeight: 'bold', color: 'var(--laranja)', padding: '12px', border: '1px solid #ccc', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div className="modal-actions" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button onClick={limparFormulario} style={{ flex: 1, padding: '12px', background: '#e0e0e0', color: '#333', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                CANCELAR
              </button>
              <button onClick={salvarEdicaoCompleta} disabled={salvandoForm} style={{ flex: 2, padding: '12px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                {salvandoForm ? <i className="fa-solid fa-spinner fa-spin"></i> : (produtoEmEdicao ? 'SALVAR ALTERAÇÃO' : 'CADASTRAR')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: CRIAR NOVA CATEGORIA (SOBREPOSTA)
      ======================================================== */}
      {modalCategoriaAberta && (
        <div className="modal-secundaria-overlay" style={{ zIndex: 999999, background: 'rgba(0,0,0,0.8)' }}>
          <div className="modal-secundaria-content" style={{ background: '#fff', padding: '25px', borderRadius: '8px', width: '100%', maxWidth: '350px', display: 'flex', flexDirection: 'column', gap: '15px', boxSizing: 'border-box' }}>
            <h3 style={{ margin: 0, color: 'var(--laranja)', fontSize: '12pt', textAlign: 'center' }}>
              ➕ CRIAR CATEGORIA
            </h3>
            
            <div className="modal-input-group">
              <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#555' }}>NOME DA NOVA CATEGORIA</label>
              <input 
                type="text" 
                value={novaCategoriaInput} 
                onChange={e => setNovaCategoriaInput(e.target.value)} 
                placeholder="Ex: BEBIDAS QUENTES"
                autoFocus
                style={{ textTransform: 'uppercase', border: '2px solid var(--laranja)', padding: '12px', borderRadius: '4px', width: '100%', boxSizing: 'border-box', fontWeight: 'bold', color: 'var(--laranja)', outline: 'none' }}
              />
            </div>

            <div className="modal-actions" style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { setModalCategoriaAberta(false); setNovaCategoriaInput(""); }} style={{ flex: 1, padding: '12px', background: '#e0e0e0', color: '#333', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                CANCELAR
              </button>
              <button onClick={() => {
                if (novaCategoriaInput.trim() !== "") {
                  setFormCategoria(novaCategoriaInput.toUpperCase());
                  setModalCategoriaAberta(false);
                  setNovaCategoriaInput("");
                }
              }} style={{ flex: 1, padding: '12px', background: 'var(--laranja)', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                USAR
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
