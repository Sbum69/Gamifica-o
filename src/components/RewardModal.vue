<script setup>
import { computed, ref, watch, nextTick } from 'vue'
import { useUserStore } from '../stores/UseStores'
import story from '../data/story.json'

const store = useUserStore()
const closeBtn = ref(null)

const content = computed(() => {
  const r = store.currentReward
  if (!r) return null

  if (r.type === 'badge') {
    const b = story.badges[r.id]
    return {
      icone: b.icone,
      cabecalho: 'Badge desbloqueada',
      titulo: b.nome,
      texto: b.descricao,
      celebrar: true,
      botao: 'Continuar',
    }
  }

  const n = story.nos[r.id]
  return {
    icone: n.icone,
    cabecalho: 'Fim da história',
    titulo: n.titulo.replace('Final: ', ''),
    texto: n.licao,
    celebrar: n.finalTipo !== 'mau',
    botao: 'Ver resumo',
  }
})

// Confetti gerado de cada vez que aparece uma nova recompensa
const CORES = ['#d9a94a', '#34d399', '#38bdf8', '#ede7d6', '#f87171']
const confetti = computed(() =>
  content.value?.celebrar
    ? Array.from({ length: 36 }, (_, i) => ({
        id: i,
        style: {
          left: `${Math.random() * 100}%`,
          backgroundColor: CORES[i % CORES.length],
          animationDuration: `${2 + Math.random() * 1.6}s`,
          animationDelay: `${Math.random() * 0.7}s`,
        },
      }))
    : [],
)

// Foco no botão quando o modal abre
watch(
  () => store.currentReward,
  async (r) => {
    if (!r) return
    await nextTick()
    closeBtn.value?.focus()
  },
)
</script>

<template>
  <div
    v-if="content"
    :key="`${store.currentReward.type}-${store.currentReward.id}`"
    class="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/80 p-5"
    @keydown.esc="store.dismissReward()"
  >
    <!-- Confetti decorativo -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <span v-for="c in confetti" :key="c.id" class="confetti-piece" :style="c.style" />
    </div>

    <div
      class="pop-in relative w-full max-w-sm rounded-xl border border-brass/70 bg-ink-900 px-7 py-8 text-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reward-title"
    >
      <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-brass bg-ink-800 text-4xl">
        <span aria-hidden="true">{{ content.icone }}</span>
      </div>
      <p class="mt-5 text-sm text-paper-dim">{{ content.cabecalho }}</p>
      <h2 id="reward-title" class="mt-1 font-serif text-2xl font-semibold text-brass">
        {{ content.titulo }}
      </h2>
      <p class="mt-3 font-serif text-lg leading-relaxed text-paper/90">{{ content.texto }}</p>
      <button
        ref="closeBtn"
        type="button"
        class="mt-7 w-full rounded-md bg-brass px-5 py-2.5 font-medium text-ink-950 transition-colors hover:bg-amber-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
        @click="store.dismissReward()"
      >
        {{ content.botao }}
      </button>
    </div>
  </div>
</template>