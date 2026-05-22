// src/components/EtiquetaNormal.jsx
import React from 'react';
import logo1 from '../assets/logo1.svg';
import placa from '../assets/placa.svg'; // Importação da placa +18
import { PriceFormatter } from './PriceFormatter';

export function EtiquetaNormal({ produto }) {
  return (
    <div className="etiqueta normal" style={{ position: 'relative' }}>
      <div className="borda-topo"></div>

      <div className="logo-container-etiqueta">
        <img src={logo1} alt="Brasil Cacau" className="logo-svg" />
      </div>

      {/* PLACA +18 FLUTUANDO NA PARTE BRANCA (Canto superior direito) */}
      {produto?.maior18 && (
        <img 
          src={placa} 
          alt="Proibido para menores de 18 anos" 
          style={{ position: 'absolute', top: '1.5cm', right: '24px', width: '1.2cm', height: 'auto', zIndex: 10 }} 
        />
      )}

      <div className="etiqueta-header">
        <div className="tipo-gramatura">
          {produto.categoria !== 'SEM CATEGORIA' && (
            <span className="tipo">{produto.categoria}</span>
          )}
          <span className="gramatura">{produto.gramatura}</span>
        </div>
        <h1 className="sabor">{produto.complemento}</h1>
      </div>

      <div className="etiqueta-footer">
        <PriceFormatter preco={produto.precoBase} />
      </div>
    </div>
  );
}