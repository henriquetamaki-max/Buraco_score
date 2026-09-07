import { defineConfig } from 'vitest/config'

/**
 * Config do runner, separada do `vite.config.ts` de propósito: o motor de
 * pontuação é TypeScript puro — sem JSX, sem DOM, sem service worker — e não
 * precisa dos plugins do app para rodar.
 *
 * `pool: 'vmThreads'` não é preferência, é correção de um bug de ambiente
 * (diagnóstico em 2026-09-07, registrado em MEMORIA.md):
 *
 *   Com os pools default (`forks` / `threads`), o vitest 5.0.0 nesta máquina
 *   falha na coleta com `TypeError: Cannot read properties of undefined
 *   (reading 'config')` em TODO arquivo de teste — mas somente quando é lançado
 *   por um processo Node pai via `child_process` (é assim que o hook
 *   `test-after-edit` roda `npm test`). Direto no Git Bash ou no PowerShell,
 *   os mesmos pools passam.
 *
 *   Bisseccionado e descartado: shell (cmd/bash/pwsh), stdin ignore/pipe/inherit,
 *   `--maxWorkers=1`, `--no-file-parallelism`, `--no-isolate`, config explícita,
 *   ausência do `vite.config.ts`, `NODE_PATH` e ambiente mínimo. Só a troca de
 *   pool resolve. `vmThreads` e `vmForks` passam nos dois contextos.
 *
 *   Seguro aqui: os testes não tocam DOM, módulo nativo nem estado global.
 */
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    pool: 'vmThreads',
  },
})
