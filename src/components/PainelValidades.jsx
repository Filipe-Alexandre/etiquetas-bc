// src/components/PainelValidades.jsx
import React, { useState } from 'react';

export function PainelValidades({ todosProdutos, fecharPainel, recarregarDados }) {
  const [validadesEditadas, setValidadesEditadas] = useState({});
  const [salvandoId, setSalvandoId] = useState(null);
  const [buscaVal, setBuscaVal] = useState("");
  const [mostrarApenasAlertas, setMostrarApenasAlertas] = useState(false);

  const mascaraData = (valor) => {
    let v = valor.replace(/\D/g, '');
    if (v.length > 8) v = v.slice(0, 8);
    if (v.length >= 5) return `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
    else if (v.length >= 3) return `${v.slice(0, 2)}/${v.slice(2)}`;
    return v;
  };

  const handleChange = (id, valor) => {
    setValidadesEditadas(prev => ({ ...prev, [id]: mascaraData(valor) }));
  };

  const salvarValidade = async (produto) => {
    const novaValidade = validadesEditadas[produto.id];
    if (novaValidade === undefined || novaValidade === produto.validade) return;
    setSalvandoId(produto.id);
    try {
      const validadesLocais = JSON.parse(localStorage.getItem('minhas_validades')) || {};
      validadesLocais[produto.id] = novaValidade;
      localStorage.setItem('minhas_validades', JSON.stringify(validadesLocais));
      alert(`Validade salva com sucesso!`);
      recarregarDados();
    } catch (error) {
      console.error("Erro ao salvar:", error);
    } finally {
      setSalvandoId(null);
    }
  };

  const salvarTudo = () => {
    const validadesLocais = JSON.parse(localStorage.getItem('minhas_validades')) || {};
    let temMudanca = false;

    Object.keys(validadesEditadas).forEach(id => {
      const prod = todosProdutos.find(p => p.id === id);
      if (prod && validadesEditadas[id] !== prod.validade) {
        validadesLocais[id] = validadesEditadas[id];
        temMudanca = true;
      }
    });

    if (temMudanca) {
      localStorage.setItem('minhas_validades', JSON.stringify(validadesLocais));
      alert("Todas as alterações foram salvas com sucesso!");
      recarregarDados();
      setValidadesEditadas({});
    } else {
      alert("Nenhuma validade foi alterada para salvar.");
    }
  };

  const obterStatusValidade = (dataStr) => {
    if (!dataStr || dataStr.length < 8) return 'nenhuma';

    const [dia, mes, anoStr] = dataStr.split('/');
    const ano = anoStr.length === 2 ? 2000 + parseInt(anoStr) : parseInt(anoStr);
    const validade = new Date(ano, parseInt(mes) - 1, parseInt(dia));
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const diffTempo = validade - hoje;
    const diffDias = Math.ceil(diffTempo / (1000 * 60 * 60 * 24));

    if (diffDias < 0) return 'vencido';
    if (diffDias <= 10) return 'alerta';
    return 'em-dia'; 
  };

  let produtosFiltrados = todosProdutos.filter(p =>
    p.complemento.toLowerCase().includes(buscaVal.toLowerCase()) ||
    p.categoria.toLowerCase().includes(buscaVal.toLowerCase())
  );

  if (mostrarApenasAlertas) {
    produtosFiltrados = produtosFiltrados.filter(prod => {
      const valorAtualEditado = validadesEditadas[prod.id] !== undefined ? validadesEditadas[prod.id] : (prod.validade || '');
      const status = obterStatusValidade(valorAtualEditado);
      return status === 'vencido' || status === 'alerta';
    });
  }

  return (
    <div className="painel-overlay" style={overlayStyle}>
      <div className="painel-modal" style={modalStyle}>
        <div style={{ display: 'block', marginBottom: '20px' }}>
          <h2 style={{ color: 'var(--laranja)', margin: 0 }}>Gestão de Validades</h2>
          <br />
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
            
            {/* TEXTO DO FILTRO ATUALIZADO */}
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--marrom)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', background: '#f5f5f5', padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd' }}>
              <input
                type="checkbox"
                checked={mostrarApenasAlertas}
                onChange={e => setMostrarApenasAlertas(e.target.checked)}
                style={{ accentColor: 'var(--laranja)', width: '16px', height: '16px' }}
              />
              <i className="fa-solid fa-triangle-exclamation" style={{ color: 'var(--laranja)' }}></i> EM ALERTA
            </label>

            <input
              type="text"
              placeholder="🔍 Buscar produto ou categoria..."
              value={buscaVal}
              onChange={(e) => setBuscaVal(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', fontFamily: 'var(--bold)', flexGrow: 1, minWidth: '200px', outline: 'none' }}
            />
            <button onClick={salvarTudo} style={{ ...btnSalvarStyle, background: 'var(--laranja)', padding: '10px 20px', boxShadow: '0 4px 10px #f159214d' }}>
              💾 SALVAR TUDO
            </button>
            <button onClick={fecharPainel} style={btnFecharStyle}>✖ FECHAR</button>
          </div>
        </div>

        <div style={{ overflowY: 'auto', maxHeight: '65vh' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f5f5f5', color: 'var(--marrom)', position: 'sticky', top: 0, zIndex: 1 }}>
                <th style={thStyle}>CATEGORIA</th>
                <th style={thStyle}>PRODUTO</th>
                <th style={thStyle}>VALIDADE ATUAL</th>
                <th style={thStyle}>NOVA VALIDADE</th>
                <th style={thStyle}>AÇÃO</th>
              </tr>
            </thead>
            <tbody>
              {produtosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>Nenhum produto encontrado.</td>
                </tr>
              ) : (
                produtosFiltrados.map(prod => {
                  const valorAtualEditado = validadesEditadas[prod.id] !== undefined ? validadesEditadas[prod.id] : (prod.validade || '');
                  const status = obterStatusValidade(valorAtualEditado);

                  let rowStyle = { borderBottom: '1px solid #eee' };
                  let textColor = '#444';
                  let tagStatus = null;

                  // FUNDOS COLORIDOS NA LINHA INTEIRA E CORES DO TEXTO
                  if (status === 'vencido') {
                    rowStyle = { backgroundColor: '#ffebee', borderBottom: '1px solid #ffcdd2' };
                    textColor = '#c62828';
                    tagStatus = <span className="badge badge-vencido">VENCIDO</span>;
                  } else if (status === 'alerta') {
                    rowStyle = { backgroundColor: '#fff8e1', borderBottom: '1px solid #ffecb3' };
                    textColor = '#f57f17';
                    tagStatus = <span className="badge badge-alerta">VENCE EM BREVE</span>;
                  } else if (status === 'em-dia') {
                    rowStyle = { backgroundColor: '#e8f5e9', borderBottom: '1px solid #c8e6c9' };
                    textColor = '#2e7d32';
                    tagStatus = <span className="badge badge-ok">VALIDADE CADASTRADA</span>;
                  }

                  return (
                    <tr key={prod.id} style={rowStyle}>
                      <td style={{ ...tdStyle, color: textColor }}><b>{prod.categoria}</b></td>
                      <td style={{ ...tdStyle, color: textColor }}>
                        <div style={{ fontWeight: 'bold' }}>{prod.complemento} {prod.gramatura}</div>
                        {tagStatus && <div style={{ marginTop: '6px' }}>{tagStatus}</div>}
                      </td>
                      <td style={{ ...tdStyle, color: textColor }}><span>{prod.validade || '---'}</span></td>
                      <td style={tdStyle}>
                        <input
                          type="text"
                          placeholder="DD/MM/AAAA"
                          maxLength="10"
                          value={valorAtualEditado}
                          onChange={(e) => handleChange(prod.id, e.target.value)}
                          style={{ ...inputStyle, borderColor: status === 'nenhuma' ? '#ccc' : textColor, color: textColor }}
                        />
                      </td>
                      <td style={tdStyle}>
                        <button
                          onClick={() => salvarValidade(prod)}
                          disabled={salvandoId === prod.id || validadesEditadas[prod.id] === prod.validade}
                          style={{ ...btnSalvarStyle, opacity: (salvandoId === prod.id || validadesEditadas[prod.id] === prod.validade) ? 0.5 : 1 }}
                        >
                          {salvandoId === prod.id ? 'SALVANDO...' : 'SALVAR'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const overlayStyle = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 };
const modalStyle = { background: '#fff', padding: '30px', borderRadius: '12px', width: '95%', maxWidth: '1100px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' };
const btnFecharStyle = { background: '#fee', color: 'red', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const thStyle = { padding: '12px', borderBottom: '2px solid #ddd' };
const tdStyle = { padding: '12px', fontSize: '14px' };
const inputStyle = { padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '130px', fontFamily: 'var(--bold)', outline: 'none', textAlign: 'center' };
const btnSalvarStyle = { background: '#4CAF50', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };