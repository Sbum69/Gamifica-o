<script setup>
import GameHUD from './components/GameHUD.vue'
import NarrativeEngine from './components/NarrativeEngine.vue'
import RewardModal from './components/RewardModal.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <GameHUD />
    <main class="flex-1">
      <NarrativeEngine />
    </main>
    <RewardModal />
  </div>
</template>