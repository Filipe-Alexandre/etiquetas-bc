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
    <div className="painel-overlay">
      <div className="painel-modal">

        <div className="painel-header">
          <h2 style={{ color: 'var(--laranja)', margin: 0 }}>Gestão de Validades</h2>

          <div className="painel-controls">
            <label className="checkbox-alerta">
              <input
                type="checkbox"
                checked={mostrarApenasAlertas}
                onChange={e => setMostrarApenasAlertas(e.target.checked)}
              />
              <i className="fa-solid fa-triangle-exclamation" style={{ color: 'var(--laranja)' }}></i> EM ALERTA
            </label>

            <input
              type="text"
              className="input-busca-painel"
              placeholder="🔍 Buscar produto ou categoria..."
              value={buscaVal}
              onChange={(e) => setBuscaVal(e.target.value)}
            />

            <button className="btn-salvar-tudo" onClick={salvarTudo}>
              💾 SALVAR TUDO
            </button>

            <button className="btn-fechar-painel" onClick={fecharPainel}>
              ✖ FECHAR
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="validades-table">
            <thead>
              <tr>
                <th>CATEGORIA</th>
                <th>PRODUTO</th>
                <th>VALIDADE ATUAL</th>
                <th>NOVA VALIDADE</th>
                <th>AÇÃO</th>
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

                  let rowClass = 'linha-normal';
                  let tagStatus = null;

                  if (status === 'vencido') {
                    rowClass = 'linha-vencido';
                    tagStatus = <span className="badge badge-vencido">VENCIDO</span>;
                  } else if (status === 'alerta') {
                    rowClass = 'linha-alerta';
                    tagStatus = <span className="badge badge-alerta">VENCE EM BREVE</span>;
                  } else if (status === 'em-dia') {
                    rowClass = 'linha-ok';
                    tagStatus = <span className="badge badge-ok">NA VALIDADE</span>;
                  }

                  return (
                    <tr key={prod.id} className={`validades-tr ${rowClass}`}>
                      <td className="col-cat">
                        <b>{prod.categoria}</b>
                      </td>

                      <td className="col-prod">
                        <div className="prod-nome">{prod.complemento} {prod.gramatura}</div>
                        {tagStatus && <div style={{ marginTop: '6px' }}>{tagStatus}</div>}
                      </td>

                      <td className="col-val-atual">
                        <span className="mobile-label">Atual:</span>
                        <span>{prod.validade || '---'}</span>
                      </td>

                      <td className="col-nova-val">
                        <span className="mobile-label">Nova Data:</span>
                        <input
                          type="text"
                          className={`input-nova-data status-${status}`}
                          placeholder="DD/MM/AAAA"
                          maxLength="10"
                          value={valorAtualEditado}
                          onChange={(e) => handleChange(prod.id, e.target.value)}
                        />
                      </td>

                      <td className="col-acao">
                        <button
                          className="btn-salvar-ind"
                          onClick={() => salvarValidade(prod)}
                          disabled={salvandoId === prod.id || validadesEditadas[prod.id] === prod.validade}
                          style={{ opacity: (salvandoId === prod.id || validadesEditadas[prod.id] === prod.validade) ? 0.5 : 1 }}
                        >
                          <i className={`fa-solid ${salvandoId === prod.id ? 'fa-spinner fa-spin' : 'fa-floppy-disk'}`}></i>
                          <span className="btn-texto">{salvandoId === prod.id ? ' SALVANDO...' : ' SALVAR'}</span>
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