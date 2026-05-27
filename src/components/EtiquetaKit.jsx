// src/components/EtiquetaKit.jsx
import React, { useState } from 'react';
import logo2 from '../assets/logo2.svg';
import placa from '../assets/placa.svg';
import { EtiquetaNormal } from './EtiquetaNormal';
import { EtiquetaDePor } from './EtiquetaDePorAmarela';
import Barcode from 'react-barcode';

export function EtiquetaKit({ todosProdutos, bancoDeDados, kitsParaImpressao, setKitsParaImpressao }) {
    const [kitName, setKitName] = useState("");
    const [barcodeValue, setBarcodeValue] = useState("");

    const [qtdTabelas, setQtdTabelas] = useState(1);
    const [qtdEtiquetas, setQtdEtiquetas] = useState(1);

    const [rows, setRows] = useState([{ id: "", qtd: 1, texto: "" }, { id: "", qtd: 1, texto: "" }, { id: "", qtd: 1, texto: "" }]);

    const formataPreco = (valor) => {
        if (valor === undefined || valor === null || isNaN(valor)) return '0,00';
        return Number(valor).toFixed(2).replace('.', ',');
    };

    const mascaraData = (valor) => {
        if (!valor) return '';
        let v = String(valor).replace(/\D/g, '');
        if (v.length > 8) v = v.slice(0, 8);
        if (v.length >= 5) return `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
        else if (v.length >= 3) return `${v.slice(0, 2)}/${v.slice(2)}`;
        return v;
    };

    const menuMontagemTemAlcool = rows.some(row => {
        const prod = todosProdutos.find(p => p.id === row.id);
        return prod?.maior18 === true;
    });

    const salvarKitParaImpressao = () => {
        if (!kitName) return alert("Dê um nome ao kit antes de salvar!");

        const produtosValidos = rows.filter(r => r.id !== "");

        const kitTemAlcool = produtosValidos.some(r => {
            const prod = todosProdutos.find(p => p.id === r.id);
            return prod?.maior18 === true;
        });

        const gramaturaTotalCalc = produtosValidos.reduce((acc, row) => {
            const prod = todosProdutos.find(p => p.id === row.id);

            if (prod && prod.gramatura) {
                const gramaturaTexto = prod.gramatura.toLowerCase();

                if (!gramaturaTexto.includes('un') && !gramaturaTexto.includes('pc')) {
                    const valorNumerico = parseInt(gramaturaTexto.replace(/\D/g, ''), 10);

                    if (!isNaN(valorNumerico)) {
                        return acc + (valorNumerico * row.qtd);
                    }
                }
            }
            return acc;
        }, 0);

        const novoKit = {
            id: Date.now(),
            tipo: 'NORMAL',
            nome: kitName,
            barcode: barcodeValue,
            qtdTabelas: Math.max(0, qtdTabelas),
            qtdEtiquetas: Math.max(0, qtdEtiquetas),
            produtos: produtosValidos.map(r => ({ ...r })),
            total: produtosValidos.reduce((acc, row) => {
                const prod = todosProdutos.find(p => p.id === row.id);
                return acc + (prod ? prod.precoBase * row.qtd : 0);
            }, 0),
            produtoSintetico: {
                id: `kit-${Date.now()}`,
                categoria: "",
                complemento: `${kitName} - ${gramaturaTotalCalc}g`,
                gramatura: "",
                precoBase: produtosValidos.reduce((acc, row) => {
                    const prod = todosProdutos.find(p => p.id === row.id);
                    return acc + (prod ? prod.precoBase * row.qtd : 0);
                }, 0),
                maior18: kitTemAlcool
            }
        };

        setKitsParaImpressao([novoKit, ...kitsParaImpressao]);
        setKitName(""); setBarcodeValue(""); setQtdTabelas(1); setQtdEtiquetas(1);
        setRows([{ id: "", qtd: 1 }, { id: "", qtd: 1 }, { id: "", qtd: 1 }]);
    };

    // NOVA FUNÇÃO DE CONTROLE DE CÓPIAS
    const alterarQuantidadeItem = (idKit, tipoItem, delta) => {
        setKitsParaImpressao(prev => {
            return prev.map(kit => {
                if (kit.id === idKit) {
                    const novoKit = { ...kit };
                    if (tipoItem === 'tabela') {
                        novoKit.qtdTabelas = Math.max(0, novoKit.qtdTabelas + delta);
                    } else if (tipoItem === 'etiqueta') {
                        novoKit.qtdEtiquetas = Math.max(0, novoKit.qtdEtiquetas + delta);
                    }
                    return novoKit;
                }
                return kit;
            }).filter(kit => kit.qtdTabelas > 0 || kit.qtdEtiquetas > 0);
        });
    };

    const elementosTotais = [];
    kitsParaImpressao.forEach(kit => {
        for (let i = 0; i < kit.qtdTabelas; i++) elementosTotais.push({ tipo: 'tabela', kit });
        for (let i = 0; i < kit.qtdEtiquetas; i++) elementosTotais.push({ tipo: 'etiqueta', kit });
    });

    const paginasA4 = [];
    let paginaAtual = [];
    let celulasOcupadas = 0;

    elementosTotais.forEach(item => {
        const slotsNecessarios = item.tipo === 'tabela' ? 3 : 1;
        if (celulasOcupadas + slotsNecessarios > 12) {
            paginasA4.push(paginaAtual);
            paginaAtual = [item];
            celulasOcupadas = slotsNecessarios;
        } else {
            paginaAtual.push(item);
            celulasOcupadas += slotsNecessarios;
        }
    });
    if (paginaAtual.length > 0) paginasA4.push(paginaAtual);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>

            <div className="menu-montagem hide-print" style={{ backgroundColor: 'var(--bg-sidebar)', padding: '5%', borderRadius: '12px', border: '1px solid #ddd', width: '100%', maxWidth: '21cm', boxSizing: 'border-box', marginBottom: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <div style={{ textAlign: 'center', color: 'var(--marrom)', fontWeight: '900', marginBottom: '20px', fontSize: '14pt' }}>MENU DE MONTAGEM (KIT NORMAL)</div>

                <div className="print-controls" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', background: '#fff', padding: '15px 20px', border: '1px solid #ccc', marginBottom: '20px', justifyContent: 'center', borderRadius: '8px' }}>
                    <label style={{ fontWeight: 'bold', fontSize: '10pt', color: 'var(--marrom)', display: 'flex', alignItems: 'center', gap: '8px' }}>Qtd. Tabelas: <input type="number" min="0" value={qtdTabelas} onChange={e => setQtdTabelas(Number(e.target.value))} style={{ width: '50px', padding: '6px', textAlign: 'center', border: '1px solid #ccc', borderRadius: '4px' }} /></label>
                    <label style={{ fontWeight: 'bold', fontSize: '10pt', color: 'var(--marrom)', display: 'flex', alignItems: 'center', gap: '8px' }}>Qtd. Etiquetas: <input type="number" min="0" value={qtdEtiquetas} onChange={e => setQtdEtiquetas(Number(e.target.value))} style={{ width: '50px', padding: '6px', textAlign: 'center', border: '1px solid #ccc', borderRadius: '4px' }} /></label>
                </div>

                <div className="etiqueta kit" style={{ border: '2px dashed var(--laranja)' }}>
                    <div className="kit-header" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input type="text" className="kit-name-input" value={kitName} onChange={(e) => setKitName(e.target.value.toUpperCase())} placeholder="NOME DO KIT" style={{ borderBottom: '1px solid rgba(255,255,255,0.5)', flex: 1, minWidth: 0 }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img src={logo2} alt="Brasil Cacau" className="kit-logo" />
                            {menuMontagemTemAlcool && <img src={placa} alt="Proibido menores de 18 anos" style={{ width: '24px', height: 'auto' }} />}
                        </div>
                    </div>

                    <div className="kit-subheader">
                        <div className="col-produto">PRODUTO</div>
                        <div className="col-validade text-center">VALIDADE</div>
                        <div className="col-preco text-center">PREÇO</div>
                    </div>

                    <div className="kit-body">
                        {rows.map((row, index) => {
                            const prod = todosProdutos.find(p => p.id === row.id);
                            return (
                                <div className="kit-row" key={index} style={{ padding: '4px 0' }}>
                                    <div className="col-produto" style={{ flexWrap: 'wrap' }}>
                                        {prod && <span className="row-number">{index + 1}</span>}
                                        <div className="row-controls" style={{ flex: '1 1 100%', display: 'flex', gap: '5px' }}>
                                            <input
                                                type="number"
                                                min="1"
                                                value={row.qtd}
                                                onChange={(e) => { const n = [...rows]; n[index].qtd = Number(e.target.value); setRows(n); }}
                                                className="qtd-input"
                                            />

                                            {/* Campo de Busca com Auto-seleção Corrigido */}
                                            <input
                                                list={`lista-produtos-${index}`}
                                                placeholder="Digite o nome..."
                                                className="prod-select"
                                                value={row.texto !== undefined ? row.texto : (prod ? `${prod.categoria} - ${prod.complemento} ${prod.gramatura}`.trim() : "")}
                                                onChange={(e) => {
                                                    const valorDigitado = e.target.value;
                                                    const n = [...rows];

                                                    // 1. Salva a letra que você acabou de digitar para não apagar do campo
                                                    n[index].texto = valorDigitado;

                                                    // 2. Verifica se o texto digitado (ou clicado na lista) é um produto válido
                                                    const prodEncontrado = todosProdutos.find(p =>
                                                        `${p.categoria} - ${p.complemento} ${p.gramatura}`.trim() === valorDigitado
                                                    );

                                                    if (prodEncontrado) {
                                                        n[index].id = prodEncontrado.id;
                                                    } else {
                                                        n[index].id = ""; // Se apagou ou tá digitando, zera o ID
                                                    }
                                                    setRows(n);
                                                }}
                                            />

                                            <datalist id={`lista-produtos-${index}`}>
                                                {todosProdutos.map(p => (
                                                    <option key={p.id} value={`${p.categoria} - ${p.complemento} ${p.gramatura}`.trim()} />
                                                ))}
                                            </datalist>

                                            <button onClick={() => setRows(rows.filter((_, i) => i !== index))} className="btn-remove">✖</button>
                                        </div>
                                    </div>
                                    <div className="col-validade text-center validade-box">
                                        {prod ? (
                                            ["ACESSÓRIOS", "ALMOFADA", "CANECA", "LATA", "PELÚCIA", "SEM CATEGORIA"].includes(prod.categoria) ? (
                                                <span style={{ color: '#999', fontSize: '10px' }}>N/A</span>
                                            ) : (
                                                <input
                                                    type="text"
                                                    placeholder="DD/MM/AAAA"
                                                    className="input-validade-kit"
                                                    maxLength="10"
                                                    value={row.validade !== undefined ? row.validade : (prod?.validade ? mascaraData(prod.validade) : '')}
                                                    onChange={(e) => { const n = [...rows]; n[index].validade = mascaraData(e.target.value); setRows(n); }}
                                                    style={{ borderBottom: '1px dotted #ccc' }}
                                                />
                                            )
                                        ) : ''}
                                    </div>
                                    <div className="col-preco text-center preco-box">
                                        {prod ? <><span className="moeda kit">R$</span> {formataPreco(prod.precoBase * row.qtd)}</> : ''}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <button className="btn-add-row" onClick={() => setRows([...rows, { id: "", qtd: 1, texto: "" }])}>+ ADICIONAR PRODUTO</button>

                    <div className="kit-footer">
                        <div className="kit-barcode-area" style={{ flex: 1, marginRight: '15px' }}>
                            <input type="text" className="barcode-input" placeholder="Cód. Barras (Opcional)" value={barcodeValue} onChange={(e) => setBarcodeValue(e.target.value)} style={{ width: '100%' }} />
                            {barcodeValue && <div className="barcode-display"><Barcode value={barcodeValue} width={1.2} height={20} fontSize={10} background="#ffffff" margin={1} displayValue={true} /></div>}
                        </div>
                        <div className="kit-total-area">
                            <span className="total-label">Total</span>
                            <div className="total-box">
                                <span className="moeda-total">R$</span>
                                <span className="valor-total">{formataPreco(rows.reduce((acc, r) => acc + (todosProdutos.find(p => p.id === r.id)?.precoBase || 0) * r.qtd, 0))}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                    <button className="btn-action btn-orange" style={{ flex: 1, padding: '15px' }} onClick={salvarKitParaImpressao}><i className="fa-solid fa-floppy-disk"></i> ADICIONAR À FOLHA</button>
                    {kitsParaImpressao.length > 0 && <button className="btn-action btn-brown" onClick={() => setKitsParaImpressao([])} style={{ width: '50%' }}><i className="fa-solid fa-trash"></i> LIMPAR FOLHAS</button>}
                </div>
            </div>

{paginasA4.map((pagina, idxPagina) => (
                <div key={idxPagina} className="preview-folha" style={{ display: 'flex', flexWrap: 'wrap', alignContent: 'flex-start', justifyContent: 'space-between', rowGap: '0.4cm', columnGap: '0' }}>
                    {pagina.map((item, idxItem) => {
                        if (item.tipo === 'tabela') {
                            const isPromo = item.kit.tipo === 'DEPOR';
                            const kitImpressoTemAlcool = item.kit.produtos.some(r => {
                                const prod = todosProdutos.find(p => p.id === r.id);
                                return prod?.maior18 === true;
                            });

                            return (
                                <div key={`print-tab-${idxPagina}-${idxItem}`} style={{ position: 'relative', width: '100%', maxWidth: '12cm', margin: '0 auto', pageBreakInside: 'avoid' }}>
                                    
                                    <div className="hide-print print-floating-controls">
                                        <button className="btn-float-remove" onClick={() => alterarQuantidadeItem(item.kit.id, 'tabela', -1)} title="Remover">
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                        <button className="btn-float-add" onClick={() => alterarQuantidadeItem(item.kit.id, 'tabela', 1)} title="Duplicar">
                                            +1
                                        </button>
                                    </div>

                                    <div className={`etiqueta kit ${isPromo ? 'depor-theme' : ''}`}>
                                        <div className="kit-header" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <span className="kit-name-text" style={{ flex: 1 }}>{item.kit.nome}</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <img src={logo2} alt="Brasil Cacau" className="kit-logo" />
                                                {kitImpressoTemAlcool && <img src={placa} alt="Proibido menores de 18 anos" style={{ width: '24px', height: 'auto' }} />}
                                            </div>
                                        </div>
                                        <div className="kit-subheader"><div className="col-produto">PRODUTO</div><div className="col-validade text-center">VALIDADE</div><div className="col-preco text-center">PREÇO</div></div>
                                        <div className="kit-body">
                                            {item.kit.produtos.map((row, idxProd) => {
                                                const prod = todosProdutos.find(p => p.id === row.id);
                                                const nomeTexto = prod ? (
                                                    (row.qtd > 1 ? `${row.qtd}x ` : '') + 
                                                    (prod.categoria !== 'SEM CATEGORIA' ? `${prod.categoria} ` : '') + 
                                                    prod.complemento + ' ' + prod.gramatura
                                                ).trim() : '';
                                                return (
                                                    <div className="kit-row" key={idxProd} style={{ padding: '4px 0', minHeight: '24px' }}>
                                                        <div className="col-produto">{prod && <span className="row-number">{idxProd + 1}</span>}<div>{nomeTexto}</div></div>
                                                        <div className="col-validade text-center">{prod ? (row.validade || (prod.validade ? mascaraData(prod.validade) : '')) : ''}</div>
                                                        <div className="col-preco text-center">{prod ? `R$ ${formataPreco(prod.precoBase * row.qtd)}` : ''}</div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="kit-footer">
                                            <div className="kit-warning"><span className="icon-alert">!</span><p>Infos nutricionais e alergênicos,<br />consulte a embalagem</p></div>
                                            {item.kit.barcode && <div className="barcode-display"><Barcode value={item.kit.barcode} width={1.2} height={20} fontSize={10} background="#ffffff" margin={1} displayValue={true} /></div>}
                                            {isPromo ? (
                                                <div className="kit-total-area depor-mode">
                                                    <div className="total-de"><span className="texto-de">DE R$</span><span className="valor-de">{formataPreco(item.kit.valorDe)}</span></div>
                                                    <div className="total-por"><span className="texto-por">POR R$</span><span className="valor-por">{formataPreco(item.kit.valorPor)}</span></div>
                                                </div>
                                            ) : (
                                                <div className="kit-total-area"><span className="total-label">Total</span><div className="total-box"><span className="moeda-total">R$</span><span className="valor-total">{formataPreco(item.kit.total)}</span></div></div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        } else {
                            const isPromo = item.kit.tipo === 'DEPOR';

                            return (
                                <div key={`print-etiq-${idxPagina}-${idxItem}`} style={{ position: 'relative', width: '49%', display: 'flex', justifyContent: 'center', pageBreakInside: 'avoid' }}>
                                    
                                    <div className="hide-print print-floating-controls">
                                        <button className="btn-float-remove" onClick={() => alterarQuantidadeItem(item.kit.id, 'etiqueta', -1)} title="Remover">
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                        <button className="btn-float-add" onClick={() => alterarQuantidadeItem(item.kit.id, 'etiqueta', 1)} title="Duplicar">
                                            +1
                                        </button>
                                    </div>

                                    {/* BIFURCAÇÃO INTELIGENTE: Desenha a etiqueta exata e trava o desconto matemático */}
                                    {isPromo ? (
                                        <EtiquetaDePor 
                                            produto={item.kit.produtoSintetico} 
                                            discountType="value" 
                                            discountValue={item.kit.valorDe - item.kit.valorPor} 
                                        />
                                    ) : (
                                        <EtiquetaNormal produto={item.kit.produtoSintetico} />
                                    )}
                                </div>
                            );
                        }
                    })}
                </div>
            ))}
        </div>
    );
}