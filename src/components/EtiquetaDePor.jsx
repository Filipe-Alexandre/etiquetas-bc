// src/components/EtiquetaDePor.jsx
import React from 'react';
import logoClube from '../assets/logo2.svg'; 

// Adicione as props discountType e discountValue
export function EtiquetaDePor({ produto, discountType, discountValue }) {
  const precoBase = produto.precoBase;
  
  // LÓGICA DE CÁLCULO DINÂMICO
  let precoPromo = precoBase;
  if (discountType === 'percent') {
    // Ex: 10 - (10 * (15/100)) = 8.50
    precoPromo = precoBase - (precoBase * (discountValue / 100));
  } else if (discountType === 'value') {
    // Ex: 10 - 2 = 8.00
    precoPromo = precoBase - discountValue;
  }

  // Trava de segurança para não gerar preços negativos
  if (precoPromo < 0) precoPromo = 0;

  // Quebra os valores para estilizar centavos menores
  const [deReais, deCentavos] = precoBase.toFixed(2).split('.');
  const [porReais, porCentavos] = precoPromo.toFixed(2).split('.');

  return (
    <div className="etiqueta depor">
      {/* CABEÇALHO */}
      <div className="dp-header">
        <div className="dp-info">
          <div className="dp-cat-gram">
            {produto.categoria} {produto.gramatura}
          </div>
          <h1 className="dp-sabor">{produto.complemento}</h1>
        </div>
        
        <div className="dp-tana">
          TÁ NA<br/>PROMO
        </div>
      </div>

      {/* RODAPÉ (PREÇO ANTIGO) */}
      <div className="dp-de-bloco">
        <div className="dp-de-texto">
          <span>DE</span><br/>R$
        </div>
        <div className="dp-de-preco">
          {deReais},{deCentavos}
        </div>
      </div>

      {/* SHAPE LARANJA (O MORRO) */}
      <div className="dp-shape">
        <div className="dp-shape-header">
          <span className="dp-exclusivo">PREÇO<br/>EXCLUSIVO</span>
          <img src={logoClube} alt="Clube Brasil Cacau" className="dp-logo-clube" />
        </div>

        <div className="dp-por-bloco">
          <div className="dp-por-texto">
            POR<br/>APENAS<br/><span>R$</span>
          </div>
          <div className="dp-por-preco">
            <span className="dp-reais">{porReais}</span>
            <span className="dp-virgula">,</span>
            <span className="dp-centavos">{porCentavos}</span>
          </div>
        </div>
      </div>

      <div className="dp-faixa-marrom"></div>
    </div>
  );
}