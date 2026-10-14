<script setup>
import { ref, computed } from 'vue'
import story from '../data/story.json'
import { useUserStore } from '../stores/UseStores'

const store = useUserStore()

const currentId = ref(story.inicio)
const hovered = ref(null) // índice da opção em hover/foco

const node = computed(() => story.nos[currentId.value])
const hoveredOption = computed(() =>
  hovered.value !== null ? node.value.opcoes?.[hovered.value] : null,
)

// Só pode escolher se o custo em tempo couber no tempo disponível
const canAfford = (op) => store.tempoDisponivel + (op.efeitos?.tempo ?? 0) >= 0

const LABELS = { integridade: 'Integridade', tempo: 'Tempo', pontos: 'Pontos' }

function impacts(op) {
  return Object.keys(LABELS).map((chave) => {
    const valor = op.efeitos?.[chave] ?? 0
    // Para o tempo, gastar é "custo" (âmbar); para o resto, negativo é mau (vermelho)
    let cls = 'border-ink-700 text-paper-dim'
    if (valor > 0) cls = 'border-emerald-500/60 text-emerald-300'
    if (valor < 0) cls = chave === 'tempo' ? 'border-amber-400/60 text-amber-300' : 'border-red-500/60 text-red-300'
    const sinal = valor > 0 ? '+' : valor < 0 ? '\u2212' : ''
    return { chave, label: LABELS[chave], texto: `${sinal}${Math.abs(valor)}`, cls }
  })
}

function enterNode(id) {
  currentId.value = id
  hovered.value = null
  const n = story.nos[id]
  if (n.badge) store.unlockBadge(n.badge)
  if (n.final) store.queueReward({ type: 'ending', id })
}

function choose(op) {
  if (!canAfford(op)) return
  store.applyChoiceEffects(op.efeitos)
  enterNode(op.destino)
}

function restart() {
  store.$reset()
  currentId.value = story.inicio
  hovered.value = null
}

const finalTone = computed(
  () =>
    ({ bom: 'border-emerald-500', neutro: 'border-brass', mau: 'border-red-500' })[node.value.finalTipo] ??
    'border-brass',
)
</script>

<template>
  <section class="mx-auto w-full max-w-3xl px-5 py-10 sm:py-14">
    <Transition name="node" mode="out-in">
      <div :key="currentId">
        <h1 class="font-serif text-3xl font-semibold leading-tight sm:text-4xl">
          {{ node.titulo }}
        </h1>
        <p class="mt-5 max-w-[62ch] font-serif text-lg leading-relaxed text-paper/90 sm:text-xl">
          {{ node.texto }}
        </p>

        <!-- Opções -->
        <template v-if="!node.final">
          <ul class="mt-9 space-y-3">
            <li v-for="(op, i) in node.opcoes" :key="op.destino">
              <button
                type="button"
                :disabled="!canAfford(op)"
                class="w-full rounded-r-lg border-l-4 px-5 py-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass disabled:cursor-not-allowed disabled:opacity-40"
                :class="
                  hovered === i
                    ? 'border-brass bg-ink-800'
                    : 'border-ink-700 bg-ink-900 hover:bg-ink-800'
                "
                @mouseenter="hovered = i"
                @mouseleave="hovered = null"
                @focus="hovered = i"
                @blur="hovered = null"
                @click="choose(op)"
              >
                <span class="block text-base font-medium">{{ op.texto }}</span>
                <span v-if="!canAfford(op)" class="mt-1 block text-sm text-amber-300">
                  Não tens tempo suficiente para esta opção.
                </span>
              </button>
            </li>
          </ul>
          

          <!-- Pré-visualização do impacto (altura reservada para não saltar) -->
          <div class="mt-5 min-h-[4.5rem]" aria-live="polite">
            <template v-if="hoveredOption">
              <ul class="flex flex-wrap gap-2">
                <li
                  v-for="im in impacts(hoveredOption)"
                  :key="im.chave"
                  class="rounded-full border px-3 py-1 text-sm tabular-nums"
                  :class="im.cls"
                >
                  {{ im.label }} {{ im.texto }}
                </li>
              </ul>
              <p class="mt-2 text-sm text-paper-dim">{{ hoveredOption.dica }}</p>
            </template>
            <p v-else class="text-sm text-paper-dim">
              Passa o cursor por cima de uma opção para ver o impacto. Clica para a escolher.
            </p>
          </div>
        </template>

        <!-- Final -->
        <div v-else class="mt-9 border-l-4 py-1 pl-5" :class="finalTone">
          <p class="max-w-[62ch] text-paper-dim">{{ node.licao }}</p>
          <p class="mt-4 text-sm text-paper-dim">
            Pontuação final: <span class="text-paper">{{ store.userPoints }}</span>
            · Integridade: <span class="text-paper">{{ store.integridadeAcademica }}%</span>
            · Badges: <span class="text-paper">{{ store.unlockedBadges.length }}</span>
          </p>
          <button
            type="button"
            class="mt-6 rounded-md bg-brass px-5 py-2.5 font-medium text-ink-950 transition-colors hover:bg-amber-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
            @click="restart"
          >
            Jogar novamente
          </button>
        </div>
      </div>
    </Transition>
  </section>
</template>