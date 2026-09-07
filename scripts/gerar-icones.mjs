/**
 * Gera os ícones PNG do PWA sem nenhuma dependência externa.
 * Escreve o PNG na mão (zlib do próprio Node) para não arrastar `sharp` ao projeto.
 *
 *   node scripts/gerar-icones.mjs
 *
 * Desenho: fundo verde de mesa, carta branca ao centro, ouro vermelho.
 * A carta ocupa 44% x 62% do quadro, dentro da zona segura de ícone `maskable`.
 */

import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..')
const DESTINO = join(RAIZ, 'public')

const VERDE = [27, 67, 50, 255]
const BRANCO = [250, 250, 247, 255]
const VERMELHO = [163, 35, 43, 255]

const TABELA_CRC = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(buf) {
  let c = 0xffffffff
  for (const b of buf) c = TABELA_CRC[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function bloco(tipo, dados) {
  const tamanho = Buffer.alloc(4)
  tamanho.writeUInt32BE(dados.length)
  const corpo = Buffer.concat([Buffer.from(tipo, 'ascii'), dados])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(corpo))
  return Buffer.concat([tamanho, corpo, crc])
}

function png(lado, rgba) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(lado, 0)
  ihdr.writeUInt32BE(lado, 4)
  ihdr[8] = 8 // profundidade de bits
  ihdr[9] = 6 // RGBA
  const linhas = []
  for (let y = 0; y < lado; y++) {
    linhas.push(Buffer.from([0])) // filtro 0 por scanline
    linhas.push(rgba.subarray(y * lado * 4, (y + 1) * lado * 4))
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    bloco('IHDR', ihdr),
    bloco('IDAT', deflateSync(Buffer.concat(linhas), { level: 9 })),
    bloco('IEND', Buffer.alloc(0)),
  ])
}

/** SDF de retângulo arredondado: true se o ponto está dentro. */
function dentro(px, py, x, y, largura, altura, raio) {
  if (px < x || px > x + largura || py < y || py > y + altura) return false
  const ex = Math.max(x + raio - px, px - (x + largura - raio), 0)
  const ey = Math.max(y + raio - py, py - (y + altura - raio), 0)
  return ex * ex + ey * ey <= raio * raio
}

function desenhar(lado) {
  const px = Buffer.alloc(lado * lado * 4)

  const raioFundo = lado * 0.18
  const cartaL = lado * 0.44
  const cartaA = lado * 0.62
  const cartaX = (lado - cartaL) / 2
  const cartaY = (lado - cartaA) / 2
  const raioCarta = lado * 0.05
  const ouroR = lado * 0.115
  const centro = lado / 2

  for (let y = 0; y < lado; y++) {
    for (let x = 0; x < lado; x++) {
      const cx = x + 0.5
      const cy = y + 0.5
      let cor = [0, 0, 0, 0]

      if (dentro(cx, cy, 0, 0, lado, lado, raioFundo)) cor = VERDE
      if (dentro(cx, cy, cartaX, cartaY, cartaL, cartaA, raioCarta)) cor = BRANCO
      // ouro: losango |dx|/r + |dy|/(1.3r) <= 1
      if (Math.abs(cx - centro) / ouroR + Math.abs(cy - centro) / (ouroR * 1.3) <= 1) cor = VERMELHO

      const i = (y * lado + x) * 4
      px[i] = cor[0]
      px[i + 1] = cor[1]
      px[i + 2] = cor[2]
      px[i + 3] = cor[3]
    }
  }
  return px
}

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="92" fill="#1b4332"/>
  <rect x="143" y="97" width="226" height="318" rx="26" fill="#fafaf7"/>
  <path d="M256 197 L315 256 L256 315 L197 256 Z" fill="#a3232b"/>
</svg>
`

mkdirSync(DESTINO, { recursive: true })
writeFileSync(join(DESTINO, 'favicon.svg'), SVG, 'utf8')

for (const [arquivo, lado] of [
  ['icone-192.png', 192],
  ['icone-512.png', 512],
  ['apple-touch-icon.png', 180],
]) {
  const dados = png(lado, desenhar(lado))
  writeFileSync(join(DESTINO, arquivo), dados)
  console.log(`${arquivo} — ${lado}x${lado} — ${(dados.length / 1024).toFixed(1)} KB`)
}
console.log('favicon.svg')
