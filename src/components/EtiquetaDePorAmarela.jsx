// src/components/EtiquetaDePor.jsx
import React from 'react';
import logoClube from '../assets/logoClube.svg';
import placa from '../assets/placa.svg'; // Importação da placa +18

export function EtiquetaDePor({ produto, discountType, discountValue }) {
  const precoBase = produto.precoBase;

  let precoPromo = precoBase;
  if (discountType === 'percent') {
    precoPromo = precoBase - (precoBase * (discountValue / 100));
  } else if (discountType === 'value') {
    precoPromo = precoBase - discountValue;
  }

  if (precoPromo < 0) precoPromo = 0;

  const [deReais, deCentavos] = precoBase.toFixed(2).split('.');
  const [porReais, porCentavos] = precoPromo.toFixed(2).split('.');

  return (
    <div className="etiqueta depor">
      <div className="dp-header">
        <div className="dp-info">
          <div className="dp-cat-gram">
            {produto.categoria} {produto.gramatura}
          </div>
          <h1 className="dp-sabor">{produto.complemento}</h1>
        </div>

        <div className="dp-tana">
          TÁ NA<br />PROMO
        </div>
      </div>

      <div className="dp-de-bloco">
        <div className="dp-de-texto">
          <span>DE</span><br />R$
        </div>
        <div className="dp-de-preco">
          {deReais},{deCentavos}
        </div>
      </div>

      <div className="dp-shape">
        <div className="dp-shape-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="dp-exclusivo">PREÇO <br /> EXCLUSIVO</span>
        </div>


        <div className="dp-por-bloco">
          <div className="dp-por-texto">
            POR<br />APENAS<br /><span>R$</span>
          </div>

          <div>
            <img src={logoClube} alt="Clube Brasil Cacau" className="dp-logo-clube" />
            {/* PLACA +18 AO LADO DIREITO DA LOGO DO CLUBE */}
            {produto?.maior18 && (
              <img src={placa} alt="+18" style={{ width: '.8cm', height: 'auto', objectFit: 'contain', position: 'absolute', transform: 'translate(2.6cm, -12px)' }} />
            )}
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