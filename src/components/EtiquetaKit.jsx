// src/components/EtiquetaKit.jsx
import React, { useState } from 'react';
import logo2 from '../assets/logo2.svg';
import { EtiquetaNormal } from './EtiquetaNormal';
import Barcode from 'react-barcode';

export function EtiquetaKit({ todosProdutos, bancoDeDados }) {
    const [buscaProd, setBuscaProd] = useState("");
    const [kitName, setKitName] = useState("");
    const [barcodeValue, setBarcodeValue] = useState("");
    
    // NOVOS ESTADOS PARA QUANTIDADE
    const [qtdTabelas, setQtdTabelas] = useState(1);
    const [qtdEtiquetas, setQtdEtiquetas] = useState(1);

    const [rows, setRows] = useState([
        { id: "", qtd: 1 },
        { id: "", qtd: 1 },
        { id: "", qtd: 1 }
    ]);

    const addRow = () => setRows([...rows, { id: "", qtd: 1 }]);

    const updateRow = (index, field, value) => {
        const newRows = [...rows];
        newRows[index][field] = value;
        setRows(newRows);
    };

    const removeRow = (index) => {
        const newRows = rows.filter((_, i) => i !== index);
        setRows(newRows);
    };

    const valorTotal = rows.reduce((acc, row) => {
        const prod = todosProdutos.find(p => p.id === row.id);
        return acc + (prod ? prod.precoBase * row.qtd : 0);
    }, 0);

    const gramaturaTotal = rows.reduce((acc, row) => {
        const prod = todosProdutos.find(p => p.id === row.id);
        if (prod && prod.gramatura) {
            const peso = parseInt(prod.gramatura.replace(/\D/g, ''), 10) || 0;
            return acc + (peso * row.qtd);
        }
        return acc;
    }, 0);

    const formataPreco = (valor) => valor.toFixed(2).replace('.', ',');

    const produtoSintetico = {
        id: "kit-custom",
        categoria: "",
        complemento: `${kitName || "NOME DO KIT"} - ${gramaturaTotal}g`,
        gramatura: "",
        precoBase: valorTotal
    };

    // FUNÇÕES PARA OCULTAR CLONES NA TELA E MOSTRAR NA IMPRESSÃO
    const getTabelaClass = (idx) => {
        if (qtdTabelas === 0) return 'hide-print';
        if (idx > 0) return 'show-print';
        return '';
    };

    const getEtiqClass = (idx) => {
        if (qtdEtiquetas === 0) return 'hide-print';
        if (idx > 0) return 'show-print';
        return '';
    };

    return (
        <div className="kit-wrapper">
            {/* PAINEL DE CONTROLE DE QUANTIDADE */}
            <div className="hide-print print-controls" style={{ display: 'flex', gap: '20px', background: '#f5f5f5', padding: '10px 20px', border: '1px dashed #ccc', marginBottom: '15px', justifyContent: 'center', borderRadius: '8px' }}>
                <label style={{ fontWeight: 'bold', fontSize: '10pt', color: 'var(--marrom)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Imprimir Tabelas: 
                    <input type="number" min="0" value={qtdTabelas} onChange={e => setQtdTabelas(Number(e.target.value))} style={{ width: '50px', padding: '4px', textAlign: 'center', border: '1px solid #ccc', borderRadius: '4px' }} />
                </label>
                <label style={{ fontWeight: 'bold', fontSize: '10pt', color: 'var(--marrom)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Imprimir Etiquetas: 
                    <input type="number" min="0" value={qtdEtiquetas} onChange={e => setQtdEtiquetas(Number(e.target.value))} style={{ width: '50px', padding: '4px', textAlign: 'center', border: '1px solid #ccc', borderRadius: '4px' }} />
                </label>
            </div>

            {/* RENDERIZA AS TABELAS */}
            {Array.from({ length: Math.max(1, qtdTabelas) }).map((_, idx) => (
                <div className={`etiqueta kit ${getTabelaClass(idx)}`} key={`tab-${idx}`} style={{ marginBottom: idx < Math.max(1, qtdTabelas) - 1 ? '20px' : '0' }}>
                    <div className="kit-header">
                        <input
                            type="text"
                            className="kit-name-input hide-print"
                            value={kitName}
                            onChange={(e) => setKitName(e.target.value.toUpperCase())}
                            placeholder="NOME DO KIT"
                        />
                        <span className="kit-name-text show-print">{kitName}</span>
                        <img src={logo2} alt="Brasil Cacau" className="kit-logo" />
                    </div>

                    <div className="kit-subheader">
                        <div className="col-produto">PRODUTO</div>
                        <div className="col-validade text-center">VALIDADE</div>
                        <div className="col-preco text-center">PREÇO</div>
                    </div>

                    <div className="kit-body">
                        <input
                            type="text"
                            className="hide-print search-kit-input"
                            placeholder="🔍 Filtrar produtos..."
                            value={buscaProd}
                            onChange={e => setBuscaProd(e.target.value.toLowerCase())}
                        />

                        {rows.map((row, index) => {
                            const prod = todosProdutos.find(p => p.id === row.id);
                            const precoLinha = prod ? prod.precoBase * row.qtd : 0;
                            const mascaraData = (valor) => {
                                let v = valor.replace(/\D/g, '');
                                if (v.length > 8) v = v.slice(0, 8);
                                if (v.length >= 5) return `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
                                else if (v.length >= 3) return `${v.slice(0, 2)}/${v.slice(2)}`;
                                return v;
                            };
                            return (
                                <div className="kit-row" key={index}>
                                    <div className="col-produto">
                                        <span className="row-number">{index + 1}</span>

                                        <div className="row-controls hide-print">
                                            <input
                                                type="number" min="1" value={row.qtd}
                                                onChange={(e) => updateRow(index, 'qtd', Number(e.target.value))}
                                                className="qtd-input" title="Quantidade"
                                            />
                                            <select
                                                value={row.id}
                                                onChange={(e) => updateRow(index, 'id', e.target.value)}
                                                className="prod-select"
                                            >
                                                <option value="">Selecione um produto...</option>
                                                {bancoDeDados && Object.keys(bancoDeDados).map(cat => {
                                                    const produtosFiltrados = bancoDeDados[cat].filter(p =>
                                                        p.complemento.toLowerCase().includes(buscaProd) ||
                                                        p.categoria.toLowerCase().includes(buscaProd)
                                                    );
                                                    if (produtosFiltrados.length === 0) return null;

                                                    return (
                                                        <optgroup key={cat} label={cat}>
                                                            {produtosFiltrados.map(p => (
                                                                <option key={p.id} value={p.id}>
                                                                    {cat !== 'SEM CATEGORIA' ? `${cat} ` : ''}{p.complemento} {p.gramatura}
                                                                </option>
                                                            ))}
                                                        </optgroup>
                                                    );
                                                })}
                                            </select>
                                            <button onClick={() => removeRow(index)} className="btn-remove">✖</button>
                                        </div>

                                        <div className="show-print">
                                            {row.qtd > 1 ? `${row.qtd}x ` : ''}
                                            {prod ? `${prod.categoria !== 'SEM CATEGORIA' ? prod.categoria + ' ' : ''}${prod.complemento} ${prod.gramatura}` : ''}
                                        </div>
                                    </div>

                                    <div className="col-validade text-center validade-box">
                                        <input
                                            type="text"
                                            className="input-validade-kit"
                                            maxLength="10"
                                            value={row.validade !== undefined ? row.validade : (prod?.validade || '')}
                                            onChange={(e) => updateRow(index, 'validade', mascaraData(e.target.value))}
                                            placeholder="DD/MM/AAAA"
                                        />
                                    </div>

                                    <div className="col-preco text-center preco-box">
                                        <span className="moeda kit">R$</span> {formataPreco(precoLinha)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <button className="btn-add-row hide-print" onClick={addRow}>+ ADICIONAR PRODUTO</button>

                    <div className="kit-footer">
                        <div className="kit-warning">
                            <span className="icon-alert">!</span>
                            <p>Informações nutricionais e alergênicos,<br />consulte a embalagem do produto</p>
                        </div>

                        <div className="kit-barcode-area">
                            <input
                                type="text"
                                className="barcode-input hide-print"
                                placeholder="Cód. Barras (Opcional)"
                                value={barcodeValue}
                                onChange={(e) => setBarcodeValue(e.target.value)}
                            />
                            {barcodeValue && (
                                <div className="barcode-display">
                                    <Barcode
                                        value={barcodeValue}
                                        width={1.2} /* <-- BARCODE REDUZIDO AQUI */
                                        height={20} /* <-- BARCODE REDUZIDO AQUI */
                                        fontSize={10} /* <-- BARCODE REDUZIDO AQUI */
                                        background="#ffffff"
                                        margin={1} /* <-- BARCODE REDUZIDO AQUI */
                                        displayValue={true}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="kit-total-area">
                            <span className="total-label">Total</span>
                            <div className="total-box">
                                <span className="moeda-total">R$</span>
                                <span className="valor-total">{formataPreco(valorTotal)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* RENDERIZA AS ETIQUETAS PEQUENAS (COMPANION) */}
            <div className={`kit-companion-area ${qtdEtiquetas === 0 ? 'hide-print' : ''}`} style={{ marginTop: '20px' }}>
                <div className="hide-print companion-title">
                    <i className="fa-solid fa-arrow-down" style={{ marginRight: '8px' }}></i>
                    ETIQUETAS DE IDENTIFICAÇÃO DO KIT
                    <i className="fa-solid fa-arrow-down" style={{ marginLeft: '8px' }}></i>
                </div>
                
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {Array.from({ length: Math.max(1, qtdEtiquetas) }).map((_, idx) => (
                        <div key={`etiq-${idx}`} className={getEtiqClass(idx)} style={{ marginBottom: '10px' }}>
                            <EtiquetaNormal produto={produtoSintetico} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}