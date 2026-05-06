// src/components/PainelValidades.jsx
import React, { useState } from 'react';
import { db } from '../data/firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

export function PainelValidades({ todosProdutos, fecharPainel, recarregarDados }) {
  const [validadesEditadas, setValidadesEditadas] = useState({});
  const [salvandoId, setSalvandoId] = useState(null);
  const [buscaVal, setBuscaVal] = useState(""); // <-- NOVO ESTADO DE BUSCA

  const handleChange = (id, valor) => {
    setValidadesEditadas(prev => ({ ...prev, [id]: valor }));
  };

  const salvarValidade = async (produto) => {
    const novaValidade = validadesEditadas[produto.id];
    
    if (novaValidade === undefined || novaValidade === produto.validade) return;

    setSalvandoId(produto.id);
    try {
      const validadesLocais = JSON.parse(localStorage.getItem('minhas_validades')) || {};
      validadesLocais[produto.id] = novaValidade;
      localStorage.setItem('minhas_validades', JSON.stringify(validadesLocais));
      alert(`Validade salva LOCALMENTE com sucesso!`);
      recarregarDados();
    } catch (error) {
      console.error("Erro ao salvar localmente:", error);
      alert("Erro ao salvar no seu aparelho.");
    } finally {
      setSalvandoId(null);
    }
  };

  // Lógica de filtro da tabela
  const produtosFiltrados = todosProdutos.filter(p => 
    p.complemento.toLowerCase().includes(buscaVal.toLowerCase()) || 
    p.categoria.toLowerCase().includes(buscaVal.toLowerCase())
  );

  return (
    <div className="painel-overlay" style={overlayStyle}>
      <div className="painel-modal" style={modalStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: 'var(--laranja)', margin: 0 }}>Gestão de Validades</h2>
          
          {/* BARRA DE PESQUISA DO PAINEL */}
          <input 
            type="text" 
            placeholder="🔍 Buscar produto ou categoria..."
            value={buscaVal}
            onChange={(e) => setBuscaVal(e.target.value)}
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '300px', fontFamily: 'var(--bold)' }}
          />

          <button onClick={fecharPainel} style={btnFecharStyle}>✖ FECHAR</button>
        </div>

        <div style={{ overflowY: 'auto', maxHeight: '70vh' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f5f5f5', color: 'var(--marrom)' }}>
                <th style={thStyle}>CATEGORIA</th>
                <th style={thStyle}>PRODUTO</th>
                <th style={thStyle}>VALIDADE ATUAL</th>
                <th style={thStyle}>NOVA VALIDADE</th>
                <th style={thStyle}>AÇÃO</th>
              </tr>
            </thead>
            <tbody>
              {produtosFiltrados.map(prod => (
                <tr key={prod.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={tdStyle}><b>{prod.categoria}</b></td>
                  <td style={tdStyle}>{prod.complemento} {prod.gramatura}</td>
                  <td style={tdStyle}><span style={{ color: '#888' }}>{prod.validade || '---'}</span></td>
                  <td style={tdStyle}>
                    <input 
                      type="text" 
                      placeholder="Ex: 15/10/2026"
                      value={validadesEditadas[prod.id] !== undefined ? validadesEditadas[prod.id] : prod.validade || ''}
                      onChange={(e) => handleChange(prod.id, e.target.value)}
                      style={inputStyle}
                    />
                  </td>
                  <td style={tdStyle}>
                    <button 
                      onClick={() => salvarValidade(prod)}
                      disabled={salvandoId === prod.id || validadesEditadas[prod.id] === prod.validade}
                      style={{ 
                        ...btnSalvarStyle, 
                        opacity: (salvandoId === prod.id || validadesEditadas[prod.id] === prod.validade) ? 0.5 : 1 
                      }}
                    >
                      {salvandoId === prod.id ? '⏳' : '💾 SALVAR'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 };
const modalStyle = { background: '#fff', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '900px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' };
const btnFecharStyle = { background: '#fee', color: 'red', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const thStyle = { padding: '12px', borderBottom: '2px solid #ddd' };
const tdStyle = { padding: '12px', fontSize: '14px', color: '#444' };
const inputStyle = { padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '120px', fontFamily: 'var(--bold)' };
const btnSalvarStyle = { background: '#4CAF50', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };