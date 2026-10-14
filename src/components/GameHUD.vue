<script setup>
import { computed } from 'vue'
import { useUserStore } from '../stores/UseStores'
import story from '../data/story.json'

const TEMPO_MAX = 10
const store = useUserStore()

// verde > 70, amarelo > 40, vermelho caso contrário
const integridadeCor = computed(() => {
  const v = store.integridadeAcademica
  if (v > 70) return 'bg-emerald-500'
  if (v > 40) return 'bg-amber-400'
  return 'bg-red-500'
})

const tempoPct = computed(() =>
  Math.max(0, Math.min(100, (store.tempoDisponivel / TEMPO_MAX) * 100)),
)

const badges = computed(() =>
  store.unlockedBadges.map((id) => ({ id, ...story.badges[id] })),
)
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-ink-700 bg-ink-900/95 backdrop-blur">
    <div class="mx-auto grid max-w-5xl gap-4 px-5 py-3 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-8">
      <!-- Reputação -->
      <div>
        <p class="text-xs text-paper-dim">Nível de reputação</p>
        <p class="font-serif text-lg font-semibold leading-tight text-brass">
          {{ store.nivelReputacao }}
          <span class="ml-1 font-sans text-sm font-normal text-paper-dim">{{ store.userPoints }} pts</span>
        </p>
      </div>

      <!-- Barras -->
      <div class="grid gap-3 sm:grid-cols-2">
        <div>
          <div class="mb-1 flex justify-between text-xs text-paper-dim">
            <span>Integridade académica</span>
            <span class="tabular-nums text-paper">{{ store.integridadeAcademica }}%</span>
          </div>
          <div
            class="h-2.5 overflow-hidden rounded-full bg-ink-800"
            role="progressbar"
            aria-label="Integridade académica"
            :aria-valuenow="store.integridadeAcademica"
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div
              class="h-full rounded-full transition-all duration-500"
              :class="integridadeCor"
              :style="{ width: store.integridadeAcademica + '%' }"
            />
          </div>
        </div>

        <div>
          <div class="mb-1 flex justify-between text-xs text-paper-dim">
            <span>Tempo disponível</span>
            <span class="tabular-nums text-paper">{{ store.tempoDisponivel }}h</span>
          </div>
          <div
            class="h-2.5 overflow-hidden rounded-full bg-ink-800"
            role="progressbar"
            aria-label="Tempo disponível"
            :aria-valuenow="store.tempoDisponivel"
            aria-valuemin="0"
            :aria-valuemax="TEMPO_MAX"
          >
            <div
              class="h-full rounded-full bg-sky-400 transition-all duration-500"
              :style="{ width: tempoPct + '%' }"
            />
          </div>
        </div>
      </div>

      <!-- Badges -->
      <div class="min-w-[7rem]">
        <p class="mb-1 text-xs text-paper-dim">Badges</p>
        <ul v-if="badges.length" class="flex gap-1.5">
          <li
            v-for="b in badges"
            :key="b.id"
            :title="`${b.nome}: ${b.descricao}`"
            class="flex h-8 w-8 items-center justify-center rounded-full border border-brass/60 bg-ink-800 text-base"
          >
            <span aria-hidden="true">{{ b.icone }}</span>
            <span class="sr-only">{{ b.nome }}</span>
          </li>
        </ul>
        <p v-else class="text-sm text-paper-dim">Nenhuma ainda</p>
      </div>
    </div>
  </header>
</template>