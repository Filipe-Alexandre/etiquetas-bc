// src/components/Sidebar.jsx
import React, { useState } from 'react';
import logo1 from '../assets/logo1.svg';

export function Sidebar({
    bancoDeDados,
    selectedItems,
    toggleItem,
    labelType,
    setLabelType,
    selectAllGlobal,
    selectAllCategory,
    onPrint,
    printCount,
    discountType,
    setDiscountType,
    discountValue,
    setDiscountValue,
    abrirPainelAdmin,
    abrirPainelMigracao
}) {
    const [openCategory, setOpenCategory] = useState(null);
    const categorias = bancoDeDados ? Object.keys(bancoDeDados) : [];

    return (
        <aside className="sidebar">

            <div className="logo-container">
                <img src={logo1} alt="Logo" className="logo" />
            </div>
            <div className="dev-felps">
                Desenvolvido por <a href="https://www.linkedin.com/in/filipe-alexandre/" target="_blank" rel="noopener noreferrer"> <i className="fa-solid fa-terminal"></i> Filipe Alexandre</a>
            </div>

            <div className="label-type-selector">
                <h3 className="section-title">TIPO DE ETIQUETA</h3>
                <div className="radio-group-vertical">
                    {['NORMAL', 'DE POR', 'KIT', 'KIT DE POR'].map(type => (
                        <label key={type} className="radio-option">
                            <input
                                type="radio"
                                name="type"
                                checked={labelType === type}
                                onChange={() => setLabelType(type)}
                            />
                            <span>{type}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* --- BLOCO DE DESCONTO --- */}
            {(labelType === 'DE POR' || labelType === 'KIT DE POR') && (
                <div className="discount-config" style={{ marginBottom: '25px' }}>
                    <h3 className="section-title">APLICAR DESCONTO</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <select
                            value={discountType}
                            onChange={(e) => setDiscountType(e.target.value)}
                            style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--laranja)', outline: 'none', color: 'var(--marrom)', fontWeight: 'bold' }}
                        >
                            <option value="percent">%</option>
                            <option value="value">R$</option>
                        </select>
                        <input
                            type="number"
                            value={discountValue}
                            onChange={(e) => setDiscountValue(Number(e.target.value))}
                            min="0"
                            step="0.01"
                            style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--laranja)', outline: 'none', color: 'var(--marrom)', fontWeight: 'bold' }}
                        />
                    </div>
                </div>
            )}

            {/* --- BOTÕES DE AÇÃO --- */}
            <div className="sidebar-actions">
                <button
                    className="btn-action btn-orange"
                    onClick={onPrint}
                    disabled={!labelType.includes('KIT') && printCount === 0}
                >
                    {labelType.includes('KIT') ? 'IMPRIMIR KIT' : `IMPRIMIR ${printCount} ETIQUETAS`}
                </button>

                <label className="btn-action btn-outline">
                    <input
                        type="checkbox"
                        onChange={(e) => selectAllGlobal(e.target.checked)}
                        checked={categorias.length > 0 && selectedItems.length > 0 && selectedItems.length === Object.values(bancoDeDados).flat().length}
                    />
                    SELECIONAR TUDO
                </label>

                <button
                    className="btn-action btn-brown hide-print"
                    onClick={abrirPainelAdmin}
                >
                    <i className="fa-solid fa-pen-to-square"></i> CONTROLE DE VALIDADES
                </button>
            </div>

            {/* --- ACORDION DE PRODUTOS --- */}
            <nav className="accordion-menu">
                <h3 className="section-title">PRODUTOS</h3>
                {categorias.map((cat) => (
                    <div key={cat} className="category-group">
                        <div className="category-row" onClick={() => setOpenCategory(openCategory === cat ? null : cat)}>
                            <span className="folder-icon">{openCategory === cat ? '▼' : '▶'}</span>
                            <span className="category-name">{cat}</span>
                        </div>
                        {openCategory === cat && (
                            <ul className="product-submenu">
                                <li className="select-all-cat" onClick={() => selectAllCategory(cat)}>
                                    -- SELECIONAR TODOS ({cat})
                                </li>
                                {bancoDeDados[cat].map((prod) => (
                                    <li
                                        key={prod.id}
                                        className={selectedItems.includes(prod.id) ? 'active' : ''}
                                        onClick={() => toggleItem(prod.id)}
                                    >
                                        {prod.complemento} {prod.gramatura}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
                
                {/* BOTÃO DA MIGRAÇÃO */}
                <button 
                    className="btn-action hide-print" 
                    onClick={abrirPainelMigracao}
                    style={{ 
                        marginTop: '30px', 
                        background: 'transparent', 
                        border: '1px dashed #ccc', 
                        color: '#999', 
                        fontSize: '11px',
                        padding: '10px'
                    }}
                >
                    <i className="fa-solid fa-server"></i> ATUALIZAR CATÁLOGO E PREÇOS
                </button>
            </nav>
        </aside>
    );
}