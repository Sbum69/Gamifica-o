# Academic Integrity: The AI Dilemma

Protótipo de uma aplicação web educacional gamificada sobre **ética da IA no ensino superior e no trabalho**. O jogador enfrenta um dilema realista (entregar um relatório escrito com IA que inclui fontes alucinadas) e as suas escolhas afetam a integridade académica, o tempo disponível e a reputação.

## Tecnologias

| Tecnologia | Função |
|---|---|
| Vue.js 3 (`<script setup>`) | Interface e componentes |
| Pinia | Estado global do jogador |
| Tailwind CSS v4 | Estilização (tema escuro) |
| Vite | Servidor de desenvolvimento e build |

## Como executar

**Pré-requisito:** Node.js 20 ou superior.

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar o servidor de desenvolvimento
npm run dev
```

Abrir o endereço indicado no terminal (normalmente http://localhost:5173).

Comandos adicionais:

```bash
npm run build     # gera a versão de produção na pasta dist/
npm run preview   # serve localmente a versão de produção
```

### Criar o projeto de raiz (sem este repositório)

```bash
npm create vite@latest academic-integrity-ai-dilemma   # escolher Vue + JavaScript
cd academic-integrity-ai-dilemma
npm install
npm install pinia tailwindcss @tailwindcss/vite
```

Depois, copiar os ficheiros de `src/`, `index.html` e `vite.config.js` deste projeto. O `vite.config.js` tem de incluir o plugin `tailwindcss()`, caso contrário os estilos não são aplicados.

## Estrutura de pastas

```
academic-integrity-ai-dilemma/
├── index.html                  # Página base (lang="pt-PT")
├── vite.config.js              # Plugins: Vue + Tailwind
└── src/
    ├── main.js                 # Arranque: cria a app, regista o Pinia
    ├── style.css               # Tailwind, paleta, fontes e animações
    ├── App.vue                 # Compõe HUD + Motor Narrativo + Modal
    ├── stores/
    │   └── userStore.js        # Estado e regras do jogador (Pinia)
    ├── components/
    │   ├── GameHUD.vue         # Barra de estado fixa no topo
    │   ├── NarrativeEngine.vue # Mostra a história e processa escolhas
    │   └── RewardModal.vue     # Pop-up de badges e finais
    └── data/
        └── story.json          # Conteúdo da história (nós, opções, badges)
```

A separação segue três camadas: **dados** (`story.json`), **estado** (`userStore.js`) e **apresentação** (componentes). Os componentes não têm texto da história escrito no código: tudo vem do JSON.

## O que faz cada ficheiro

### `src/stores/userStore.js`
Store Pinia que guarda o estado do jogador.

**Estado**

| Campo | Valor inicial | Descrição |
|---|---|---|
| `userPoints` | `0` | Pontos acumulados |
| `integridadeAcademica` | `100` | Limitada a 0–100 |
| `tempoDisponivel` | `10` | Horas disponíveis, nunca abaixo de 0 |
| `nivelReputacao` | `'Novato'` | Calculado a partir dos pontos |
| `unlockedBadges` | `[]` | IDs das badges conquistadas |
| `rewardQueue` | `[]` | Fila de recompensas por mostrar no modal |

**Ações**

- `applyChoiceEffects({ integridade, tempo, pontos })`: soma os efeitos de uma escolha ao estado e recalcula o nível.
- `unlockBadge(badgeId)`: desbloqueia a badge (só uma vez), dá +10 pontos e coloca-a na fila do modal.
- `queueReward(reward)` / `dismissReward()`: adicionam e removem recompensas da fila.

**Níveis de reputação:** Novato (0 pts), Aprendiz (20), Rigoroso (50), Guardião da Integridade (80).

### `src/data/story.json`
Base de dados narrativa, com três partes:

- `inicio`: ID do nó inicial (`NO_01`).
- `badges`: nome, ícone e descrição de cada badge.
- `nos`: todos os nós da história.

**Nós de decisão** têm `titulo`, `texto`, `opcoes` e, opcionalmente, `badge` (concedida ao entrar no nó). Cada opção tem `texto`, `destino`, `efeitos` (`integridade`, `tempo`, `pontos`) e `dica`.

**Nós finais** têm `final: true`, `finalTipo` (`bom`, `neutro` ou `mau`), `icone` e `licao`.

Mapa da história:

```
NO_01 ─┬─ verificar fontes ──► NO_02A ─┬─ substituir e declarar IA ──► FIM_BOM
       │                               └─ apagar e não declarar ─────► FIM_NEUTRO
       └─ entregar já ───────► NO_02B ─┬─ admitir uso de IA ─────────► FIM_REDENCAO
                                       └─ dizer que foi erro ────────► FIM_MAU
```

### `src/components/GameHUD.vue`
Barra fixa no topo (`sticky`) que lê a store e mostra:

- Nível de reputação e pontos.
- Barra de **integridade** com cor dinâmica: verde (> 70), amarela (> 40), vermelha (≤ 40).
- Barra de **tempo disponível** (máximo de 10 h).
- **Badges** desbloqueadas, com nome e descrição ao passar o cursor.

### `src/components/NarrativeEngine.vue`
O motor da história. Guarda o nó atual e:

1. Mostra o título, o texto e as opções do nó.
2. Ao passar o cursor (ou focar com o teclado) numa opção, mostra o impacto previsto sem alterar o estado.
3. Ao clicar, chama `applyChoiceEffects` e avança para o nó `destino`.
4. Ao entrar num nó, desbloqueia a badge associada e, se for um final, coloca-o na fila de recompensas.
5. Desativa opções cujo custo em tempo excede o tempo disponível.
6. Nos finais, mostra o resumo e o botão "Jogar novamente" (`$reset()` da store).

### `src/components/RewardModal.vue`
Mostra o primeiro item de `rewardQueue` num pop-up com confetti em CSS, para badges e finais. O confetti não aparece em finais maus. Fecha com o botão ou com Esc, e se houver mais recompensas na fila mostra a seguinte.

### `src/App.vue`, `src/main.js` e `src/style.css`
- `main.js` cria a aplicação e regista o Pinia.
- `App.vue` junta os três componentes.
- `style.css` importa o Tailwind, define a paleta (`ink`, `paper`, `brass`), as fontes (IBM Plex Sans e Newsreader) e as animações. Respeita `prefers-reduced-motion`.

## Fluxo de dados

```
story.json ──► NarrativeEngine ──(clique)──► userStore.applyChoiceEffects()
                    │                               │
                    │                               ▼
                    │                        GameHUD (atualiza barras)
                    │
                    └──(entra no nó)──► userStore.unlockBadge() / queueReward()
                                                    │
                                                    ▼
                                      RewardModal (mostra rewardQueue[0])
```

## Como adicionar conteúdo

1. **Novo nó:** acrescentar uma entrada em `nos` no `story.json` com um ID único.
2. **Ligá-lo à história:** colocar esse ID no campo `destino` de uma opção existente.
3. **Nova badge:** definir em `badges` e referenciar com `"badge": "id_da_badge"` num nó.
4. **Novo final:** criar um nó com `"final": true`, `finalTipo`, `icone` e `licao`.

Não é preciso alterar nenhum componente.
