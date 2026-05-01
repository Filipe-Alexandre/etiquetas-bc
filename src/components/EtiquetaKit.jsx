// src/components/EtiquetaKit.jsx
import React, { useState } from 'react';
import logo2 from '../assets/logo2.svg';
import { EtiquetaNormal } from './EtiquetaNormal';

export function EtiquetaKit({ todosProdutos, bancoDeDados }) {
    const [kitName, setKitName] = useState("");
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
        categoria: "KIT",
        complemento: kitName || "NOME DO KIT",
        gramatura: `${gramaturaTotal}g`,
        precoBase: valorTotal
    };

    return (
        <div className="kit-wrapper">
            <div className="etiqueta kit">
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
                    {rows.map((row, index) => {
                        const prod = todosProdutos.find(p => p.id === row.id);
                        const precoLinha = prod ? prod.precoBase * row.qtd : 0;
                        const mascaraData = (valor) => {
                            let v = valor.replace(/\D/g, ''); // Remove tudo que não é número
                            if (v.length > 8) v = v.slice(0, 8); // Limita a 8 dígitos (DDMMAAAA)

                            if (v.length >= 5) {
                                return `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
                            } else if (v.length >= 3) {
                                return `${v.slice(0, 2)}/${v.slice(2)}`;
                            }
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
                                            {/* OPTGROUP PARA AGRUPAR POR CATEGORIA */}
                                            {bancoDeDados && Object.keys(bancoDeDados).map(cat => (
                                                <optgroup key={cat} label={cat}>
                                                    {bancoDeDados[cat].map(p => (
                                                        <option key={p.id} value={p.id}>
                                                            {cat !== 'SEM CATEGORIA' ? `${cat} ` : ''}{p.complemento} {p.gramatura}
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                        </select>
                                        <button onClick={() => removeRow(index)} className="btn-remove">
                                            <i className="fa-solid fa-times"></i>
                                        </button>
                                    </div>

                                    <div className="show-print">
                                        {row.qtd > 1 ? `${row.qtd}x ` : ''}
                                        {prod ? `${prod.categoria !== 'SEM CATEGORIA' ? prod.categoria + ' ' : ''}${prod.complemento} ${prod.gramatura}` : ''}
                                    </div>
                                </div>

                                <div className="col-validade text-center validade-box">
                                    {/* INPUT DE VALIDADE EDITÁVEL */}
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

                    <div className="kit-total-area">
                        <span className="total-label">Total</span>
                        <div className="total-box">
                            <span className="moeda-total">R$</span>
                            <span className="valor-total">{formataPreco(valorTotal)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="kit-companion-area">
                <div className="hide-print companion-title">
                    <i className="fa-solid fa-arrow-down" style={{ marginRight: '8px' }}></i>
                    ETIQUETA DE IDENTIFICAÇÃO DO KIT
                    <i className="fa-solid fa-arrow-down" style={{ marginLeft: '8px' }}></i>
                </div>
                <EtiquetaNormal produto={produtoSintetico} />
            </div>
        </div>
    );
}