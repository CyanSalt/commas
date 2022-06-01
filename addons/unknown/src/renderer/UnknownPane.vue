<script lang="ts" setup>
import * as commas from 'commas:api/renderer'
import { sample, sampleSize } from 'lodash'
import { nextTick, onMounted, reactive } from 'vue'
import UnknownDial from './UnknownDial.vue'

const { vI18n, TerminalPane } = commas.ui.vueAssets
const generateID = commas.helperRenderer.createIDGenerator()

interface Player {
  id: number,
  offline: boolean,
  color: string,
  speed: number,
  base: number,
  scale: number,
  army: number,
  mainPosition: number,
  benifitPosition: number,
}

interface TerritoryCell {
  color: string,
}

interface DialItem {
  color: string,
  percentage: number,
  action: string,
  label: string,
}

const players = reactive<Player[]>([])

function initializePlayers() {
  const colors = sampleSize([
    'red',
    'green',
    'yellow',
    'blue',
    'magenta',
    'cyan',
  ], 4)
  for (let index = 0; index < colors.length; index += 1) {
    players[index] = {
      id: generateID(),
      offline: false,
      color: colors[index],
      speed: 1,
      base: 1,
      scale: 1,
      army: 0,
      mainPosition: 0,
      benifitPosition: 0,
    }
  }
}

const size = 40

const territory = reactive(
  Array.from({ length: size }, () => {
    return Array.from<unknown, TerritoryCell>({ length: size }, () => ({ color: '' }))
  }),
)

function initializeTerritory() {
  const half = size / 2
  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column < size; column += 1) {
      const topBit = Number(row >= half)
      const leftBit = Number(column >= half)
      const index = 2 * topBit + leftBit
      territory[row][column].color = players[index].color
    }
  }
}

const mainDialItems: DialItem[] = [
  { color: 'green', percentage: 0.4, action: 'double', label: '×2' },
  { color: 'yellow', percentage: 0.5, action: 'attack', label: 'A' },
  { color: 'blue', percentage: 0.1, action: 'roll', label: 'R' },
]

const benifitDialItems: DialItem[] = [
  { color: 'cyan', percentage: 0.25, action: 'add-base', label: '+B' },
  { color: 'magenta', percentage: 0.25, action: 'add-speed', label: '+S' },
  { color: 'green', percentage: 0.5, action: 'triple', label: '×3' },
]

function sleep(timeout: number) {
  return new Promise(resolve => {
    setTimeout(resolve, timeout)
  })
}

function getOutlineCells(player: Player) {
  return territory.flatMap((line, row) => {
    return line.flatMap((cell, column) => {
      const result: TerritoryCell[] = []
      if (cell.color === player.color) {
        if (column > 0 && line[column - 1].color !== player.color) {
          result.push(line[column - 1])
        }
        if (column + 1 < line.length && line[column + 1].color !== player.color) {
          result.push(line[column + 1])
        }
        if (row > 0 && territory[row - 1][column].color !== player.color) {
          result.push(territory[row - 1][column])
        }
        if (row + 1 < territory.length && territory[row + 1][column].color !== player.color) {
          result.push(territory[row + 1][column])
        }
      }
      return result
    })
  })
}

async function attack(player: Player) {
  for (let i = 0; i < player.base; i += 1) {
    const targets = getOutlineCells(player)
    if (!targets.length) return
    const target = sample(targets)!
    target.color = player.color
  }
  await sleep(50)
  if (player.offline) return
  player.army -= 1
  if (player.army) {
    attack(player)
  } else {
    player.scale = 1
    player.mainPosition = Math.random()
  }
}

function isAlive(player: Player) {
  return territory.some((line, row) => {
    return line.some((cell, column) => {
      return column + 1 < line.length
        && row + 1 < territory.length
        && cell.color === player.color
        && line[column + 1].color === player.color
        && territory[row + 1][column].color === player.color
        && territory[row + 1][column + 1].color === player.color
    })
  })
}

async function handleDial(player: Player, result: DialItem | undefined) {
  await sleep(500)
  if (player.offline) return
  if (!isAlive(player)) {
    player.offline = true
    return
  }
  if (!result) {
    player.mainPosition = Math.random()
    return
  }
  switch (result.action) {
    case 'double':
      player.scale *= 2
      player.mainPosition = Math.random()
      break
    case 'triple':
      player.scale *= 3
      player.mainPosition = Math.random()
      break
    case 'add-base':
      player.base += 1
      player.mainPosition = Math.random()
      break
    case 'add-speed':
      player.speed = Math.round((player.speed + 0.4) * 10) / 10
      player.mainPosition = Math.random()
      break
    case 'roll':
      player.benifitPosition = Math.random()
      break
    case 'attack':
      player.army = player.scale
      attack(player)
      break
  }
}

async function refresh() {
  players.forEach(player => {
    player.offline = true
  })
  initializePlayers()
  initializeTerritory()
  await nextTick()
  players.forEach(player => {
    player.mainPosition = Math.random()
  })
}

onMounted(() => {
  refresh()
})
</script>

<template>
  <TerminalPane class="unknown-pane">
    <div class="unknown-main">
      <div class="territory-area">
        <div v-for="(line, row) in territory" :key="row" class="territory-line">
          <span
            v-for="(cell, column) in territory[row]"
            :key="column"
            class="territory-cell"
            :style="{ 'background-color': `rgb(var(--theme-${cell.color}))` }"
          ></span>
        </div>
      </div>
      <div class="player-area">
        <div
          v-for="player in players"
          :key="player.id"
          :class="['player-card', { 'is-offline': player.offline }]"
          :style="{ 'border-color': `rgb(var(--theme-${player.color}))` }"
        >
          <UnknownDial
            :items="mainDialItems"
            :position="player.mainPosition"
            :duration="3000 / player.speed"
            @rotate-finish="handleDial(player, $event as DialItem)"
          >
            <span
              v-for="item in mainDialItems"
              :key="item.action"
              :class="['dial-text', item.action]"
            >{{ item.label }}</span>
          </UnknownDial>
          <div class="player-stats">
            <div class="stats-line"><span v-i18n>Base#!unknown.2</span> = {{ player.base }}×{{ player.army || player.scale }}</div>
            <div class="stats-line"><span v-i18n>Speed#!unknown.3</span> = {{ player.speed }}</div>
          </div>
          <UnknownDial
            :items="benifitDialItems"
            :position="player.benifitPosition"
            :duration="3000 / player.speed"
            @rotate-finish="handleDial(player, $event as DialItem)"
          >
            <span
              v-for="item in benifitDialItems"
              :key="item.action"
              :class="['dial-text', item.action]"
            >{{ item.label }}</span>
          </UnknownDial>
        </div>
      </div>
    </div>
    <div class="action-line">
      <span class="link form-action" @click="refresh">
        <span class="feather-icon icon-refresh-cw"></span>
      </span>
    </div>
    <div class="form-line-tip">Inspired by Algodoo</div>
  </TerminalPane>
</template>

<style lang="scss" scoped>
.unknown-main {
  display: flex;
  padding: 1em 0;
}
.territory-line {
  display: flex;
}
.territory-cell {
  flex: none;
  box-sizing: border-box;
  width: 8px;
  height: 8px;
  border: 1px solid rgb(var(--theme-background));
}
.player-area {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
  padding-left: 1em;
}
.player-card {
  display: flex;
  gap: 1em;
  align-items: center;
  padding-left: 1em;
  border-left: 4px solid;
  &.is-offline {
    opacity: 0.5;
  }
  :deep(.unknown-dial) {
    --dial-size: 64px;
  }
}
.dial-text {
  position: absolute;
  color: white;
  &.double {
    top: 26%;
    left: 58%;
  }
  &.attack {
    top: 50%;
    left: 28%;
  }
  &.roll {
    top: 1%;
    left: 32%;
  }
  &.add-base {
    top: 16%;
    left: 54%;
  }
  &.add-speed {
    top: 56%;
    left: 56%;
  }
  &.triple {
    top: 40%;
    left: 10%;
  }
}
.player-stats {
  flex: 1;
  min-width: 0;
}
.form-line-tip {
  color: rgb(var(--theme-foreground) / 0.5);
}
</style>
