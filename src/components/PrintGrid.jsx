// src/components/PrintGrid.jsx
import React from 'react';
import { EtiquetaNormal } from './EtiquetaNormal';
import { bancoDeDados } from '../data/index'; 

export function PrintGrid({ selectedItems, labelType }) {
  // Puxa todos os produtos do banco e filtra apenas os selecionados
  const todosProdutos = Object.values(bancoDeDados).flat();
  const produtosImprimir = todosProdutos.filter(p => selectedItems.includes(p.id));

  // Divide o array em grupos de 12 (para a folha A4 Vertical)
  const paginas = [];
  for (let i = 0; i < produtosImprimir.length; i += 12) {
    paginas.push(produtosImprimir.slice(i, i + 12));
  }

  return (
    <div className="area-impressao">
      {paginas.map((pagina, index) => (
        <div key={`pagina-${index}`} className="folha-a4">
          {pagina.map(produto => {
            // No futuro, adicionaremos as outras etiquetas aqui (De Por, Kit, etc)
            if (labelType === 'NORMAL') {
              return <EtiquetaNormal key={produto.id} produto={produto} />;
            }
            return <div key={produto.id}>Etiqueta em construção...</div>;
          })}
        </div>
      ))}
    </div>
  );
}