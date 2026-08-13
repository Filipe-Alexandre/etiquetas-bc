// src/components/Migracao.jsx
import React, { useState } from 'react';
import { db } from '../data/firebaseConfig';
import { collection, getDocs, doc, setDoc, deleteDoc, query, where, addDoc } from 'firebase/firestore';

// ==========================================
// 1. CARGA DE SEGURANÇA (DADOS ESTÁTICOS)
// ==========================================
const categoriasData = [
  {
    nome: "ACESSÓRIOS", prefixo: "ace",
    itens: [
      { comp: "BOLSA M&N 2026", gram: "1 UN", preco: 59.90 },
      { comp: "COPO SNACK AMARELO 2026", gram: "1 UN", preco: 24.90 },
      { comp: "COPO SNACK LARANJA 2026", gram: "1 UN", preco: 24.90 },
      { comp: "COPO TÉRMICO BRASIL CACAU", gram: "1 UN", preco: 59.90 },
    ]
  },
  {
    nome: "ALMOFADA", prefixo: "alm",
    itens: [
    ]
  },
  {
    nome: "BEM ME FAZ", prefixo: "bmf",
    itens: [
      { comp: "BOMBOM AMENDOIM", gram: "20g", preco: 5.99 },
      { comp: "BOMBOM GATO MIA", gram: "20g", preco: 5.99 },
      { comp: "GATO MIA", gram: "70g", preco: 21.99 }
      { comp: "TABLETE AO LEITE", gram: "20g", preco: 6.49 },
      { comp: "TABLETE AO LEITE", gram: "90g", preco: 22.99 },
    ]
  },
  {
    nome: "CANECA", prefixo: "can",
    itens: [
      { comp: "CHUBBY AZUL", gram: "1 UN", preco: 45.00 },
      { comp: "CHUBBY ROSA", gram: "1 UN", preco: 45.00 },
      { comp: "BRASILIDADES", gram: "1 UN", preco: 30.90 },
      { comp: "CORAÇÃO 240ML", gram: "1 UN", preco: 35.90 },
      { comp: "ELO ROSA E VERDE", gram: "1 UN", preco: 34.90 },
      { comp: "FLAT CAPIVARA", gram: "1 UN", preco: 39.99 },
      { comp: "FLAT LARANJA", gram: "1 UN", preco: 39.90 },
      { comp: "FLAT VERDE", gram: "1 UN", preco: 39.90 },
      { comp: "LISTRADA AZUL", gram: "1 UN", preco: 34.90 },
      { comp: "LISTRADA LARANJA", gram: "1 UN", preco: 34.90 },
      { comp: "LISTRADA ROSA", gram: "1 UN", preco: 34.90 },
      { comp: "VM AFETO", gram: "1 UN", preco: 23.60 },
      { comp: "VM CORAÇÃO", gram: "1 UN", preco: 23.60 }
    ]
  },
  {
    nome: "DINDA", prefixo: "din",
    itens: [
      { comp: "ALPINO", gram: "90g", preco: 17.99 },
      { comp: "BOMBOM LOLLO", gram: "90g", preco: 28.99 },
      { comp: "BOMBOM TRADICIONAL", gram: "90g", preco: 28.99 },
      { comp: "LOLLO", gram: "30g", preco: 7.99 },
      { comp: "SENSAÇÃO", gram: "90g", preco: 17.99 },
      { comp: "TRADICIONAL", gram: "30g", preco: 7.99 },
      { comp: "TRADICIONAL", gram: "90g", preco: 17.99 }
    ]
  },
  {
    nome: "GATO MIA", prefixo: "gat",
    itens: [
      { comp: "AO LEITE", gram: "70g", preco: 20.99 },
      { comp: "CHOCOLATE BRANCO", gram: "70g", preco: 20.99 },
      { comp: "RECHEADO ALPINO", gram: "70g", preco: 21.99 },
      { comp: "RECHEADO AVELÃ", gram: "70g", preco: 21.99 },
      { comp: "RECHEADO PISTACHE", gram: "70g", preco: 21.99 }
    ]
  },
  {
    nome: "LATA", prefixo: "lat",
    itens: [

    ]
  },
  {
    nome: "PEGUE E LEVE", prefixo: "peg",
    itens: [
      { comp: "PURO CACAU", gram: "10g", preco: 2.99 },
      { comp: "AO LEITE", gram: "10g", preco: 2.99 },
      { comp: "AO LEITE CASTANHA DE CAJU", gram: "10g", preco: 2.99 },
      { comp: "AO LEITE PISTACHE", gram: "12g", preco: 2.99 },
      { comp: "AVELÃ", gram: "12g", preco: 2.99 },
      { comp: "GATO MIA", gram: "12g", preco: 2.99 },
      { comp: "PURO CACAU", gram: "12g", preco: 2.99 },
      { comp: "TRADICIONAL", gram: "12g", preco: 2.99 }
      { comp: "MORANGO", gram: "12g", preco: 2.99 }
      { comp: "CARAMELO", gram: "12g", preco: 2.99 }
    ]
  },
  {
    nome: "PELÚCIA", prefixo: "pel",
    itens: [

      { comp: "CACHORRO BOB C/ POTE", gram: "1 UN", preco: 65.90 },
   
      { comp: "CACHORRO PIRATA BC", gram: "1 UN", preco: 45.90 },
      { comp: "CAPIVARA C/ TRUFA BRASIL CACAU", gram: "1 UN", preco: 72.90 },
      { comp: "COELHO ROSA C/ POTE", gram: "1 UN", preco: 65.90 },
      { comp: "CORAÇÃO", gram: "1 UN", preco: 35.90 },
      { comp: "CORUJA BABY BC", gram: "1 UN", preco: 69.90 },
      { comp: "DINOSSAURO MINI BC", gram: "1 UN", preco: 49.90 },
      { comp: "GATA NA MANTA BC", gram: "1 UN", preco: 72.00 },
      { comp: "GATO BRANCO C/ POTE ROSA BC", gram: "1 UN", preco: 65.90 },
      { comp: "GIRAFINHA BC", gram: "1 UN", preco: 59.90 },
      { comp: "HIPOPÓTAMO BRASIL CACAU", gram: "1 UN", preco: 65.90 },
      { comp: "LHAMA BC", gram: "1 UN", preco: 69.90 },
      { comp: "RAPOSINHA BC", gram: "1 UN", preco: 65.90 },
      { comp: "UNICÓRNIO BC", gram: "1 UN", preco: 49.90 },
      { comp: "URSO BALAO CORACAO", gram: "1 UN", preco: 89.90 },
      { comp: "URSO CORAÇÃO", gram: "1 UN", preco: 32.90 },
      { comp: "URSO MARROM", gram: "1 UN", preco: 32.90 },
      { comp: "URSO MARROM C/ POTE BC", gram: "1 UN", preco: 65.90 },
      { comp: "URSO NINO C/ POTE", gram: "1 UN", preco: 38.50 },
    ]
  },
  {
    nome: "PRESENTE", prefixo: "pre",
    itens: [
      { comp: "ALEGRIA", gram: "114g", preco: 49.49 },
      { comp: "AMORES", gram: "80g", preco: 39.99 },
      { comp: "AVELÃ & WHITE TOP", gram: "120g", preco: 59.99 },
      { comp: "BUQUÊ DE ROSAS", gram: "36g", preco: 47.97 },
      { comp: "CELEBRAR", gram: "96g", preco: 40.99 },
      { comp: "COMBO 3 DELÍCIAS DO BRASIL", gram: "240g", preco: 71.49 },
      { comp: "MINI TRUFAS", gram: "120g", preco: 35.99 },
      { comp: "DELEITE GATO MIA", gram: "97g", preco: 53.99 },
      { comp: "DELÍRIOS DE CEREJA", gram: "150g", preco: 68.99, maior18: true },
      { comp: "ENCANTOS BRASILEIROS", gram: "108g", preco: 49.49 },
      { comp: "EXPERIÊNCIAS", gram: "192g", preco: 69.99 },
      { comp: "MOMENTOS", gram: "162g", preco: 58.99, maior18: true },
      { comp: "ROSA UNITÁRIA", gram: "12g", preco: 15.99 },
      { comp: "ROSAS", gram: "80g", preco: 39.99 },
      { comp: "SELEÇÕES", gram: "250g", preco: 69.99 },
      { comp: "SENSAÇÃO", gram: "126g", preco: 53.99 },
      { comp: "SUPREMO", gram: "200g", preco: 60.49 },
      { comp: "HARMONIA", gram: "140g", preco: 59.99 }
    ]
  },
  {
    nome: "SEM CATEGORIA", prefixo: "sca",
    itens: [
      { comp: "CAIXA CARTUCHO PP", gram: "1 UN", preco: 1.10 },
      { comp: "CAIXA INST CBC G", gram: "1 UN", preco: 3.90 },
      { comp: "CAIXA INST CBC M", gram: "1 UN", preco: 3.20 },
      { comp: "CAIXA INST CBC P", gram: "1 UN", preco: 2.90 },
      { comp: "CAIXA M LARANJA", gram: "1 UN", preco: 8.90 },
      { comp: "CAIXA P LARANJA", gram: "1 UN", preco: 6.99 },
      { comp: "CAIXA PP LARANJA", gram: "1 UN", preco: 2.99 },
      { comp: "CARTÃO PRESENTE", gram: "1 UN", preco: 7.00 },
      { comp: "CARTUCHO 3 MINITRUFAS BC", gram: "1 UN", preco: 2.99 },
      { comp: "CARTUCHO C/ VISOR", gram: "1 UN", preco: 6.99 },
      { comp: "CESTA RÍGIDA P", gram: "1 UN", preco: 14.90 },
      { comp: "CESTA RÍGIDA M", gram: "1 UN", preco: 15.90 },
      { comp: "CESTA RÍGIDA G", gram: "1 UN", preco: 22.90 },
      { comp: "LAÇO + CELOFANE", gram: "1 UN", preco: 2.00 },
      { comp: "CXARTUCHO P/ TABLETES 90G", gram: "1 UN", preco: 5.99 }
    ]
  },
  {
    nome: "TABLETE", prefixo: "tab",
    itens: [
      { comp: "60% CACAU", gram: "20g", preco: 5.29 },
      { comp: "60% CACAU", gram: "90g", preco: 22.99 },
      { comp: "70% CACAU", gram: "20g", preco: 5.29 },
      { comp: "70% CACAU", gram: "90g", preco: 22.99 },
      { comp: "80% CACAU", gram: "20g", preco: 5.29 },
      { comp: "AO LEITE", gram: "20g", preco: 5.29 },
      { comp: "AO LEITE", gram: "90g", preco: 19.99 },
      { comp: "BRANCO", gram: "90g", preco: 19.99 },
      { comp: "BRANCO GATO MIA", gram: "20g", preco: 5.29 },
      { comp: "CASTANHA DE CAJU", gram: "20g", preco: 5.29 },
      { comp: "CASTANHA DE CAJU", gram: "90g", preco: 19.99 },
    ]
  },
  {
    nome: "TABLETE RECHEADO", prefixo: "tab-rech",
    itens: [
      { comp: "ALPINO", gram: "90g", preco: 22.99 },
      { comp: "AO LEITE TRUFADO OBRIGADO", gram: "90g", preco: 22.99 },
      { comp: "AO LEITE TRUFADO PARABÉNS", gram: "90g", preco: 22.99 },
      { comp: "AO LEITE TRUFADO TE AMO", gram: "90g", preco: 22.99 },
      { comp: "BRIGADEIRO BRASILIDADES", gram: "90g", preco: 22.99 },
      { comp: "CREME DE AVELÃ", gram: "90g", preco: 22.99 },
      { comp: "DUO", gram: "90g", preco: 22.99 },
      { comp: "AO LEITE", gram: "90g", preco: 22.99 },
      { comp: "LICOR DE CEREJA", gram: "90g", preco: 22.99, maior18: true },
      { comp: "PISTACHE", gram: "90g", preco: 22.99 }
    ]
  },
  {
    nome: "TO GO", prefixo: "tgo",
    itens: [
      { comp: "BRIGADEIRÃO", gram: "45g", preco: 10.99 },
      { comp: "CANUDO AVELÃ", gram: "20g", preco: 6.99 },
      { comp: "CANUDO BATON AO LEITE", gram: "20g", preco: 6.99 },
    ]
  },
  {
    nome: "TRUFA", prefixo: "tru",
    itens: [
      { comp: "ALPINO", gram: "25g", preco: 5.29 },
      { comp: "AO LEITE", gram: "25g", preco: 4.99 },
      { comp: "AVELÃ", gram: "25g", preco: 4.99 },
      { comp: "BRANCA", gram: "25g", preco: 4.99 },
      { comp: "BRIGADEIRO", gram: "25g", preco: 4.99 },
      { comp: "CEREJA", gram: "25g", preco: 4.99 },
      { comp: "CHOC BRANCO PISTACHE", gram: "25g", preco: 4.99 },
      { comp: "DUO", gram: "25g", preco: 4.99 },
      { comp: "GATO MIA", gram: "25g", preco: 4.99 },
      { comp: "MARACUJÁ", gram: "25g", preco: 4.99 },
      { comp: "MORANGO", gram: "25g", preco: 4.99 },
      { comp: "OVOMALTINE", gram: "25g", preco: 5.29 },
      { comp: "PRESTÍGIO", gram: "25g", preco: 5.29 },
      { comp: "PURO CACAU", gram: "25g", preco: 4.99 }
    ]
  }
];

const todosOsProdutos = [];
categoriasData.forEach(cat => {
  cat.itens.forEach((produto, index) => {
    const idFormatado = `${cat.prefixo}-${String(index + 1).padStart(2, '0')}`;
    todosOsProdutos.push({
      id: idFormatado,
      categoria: cat.nome,
      complemento: produto.comp,
      gramatura: produto.gram,
      precoBase: produto.preco,
      maior18: produto.maior18 || false
    });
  });
});

// ==========================================
// 2. PAINEL MESTRE (MIGRAÇÃO + CRIAÇÃO MODAL)
// ==========================================
export function Migracao({ fecharPainel, recarregarDados }) {
  const [senha, setSenha] = useState("");
  const [autenticado, setAutenticado] = useState(false);
  const [erroSenha, setErroSenha] = useState(false);

  const [produtosFirebase, setProdutosFirebase] = useState([]);
  const [precosEditados, setPrecosEditados] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [buscaVal, setBuscaVal] = useState("");

  const [salvando, setSalvando] = useState(false);
  const [progresso, setProgresso] = useState(0);

  // Estados do Formulário Modal
  const [produtoEmEdicao, setProdutoEmEdicao] = useState(null);
  const [formCategoria, setFormCategoria] = useState("");
  const [formComplemento, setFormComplemento] = useState("");
  const [formGramatura, setFormGramatura] = useState("");
  const [formPreco, setFormPreco] = useState("");
  const [formMaior18, setFormMaior18] = useState(false);

  const [salvandoForm, setSalvandoForm] = useState(false);
  const [formAberto, setFormAberto] = useState(false);

  const SENHA_MESTRE = "182529";

  const fechar = () => {
    if (fecharPainel) fecharPainel();
  };

  const verificarSenha = (e) => {
    e.preventDefault();
    if (senha === SENHA_MESTRE) {
      setAutenticado(true);
      carregarProdutosDoBanco();
    } else {
      setErroSenha(true);
      setSenha("");
    }
  };

  const carregarProdutosDoBanco = async () => {
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

      setProdutosFirebase(lista);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      alert("Erro ao conectar com o banco de dados.");
    } finally {
      setCarregando(false);
    }
  };

  const categoriasUnicas = Array.from(new Set(produtosFirebase.map(p => p.categoria))).filter(Boolean).sort();

  // Aciona a Modal para NOVO Produto
  const abrirFormularioNovo = () => {
    setProdutoEmEdicao(null);
    setFormCategoria("");
    setFormComplemento("");
    setFormGramatura("");
    setFormPreco("");
    setFormMaior18(false);
    setFormAberto(true);
  };

  // Aciona a Modal para EDITAR Produto Existente
  const carregarNoFormulario = (produto) => {
    setProdutoEmEdicao(produto);
    setFormCategoria(produto.categoria || "");
    setFormComplemento(produto.complemento || "");
    setFormGramatura(produto.gramatura || "");
    setFormPreco(Number(produto.precoBase).toFixed(2).replace('.', ','));
    setFormMaior18(produto.maior18 || false);
    setFormAberto(true);
  };

  const fecharFormulario = () => {
    setFormAberto(false);
  };

const salvarProdutoFormulario = async () => {
    if (!formCategoria || !formComplemento || !formGramatura || !formPreco) {
      return alert("Por favor, preencha todos os campos!");
    }

    const precoLimpo = formPreco.replace(/\./g, '').replace(',', '.');
    const precoFinal = parseFloat(precoLimpo);

    if (isNaN(precoFinal)) return alert("Digite um preço válido!");

    setSalvandoForm(true);
    try {
      if (produtoEmEdicao) {
        const docRef = doc(db, "produtos", produtoEmEdicao.id);
        await setDoc(docRef, {
          categoria: formCategoria.toUpperCase(),
          complemento: formComplemento.toUpperCase(),
          gramatura: formGramatura.toUpperCase(),
          precoBase: precoFinal,
          maior18: formMaior18 // <--- SALVA A EDIÇÃO NO BANCO
        }, { merge: true });
        alert("Produto atualizado com sucesso!");
      } else {
        await addDoc(collection(db, "produtos"), {
          categoria: formCategoria.toUpperCase(),
          complemento: formComplemento.toUpperCase(),
          gramatura: formGramatura.toUpperCase(),
          precoBase: precoFinal,
          maior18: formMaior18 // <--- SALVA O CADASTRO NO BANCO
        });
        alert("Novo produto cadastrado com sucesso!");
      }

      fecharFormulario();
      carregarProdutosDoBanco();
      if (recarregarDados) recarregarDados();
    } catch (error) {
      console.error("Erro ao salvar o produto:", error);
      alert("Falha ao salvar produto.");
    } finally {
      setSalvandoForm(false);
    }
  };

  const handleChangePreco = (id, valorStr) => {
    let valorFormatado = valorStr.replace(/[^0-9.,]/g, '');
    setPrecosEditados(prev => ({ ...prev, [id]: valorFormatado }));
  };

  const excluirProduto = async (produto) => {
    if (!window.confirm(`ATENÇÃO: Deseja EXCLUIR o produto "${produto.complemento}"?`)) return;
    try {
      await deleteDoc(doc(db, "produtos", produto.id));
      alert("Produto excluído!");
      setProdutosFirebase(prev => prev.filter(p => p.id !== produto.id));
      if (recarregarDados) recarregarDados();
    } catch (error) {
      console.error("Erro ao excluir:", error);
      alert("Falha ao excluir.");
    }
  };

  const salvarTudo = async () => {
    const idsEditados = Object.keys(precosEditados).filter(id => {
      const prodOriginal = produtosFirebase.find(p => p.id === id);
      if (!prodOriginal) return false;

      const valorNovoFormatado = precosEditados[id].replace(/\./g, '').replace(',', '.');
      const valorNovo = parseFloat(valorNovoFormatado);

      return !isNaN(valorNovo) && valorNovo !== prodOriginal.precoBase;
    });

    if (idsEditados.length === 0) {
      alert("Nenhum preço foi alterado na tabela rápida.");
      return;
    }

    if (!window.confirm(`Atualizar o preço de ${idsEditados.length} produto(s)?`)) return;

    setSalvando(true);
    setProgresso(0);

    try {
      for (let i = 0; i < idsEditados.length; i++) {
        const id = idsEditados[i];
        const valorNovoFormatado = precosEditados[id].replace(/\./g, '').replace(',', '.');
        const novoPreco = parseFloat(valorNovoFormatado);
        const docRef = doc(db, "produtos", id);

        await setDoc(docRef, { precoBase: novoPreco }, { merge: true });
        setProgresso(Math.round(((i + 1) / idsEditados.length) * 100));
      }

      alert("Todos os preços foram atualizados!");
      setPrecosEditados({});
      carregarProdutosDoBanco();
      if (recarregarDados) recarregarDados();
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar os preços.");
    } finally {
      setSalvando(false);
      setProgresso(0);
    }
  };

  const executarSincronizacaoDaCarga = async () => {
    if (!window.confirm(`Isso enviará novos itens e atualizará os preços da nuvem (${todosOsProdutos.length} itens). Deseja continuar?`)) return;

    setSalvando(true);
    setProgresso(0);

    try {
      const produtosCollection = collection(db, "produtos");

      for (let i = 0; i < todosOsProdutos.length; i++) {
        const itemLocal = todosOsProdutos[i];

        const q = query(
          produtosCollection,
          where("complemento", "==", itemLocal.complemento),
          where("gramatura", "==", itemLocal.gramatura)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docIdExistente = querySnapshot.docs[0].id;
          const docRef = doc(db, "produtos", docIdExistente);

          await setDoc(docRef, {
            categoria: itemLocal.categoria,
            precoBase: itemLocal.precoBase,
            maior18: itemLocal.maior18
          }, { merge: true });
        } else {
          await addDoc(produtosCollection, {
            categoria: itemLocal.categoria,
            complemento: itemLocal.complemento,
            gramatura: itemLocal.gramatura,
            precoBase: itemLocal.precoBase,
            maior18: itemLocal.maior18
          });
        }
        setProgresso(Math.round(((i + 1) / todosOsProdutos.length) * 100));
      }

      alert("Catálogo sincronizado com sucesso!");
      carregarProdutosDoBanco();
      if (recarregarDados) recarregarDados();
    } catch (error) {
      console.error("Erro na sincronização:", error);
      alert("Erro ao enviar a carga.");
    } finally {
      setSalvando(false);
      setProgresso(0);
    }
  };

  if (!autenticado) {
    return (
      <div className="painel-overlay" onClick={fechar}>
        <div className="painel-modal modal-senha" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '350px', height: 'auto', minHeight: 'auto', position: 'relative' }}>
          <button className="btn-fechar-absoluto" onClick={fechar}>✖</button>
          <h2 style={{ color: 'var(--marrom)', textAlign: 'center', marginBottom: '20px' }}><i className="fa-solid fa-lock"></i> Acesso Restrito</h2>
          <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px', fontSize: '12px' }}>Digite a senha para gerenciar os preços do banco de dados.</p>
          <form onSubmit={verificarSenha} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input
              type="password"
              placeholder="Senha de Acesso"
              value={senha}
              onChange={(e) => { setSenha(e.target.value); setErroSenha(false); }}
              autoFocus
              style={{ padding: '12px', borderRadius: '6px', border: `2px solid ${erroSenha ? 'red' : 'var(--laranja)'}`, fontFamily: 'var(--bold)', textAlign: 'center', fontSize: '18px', outline: 'none' }}
            />
            {erroSenha && <span style={{ color: 'red', fontSize: '11px', textAlign: 'center' }}>Senha incorreta!</span>}
            <button type="submit" style={{ background: 'var(--laranja)', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'var(--bold)' }}>DESBLOQUEAR</button>
          </form>
        </div>
      </div>
    );
  }

  const produtosFiltrados = produtosFirebase.filter(p =>
    (p.complemento || '').toLowerCase().includes(buscaVal.toLowerCase()) ||
    (p.categoria || '').toLowerCase().includes(buscaVal.toLowerCase()) ||
    (p.gramatura || '').toLowerCase().includes(buscaVal.toLowerCase())
  );

  return (
    <>
      <div className="painel-overlay" onClick={fechar}>
        <div className="painel-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '1000px', width: '95vw' }}>

          <div className="painel-header" style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h2 style={{ color: 'var(--laranja)', margin: 0, fontSize: '18px' }}>
                <i className="fa-solid fa-server"></i> GERENCIADOR DE CATÁLOGO
              </h2>
              <button
                className={salvando ? 'loading' : ''}
                onClick={executarSincronizacaoDaCarga}
                disabled={salvando || carregando}
                style={{
                  margin: 0,
                  padding: '5px 10px',
                  fontWeight: 'bold',
                  fontSize: '10px',
                  backgroundColor: '#e2e2e2',
                  color: '#777777',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  width: 'fit-content'
                }}
              >
                {salvando ? `⏳ SALVANDO CARGA ${progresso}%` : 'ENVIAR CARGA PADRÃO DO CÓDIGO'}
              </button>
            </div>

            {/* CONTROLES: Inline no PC, Grid no Celular */}
            <div className="migracao-header-actions">
              <input
                type="text"
                className="migracao-busca"
                placeholder="🔍 Buscar produto..."
                value={buscaVal}
                onChange={(e) => setBuscaVal(e.target.value)}
              />
              <button className="migracao-btn btn-cadastrar" onClick={abrirFormularioNovo} disabled={salvando || carregando}>
                <i className="fa-solid fa-plus"></i> CADASTRAR
              </button>
              <button className="migracao-btn btn-salvar" onClick={salvarTudo} disabled={salvando || carregando}>
                <i className="fa-solid fa-floppy-disk"></i> SALVAR LOTE
              </button>
              <button className="migracao-btn btn-fechar" onClick={fechar} disabled={salvando}>
                <i className="fa-solid fa-xmark"></i> FECHAR
              </button>
            </div>
          </div>

          <div className="table-responsive" style={{ maxHeight: '60vh', overflowY: 'auto', marginTop: '15px' }}>
            {carregando ? (
              <div style={{ textAlign: 'center', padding: '50px', color: 'var(--laranja)' }}>
                <h3><i className="fa-solid fa-spinner fa-spin"></i> Carregando preços do servidor...</h3>
              </div>
            ) : (
              <table className="validades-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th>CATEGORIA</th>
                    <th>PRODUTO</th>
                    <th style={{ textAlign: 'center' }}>PREÇO ATUAL</th>
                    <th style={{ textAlign: 'center' }}>EDIÇÃO RÁPIDA (R$)</th>
                    <th style={{ textAlign: 'center' }}>AÇÕES</th>
                  </tr>
                </thead>
                <tbody>
                  {produtosFiltrados.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>Nenhum produto encontrado.</td></tr>
                  ) : (
                    produtosFiltrados.map(prod => {
                      const valorEditado = precosEditados[prod.id];
                      const precoAtualFormat = Number(prod.precoBase).toFixed(2).replace('.', ',');
                      const temAlteracao = valorEditado !== undefined && valorEditado !== precoAtualFormat && valorEditado !== "";

                      return (
                        <tr key={prod.id} className="validades-tr linha-normal" style={{ borderBottom: '1px solid #eee' }}>
                          <td className="col-cat" style={{ verticalAlign: 'middle', padding: '10px' }}><b>{prod.categoria}</b></td>
                          <td className="col-prod" style={{ verticalAlign: 'middle', padding: '10px' }}>
                            <div className="prod-nome">
                              {prod.complemento} {prod.gramatura}
                            </div>
                            <span style={{ fontSize: '10px', color: '#999' }}>ID: {prod.id}</span>
                          </td>
                          <td className="col-val-atual" style={{ textAlign: 'center', verticalAlign: 'middle', padding: '10px' }}>
                            <span style={{ fontWeight: 'bold', color: 'var(--laranja)' }}>R$ {precoAtualFormat}</span>
                          </td>
                          <td className="col-nova-val" style={{ textAlign: 'center', verticalAlign: 'middle', padding: '10px' }}>
                            <input
                              type="text"
                              placeholder={precoAtualFormat}
                              value={valorEditado !== undefined ? valorEditado : ''}
                              onChange={(e) => handleChangePreco(prod.id, e.target.value)}
                              style={{ 
                                padding: '5px', 
                                borderRadius: '4px', 
                                border: `1px solid ${temAlteracao ? 'var(--laranja)' : '#ccc'}`,
                                width: '80px',
                                textAlign: 'center'
                              }}
                            />
                          </td>
                          <td className="col-acao" style={{ display: 'flex', gap: '5px', justifyContent: 'center', verticalAlign: 'middle', padding: '10px' }}>
                            <button
                              onClick={() => carregarNoFormulario(prod)}
                              style={{ background: '#03A9F4', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}
                            >
                              <i className="fa-solid fa-pencil"></i> EDITAR
                            </button>
                            <button
                              onClick={() => excluirProduto(prod)}
                              style={{ background: '#F44336', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              <i className="fa-solid fa-trash-can"></i>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          MODAL SOBREPOSTA DE CADASTRO / EDIÇÃO
      ======================================================== */}
      {formAberto && (
        <div className="modal-secundaria-overlay" onClick={fecharFormulario}>
          <div className="modal-secundaria-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: 0, color: produtoEmEdicao ? '#0288D1' : 'var(--laranja)', fontSize: '14pt', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              <i className={`fa-solid ${produtoEmEdicao ? 'fa-pen-to-square' : 'fa-circle-plus'}`}></i> 
              {produtoEmEdicao ? ` Editar Produto` : " Cadastrar Novo Produto"}
            </h3>

            <div className="modal-input-group">
              <label>CATEGORIA</label>
              <select value={formCategoria} onChange={e => setFormCategoria(e.target.value)}>
                <option value="">Selecione a categoria...</option>
                {categoriasUnicas.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="modal-input-group">
              <label>NOME / COMPLEMENTO</label>
              <input type="text" value={formComplemento} onChange={e => setFormComplemento(e.target.value)} placeholder="Ex: TABLETE AO LEITE" style={{ textTransform: 'uppercase' }} />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <div className="modal-input-group" style={{ flex: 1 }}>
                <label>GRAMATURA</label>
                <input type="text" value={formGramatura} onChange={e => setFormGramatura(e.target.value)} placeholder="Ex: 90g" style={{ textTransform: 'uppercase' }} />
              </div>
              <div className="modal-input-group" style={{ flex: 1 }}>
                <label>PREÇO (R$)</label>
                <input type="text" value={formPreco} onChange={(e) => {
                  let valor = e.target.value.replace(/\D/g, '');
                  if (!valor) valor = '0';
                  setFormPreco((Number(valor) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
                }} placeholder="0,00" style={{ fontWeight: 'bold', color: 'var(--laranja)' }} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
                <input 
                  type="checkbox" 
                  checked={formMaior18} 
                  onChange={(e) => setFormMaior18(e.target.checked)} 
                  style={{ width: '18px', height: '18px', accentColor: '#d32f2f', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: formMaior18 ? '#d32f2f' : '#666', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i style={{ color: formMaior18 ? '#4A0D12' : '#666' }} className="fa-solid fa-wine-glass"></i> Produto Destinado a Maiores de 18 Anos
                </span>
              </label>
            </div>

            <div className="modal-actions">
              <button onClick={fecharFormulario} style={{ background: '#e0e0e0', color: '#333' }}>
                CANCELAR
              </button>
              <button onClick={salvarProdutoFormulario} disabled={salvandoForm} style={{ background: '#4CAF50', flex: 2 }}>
                {salvandoForm ? <i className="fa-solid fa-spinner fa-spin"></i> : (produtoEmEdicao ? 'SALVAR ALTERAÇÃO' : 'CADASTRAR')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
