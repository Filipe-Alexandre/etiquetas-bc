// src/components/EtiquetaClube.jsx
import React from 'react';
import logoClube from '../assets/logoClube.svg'; 
import placa from '../assets/placa.svg'; 

export function EtiquetaClube({ produto, discountType, discountValue }) {
  const precoOriginal = Number(produto.precoBase || 0);
  let precoComDesconto = precoOriginal;
  
  if (discountType === 'percent') {
    precoComDesconto = precoOriginal - (precoOriginal * (discountValue / 100));
  } else if (discountType === 'value') {
    precoComDesconto = precoOriginal - discountValue;
  }
  
  if (precoComDesconto < 0) precoComDesconto = 0;

  const [reaisOld, centavosOld] = precoOriginal.toFixed(2).split('.');
  const [reaisNew, centavosNew] = precoComDesconto.toFixed(2).split('.');

  return (
    <div className="etiqueta clube">
      
      {/* LADO ESQUERDO (Branco) */}
      <div className="clube-left">
        <div className="clube-cat">{produto.categoria} {produto.gramatura}</div>
        <div className="clube-name">{produto.complemento}</div>
        
        <div className="clube-old-price-box">
          <div className="clube-old-label">PREÇO FORA<br/>DO CLUBE</div>

          <div className="clube-old-value">
            <span className="clube-old-rs">R$</span>
            {reaisOld},{centavosOld}
          </div>
        </div>
      </div>
      
      {/* LADO DIREITO (Laranja) */}
      <div className="clube-right">
        {/* O fundo laranja com a diagonal e curva superior */}
        <div className="clube-bg-curve"></div>
        
        <div className="clube-badge">
          <div className="clube-exclusive">PREÇO EXCLUSIVO</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <img src={logoClube} alt="Clube Brasil Cacau" className="clube-logo-svg" />
            {produto?.maior18 && (
              <img src={placa} alt="+18" style={{ width: '1cm', height: 'auto', objectFit: 'contain' }} />
            )}
          </div>
        </div>
        
        <div className="clube-new-price-box">
          <span className="clube-new-rs">R$</span>
          <span className="clube-new-value">{reaisNew},{centavosNew}</span>
        </div>
      </div>
      
    </div>
  );
}