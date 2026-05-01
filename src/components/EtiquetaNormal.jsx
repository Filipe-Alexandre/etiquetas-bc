// src/components/EtiquetaNormal.jsx
import React from 'react';
import logo1 from '../assets/logo1.svg';
import { PriceFormatter } from './PriceFormatter';

export function EtiquetaNormal({ produto }) {
  return (
    <div className="etiqueta normal">
      <div className="borda-topo"></div>

      <div className="logo-container-etiqueta">
        <img src={logo1} alt="Brasil Cacau" className="logo-svg" />
      </div>

      <div className="etiqueta-header">
        <div className="tipo-gramatura">
          {produto.categoria !== 'SEM CATEGORIA' && (
            <span className="tipo">{produto.categoria}</span>
          )}

          {/* A gramatura (ex: 1 UN) continua aparecendo normal */}
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