import { defineStore } from 'pinia'

// Níveis de reputação por pontos acumulados
const NIVEIS = [
  { min: 0, nome: 'Novato' },
  { min: 20, nome: 'Aprendiz' },
  { min: 50, nome: 'Rigoroso' },
  { min: 80, nome: 'Guardião da Integridade' },
]

const BONUS_BADGE = 10
const clamp = (valor, min, max) => Math.min(max, Math.max(min, valor))

export const useUserStore = defineStore('user', {
  state: () => ({
    userPoints: 0,
    integridadeAcademica: 100,
    tempoDisponivel: 10,
    nivelReputacao: 'Novato',
    unlockedBadges: [],
    // Fila de recompensas por mostrar no modal: { type: 'badge' | 'ending', id }
    rewardQueue: [],
  }),

  getters: {
    currentReward: (state) => state.rewardQueue[0] ?? null,
  },

  actions: {
    /**
     * Aplica o impacto de uma escolha.
     * @param {{integridade?: number, tempo?: number, pontos?: number}} effects
     */
    applyChoiceEffects(effects = {}) {
      const { integridade = 0, tempo = 0, pontos = 0 } = effects

      this.integridadeAcademica = clamp(this.integridadeAcademica + integridade, 0, 100)
      this.tempoDisponivel = Math.max(0, this.tempoDisponivel + tempo)
      this.userPoints = Math.max(0, this.userPoints + pontos)
      this.atualizarNivel()
    },

    /** Desbloqueia uma badge (só uma vez) e coloca-a na fila do modal. */
    unlockBadge(badgeId) {
      if (this.unlockedBadges.includes(badgeId)) return false

      this.unlockedBadges.push(badgeId)
      this.userPoints += BONUS_BADGE
      this.atualizarNivel()
      this.queueReward({ type: 'badge', id: badgeId })
      return true
    },

    queueReward(reward) {
      this.rewardQueue.push(reward)
    },

    dismissReward() {
      this.rewardQueue.shift()
    },

    atualizarNivel() {
      const nivel = [...NIVEIS].reverse().find((n) => this.userPoints >= n.min)
      this.nivelReputacao = nivel.nome
    },
  },
})