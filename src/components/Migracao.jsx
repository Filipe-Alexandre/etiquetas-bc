// src/components/Migracao.jsx
import React, { useState } from 'react';
import { db } from '../data/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

// ==========================================
// 1. CARGA DE DADOS - ORDEM ALFABÉTICA (LIMPEZA FINAL)
// ==========================================

const categoriasData = [
  {
    nome: "ACESSÓRIOS",
    prefixo: "ace",
    itens: [
      { comp: "APOIO DE PESCOÇO NAMORADOS", gram: "1 UN", preco: 44.90 },
      { comp: "ÁRVORE DE NATAL BC24", gram: "1 UN", preco: 24.90 },
      { comp: "BOLINHA DE NATAL BC24", gram: "1 UN", preco: 19.90 },
      { comp: "BOLSA PALHA DIVERSA M", gram: "1 UN", preco: 39.90 },
      { comp: "BOLSA TÉRMICA", gram: "1 UN", preco: 117.75 },
      { comp: "BOLSA TOTE M&N 2026", gram: "1 UN", preco: 59.90 },
      { comp: "BOLSA TRANSPARENTE MN", gram: "1 UN", preco: 29.90 },
      { comp: "BOLSINHA NEUTRA", gram: "1 UN", preco: 49.90 },
      { comp: "BONECO DE NEVE 21", gram: "1 UN", preco: 34.90 },
      { comp: "CARTELA DE ADESIVOS NATAL", gram: "1 UN", preco: 1.50 },
      { comp: "CERÂMICA DE FONDUE INVERNO 400ML", gram: "1 UN", preco: 69.90 },
      { comp: "COPO DIA DAS CRIANÇAS 22", gram: "1 UN", preco: 49.90 },
      { comp: "COPO SNACK AMARELO COPA 2026", gram: "1 UN", preco: 24.99 },
      { comp: "COPO SNACK LARANJA COPA 2026", gram: "1 UN", preco: 24.99 },
      { comp: "COPO VERÃO", gram: "1 UN", preco: 7.50 },
      { comp: "COPO VERDE VERÃO", gram: "1 UN", preco: 7.50 },
      { comp: "COPO VIDRO NAMORADOS E PAIS 24", gram: "1 UN", preco: 34.90 },
      { comp: "GORRINHO 21", gram: "1 UN", preco: 17.00 },
      { comp: "KIT MASSINHA DE MODELAR", gram: "1 UN", preco: 29.90 },
      { comp: "MEIA DE NATAL", gram: "1 UN", preco: 19.90 },
      { comp: "MEIA NATALINA BRASIL CACAU 2025", gram: "1 UN", preco: 24.90 },
      { comp: "NECESSAIRE LARANJA E ROSA MN", gram: "1 UN", preco: 39.90 },
      { comp: "NECESSAIRE VERMELHA", gram: "1 UN", preco: 29.90 },
      { comp: "POCHETE GATO MIA", gram: "1 UN", preco: 49.90 },
      { comp: "PORCELANA FONDUE CBC", gram: "1 UN", preco: 69.90 },
      { comp: "PORTA JOIAS NECESSAIRE MN 24", gram: "1 UN", preco: 29.90 },
      { comp: "PORTA TRUFAS CORAÇÃO", gram: "1 UN", preco: 9.90 },
      { comp: "ROSA CAMURÇA CABO ARTIFICIAL", gram: "1 UN", preco: 13.99 }
    ]
  },
  {
    nome: "ALMOFADA",
    prefixo: "alm",
    itens: [
      { comp: "DIA DAS CRIANÇAS 22", gram: "1 UN", preco: 49.90 },
      { comp: "GATO MIA", gram: "1 UN", preco: 49.90 },
      { comp: "UNICÓRNIO", gram: "1 UN", preco: 59.90 }
    ]
  },
  {
    nome: "BEM ME FAZ",
    prefixo: "bmf",
    itens: [
      { comp: "BOMBOM AMENDOIM", gram: "20g", preco: 5.99 },
      { comp: "TABLETE AO LEITE", gram: "20g", preco: 6.49 },
      { comp: "TABLETE AO LEITE", gram: "90g", preco: 22.99 },
      { comp: "BOMBOM GATO MIA", gram: "20g", preco: 5.99 },
      { comp: "GATO MIA", gram: "70g", preco: 21.99 }
    ]
  },
  {
    nome: "CANECA",
    prefixo: "can",
    itens: [
      { comp: "AMARELA LINHA FRASE", gram: "1 UN", preco: 18.15 },
      { comp: "AZUL BIGODE", gram: "1 UN", preco: 24.90 },
      { comp: "AZUL CHUBBY", gram: "1 UN", preco: 45.00 },
      { comp: "AZUL E PRETA PAI 23", gram: "1 UN", preco: 30.90 },
      { comp: "BR CORAÇÕES", gram: "1 UN", preco: 23.60 },
      { comp: "BRANCA LINHA FRASE", gram: "1 UN", preco: 18.15 },
      { comp: "BRASILIDADES", gram: "1 UN", preco: 30.90 },
      { comp: "BRASILIDADES 300ML", gram: "1 UN", preco: 29.90 },
      { comp: "CHOCOLATE CBC", gram: "1 UN", preco: 18.15 },
      { comp: "CÔNICA CORUJA", gram: "1 UN", preco: 26.90 },
      { comp: "CÔNICA I LOVE YOU", gram: "1 UN", preco: 26.90 },
      { comp: "CÔNICA LOVE E CORAÇÕES", gram: "1 UN", preco: 26.90 },
      { comp: "CORAÇÃO 240ML", gram: "1 UN", preco: 35.90 },
      { comp: "CORAÇÕES 18", gram: "1 UN", preco: 24.90 },
      { comp: "CORAÇÕES MN", gram: "1 UN", preco: 26.90 },
      { comp: "DE NATAL LINHA BR", gram: "1 UN", preco: 19.90 },
      { comp: "DESEJO", gram: "1 UN", preco: 26.90 },
      { comp: "DIA DAS MÃES 21", gram: "1 UN", preco: 26.90 },
      { comp: "EASY 330ML KISS MENAMORADOS 2016", gram: "1 UN", preco: 26.90 },
      { comp: "EASY 330ML TE AMOMAES 2016", gram: "1 UN", preco: 26.90 },
      { comp: "ELO PAI 23", gram: "1 UN", preco: 34.90 },
      { comp: "ELO ROSA E VERDE MN", gram: "1 UN", preco: 34.90 },
      { comp: "EMPILHÁVEL NAMORADOS 220ML BC 24", gram: "1 UN", preco: 44.90 },
      { comp: "FELIZ NATAL", gram: "1 UN", preco: 54.90 },
      { comp: "FLAT CAPIVARA", gram: "1 UN", preco: 39.99 },
      { comp: "FRASE ASA CHOCOLATE BRANCA 2019", gram: "1 UN", preco: 26.90 },
      { comp: "FRASE LARANJA 2019", gram: "1 UN", preco: 26.90 },
      { comp: "GATO MITSI", gram: "1 UN", preco: 26.90 },
      { comp: "LARANJA FLAT", gram: "1 UN", preco: 39.90 },
      { comp: "LHAMA TRANSPARENTE", gram: "1 UN", preco: 23.60 },
      { comp: "LINHA DIVERSAS ESPECIAIS", gram: "1 UN", preco: 34.90 },
      { comp: "LINHA DIVERSAS G", gram: "1 UN", preco: 30.90 },
      { comp: "LINHA DIVERSAS GRANDES", gram: "1 UN", preco: 26.90 },
      { comp: "LINHA DIVERSAS M", gram: "1 UN", preco: 24.90 },
      { comp: "LINHA DIVERSAS MEDIA", gram: "1 UN", preco: 23.60 },
      { comp: "LINHA DIVERSAS MINI", gram: "1 UN", preco: 16.50 },
      { comp: "LINHA DIVERSAS PEQUENAS", gram: "1 UN", preco: 18.15 },
      { comp: "LISTRADA AZUL MOBI", gram: "1 UN", preco: 34.90 },
      { comp: "LISTRADA LARANJA MOBI", gram: "1 UN", preco: 34.90 },
      { comp: "LISTRADA ROSA MOBI", gram: "1 UN", preco: 34.90 },
      { comp: "MÃES E NAMORADOS 2022", gram: "1 UN", preco: 30.90 },
      { comp: "MAIS AMOR MAIS PET", gram: "1 UN", preco: 26.90 },
      { comp: "MELHOR PAI 21", gram: "1 UN", preco: 26.90 },
      { comp: "MOBI ROSA BC", gram: "1 UN", preco: 39.90 },
      { comp: "NAMORADOS 2020", gram: "1 UN", preco: 26.90 },
      { comp: "NATAL 350ML BC 24", gram: "1 UN", preco: 39.90 },
      { comp: "NATAL BENGALA", gram: "1 UN", preco: 45.90 },
      { comp: "NATALINA 2023", gram: "1 UN", preco: 39.90 },
      { comp: "PAIS", gram: "1 UN", preco: 19.90 },
      { comp: "PTA PAIS 2019", gram: "1 UN", preco: 19.90 },
      { comp: "ROMÂNTICA BRANCA COM CORAÇÕES", gram: "1 UN", preco: 16.50 },
      { comp: "ROSA CHUBBY", gram: "1 UN", preco: 45.00 },
      { comp: "TE AMO", gram: "1 UN", preco: 24.90 },
      { comp: "UNICÓRNIO", gram: "1 UN", preco: 23.60 },
      { comp: "UNICÓRNIO CORES", gram: "1 UN", preco: 22.90 },
      { comp: "UNICÓRNIO NATAL ROSA 2019", gram: "1 UN", preco: 26.90 },
      { comp: "VERDE FLAT", gram: "1 UN", preco: 39.90 },
      { comp: "VERDE LINHA FRASE", gram: "1 UN", preco: 18.15 },
      { comp: "VERDE NATAL 25 BC OXFD", gram: "1 UN", preco: 39.90 },
      { comp: "VM AFETO", gram: "1 UN", preco: 23.60 },
      { comp: "VM CORAÇÃO", gram: "1 UN", preco: 23.60 }
    ]
  },
  {
    nome: "DINDA",
    prefixo: "din",
    itens: [
      { comp: "ALPINO", gram: "90g", preco: 17.99 },
      { comp: "BOMBOM LOLLO", gram: "90g", preco: 28.99 },
      { comp: "BOMBOM TRADICIONAL", gram: "90g", preco: 28.99 },
      { comp: "CHOCOLATE", gram: "90g", preco: 17.99 },
      { comp: "LOLLO", gram: "30g", preco: 7.99 },
      { comp: "SENSAÇÃO", gram: "90g", preco: 17.99 },
      { comp: "TRADICIONAL", gram: "30g", preco: 7.99 },
      { comp: "TRADICIONAL", gram: "90g", preco: 17.99 }
    ]
  },
  {
    nome: "GATO MIA",
    prefixo: "gat",
    itens: [
      { comp: "AO LEITE", gram: "70g", preco: 20.99 },
      { comp: "CHOCOLATE BRANCO", gram: "70g", preco: 20.99 },
      { comp: "RECHEADO ALPINO", gram: "70g", preco: 21.99 },
      { comp: "RECHEADO AVELÃ", gram: "70g", preco: 21.99 },
      { comp: "RECHEADO PISTACHE", gram: "70g", preco: 21.99 }
    ]
  },
  {
    nome: "LATA",
    prefixo: "lat",
    itens: [
      { comp: "BALDE", gram: "1 UN", preco: 38.90 },
      { comp: "BOLA", gram: "1 UN", preco: 38.90 },
      { comp: "CILÍNDRICA LAR METALIZADA", gram: "1 UN", preco: 21.90 },
      { comp: "CORAÇÃO DOURADA", gram: "1 UN", preco: 61.90 },
      { comp: "CORAÇÃO PEQUENA", gram: "1 UN", preco: 27.90 },
      { comp: "DE CORAÇÃO VERMELHA", gram: "1 UN", preco: 44.90 },
      { comp: "DOURADA D 85MM X A 95MM 10UN", gram: "1 UN", preco: 21.90 },
      { comp: "GRANDE", gram: "1 UN", preco: 26.90 },
      { comp: "NATAL QUADRADA", gram: "1 UN", preco: 19.90 },
      { comp: "OURO REDONDA", gram: "1 UN", preco: 23.90 },
      { comp: "PEQUENA", gram: "1 UN", preco: 19.90 },
      { comp: "REDONDA ALTA MARROM BC", gram: "1 UN", preco: 9.40 },
      { comp: "REDONDA BAIXA PRETA BC", gram: "1 UN", preco: 16.40 },
      { comp: "REDONDA BAIXA VERDE BC", gram: "1 UN", preco: 14.20 },
      { comp: "REDONDA BOMBONS DE NATAL", gram: "1 UN", preco: 25.90 },
      { comp: "REDONDA LAR METALIZADA", gram: "1 UN", preco: 38.90 },
      { comp: "RETANGULAR LAR METALIZADA", gram: "1 UN", preco: 29.90 }
    ]
  },
  {
    nome: "PEGUE E LEVE",
    prefixo: "peg",
    itens: [
      { comp: "PURO CACAU", gram: "10g", preco: 2.99 },
      { comp: "AO LEITE", gram: "10g", preco: 2.99 },
      { comp: "AO LEITE CASTANHA DE CAJU", gram: "10g", preco: 2.99 },
      { comp: "AO LEITE PISTACHE", gram: "12g", preco: 2.99 },
      { comp: "AVELÃ", gram: "12g", preco: 2.99 },
      { comp: "GATO MIA", gram: "12g", preco: 2.99 },
      { comp: "PURO CACAU", gram: "12g", preco: 2.99 },
      { comp: "TRADICIONAL", gram: "12g", preco: 2.99 }
    ]
  },
  {
    nome: "PELÚCIA",
    prefixo: "pel",
    itens: [
      { comp: "ARCO ÍRIS", gram: "1 UN", preco: 27.90 },
      { comp: "BICHO PREGUIÇA CBC", gram: "1 UN", preco: 59.90 },
      { comp: "BISCOITO DE CHOCOLATE", gram: "1 UN", preco: 29.90 },
      { comp: "BISCOITO NATALINA", gram: "1 UN", preco: 25.80 },
      { comp: "BONECO DE NEVE BARRIGA", gram: "1 UN", preco: 34.90 },
      { comp: "BONECO DE NEVE BARRIGA VAZADA", gram: "1 UN", preco: 34.90 },
      { comp: "BOTA NATALINA", gram: "1 UN", preco: 25.80 },
      { comp: "CACHORRO BOB C/ POTE", gram: "1 UN", preco: 65.90 },
      { comp: "CACHORRO NAMORADOS", gram: "1 UN", preco: 27.90 },
      { comp: "CACHORRO PIRATA BC", gram: "1 UN", preco: 45.90 },
      { comp: "CAPIVARA C/ TRUFA BRASIL CACAU", gram: "1 UN", preco: 72.90 },
      { comp: "CASAL URSO", gram: "1 UN", preco: 69.90 },
      { comp: "CASAL URSO ABRAÇADOS", gram: "1 UN", preco: 54.90 },
      { comp: "CEREJINHA BC 23", gram: "1 UN", preco: 49.90 },
      { comp: "COLECIONÁVEL GIRAFA", gram: "1 UN", preco: 27.90 },
      { comp: "CORAÇÃO", gram: "1 UN", preco: 35.90 },
      { comp: "CORUJA BABY BC", gram: "1 UN", preco: 69.90 },
      { comp: "DE INVERNO", gram: "1 UN", preco: 32.90 },
      { comp: "DINOSSAURO MINI BC", gram: "1 UN", preco: 49.90 },
      { comp: "DOG ESTAMPADO", gram: "1 UN", preco: 44.90 },
      { comp: "ELEFANTE", gram: "1 UN", preco: 38.50 },
      { comp: "EMBALAGEM BOMBOM", gram: "1 UN", preco: 9.90 },
      { comp: "ESPECIAIS", gram: "1 UN", preco: 89.90 },
      { comp: "ESTRELA", gram: "1 UN", preco: 25.80 },
      { comp: "EXTRA GRANDE", gram: "1 UN", preco: 69.90 },
      { comp: "GATA NA MANTA BC", gram: "1 UN", preco: 72.00 },
      { comp: "GATO BRANCO C/ POTE ROSA BC", gram: "1 UN", preco: 65.90 },
      { comp: "GIRAFINHA BC", gram: "1 UN", preco: 59.90 },
      { comp: "GRANDE", gram: "1 UN", preco: 65.90 },
      { comp: "HIPOPÓTAMO BRASIL CACAU", gram: "1 UN", preco: 65.90 },
      { comp: "INTERMEDIÁRIAS", gram: "1 UN", preco: 49.90 },
      { comp: "LEÃOZINHO 21", gram: "1 UN", preco: 59.90 },
      { comp: "LHAMA BC", gram: "1 UN", preco: 69.90 },
      { comp: "MÉDIA", gram: "1 UN", preco: 49.90 },
      { comp: "MEIA BORDADA", gram: "1 UN", preco: 17.00 },
      { comp: "MINI", gram: "1 UN", preco: 35.90 },
      { comp: "NOEL BOLINHA BOLACHA", gram: "1 UN", preco: 25.80 },
      { comp: "PEQUENAS", gram: "1 UN", preco: 45.90 },
      { comp: "POLVO HUMOR", gram: "1 UN", preco: 38.50 },
      { comp: "PORTA RETRATO", gram: "1 UN", preco: 69.90 },
      { comp: "RAPOSINHA BC", gram: "1 UN", preco: 65.90 },
      { comp: "RENA BOLSA", gram: "1 UN", preco: 34.90 },
      { comp: "RENA C/ POTE FELIZ NATAL", gram: "1 UN", preco: 25.80 },
      { comp: "RENA NATALINA", gram: "1 UN", preco: 34.90 },
      { comp: "RENA NATALINA DOURADA", gram: "1 UN", preco: 69.90 },
      { comp: "TUBARÃO", gram: "1 UN", preco: 32.90 },
      { comp: "UNICÓRNIO", gram: "1 UN", preco: 32.90 },
      { comp: "UNICÓRNIO BC", gram: "1 UN", preco: 49.90 },
      { comp: "URSO BALAO CORACAO", gram: "1 UN", preco: 89.90 },
      { comp: "URSO BRANCO", gram: "1 UN", preco: 49.90 },
      { comp: "URSO CORAÇÃO", gram: "1 UN", preco: 32.90 },
      { comp: "URSO CORAÇÃO EU TE AMO MN25", gram: "1 UN", preco: 65.90 },
      { comp: "URSO CORAÇÃO VOCÊ ME COMPLETA MN25", gram: "1 UN", preco: 65.90 },
      { comp: "URSO FELPUDO MN", gram: "1 UN", preco: 49.90 },
      { comp: "URSO FELPUDO MN 24", gram: "1 UN", preco: 59.90 },
      { comp: "URSO GRAVATA", gram: "1 UN", preco: 38.50 },
      { comp: "URSO LOUCO POR VOCÊ", gram: "1 UN", preco: 44.90 },
      { comp: "URSO MARROM", gram: "1 UN", preco: 32.90 },
      { comp: "URSO MARROM C/ POTE BC", gram: "1 UN", preco: 65.90 },
      { comp: "URSO MINI CORAÇÃO MN 24", gram: "1 UN", preco: 35.90 },
      { comp: "URSO NINO C/ POTE", gram: "1 UN", preco: 38.50 },
      { comp: "URSO NOEL", gram: "1 UN", preco: 53.80 },
      { comp: "URSO SENTADO MARROM NT BC", gram: "1 UN", preco: 89.90 },
      { comp: "XÍCARA", gram: "1 UN", preco: 49.90 }
    ]
  },
  {
    nome: "PRESENTE",
    prefixo: "pre",
    itens: [
      { comp: "ALEGRIA", gram: "114g", preco: 49.49 },
      { comp: "AMORES", gram: "80g", preco: 39.99 },
      { comp: "BOMBOM AVELÃ & WHITE TOP", gram: "120g", preco: 59.99 },
      { comp: "BUQUÊ DE ROSAS", gram: "36g", preco: 47.97 },
      { comp: "CAIPIRINHA BRASILIDADES", gram: "108g", preco: 49.49 },
      { comp: "CELEBRAR", gram: "96g", preco: 40.99 },
      { comp: "COMBO 3 DELÍCIAS DO BRASIL", gram: "240g", preco: 71.49 },
      { comp: "COMBO MINI", gram: "120g", preco: 35.99 },
      { comp: "DELEITE GATO MIA", gram: "97g", preco: 53.99 },
      { comp: "DELÍRIOS DE CEREJA", gram: "150g", preco: 68.99 },
      { comp: "ENCANTOS BRASILEIROS", gram: "108g", preco: 49.49 },
      { comp: "EXPERIÊNCIAS", gram: "192g", preco: 69.99 },
      { comp: "MOMENTOS", gram: "162g", preco: 58.99 },
      { comp: "ROSA UNITÁRIA", gram: "12g", preco: 15.99 },
      { comp: "ROSAS", gram: "80g", preco: 39.99 },
      { comp: "SELEÇÕES EMB", gram: "250g", preco: 69.99 },
      { comp: "SENSAÇÃO", gram: "126g", preco: 53.99 },
      { comp: "SUPREMO", gram: "200g", preco: 60.49 }
    ]
  },
  {
    nome: "SEM CATEGORIA",
    prefixo: "sca",
    itens: [
      { comp: "CAIXA CARTUCHO PP", gram: "1 UN", preco: 1.10 },
      { comp: "CAIXA C/ CINTA M", gram: "1 UN", preco: 3.20 },
      { comp: "CAIXA C/ CINTA P", gram: "1 UN", preco: 2.90 },
      { comp: "CAIXA HÍBRIDA", gram: "1 UN", preco: 28.00 },
      { comp: "CAIXA INST CBC G", gram: "1 UN", preco: 3.90 },
      { comp: "CAIXA INST CBC M", gram: "1 UN", preco: 3.20 },
      { comp: "CAIXA INST CBC P", gram: "1 UN", preco: 2.90 },
      { comp: "CAIXA INST M LARANJA 2026", gram: "1 UN", preco: 8.90 },
      { comp: "CAIXA INST P LARANJA 2026", gram: "1 UN", preco: 6.99 },
      { comp: "CAIXA INST PP LARANJA 2026", gram: "1 UN", preco: 2.99 },
      { comp: "CAIXA LIVRO MN C/ LAÇO", gram: "1 UN", preco: 8.00 },
      { comp: "CAIXA PRESENTE PORTA RETRATO", gram: "1 UN", preco: 21.90 },
      { comp: "CAIXINHA NATAL PP", gram: "1 UN", preco: 2.90 },
      { comp: "CARTÃO PRESENTE", gram: "1 UN", preco: 7.00 },
      { comp: "CARTUCHO 3 MINITRUFAS BC", gram: "1 UN", preco: 2.99 },
      { comp: "CARTUCHO C/ VISOR M PEGUE E LEVE 25 BC", gram: "1 UN", preco: 6.99 },
      { comp: "CARTUCHO CORAÇÃO MN 24", gram: "1 UN", preco: 4.00 },
      { comp: "CARTUCHO DIVERSOS M", gram: "1 UN", preco: 9.90 },
      { comp: "CARTUCHO ESPECIAL", gram: "1 UN", preco: 8.00 },
      { comp: "CARTUCHO G NATAL CASA DOCES", gram: "1 UN", preco: 5.15 },
      { comp: "CARTUCHO G NATAL CASA NEVE", gram: "1 UN", preco: 5.15 },
      { comp: "CARTUCHO INST DINDA 2026", gram: "1 UN", preco: 3.99 },
      { comp: "CARTUCHO M NATAL PINHEIRINHO", gram: "1 UN", preco: 3.90 },
      { comp: "CARTUCHO P NATAL URSINHO C/ VISOR", gram: "1 UN", preco: 3.10 },
      { comp: "CARTUCHO ROSAS", gram: "1 UN", preco: 1.10 },
      { comp: "CARTUCHO TABLETE COM TRUFAS 24", gram: "1 UN", preco: 4.00 },
      { comp: "CARTUCHO TABLETES DATA ESPECIAL", gram: "1 UN", preco: 9.90 },
      { comp: "CARTUCHO TRUFAS HALLOWEEN 22", gram: "1 UN", preco: 9.99 },
      { comp: "CARTUCHO TRUFAS M M&N 25 BC", gram: "1 UN", preco: 4.90 },
      { comp: "CARTUCHO URSINHO", gram: "1 UN", preco: 4.00 },
      { comp: "CELOFANE", gram: "1 UN", preco: 1.00 },
      { comp: "CELOFANE G TRANSP 45X50", gram: "1 UN", preco: 1.15 },
      { comp: "CELOFANE GG TRANSP 60X75", gram: "1 UN", preco: 3.00 },
      { comp: "CELOFANE M TRANSP 25X37", gram: "1 UN", preco: 0.55 },
      { comp: "CELOFANE P TRANSP 25X29", gram: "1 UN", preco: 0.45 },
      { comp: "CELOFANE PP TRANSP 15X22", gram: "1 UN", preco: 0.35 },
      { comp: "CESTA CANOA BRANCA GRANDE", gram: "1 UN", preco: 28.20 },
      { comp: "CESTA CANOA BRANCA MÉDIA", gram: "1 UN", preco: 21.60 },
      { comp: "CESTA CANOA MÉDIA C/ ALÇA", gram: "1 UN", preco: 59.90 },
      { comp: "CESTA CANOA MÉDIA S/ ALÇA", gram: "1 UN", preco: 51.90 },
      { comp: "CESTA CANOA PEQUENA C/ ALÇA", gram: "1 UN", preco: 49.90 },
      { comp: "CESTA CANOA PEQUENA S/ ALÇA", gram: "1 UN", preco: 45.90 },
      { comp: "CESTA CARTÃO BOLINHA", gram: "1 UN", preco: 3.30 },
      { comp: "CESTA CARTÃO LISTRAS", gram: "1 UN", preco: 3.30 },
      { comp: "CESTA CORAÇÃO GRANDE C/ ALÇA", gram: "1 UN", preco: 59.90 },
      { comp: "CESTA CORAÇÃO GRANDE S/ ALÇA", gram: "1 UN", preco: 45.90 },
      { comp: "CESTA CORAÇÃO MÉDIA C/ ALÇA", gram: "1 UN", preco: 39.90 },
      { comp: "CESTA CORAÇÃO MÉDIA S/ ALÇA", gram: "1 UN", preco: 29.90 },
      { comp: "CESTA CORAÇÃO PEQUENA C/ ALÇA", gram: "1 UN", preco: 19.90 },
      { comp: "CESTA CORAÇÃO PEQUENA S/ ALÇA", gram: "1 UN", preco: 15.90 },
      { comp: "CESTA FRALDEIRA BRANCA GRANDE", gram: "1 UN", preco: 59.90 },
      { comp: "CESTA FRALDEIRA BRANCA MÉDIA", gram: "1 UN", preco: 59.90 },
      { comp: "CESTA FRALDEIRA BRANCA PEQUENA", gram: "1 UN", preco: 29.90 },
      { comp: "CESTA FRALDEIRA BRANCA PP", gram: "1 UN", preco: 19.90 },
      { comp: "CESTA MN 24", gram: "1 UN", preco: 6.50 },
      { comp: "CESTA OVAL DE VIME ESCURECIDO G", gram: "1 UN", preco: 41.00 },
      { comp: "CESTA OVAL DE VIME ESCURECIDO GG", gram: "1 UN", preco: 43.00 },
      { comp: "CESTA OVAL DE VIME ESCURECIDO M", gram: "1 UN", preco: 38.00 },
      { comp: "CESTA OVAL DE VIME ESCURECIDO P", gram: "1 UN", preco: 33.00 },
      { comp: "CESTA OVAL MINI C/ ALÇA", gram: "1 UN", preco: 19.90 },
      { comp: "CESTA OVAL MINI S/ ALÇA", gram: "1 UN", preco: 12.90 },
      { comp: "CESTA PAPEL CARTÃO", gram: "1 UN", preco: 3.30 },
      { comp: "CESTA QUADRADA GRD", gram: "1 UN", preco: 40.60 },
      { comp: "CESTA QUADRADA PEQUENA C/ ALÇA", gram: "1 UN", preco: 22.90 },
      { comp: "CESTA QUADRADA PEQUENA S/ ALÇA", gram: "1 UN", preco: 19.90 },
      { comp: "CESTA REDONDA DE VIME ESCURECIDO G", gram: "1 UN", preco: 36.00 },
      { comp: "CESTA REDONDA DE VIME ESCURECIDO M", gram: "1 UN", preco: 30.00 },
      { comp: "CESTA REDONDA DE VIME ESCURECIDO P", gram: "1 UN", preco: 24.00 },
      { comp: "CESTA RETANGULAR BABY S/ ALÇA", gram: "1 UN", preco: 19.90 },
      { comp: "CESTA RETANGULAR MÉDIA C/ ALÇA", gram: "1 UN", preco: 39.90 },
      { comp: "CESTA RETANGULAR MÉDIA S/ ALÇA", gram: "1 UN", preco: 29.90 },
      { comp: "CESTA RETANGULAR MINI S/ ALÇA", gram: "1 UN", preco: 9.20 },
      { comp: "CESTA RETANGULAR PEQUENA C/ ALÇA", gram: "1 UN", preco: 14.20 },
      { comp: "CESTA RÍGIDA G", gram: "1 UN", preco: 22.90 },
      { comp: "CESTA RÍGIDA M", gram: "1 UN", preco: 15.90 },
      { comp: "CESTA RÍGIDA P", gram: "1 UN", preco: 14.90 },
      { comp: "CESTA TABOA DIVERSAS G", gram: "1 UN", preco: 80.00 },
      { comp: "CESTA TABOA DIVERSAS M", gram: "1 UN", preco: 70.00 },
      { comp: "CESTA TABOA DIVERSAS P", gram: "1 UN", preco: 55.00 },
      { comp: "CINTA C/ ELÁSTICO MN BC25", gram: "1 UN", preco: 1.50 },
      { comp: "CINTA M&N26", gram: "1 UN", preco: 1.09 },
      { comp: "EMB BOMBOM MENSAGENS ESPECIAIS", gram: "1 UN", preco: 7.70 },
      { comp: "EMBALAGEM BOQUINHAS BC", gram: "1 UN", preco: 16.90 },
      { comp: "EMBALAGEM BOTA NATALINA", gram: "1 UN", preco: 12.90 },
      { comp: "EMBALAGEM CORAÇÃO BC", gram: "1 UN", preco: 16.90 },
      { comp: "EMBALAGEM CORAÇÃO NAMORADOS", gram: "1 UN", preco: 11.90 },
      { comp: "EMBALAGEM CORUJA", gram: "1 UN", preco: 12.50 },
      { comp: "EMBALAGEM LIGA DA JUSTIÇA PARA TABLETES", gram: "1 UN", preco: 4.92 },
      { comp: "EMBALAGEM TRUFA MN 24", gram: "1 UN", preco: 24.90 },
      { comp: "FITA DE CETIM", gram: "1 UN", preco: 7.15 },
      { comp: "LAÇO", gram: "1 UN", preco: 0.50 },
      { comp: "LAÇO CELOFANE", gram: "1 UN", preco: 2.00 },
      { comp: "LAÇO CESTA", gram: "1 UN", preco: 3.00 },
      { comp: "LAÇO DUPLA FACE", gram: "1 UN", preco: 1.50 },
      { comp: "SACO DECORADO", gram: "1 UN", preco: 1.95 },
      { comp: "SAQUINHO PRESENTE", gram: "1 UN", preco: 3.00 }
    ]
  },
  {
    nome: "TABLETE",
    prefixo: "tab",
    itens: [
      { comp: "60% CACAU", gram: "20g", preco: 5.29 },
      { comp: "60% CACAU", gram: "90g", preco: 22.99 },
      { comp: "70% CACAU", gram: "20g", preco: 5.29 },
      { comp: "70% CACAU", gram: "90g", preco: 22.99 },
      { comp: "70% CACAU COM LARANJA", gram: "20g", preco: 5.29 },
      { comp: "80% CACAU", gram: "20g", preco: 5.29 },
      { comp: "AO LEITE", gram: "20g", preco: 5.29 },
      { comp: "AO LEITE", gram: "90g", preco: 19.99 },
      { comp: "BRANCO", gram: "90g", preco: 19.99 },
      { comp: "BRANCO GATO MIA", gram: "20g", preco: 5.29 },
      { comp: "CASTANHA DE CAJU", gram: "20g", preco: 5.29 },
      { comp: "CASTANHA DE CAJU", gram: "90g", preco: 19.99 },
      { comp: "OBRIGADO", gram: "40g", preco: 14.99 },
      { comp: "PARABÉNS", gram: "40g", preco: 14.99 }
    ]
  },
  {
    nome: "TABLETE RECHEADO",
    prefixo: "tab-rech",
    itens: [
      { comp: "70% CACAU", gram: "90g", preco: 22.99 },
      { comp: "ALPINO", gram: "90g", preco: 22.99 },
      { comp: "AO LEITE TRUFADO OBRIGADO", gram: "90g", preco: 22.99 },
      { comp: "AO LEITE TRUFADO PARABÉNS", gram: "90g", preco: 22.99 },
      { comp: "AO LEITE TRUFADO TE AMO", gram: "90g", preco: 22.99 },
      { comp: "BRIGADEIRO BRASILIDADES", gram: "90g", preco: 22.99 },
      { comp: "CREME DE AVELÃ", gram: "90g", preco: 22.99 },
      { comp: "DUO", gram: "90g", preco: 22.99 },
      { comp: "GATO MIA", gram: "90g", preco: 22.99 },
      { comp: "LICOR DE CEREJA", gram: "90g", preco: 22.99 },
      { comp: "PISTACHE", gram: "90g", preco: 22.99 }
    ]
  },
  {
    nome: "TO GO",
    prefixo: "tgo",
    itens: [
      { comp: "ALFAJOR", gram: "25g", preco: 6.99 },
      { comp: "BRIGADEIRÃO", gram: "45g", preco: 10.99 },
      { comp: "CANUDO AVELÃ", gram: "20g", preco: 6.99 },
      { comp: "CANUDO BATON AO LEITE", gram: "20g", preco: 6.99 },
      { comp: "PÃO DE MEL BC", gram: "40g", preco: 10.99 }
    ]
  },
  {
    nome: "TRUFA",
    prefixo: "tru",
    itens: [
      { comp: "ALPINO", gram: "25g", preco: 5.49 },
      { comp: "AO LEITE", gram: "25g", preco: 5.19 },
      { comp: "AVELÃ", gram: "25g", preco: 5.19 },
      { comp: "BRANCA", gram: "25g", preco: 5.19 },
      { comp: "BRIGADEIRO", gram: "25g", preco: 5.19 },
      { comp: "CEREJA", gram: "25g", preco: 5.19 },
      { comp: "CHOC BRANCO PISTACHE", gram: "25g", preco: 5.19 },
      { comp: "DUO", gram: "25g", preco: 5.19 },
      { comp: "GATO MIA", gram: "25g", preco: 5.19 },
      { comp: "MARACUJÁ", gram: "25g", preco: 5.19 },
      { comp: "MORANGO", gram: "25g", preco: 5.19 },
      { comp: "OVOMALTINE", gram: "25g", preco: 5.49 },
      { comp: "PRESTÍGIO", gram: "25g", preco: 5.49 },
      { comp: "PURO CACAU", gram: "25g", preco: 5.19 }
    ]
  }
];

// ==========================================
// 2. PROCESSAMENTO E FORMATAÇÃO FINAL
// ==========================================

const todosOsProdutos = [];

categoriasData.forEach(cat => {
  cat.itens.forEach((produto, index) => {
    // Ex: gera "tab-01", "tab-02", etc.
    const idFormatado = `${cat.prefixo}-${String(index + 1).padStart(2, '0')}`;
    
    todosOsProdutos.push({
      id: idFormatado,
      categoria: cat.nome,
      complemento: produto.comp,
      gramatura: produto.gram,
      precoBase: produto.preco,
      validade: ""
    });
  });
});

// ==========================================
// 3. O COMPONENTE VISUAL
// ==========================================
export function Migracao() {
  const [status, setStatus] = useState(`Pronto para subir ${todosOsProdutos.length} produtos!`);
  const [progresso, setProgresso] = useState(0);

  const executarMigracao = async () => {
    setStatus("🚀 Enviando para o Firebase... Por favor, não feche a aba!");
    
    try {
      for (let i = 0; i < todosOsProdutos.length; i++) {
        const produto = todosOsProdutos[i];
        const docRef = doc(db, "produtos", produto.id);
        
        await setDoc(docRef, {
          categoria: produto.categoria,
          complemento: produto.complemento,
          gramatura: produto.gramatura,
          precoBase: produto.precoBase,
          validade: produto.validade
        });
        
        // Atualiza a barrinha visual de progresso
        setProgresso(Math.round(((i + 1) / todosOsProdutos.length) * 100));
      }
      setStatus(`SUCESSO! ✅ Todos os ${todosOsProdutos.length} produtos estão na nuvem!`);
    } catch (error) {
      console.error("Erro no envio:", error);
      setStatus("ERRO! ❌ Olhe o console (F12) para detalhes.");
    }
  };

  return (
    <div style={{ padding: '40px', background: '#fff', border: '2px dashed var(--laranja)', margin: '20px', borderRadius: '10px', textAlign: 'center', width: '90%', zIndex: 9999 }}>
      <h2 style={{ color: 'var(--marrom)', marginBottom: '10px' }}>Subir Carga Final (Catálogo Limpo)</h2>
      <p style={{ fontWeight: 'bold', color: '#666', marginBottom: '20px' }}>{status}</p>
      
      <div style={{ width: '100%', backgroundColor: '#eee', borderRadius: '5px', height: '20px', marginBottom: '20px' }}>
        <div style={{ width: `${progresso}%`, backgroundColor: 'var(--laranja)', height: '100%', borderRadius: '5px', transition: 'width 0.2s' }}></div>
      </div>

      <button 
        onClick={executarMigracao}
        style={{ background: 'var(--laranja)', color: '#fff', padding: '15px 30px', fontSize: '18px', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
      >
        🚀 EXECUTAR MIGRAÇÃO COMPLETA
      </button>
    </div>
  );
}