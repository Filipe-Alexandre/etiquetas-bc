import React from 'react';

export function PriceFormatter({ preco }) {
  const precoFormatado = Number(preco).toFixed(2).replace('.', ',');
  const [reais, centavos] = precoFormatado.split(',');

  return (
    <div className="bloco-preco">
      <span className="moeda">R$</span>
      <span className="reais">{reais},</span>
      <span className="centavos">{centavos}</span>
    </div>
  );
}