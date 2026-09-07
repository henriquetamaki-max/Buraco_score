import type { Tema } from '../tema'

function IconeLua() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconeSol() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

type Props = {
  titulo: string
  sub?: string
  voltar?: () => void
  tema: Tema
  alternarTema: () => void
}

export function Cabecalho({ titulo, sub, voltar, tema, alternarTema }: Props) {
  return (
    <header className="topo">
      {voltar !== undefined && (
        <button type="button" onClick={voltar} aria-label="Voltar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M14.5 5 8 12l6.5 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
      <h1>
        {titulo}
        {sub !== undefined && <small>{sub}</small>}
      </h1>
      <button
        type="button"
        onClick={alternarTema}
        aria-label={tema === 'claro' ? 'Mudar para o tema escuro' : 'Mudar para o tema claro'}
      >
        {tema === 'claro' ? <IconeLua /> : <IconeSol />}
      </button>
    </header>
  )
}
