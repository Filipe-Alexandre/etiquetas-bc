// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { EtiquetaNormal } from './components/EtiquetaNormal';
import { EtiquetaDePor } from './components/EtiquetaDePor';
import { EtiquetaClube } from './components/EtiquetaClube'; // Etiqueta Clube mantida
import { EtiquetaKit } from './components/EtiquetaKit';
import { EtiquetaKitDePor } from './components/EtiquetaKitDePor';
import { PainelValidades } from './components/PainelValidades';
import { PainelPrecificacao } from './components/PainelPrecificacao';
import { Migracao } from './components/Migracao';

import { db } from './data/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true); 
  const [showPrecos, setShowPrecos] = useState(false);
  
  const [bancoDeDados, setBancoDeDados] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showMigracao, setShowMigracao] = useState(false);

  const [selectedItems, setSelectedItems] = useState([]);
  const [kitsParaImpressao, setKitsParaImpressao] = useState([]);

  const [labelType, setLabelType] = useState("NORMAL");
  const [discountType, setDiscountType] = useState('percent');
  const [discountValue, setDiscountValue] = useState(15);

  const carregarDadosDoFirebase = async () => {
    setCarregando(true);
    try {
      const querySnapshot = await getDocs(collection(db, "produtos"));
      const validadesLocais = JSON.parse(localStorage.getItem('minhas_validades')) || {};

      const listaProdutos = querySnapshot.docs.map(doc => {
        const dadosBanco = doc.data();
        let cat = dadosBanco.categoria;

        const nomeProduto = (dadosBanco.complemento || "").toUpperCase();
        const gramatura = dadosBanco.gramatura || "";

        if (cat === 'PEGUE E LEVE' || cat === 'MINI TRUFA' || cat === 'MINI TABLETE') {
          if (nomeProduto.includes('TRUFA') || gramatura === '12g' || gramatura === '30g') {
            cat = 'MINI TRUFA';
          } else {
            cat = 'MINI TABLETE';
          }
        }

        if (nomeProduto.includes('RECHEADO') && cat !== 'GATO MIA') {
            cat = 'TABLETE RECHEADO';
        }

        return {
          id: doc.id,
          ...dadosBanco,
          categoria: cat,
          validade: validadesLocais[doc.id] !== undefined ? validadesLocais[doc.id] : (dadosBanco.validade || "")
        };
      });

      // ORDENAÇÃO DUPLA: Primeiro pela Categoria, depois pelo Complemento (Produto)
      listaProdutos.sort((a, b) => {
        if (a.categoria < b.categoria) return -1;
        if (a.categoria > b.categoria) return 1;
        
        // Se as categorias forem iguais, ordena pelo nome do produto
        const nomeA = (a.complemento || "").trim().toUpperCase();
        const nomeB = (b.complemento || "").trim().toUpperCase();
        return nomeA.localeCompare(nomeB);
      });

      const bdAgrupado = listaProdutos.reduce((acc, prod) => {
        if (!acc[prod.categoria]) acc[prod.categoria] = [];
        acc[prod.categoria].push(prod);
        return acc;
      }, {});

      // ORDENAÇÃO DAS CATEGORIAS (Ordem de Exibição na Sidebar)
      const ordemFinal = ['ACESSÓRIOS', 'ALMOFADA', 'CANECA', 'LATA', 'PELÚCIA', 'SEM CATEGORIA'];
      const categoriasOrdenadas = Object.keys(bdAgrupado).sort((a, b) => {
        const indexA = ordemFinal.indexOf(a);
        const indexB = ordemFinal.indexOf(b);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return 1;
        if (indexB !== -1) return -1;
        return a.localeCompare(b);
      });

      const bdFinal = {};
      categoriasOrdenadas.forEach(c => bdFinal[c] = bdAgrupado[c]);

      setBancoDeDados(bdFinal);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDadosDoFirebase();
  }, []);

  if (carregando) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', color: 'var(--laranja)', fontFamily: 'var(--bold)' }}>
        <h2>Carregando sistema...</h2>
      </div>
    );
  }

  const todosProdutos = Object.values(bancoDeDados).flat();
  
  // PREPARA OS PRODUTOS SELECIONADOS (Apenas filtrando a lista ordenada)
  const produtosSelecionados = todosProdutos.filter(p => selectedItems.includes(p.id));

  const paginas = [];
  for (let i = 0; i < produtosSelecionados.length; i += 12) {
    paginas.push(produtosSelecionados.slice(i, i + 12));
  }

  const toggleItem = (id) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const selectAllCategory = (catName) => {
    const idsDaCat = bancoDeDados[catName].map(p => p.id);
    const todosJaSelecionados = idsDaCat.every(id => selectedItems.includes(id));
    setSelectedItems(prev => todosJaSelecionados
      ? prev.filter(id => !idsDaCat.includes(id))
      : [...new Set([...prev, ...idsDaCat])]);
  };

  return (
   <div className={`layout-wrapper ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
      
      <button className="fab-menu hide-print" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <i className={`fa-solid ${sidebarOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
      </button>

      {sidebarOpen && <div className="sidebar-overlay hide-print" onClick={() => setSidebarOpen(false)}></div>}
      
      <Sidebar
        selectedItems={selectedItems}
        toggleItem={toggleItem}
        labelType={labelType}
        setLabelType={setLabelType}
        selectAllGlobal={(check) => setSelectedItems(check ? todosProdutos.map(p => p.id) : [])}
        selectAllCategory={selectAllCategory}
        onPrint={() => window.print()}
        printCount={produtosSelecionados.length}
        discountType={discountType}
        setDiscountType={setDiscountType}
        discountValue={discountValue}
        setDiscountValue={setDiscountValue}
        bancoDeDados={bancoDeDados}
        sidebarOpen={sidebarOpen}
        abrirPainelAdmin={() => setShowAdmin(true)}
        abrirPainelPrecos={() => setShowPrecos(true)} 
        abrirPainelMigracao={() => setShowMigracao(true)}
      />

      <main className="main-content">
        {showAdmin && <PainelValidades todosProdutos={todosProdutos} fecharPainel={() => setShowAdmin(false)} recarregarDados={carregarDadosDoFirebase} />}
        {showPrecos && <PainelPrecificacao fecharPainel={() => setShowPrecos(false)} recarregarDados={carregarDadosDoFirebase} />}
        {showMigracao && <Migracao fecharPainel={() => setShowMigracao(false)} recarregarDados={carregarDadosDoFirebase} />}

        <div className="area-impressao">
          {labelType === 'KIT' && (
              <EtiquetaKit todosProdutos={todosProdutos} bancoDeDados={bancoDeDados} kitsParaImpressao={kitsParaImpressao} setKitsParaImpressao={setKitsParaImpressao} />
          )}

          {labelType === 'KIT DE POR' && (
              <EtiquetaKitDePor todosProdutos={todosProdutos} bancoDeDados={bancoDeDados} discountType={discountType} discountValue={discountValue} kitsParaImpressao={kitsParaImpressao} setKitsParaImpressao={setKitsParaImpressao} />
          )}

          {(labelType === 'NORMAL' || labelType === 'DE POR' || labelType === 'CLUBE') && (
            paginas.length > 0 ? (
              paginas.map((grupo, idx) => (
                <div key={idx} className="preview-folha">
                  {grupo.map(produto => (
                    <React.Fragment key={produto.id}>
                      {labelType === 'NORMAL' && <EtiquetaNormal produto={produto} />}
                      {labelType === 'DE POR' && <EtiquetaDePor produto={produto} discountType={discountType} discountValue={discountValue} />}
                      {labelType === 'CLUBE' && <EtiquetaClube produto={produto} discountType={discountType} discountValue={discountValue} />}
                    </React.Fragment>
                  ))}
                </div>
              ))
            ) : (
              <div className="preview-folha" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#999' }}>Selecione produtos para visualizar a folha</p>
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}

export default App;