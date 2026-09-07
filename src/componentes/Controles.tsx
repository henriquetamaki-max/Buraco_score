/** Controles pequenos e reutilizados: contador com − / + e chave liga-desliga. */

type PassoProps = {
  rotulo: string
  ajuda: string
  valor: number
  onChange: (n: number) => void
}

export function Passo({ rotulo, ajuda, valor, onChange }: PassoProps) {
  return (
    <div className="passo">
      <span className="rotulo">
        {rotulo}
        <small>{ajuda}</small>
      </span>
      <span className="controles">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, valor - 1))}
          disabled={valor === 0}
          aria-label={`Tirar uma ${rotulo}`}
        >
          &minus;
        </button>
        <output>{valor}</output>
        <button type="button" onClick={() => onChange(valor + 1)} aria-label={`Somar uma ${rotulo}`}>
          +
        </button>
      </span>
    </div>
  )
}

type InterruptorProps = {
  rotulo: string
  ajuda: string
  ligado: boolean
  onChange: (b: boolean) => void
}

export function Interruptor({ rotulo, ajuda, ligado, onChange }: InterruptorProps) {
  return (
    <label className="interruptor">
      <input type="checkbox" checked={ligado} onChange={(e) => onChange(e.target.checked)} />
      <span className="rotulo">
        {rotulo}
        <small>{ajuda}</small>
      </span>
    </label>
  )
}
