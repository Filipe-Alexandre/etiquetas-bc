// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { EtiquetaNormal } from './components/EtiquetaNormal';
import { EtiquetaDePor } from './components/EtiquetaDePor';
import { EtiquetaKit } from './components/EtiquetaKit';
import { EtiquetaKitDePor } from './components/EtiquetaKitDePor';
import { PainelValidades } from './components/PainelValidades';
import { Migracao } from './components/Migracao';

import { db } from './data/firebaseConfig'; 
import { collection, getDocs } from 'firebase/firestore';

function App() {
  const [bancoDeDados, setBancoDeDados] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);

  const [selectedItems, setSelectedItems] = useState([]);
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
        return {
          id: doc.id,
          ...dadosBanco,
          validade: validadesLocais[doc.id] !== undefined ? validadesLocais[doc.id] : (dadosBanco.validade || "")
        };
      });

      const bdAgrupado = listaProdutos.reduce((acc, prod) => {
        if (!acc[prod.categoria]) acc[prod.categoria] = [];
        acc[prod.categoria].push(prod);
        return acc;
      }, {});

      setBancoDeDados(bdAgrupado);
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
          {labelType === 'KIT' || labelType === 'KIT DE POR' ? (
            <div className="preview-folha">
              {labelType === 'KIT' ? (
                // PASSANDO O BANCO DE DADOS AQUI
                <EtiquetaKit todosProdutos={todosProdutos} bancoDeDados={bancoDeDados} />
              ) : (
                // PASSANDO O BANCO DE DADOS AQUI
                <EtiquetaKitDePor
                  todosProdutos={todosProdutos}
                  bancoDeDados={bancoDeDados}
                  discountType={discountType}
                  discountValue={discountValue}
                />
              )}
            </div>
          ) : paginas.length > 0 ? (
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
          )}
        </div>
      </main>
    </div>
  );
}

export default App;