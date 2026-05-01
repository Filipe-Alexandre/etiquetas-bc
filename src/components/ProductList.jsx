import React from 'react';
import { PriceFormatter } from './PriceFormatter';

export function ProductList({ produtos, selectedItems, setSelectedItems }) {
  
  const toggleAll = () => {
    if (selectedItems.length === produtos.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(produtos.map(p => p.id));
    }
  };

  const toggleItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  return (
    <div className="product-list-container">
      <label className="product-item master-selection">
        <input 
          type="checkbox" 
          id="select-all"
          checked={selectedItems.length === produtos.length && produtos.length > 0}
          onChange={toggleAll}
        />
        <span>SELECIONAR TODOS OS ITENS</span>
      </label>

      <div className="grid-produtos">
        {produtos.map((produto) => (
          <label key={produto.id} className={`product-card ${selectedItems.includes(produto.id) ? 'selected' : ''}`}>
            <input style={{ display: 'none' }} 
              type="checkbox" 
              checked={selectedItems.includes(produto.id)}
              onChange={() => toggleItem(produto.id)}
            />
            <div className="product-info">
              <div className="info-topo">
                <span className="prod-category">{produto.categoria}</span>
                <span className="prod-name">{produto.complemento}</span>
                <span className="prod-weight">{produto.gramatura}</span>
              </div>
              <div className="info-rodape">
                <PriceFormatter preco={produto.precoBase} />
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}