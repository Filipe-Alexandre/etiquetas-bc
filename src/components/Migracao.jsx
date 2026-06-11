// src/components/Migracao.jsx
import React, { useState } from 'react';
import { db } from '../data/firebaseConfig';
import { collection, getDocs, doc, setDoc, deleteDoc, query, where, addDoc } from 'firebase/firestore';

// ==========================================
// 1. CARGA DE SEGURANÇA (DADOS ESTÁTICOS REVISADOS)
// ==========================================
const categoriasData = [
  {
    nome: "ACESSÓRIOS", prefixo: "ace",
    itens: [
      { comp: "APOIO DE PESCOÇO NAMORADOS", gram: "1 UN", preco: 44.90 },
      { comp: "BOLSA PALHA DIVERSA M", gram: "1 UN", preco: 39.90 },
      { comp: "BOLSA TÉRMICA", gram: "1 UN", preco: 117.75 },
      { comp: "BOLSA TOTE M&N 2026", gram: "1 UN", preco: 59.90 },
      { comp: "BOLSA TRANSPARENTE MN", gram: "1 UN", preco: 29.90 },
      { comp: "BOLSINHA NEUTRA", gram: "1 UN", preco: 49.90 },
      { comp: "CERÂMICA DE FONDUE INVERNO 400ML", gram: "1 UN", preco: 69.90 },
      { comp: "COPO SNACK AMARELO COPA 2026", gram: "1 UN", preco: 24.90 },
      { comp: "COPO SNACK LARANJA COPA 2026", gram: "1 UN", preco: 24.90 },
      { comp: "COPO VERÃO", gram: "1 UN", preco: 7.50 },
      { comp: "COPO VERDE VERÃO", gram: "1 UN", preco: 7.50 },
      { comp: "KIT MASSINHA DE MODELAR", gram: "1 UN", preco: 29.90 },
      { comp: "NECESSAIRE LARANJA E ROSA MN", gram: "1 UN", preco: 39.90 },
      { comp: "NECESSAIRE VERMELHA", gram: "1 UN", preco: 29.90 },
      { comp: "POCHETE GATO MIA", gram: "1 UN", preco: 49.90 },
      { comp: "PORCELANA FONDUE CBC", gram: "1 UN", preco: 69.90 },
      { comp: "PORTA TRUFAS CORAÇÃO", gram: "1 UN", preco: 9.90 },
      { comp: "ROSA CAMURÇA CABO ARTIFICIAL", gram: "1 UN", preco: 13.99 }
    ]
  },
  {
    nome: "ALMOFADA", prefixo: "alm",
    itens: [
      { comp: "GATO MIA", gram: "1 UN", preco: 49.90 },
      { comp: "UNICÓRNIO", gram: "1 UN", preco: 59.90 }
    ]
  },
  {
    nome: "BEM ME FAZ", prefixo: "bmf",
    itens: [
      { comp: "BOMBOM AMENDOIM", gram: "20g", preco: 5.99 },
      { comp: "TABLETE AO LEITE", gram: "20g", preco: 6.49 },
      { comp: "TABLETE AO LEITE", gram: "90g", preco: 22.99 },
      { comp: "BOMBOM GATO MIA", gram: "20g", preco: 5.99 },
      { comp: "GATO MIA", gram: "70g", preco: 21.99 }
    ]
  },
  {
    nome: "CANECA", prefixo: "can",
    itens: [
      { comp: "AMARELA LINHA FRASE", gram: "1 UN", preco: 18.15 },
      { comp: "AZUL BIGODE", gram: "1 UN", preco: 24.90 },
      { comp: "AZUL CHUBBY", gram: "1 UN", preco: 45.00 },
      { comp: "BR CORAÇÕES", gram: "1 UN", preco: 23.60 },
      { comp: "BRANCA LINHA FRASE", gram: "1 UN", preco: 18.15 },
      { comp: "BRASILIDADES", gram: "1 UN", preco: 30.90 },
      { comp: "BRASILIDADES 300ML", gram: "1 UN", preco: 29.90 },
      { comp: "CHOCOLATE CBC", gram: "1 UN", preco: 18.15 },
      { comp: "CÔNICA CORUJA", gram: "1 UN", preco: 26.90 },
      { comp: "CÔNICA I LOVE YOU", gram: "1 UN", preco: 26.90 },
      { comp: "CÔNICA LOVE E CORAÇÕES", gram: "1 UN", preco: 26.90 },
      { comp: "CORAÇÃO 240ML", gram: "1 UN", preco: 35.90 },
      { comp: "CORAÇÕES MN", gram: "1 UN", preco: 26.90 },
      { comp: "DESEJO", gram: "1 UN", preco: 26.90 },
      { comp: "ELO ROSA E VERDE MN", gram: "1 UN", preco: 34.90 },
      { comp: "FLAT CAPIVARA", gram: "1 UN", preco: 39.99 },
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
      { comp: "LISTRADA AZUL", gram: "1 UN", preco: 34.90 },
      { comp: "LISTRADA LARANJA", gram: "1 UN", preco: 34.90 },
      { comp: "LISTRADA ROSA", gram: "1 UN", preco: 34.90 },
      { comp: "MAIS AMOR MAIS PET", gram: "1 UN", preco: 26.90 },
      { comp: "MOBI ROSA BC", gram: "1 UN", preco: 39.90 },
      { comp: "PAIS", gram: "1 UN", preco: 19.90 },
      { comp: "ROMÂNTICA BRANCA COM CORAÇÕES", gram: "1 UN", preco: 16.50 },
      { comp: "ROSA CHUBBY", gram: "1 UN", preco: 45.00 },
      { comp: "TE AMO", gram: "1 UN", preco: 24.90 },
      { comp: "UNICÓRNIO", gram: "1 UN", preco: 23.60 },
      { comp: "UNICÓRNIO CORES", gram: "1 UN", preco: 22.90 },
      { comp: "VERDE FLAT", gram: "1 UN", preco: 39.90 },
      { comp: "VERDE LINHA FRASE", gram: "1 UN", preco: 18.15 },
      { comp: "VM AFETO", gram: "1 UN", preco: 23.60 },
      { comp: "VM CORAÇÃO", gram: "1 UN", preco: 23.60 }
    ]
  },
  {
    nome: "DINDA", prefixo: "din",
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
    nome: "GATO MIA", prefixo: "gat",
    itens: [
      { comp: "AO LEITE", gram: "70g", preco: 20.99 },
      { comp: "CHOCOLATE BRANCO", gram: "70g", preco: 20.99 },
      { comp: "RECHEADO ALPINO", gram: "70g", preco: 21.99 },
      { comp: "RECHEADO AVELÃ", gram: "70g", preco: 21.99 },
      { comp: "RECHEADO PISTACHE", gram: "70g", preco: 21.99 }
    ]
  },
  {
    nome: "LATA", prefixo: "lat",
    itens: [
      { comp: "BALDE", gram: "1 UN", preco: 38.90 },
      { comp: "BOLA", gram: "1 UN", preco: 38.90 },
      { comp: "CILÍNDRICA LAR METALIZADA", gram: "1 UN", preco: 21.90 },
      { comp: "CORAÇÃO DOURADA", gram: "1 UN", preco: 61.90 },
      { comp: "CORAÇÃO PEQUENA", gram: "1 UN", preco: 27.90 },
      { comp: "DE CORAÇÃO VERMELHA", gram: "1 UN", preco: 44.90 },
      { comp: "DOURADA D 85MM X A 95MM 10UN", gram: "1 UN", preco: 21.90 },
      { comp: "GRANDE", gram: "1 UN", preco: 26.90 },
      { comp: "OURO REDONDA", gram: "1 UN", preco: 23.90 },
      { comp: "PEQUENA", gram: "1 UN", preco: 19.90 },
      { comp: "REDONDA ALTA MARROM BC", gram: "1 UN", preco: 9.40 },
      { comp: "REDONDA BAIXA PRETA BC", gram: "1 UN", preco: 16.40 },
      { comp: "REDONDA BAIXA VERDE BC", gram: "1 UN", preco: 14.20 },
      { comp: "REDONDA LAR METALIZADA", gram: "1 UN", preco: 38.90 },
      { comp: "RETANGULAR LAR METALIZADA", gram: "1 UN", preco: 29.90 }
    ]
  },
  {
    nome: "PEGUE E LEVE", prefixo: "peg",
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
    nome: "PELÚCIA", prefixo: "pel",
    itens: [
      { comp: "BICHO PREGUIÇA CBC", gram: "1 UN", preco: 59.90 },
      { comp: "CACHORRO BOB C/ POTE", gram: "1 UN", preco: 65.90 },
      { comp: "CACHORRO NAMORADOS", gram: "1 UN", preco: 27.90 },
      { comp: "CACHORRO PIRATA BC", gram: "1 UN", preco: 45.90 },
      { comp: "CAPIVARA C/ TRUFA BRASIL CACAU", gram: "1 UN", preco: 72.90 },
      { comp: "COELHO ROSA C/ POTE", gram: "1 UN", preco: 65.90 },
      { comp: "COLECIONÁVEL GIRAFA", gram: "1 UN", preco: 27.90 },
      { comp: "CORAÇÃO", gram: "1 UN", preco: 35.90 },
      { comp: "CORUJA BABY BC", gram: "1 UN", preco: 69.90 },
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
      { comp: "LHAMA BC", gram: "1 UN", preco: 69.90 },
      { comp: "MÉDIA", gram: "1 UN", preco: 49.90 },
      { comp: "MEIA BORDADA", gram: "1 UN", preco: 17.00 },
      { comp: "MINI", gram: "1 UN", preco: 35.90 },
      { comp: "PEQUENAS", gram: "1 UN", preco: 45.90 },
      { comp: "POLVO HUMOR", gram: "1 UN", preco: 38.50 },
      { comp: "PORTA RETRATO", gram: "1 UN", preco: 69.90 },
      { comp: "RAPOSINHA BC", gram: "1 UN", preco: 65.90 },
      { comp: "TUBARÃO", gram: "1 UN", preco: 32.90 },
      { comp: "UNICÓRNIO", gram: "1 UN", preco: 32.90 },
      { comp: "UNICÓRNIO BC", gram: "1 UN", preco: 49.90 },
      { comp: "URSO BALAO CORACAO", gram: "1 UN", preco: 89.90 },
      { comp: "URSO BRANCO", gram: "1 UN", preco: 49.90 },
      { comp: "URSO CORAÇÃO", gram: "1 UN", preco: 32.90 },
      { comp: "URSO CORAÇÃO EU TE AMO MN25", gram: "1 UN", preco: 65.90 },
      { comp: "URSO CORAÇÃO VOCÊ ME COMPLETA MN25", gram: "1 UN", preco: 65.90 },
      { comp: "URSO GRAVATA", gram: "1 UN", preco: 38.50 },
      { comp: "URSO LOUCO POR VOCÊ", gram: "1 UN", preco: 44.90 },
      { comp: "URSO MARROM", gram: "1 UN", preco: 32.90 },
      { comp: "URSO MARROM C/ POTE BC", gram: "1 UN", preco: 65.90 },
      { comp: "URSO NINO C/ POTE", gram: "1 UN", preco: 38.50 },
      { comp: "XÍCARA", gram: "1 UN", preco: 49.90 }
    ]
  },
  {
    nome: "PRESENTE", prefixo: "pre",
    itens: [
      { comp: "ALEGRIA", gram: "114g", preco: 49.49 },
      { comp: "AMORES", gram: "80g", preco: 39.99 },
      { comp: "AVELÃ & WHITE TOP", gram: "120g", preco: 59.99 },
      { comp: "BUQUÊ DE ROSAS", gram: "36g", preco: 47.97 },
      { comp: "CAIPIRINHA BRASILIDADES", gram: "108g", preco: 49.49, maior18: true },
      { comp: "CELEBRAR", gram: "96g", preco: 40.99 },
      { comp: "COMBO 3 DELÍCIAS DO BRASIL", gram: "240g", preco: 71.49 },
      { comp: "COMBO MINI", gram: "120g", preco: 35.99 },
      { comp: "DELEITE GATO MIA", gram: "97g", preco: 53.99 },
      { comp: "DELÍRIOS DE CEREJA", gram: "150g", preco: 68.99, maior18: true },
      { comp: "ENCANTOS BRASILEIROS", gram: "108g", preco: 49.49 },
      { comp: "EXPERIÊNCIAS", gram: "192g", preco: 69.99 },
      { comp: "MOMENTOS", gram: "162g", preco: 58.99, maior18: true },
      { comp: "ROSA UNITÁRIA", gram: "12g", preco: 15.99 },
      { comp: "ROSAS", gram: "80g", preco: 39.99 },
      { comp: "SELEÇÕES EMB", gram: "250g", preco: 69.99 },
      { comp: "SENSAÇÃO", gram: "126g", preco: 53.99 },
      { comp: "SUPREMO", gram: "200g", preco: 60.49 },
      { comp: "HARMONIA", gram: "140g", preco: 59.99 }
    ]
  },
  {
    nome: "SEM CATEGORIA", prefixo: "sca",
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
      { comp: "CAIXA PRESENTE PORTA RETRATO", gram: "1 UN", preco: 21.90 },
      { comp: "CARTÃO PRESENTE", gram: "1 UN", preco: 7.00 },
      { comp: "CARTUCHO 3 MINITRUFAS BC", gram: "1 UN", preco: 2.99 },
      { comp: "CARTUCHO C/ VISOR M PEGUE E LEVE 25 BC", gram: "1 UN", preco: 6.99 },
      { comp: "CARTUCHO DIVERSOS M", gram: "1 UN", preco: 9.90 },
      { comp: "CARTUCHO ESPECIAL", gram: "1 UN", preco: 8.00 },
      { comp: "CARTUCHO INST DINDA 2026", gram: "1 UN", preco: 3.99 },
      { comp: "CARTUCHO ROSAS", gram: "1 UN", preco: 1.10 },
      { comp: "CARTUCHO TABLETES DATA ESPECIAL", gram: "1 UN", preco: 9.90 },
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
      { comp: "CINTA M&N26", gram: "1 UN", preco: 1.09 },
      { comp: "EMB BOMBOM MENSAGENS ESPECIAIS", gram: "1 UN", preco: 7.70 },
      { comp: "EMBALAGEM BOQUINHAS BC", gram: "1 UN", preco: 16.90 },
      { comp: "EMBALAGEM CORAÇÃO BC", gram: "1 UN", preco: 16.90 },
      { comp: "EMBALAGEM CORAÇÃO NAMORADOS", gram: "1 UN", preco: 11.90 },
      { comp: "EMBALAGEM CORUJA", gram: "1 UN", preco: 12.50 },
      { comp: "EMBALAGEM LIGA DA JUSTIÇA PARA TABLETES", gram: "1 UN", preco: 4.92 },
      { comp: "FITA DE CETIM", gram: "1 UN", preco: 7.15 },
      { comp: "LAÇO", gram: "1 UN", preco: 0.50 },
      { comp: "LAÇO CELOFANE", gram: "1 UN", preco: 2.00 },
      { comp: "LAÇO CESTA", gram: "1 UN", preco: 3.00 },
      { comp: "LAÇO DUPLA FACE", gram: "1 UN", preco: 1.50 },
      { comp: "SACO DECORADO", gram: "1 UN", preco: 1.95 },
      { comp: "SAQUINHO PRESENTE", gram: "1 UN", preco: 3.00 },
      { comp: "CXARTUCHO P/ TABLETES 90G", gram: "1 UN", preco: 5.99 }
    ]
  },
  {
    nome: "TABLETE", prefixo: "tab",
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
    nome: "TABLETE RECHEADO", prefixo: "tab-rech",
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
      { comp: "LICOR DE CEREJA", gram: "90g", preco: 22.99, maior18: true },
      { comp: "PISTACHE", gram: "90g", preco: 22.99 }
    ]
  },
  {
    nome: "TO GO", prefixo: "tgo",
    itens: [
      { comp: "ALFAJOR", gram: "25g", preco: 6.99 },
      { comp: "BRIGADEIRÃO", gram: "45g", preco: 10.99 },
      { comp: "CANUDO AVELÃ", gram: "20g", preco: 6.99 },
      { comp: "CANUDO BATON AO LEITE", gram: "20g", preco: 6.99 },
      { comp: "PÃO DE MEL BC", gram: "40g", preco: 10.99 }
    ]
  },
  {
    nome: "TRUFA", prefixo: "tru",
    itens: [
      { comp: "ALPINO", gram: "25g", preco: 5.29 },
      { comp: "AO LEITE", gram: "25g", preco: 4.99 },
      { comp: "AVELÃ", gram: "25g", preco: 4.99 },
      { comp: "BRANCA", gram: "25g", preco: 4.99 },
      { comp: "BRIGADEIRO", gram: "25g", preco: 4.99 },
      { comp: "CEREJA", gram: "25g", preco: 4.99 },
      { comp: "CHOC BRANCO PISTACHE", gram: "25g", preco: 4.99 },
      { comp: "DUO", gram: "25g", preco: 4.99 },
      { comp: "GATO MIA", gram: "25g", preco: 4.99 },
      { comp: "MARACUJÁ", gram: "25g", preco: 4.99 },
      { comp: "MORANGO", gram: "25g", preco: 4.99 },
      { comp: "OVOMALTINE", gram: "25g", preco: 5.29 },
      { comp: "PRESTÍGIO", gram: "25g", preco: 5.29 },
      { comp: "PURO CACAU", gram: "25g", preco: 4.99 }
    ]
  }
];

const todosOsProdutos = [];
categoriasData.forEach(cat => {
  cat.itens.forEach((produto, index) => {
    const idFormatado = `${cat.prefixo}-${String(index + 1).padStart(2, '0')}`;
    todosOsProdutos.push({
      id: idFormatado,
      categoria: cat.nome,
      complemento: produto.comp,
      gramatura: produto.gram,
      precoBase: produto.preco,
      maior18: produto.maior18 || false
    });
  });
});

// ==========================================
// 2. PAINEL MESTRE (MIGRAÇÃO + CRIAÇÃO + EDIÇÃO COMPLETA)
// ==========================================
export function Migracao({ fecharPainel, recarregarDados }) {
  // Estados da Senha
  const [senha, setSenha] = useState("");
  const [autenticado, setAutenticado] = useState(false);
  const [erroSenha, setErroSenha] = useState(false);

  // Estados da Tabela e Busca
  const [produtosFirebase, setProdutosFirebase] = useState([]);
  const [precosEditados, setPrecosEditados] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [buscaVal, setBuscaVal] = useState("");

  // Estados de Operação em Lote
  const [salvando, setSalvando] = useState(false);
  const [progresso, setProgresso] = useState(0);

  // ESTADOS DO FORMULÁRIO SUPERIOR (CRIAÇÃO/EDIÇÃO COMPLETA)
  const [produtoEmEdicao, setProdutoEmEdicao] = useState(null);
  const [formCategoria, setFormCategoria] = useState("");
  const [formComplemento, setFormComplemento] = useState("");
  const [formGramatura, setFormGramatura] = useState("");
  const [formPreco, setFormPreco] = useState("");

  const [salvandoForm, setSalvandoForm] = useState(false);
  const [formAberto, setFormAberto] = useState(false); // NOVO ESTADO DA SANFONA

  const SENHA_MESTRE = "182529";

  const fechar = () => {
    if (fecharPainel) fecharPainel();
  };

  const verificarSenha = (e) => {
    e.preventDefault();
    if (senha === SENHA_MESTRE) {
      setAutenticado(true);
      carregarProdutosDoBanco();
    } else {
      setErroSenha(true);
      setSenha("");
    }
  };

  const carregarProdutosDoBanco = async () => {
    setCarregando(true);
    try {
      const querySnapshot = await getDocs(collection(db, "produtos"));
      const lista = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      lista.sort((a, b) => {
        if (a.categoria < b.categoria) return -1;
        if (a.categoria > b.categoria) return 1;
        return (a.complemento || "").localeCompare(b.complemento || "");
      });

      setProdutosFirebase(lista);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      alert("Erro ao conectar com o banco de dados.");
    } finally {
      setCarregando(false);
    }
  };

  const categoriasUnicas = Array.from(new Set(produtosFirebase.map(p => p.categoria))).filter(Boolean).sort();

  const carregarNoFormulario = (produto) => {
    setProdutoEmEdicao(produto);
    setFormCategoria(produto.categoria || "");
    setFormComplemento(produto.complemento || "");
    setFormGramatura(produto.gramatura || "");
    setFormPreco(Number(produto.precoBase).toFixed(2).replace('.', ','));

    // Abre a janela de edição
    setFormAberto(true);

    // Dá um pequeno atraso para o React renderizar a janela aberta antes de rolar
    setTimeout(() => {
      const formElement = document.getElementById('painel-edicao-mestre');
      if (formElement) formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const limparFormulario = () => {
    setProdutoEmEdicao(null);
    setFormCategoria("");
    setFormComplemento("");
    setFormGramatura("");
    setFormPreco("");
    setFormAberto(false); // Fecha a janela ao cancelar
  };

  // LÓGICA ATUALIZADA: ADICIONA NOVO PRODUTO SE NÃO ESTIVER EDITANDO
  const salvarProdutoFormulario = async () => {
    if (!formCategoria || !formComplemento || !formGramatura || !formPreco) {
      return alert("Por favor, preencha todos os campos!");
    }

    // Limpa a formatação BR para salvar no banco (1.250,00 -> 1250.00)
    const precoLimpo = formPreco.replace(/\./g, '').replace(',', '.');
    const precoFinal = parseFloat(precoLimpo);

    if (isNaN(precoFinal)) return alert("Digite um preço válido!");

    setSalvandoForm(true);
    try {
      if (produtoEmEdicao) {
        // MODO EDIÇÃO
        const docRef = doc(db, "produtos", produtoEmEdicao.id);
        await setDoc(docRef, {
          categoria: formCategoria.toUpperCase(),
          complemento: formComplemento.toUpperCase(),
          gramatura: formGramatura.toUpperCase(),
          precoBase: precoFinal
        }, { merge: true });
        alert("Produto atualizado com sucesso!");
      } else {
        // MODO CRIAÇÃO (Adiciona Novo)
        await addDoc(collection(db, "produtos"), {
          categoria: formCategoria.toUpperCase(),
          complemento: formComplemento.toUpperCase(),
          gramatura: formGramatura.toUpperCase(),
          precoBase: precoFinal,
          maior18: false
        });
        alert("Novo produto cadastrado com sucesso!");
      }

      limparFormulario();
      carregarProdutosDoBanco();
      if (recarregarDados) recarregarDados();
    } catch (error) {
      console.error("Erro ao salvar o produto:", error);
      alert("Falha ao salvar produto.");
    } finally {
      setSalvandoForm(false);
    }
  };

  const handleChangePreco = (id, valorStr) => {
    let valorFormatado = valorStr.replace(/[^0-9.,]/g, '');
    setPrecosEditados(prev => ({ ...prev, [id]: valorFormatado }));
  };

  const excluirProduto = async (produto) => {
    if (!window.confirm(`ATENÇÃO: Deseja EXCLUIR o produto "${produto.complemento}"?`)) return;
    try {
      await deleteDoc(doc(db, "produtos", produto.id));
      alert("Produto excluído!");
      setProdutosFirebase(prev => prev.filter(p => p.id !== produto.id));
      if (recarregarDados) recarregarDados();
    } catch (error) {
      console.error("Erro ao excluir:", error);
      alert("Falha ao excluir.");
    }
  };

  const salvarTudo = async () => {
    const idsEditados = Object.keys(precosEditados).filter(id => {
      const prodOriginal = produtosFirebase.find(p => p.id === id);
      if (!prodOriginal) return false;

      const valorNovoFormatado = precosEditados[id].replace(/\./g, '').replace(',', '.');
      const valorNovo = parseFloat(valorNovoFormatado);

      return !isNaN(valorNovo) && valorNovo !== prodOriginal.precoBase;
    });

    if (idsEditados.length === 0) {
      alert("Nenhum preço foi alterado na tabela rápida.");
      return;
    }

    if (!window.confirm(`Atualizar o preço de ${idsEditados.length} produto(s)?`)) return;

    setSalvando(true);
    setProgresso(0);

    try {
      for (let i = 0; i < idsEditados.length; i++) {
        const id = idsEditados[i];
        const valorNovoFormatado = precosEditados[id].replace(/\./g, '').replace(',', '.');
        const novoPreco = parseFloat(valorNovoFormatado);
        const docRef = doc(db, "produtos", id);

        await setDoc(docRef, { precoBase: novoPreco }, { merge: true });
        setProgresso(Math.round(((i + 1) / idsEditados.length) * 100));
      }

      alert("Todos os preços foram atualizados!");
      setPrecosEditados({});
      carregarProdutosDoBanco();
      if (recarregarDados) recarregarDados();
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar os preços.");
    } finally {
      setSalvando(false);
      setProgresso(0);
    }
  };

  const executarSincronizacaoDaCarga = async () => {
    if (!window.confirm(`Isso enviará novos itens e atualizará os preços da nuvem (${todosOsProdutos.length} itens). Deseja continuar?`)) return;

    setSalvando(true);
    setProgresso(0);

    try {
      const produtosCollection = collection(db, "produtos");

      for (let i = 0; i < todosOsProdutos.length; i++) {
        const itemLocal = todosOsProdutos[i];

        const q = query(
          produtosCollection,
          where("complemento", "==", itemLocal.complemento),
          where("gramatura", "==", itemLocal.gramatura)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docIdExistente = querySnapshot.docs[0].id;
          const docRef = doc(db, "produtos", docIdExistente);

          await setDoc(docRef, {
            categoria: itemLocal.categoria,
            precoBase: itemLocal.precoBase,
            maior18: itemLocal.maior18
          }, { merge: true });
        } else {
          await addDoc(produtosCollection, {
            categoria: itemLocal.categoria,
            complemento: itemLocal.complemento,
            gramatura: itemLocal.gramatura,
            precoBase: itemLocal.precoBase,
            maior18: itemLocal.maior18
          });
        }
        setProgresso(Math.round(((i + 1) / todosOsProdutos.length) * 100));
      }

      alert("Catálogo sincronizado com sucesso!");
      carregarProdutosDoBanco();
      if (recarregarDados) recarregarDados();
    } catch (error) {
      console.error("Erro na sincronização:", error);
      alert("Erro ao enviar a carga.");
    } finally {
      setSalvando(false);
      setProgresso(0);
    }
  };

  if (!autenticado) {
    return (
      <div className="painel-overlay" onClick={fechar}>
        <div className="painel-modal modal-senha" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '350px', height: 'auto', minHeight: 'auto', position: 'relative' }}>
          <button className="btn-fechar-absoluto" onClick={fechar}>✖</button>
          <h2 style={{ color: 'var(--marrom)', textAlign: 'center', marginBottom: '20px' }}><i className="fa-solid fa-lock"></i> Acesso Restrito</h2>
          <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px', fontSize: '12px' }}>Digite a senha para gerenciar os preços do banco de dados.</p>
          <form onSubmit={verificarSenha} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input
              type="password"
              placeholder="Senha de Acesso"
              value={senha}
              onChange={(e) => { setSenha(e.target.value); setErroSenha(false); }}
              autoFocus
              style={{ padding: '12px', borderRadius: '6px', border: `2px solid ${erroSenha ? 'red' : 'var(--laranja)'}`, fontFamily: 'var(--bold)', textAlign: 'center', fontSize: '18px', outline: 'none' }}
            />
            {erroSenha && <span style={{ color: 'red', fontSize: '11px', textAlign: 'center' }}>Senha incorreta!</span>}
            <button type="submit" style={{ background: 'var(--laranja)', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'var(--bold)' }}>DESBLOQUEAR</button>
          </form>
        </div>
      </div>
    );
  }

  const produtosFiltrados = produtosFirebase.filter(p =>
    (p.complemento || '').toLowerCase().includes(buscaVal.toLowerCase()) ||
    (p.categoria || '').toLowerCase().includes(buscaVal.toLowerCase()) ||
    (p.gramatura || '').toLowerCase().includes(buscaVal.toLowerCase())
  );

  return (
    <div className="painel-overlay" onClick={fechar}>
      <div className="painel-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '1000px' }}>

        {/* HEADER */}
        <div className="painel-header" style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h2 style={{ color: 'var(--laranja)', margin: 0 }}>
              <i className="fa-solid fa-server"></i> GERENCIADOR DE CATÁLOGO
            </h2>
            {/* BOTÃO ENVIAR CARGA ROBUSTO E CINZA */}
            <button
              className={salvando ? 'loading' : ''}
              onClick={executarSincronizacaoDaCarga}
              disabled={salvando || carregando}
              style={{
                margin: 0,
                padding: '8px 15px',
                fontWeight: 'bold',
                fontSize: '11px',
                backgroundColor: '#e2e2e2',
                color: '#777777',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                width: 'fit-content'
              }}
            >
              {salvando && <div className="progress-fill" style={{ width: `${progresso}%`, background: 'rgba(0,0,0,0.15)', position: 'absolute', top: 0, left: 0, bottom: 0, transition: 'width 0.2s' }}></div>}
              <span className="btn-content" style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <i className={`fa-solid ${salvando ? 'fa-sync fa-spin' : 'fa-cloud-arrow-up'}`}></i>
                {salvando ? ` SALVANDO CARGA ${progresso}%` : 'ENVIAR CARGA PADRÃO DO CÓDIGO'}
              </span>
            </button>
          </div>

          <div className="painel-controls" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            width: '100%',
            marginTop: '10px' // Ajuste conforme necessário
          }}>
            {/* Linha 1: Input de Busca (ocupa as 2 colunas) */}
            <input
              type="text"
              className="input-busca-painel"
              placeholder="🔍 Buscar produto..."
              value={buscaVal}
              onChange={(e) => setBuscaVal(e.target.value)}
              style={{
                gridColumn: 'span 2',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                boxSizing: 'border-box',
                height: '40px' // Altura padrão do input
              }}
            />

            {/* Linha 2: Salvar e Fechar - Botões com 40px fixos */}
            <button
              onClick={salvarTudo}
              disabled={salvando || carregando}
              style={{
                height: '40px',
                background: '#4CAF50',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              {salvando ? `⏳ SALVANDO...` : '💾 SALVAR LOTE'}
            </button>

            <button
              className="btn-fechar-painel"
              onClick={fechar}
              disabled={salvando}
              style={{ height: '40px', margin: 0 }}
            >
              ✖ FECHAR
            </button>
          </div>

          {/* FORMULÁRIO DE CRIAÇÃO / EDIÇÃO COMPLETA (TIPO ACORDEÃO) */}
          <div id="painel-edicao-mestre" className="hide-print" style={{
            background: produtoEmEdicao ? '#e3f2fd' : '#f8f9fa',
            borderRadius: '8px',
            border: `1px solid ${produtoEmEdicao ? '#03A9F4' : '#ddd'}`,
            marginBottom: '10px',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            overflow: 'visible'
          }}>
            {/* CABEÇALHO CLICÁVEL COM CARA DE BOTÃO (TOGGLE) */}
            <div
              onClick={() => setFormAberto(!formAberto)}
              style={{
                padding: '15px 20px',
                width: '100%',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                userSelect: 'none',
                backgroundColor: produtoEmEdicao ? '#0288D1' : '#ffffff',
                color: produtoEmEdicao ? '#ffffff' : 'var(--marrom)',
                borderRadius: formAberto ? '8px 8px 0 0' : '8px',
                borderBottom: formAberto ? `1px solid ${produtoEmEdicao ? '#0288D1' : '#ddd'}` : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <h3 style={{ margin: 0, width: '100%', fontSize: '11pt', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {produtoEmEdicao ? (
                  <><i className="fa-solid fa-pen-to-square"></i> EDITANDO PRODUTO: {produtoEmEdicao.complemento}</>
                ) : (
                  <><i className="fa-solid fa-circle-plus" style={{ color: 'var(--laranja)' }}></i> CADASTRAR NOVO PRODUTO</>
                )}
              </h3>
              <i className={`fa-solid fa-chevron-${formAberto ? 'up' : 'down'}`} style={{ transition: 'transform 0.3s' }}></i>
            </div>

            {/* ÁREA EXPANSÍVEL (SÓ APARECE SE formAberto FOR TRUE) */}
            {formAberto && (
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>

                  <div style={{ flex: '1 1 140px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '10px', fontWeight: 'bold', color: '#555', whiteSpace: 'nowrap' }}>CATEGORIA</label>
                    <select
                      value={formCategoria}
                      onChange={e => setFormCategoria(e.target.value)}
                      style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%', background: '#fff', fontWeight: 'bold', outline: 'none', height: '34px', fontSize: '12px' }}
                    >
                      <option value="">Selecione...</option>
                      {categoriasUnicas.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ flex: '2 1 200px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '10px', fontWeight: 'bold', color: '#555', whiteSpace: 'nowrap' }}>NOME / COMPLEMENTO</label>
                    <input
                      type="text"
                      value={formComplemento}
                      onChange={e => setFormComplemento(e.target.value)}
                      placeholder="Ex: TABLETE AO LEITE"
                      style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%', background: '#fff', textTransform: 'uppercase', outline: 'none', height: '34px', fontSize: '12px', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ flex: '1 1 100px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '10px', fontWeight: 'bold', color: '#555', whiteSpace: 'nowrap' }}>GRAMATURA</label>
                    <input
                      type="text"
                      value={formGramatura}
                      onChange={e => setFormGramatura(e.target.value)}
                      placeholder="Ex: 90g ou 1 UN"
                      style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%', background: '#fff', textTransform: 'uppercase', outline: 'none', height: '34px', fontSize: '12px', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ flex: '1 1 100px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '10px', fontWeight: 'bold', color: '#555', whiteSpace: 'nowrap' }}>PREÇO (R$)</label>
                    <input
                      type="text"
                      value={formPreco}
                      onChange={(e) => {
                        let valor = e.target.value.replace(/\D/g, '');
                        if (!valor) valor = '0';
                        setFormPreco((Number(valor) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
                      }}
                      placeholder="0,00"
                      style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%', background: '#fff', outline: 'none', fontWeight: 'bold', height: '34px', fontSize: '12px', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* BOTÕES INLINE (Ícones dinâmicos) */}
                  <div style={{ display: 'flex', gap: '6px', flex: '0 0 auto' }}>
                    <button
                      onClick={salvarProdutoFormulario}
                      disabled={salvandoForm}
                      title={produtoEmEdicao ? "Salvar Alterações" : "Adicionar Novo Produto"}
                      style={{ background: '#4CAF50', color: '#fff', width: '34px', height: '34px', borderRadius: '4px', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', transition: 'background 0.2s' }}
                    >
                      {salvandoForm ? (
                        <i className="fa-solid fa-spinner fa-spin"></i>
                      ) : (
                        produtoEmEdicao ? <i className="fa-solid fa-floppy-disk"></i> : <i className="fa-solid fa-plus"></i>
                      )}
                    </button>

                    <button
                      onClick={limparFormulario}
                      title="Limpar formulário / Fechar Aba"
                      style={{ background: '#f44336', color: '#fff', width: '34px', height: '34px', borderRadius: '4px', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', transition: 'background 0.2s' }}
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* TABELA DE DADOS DO FIREBASE */}
          <div className="table-responsive">
            {carregando ? (
              <div style={{ textAlign: 'center', padding: '50px', color: 'var(--laranja)' }}>
                <h3><i className="fa-solid fa-spinner fa-spin"></i> Carregando preços do servidor...</h3>
              </div>
            ) : (
              <table className="validades-table">
                <thead>
                  <tr>
                    <th>CATEGORIA</th>
                    <th>PRODUTO</th>
                    <th style={{ textAlign: 'center' }}>PREÇO ATUAL</th>
                    <th style={{ textAlign: 'center' }}>EDIÇÃO RÁPIDA (R$)</th>
                    <th style={{ textAlign: 'center' }}>AÇÕES</th>
                  </tr>
                </thead>
                <tbody>
                  {produtosFiltrados.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>Nenhum produto encontrado.</td></tr>
                  ) : (
                    produtosFiltrados.map(prod => {
                      const valorEditado = precosEditados[prod.id];
                      const precoAtualFormat = Number(prod.precoBase).toFixed(2).replace('.', ',');
                      const temAlteracao = valorEditado !== undefined && valorEditado !== precoAtualFormat && valorEditado !== "";
                      const isEditando = produtoEmEdicao?.id === prod.id;

                      return (
                        <tr key={prod.id} className="validades-tr linha-normal" style={{ background: isEditando ? '#e3f2fd' : 'transparent', transition: 'background 0.3s' }}>
                          <td className="col-cat" style={{ verticalAlign: 'middle' }}><b>{prod.categoria}</b></td>

                          <td className="col-prod" style={{ verticalAlign: 'middle' }}>
                            <div className="prod-nome" style={{ fontWeight: isEditando ? 'bold' : 'normal' }}>
                              {prod.complemento} {prod.gramatura}
                              {prod.maior18 && <span style={{ color: 'red', marginLeft: '5px', fontSize: '10px' }}> (+18)</span>}
                            </div>
                            <span className="mobile-label" style={{ fontWeight: 'normal', color: '#999', marginTop: '2px' }}>ID: {prod.id}</span>
                          </td>

                          <td className="col-val-atual" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                            <span className="mobile-label">Preço Atual:</span>
                            <span style={{ fontWeight: '900', color: 'var(--laranja)' }}>R$ {precoAtualFormat}</span>
                          </td>

                          <td className="col-nova-val" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                            <span className="mobile-label">Novo Preço:</span>
                            <input
                              type="text"
                              className="input-nova-data"
                              placeholder={precoAtualFormat}
                              value={valorEditado !== undefined ? valorEditado : ''}
                              onChange={(e) => handleChangePreco(prod.id, e.target.value)}
                              style={{ borderColor: temAlteracao ? 'var(--laranja)' : '#ccc', color: temAlteracao ? 'var(--laranja)' : '#444', width: '90px' }}
                            />
                          </td>

                          <td className="col-acao" style={{ display: 'flex', gap: '8px', justifyContent: 'center', verticalAlign: 'middle' }}>
                            {/* BOTÃO AZUL PARA EDITAR COMPLETO */}
                            <button
                              onClick={() => carregarNoFormulario(prod)}
                              style={{
                                background: isEditando ? '#0288D1' : '#03A9F4',
                                color: '#fff',
                                border: 'none',
                                padding: '8px 12px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                transition: 'all 0.2s'
                              }}
                              title="Editar Todos os Campos"
                            >
                              <i className="fa-solid fa-pencil"></i> EDITAR
                            </button>

                            {/* BOTÃO VERMELHO PARA EXCLUIR */}
                            <button
                              onClick={() => excluirProduto(prod)}
                              style={{ background: '#F44336', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}
                              title="Excluir Produto"
                            >
                              <i className="fa-solid fa-trash-can"></i>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}