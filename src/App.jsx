// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { EtiquetaNormal } from './components/EtiquetaNormal';
import { EtiquetaDePor } from './components/EtiquetaDePor';
import { EtiquetaKit } from './components/EtiquetaKit';
import { EtiquetaKitDePor } from './components/EtiquetaKitDePor';
import { PainelValidades } from './components/PainelValidades';

import { db } from './data/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { Migracao } from './components/Migracao';

function App() {
  const [bancoDeDados, setBancoDeDados] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);

  const [selectedItems, setSelectedItems] = useState([]);

  // O NOSSO "CARRINHO" DE KITS
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

        // 1. REGRA DO PEGUE E LEVE
        if (cat === 'PEGUE E LEVE' || cat === 'MINI TRUFA' || cat === 'MINI TABLETE') {
          if (nomeProduto.includes('TRUFA') || gramatura === '12g' || gramatura === '30g') {
            cat = 'MINI TRUFA';
          } else {
            cat = 'MINI TABLETE';
          }
        }

        // 2. REGRA DO TABLETE RECHEADO
        if (nomeProduto.includes('RECHEADO')) {
          cat = 'TABLETE RECHEADO';
        }

        return {
          id: doc.id,
          ...dadosBanco,
          categoria: cat,
          validade: validadesLocais[doc.id] !== undefined ? validadesLocais[doc.id] : (dadosBanco.validade || "")
        };
      });

      const bdAgrupado = listaProdutos.reduce((acc, prod) => {
        if (!acc[prod.categoria]) acc[prod.categoria] = [];
        acc[prod.categoria].push(prod);
        return acc;
      }, {});

      // 3. ORDENAÇÃO DO SIDEBAR
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
      console.error("Erro ao buscar dados do Firebase:", error);
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
    <div className="layout-wrapper">
      {/* <Migracao /> */}
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
        abrirPainelAdmin={() => setShowAdmin(true)}
        bancoDeDados={bancoDeDados}
      />

      <main className="main-content">
        {showAdmin && (
          <PainelValidades
            todosProdutos={todosProdutos}
            fecharPainel={() => setShowAdmin(false)}
            recarregarDados={carregarDadosDoFirebase}
          />
        )}

        <div className="area-impressao">

{/* ==========================================
              VARIANTE 1: KIT NORMAL
              ========================================== */}
          {labelType === 'KIT' && (
              <EtiquetaKit 
                todosProdutos={todosProdutos} 
                bancoDeDados={bancoDeDados} 
                kitsParaImpressao={kitsParaImpressao}
                setKitsParaImpressao={setKitsParaImpressao}
              />
          )}

          {/* ==========================================
              VARIANTE 2: KIT DE/POR
              ========================================== */}
          {labelType === 'KIT DE POR' && (
              <EtiquetaKitDePor
                todosProdutos={todosProdutos}
                bancoDeDados={bancoDeDados}
                discountType={discountType}
                discountValue={discountValue}
                kitsParaImpressao={kitsParaImpressao}
                setKitsParaImpressao={setKitsParaImpressao}
              />
          )}

          {/* ==========================================
              VARIANTES 3 e 4: ETIQUETAS INDIVIDUAIS (NORMAL E DE/POR)
              ========================================== */}
          {(labelType === 'NORMAL' || labelType === 'DE POR') && (
            paginas.length > 0 ? (
              paginas.map((grupo, idx) => (
                <div key={idx} className="preview-folha">
                  {grupo.map(produto => (
                    <React.Fragment key={produto.id}>
                      {labelType === 'NORMAL' && <EtiquetaNormal produto={produto} />}
                      {labelType === 'DE POR' && (
                        <EtiquetaDePor
                          produto={produto}
                          discountType={discountType}
                          discountValue={discountValue}
                        />
                      )}
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