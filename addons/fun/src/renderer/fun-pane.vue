<script lang="ts" setup>
import * as commas from 'commas:api/renderer'
import { sample, sampleSize } from 'lodash-es'
import { nextTick, onMounted, reactive } from 'vue'
import FunDial from './fun-dial.vue'
import type { IFunDial } from './fun-dial.vue'

const { vI18n, TerminalPane } = commas.ui.vueAssets

interface Player {
  color: string,
  speed: number,
  base: number,
  scale: number,
  army: number,
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

const mainDials = $ref<IFunDial[]>([])
const benifitDials = $ref<IFunDial[]>([])

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
  for (let index = 0; index < colors.length; index++) {
    players[index] = {
      color: colors[index],
      speed: 1,
      base: 1,
      scale: 1,
      army: 0,
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
  for (let row = 0; row < size; row++) {
    for (let column = 0; column < size; column++) {
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

function rotateDial(player: Player, dial: IFunDial) {
  dial.rotate(3000 / player.speed)
}

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

async function attack(player: Player, index: number) {
  const targets = getOutlineCells(player)
  if (!targets.length) return
  const target = sample(targets)!
  target.color = player.color
  await sleep(50 / (Math.round(Math.log10(player.army)) + 1))
  player.army -= 1
  if (player.army) {
    attack(player, index)
  } else {
    player.scale = 1
    rotateDial(player, mainDials[index])
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

async function handleDial(player: Player, index: number, result: DialItem | undefined) {
  await sleep(500)
  if (!isAlive(player)) return
  if (!result) {
    rotateDial(player, mainDials[index])
    return
  }
  switch (result.action) {
    case 'double':
      player.scale *= 2
      rotateDial(player, mainDials[index])
      break
    case 'triple':
      player.scale *= 3
      rotateDial(player, mainDials[index])
      break
    case 'add-base':
      player.base += 1
      rotateDial(player, mainDials[index])
      break
    case 'add-speed':
      player.speed = Math.round((player.speed + 0.4) * 10) / 10
      rotateDial(player, mainDials[index])
      break
    case 'roll':
      rotateDial(player, benifitDials[index])
      break
    case 'attack':
      player.army = player.base * player.scale
      attack(player, index)
      break
  }
}

onMounted(async () => {
  initializePlayers()
  initializeTerritory()
  await nextTick()
  players.forEach((player, index) => {
    rotateDial(player, mainDials[index])
  })
})
</script>

<template>
  <TerminalPane class="fun-pane">
    <div class="fun-main">
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
          v-for="(player, index) in players"
          :key="player.color"
          class="player-card"
          :style="{ 'border-color': `rgb(var(--theme-${player.color}))` }"
        >
          <FunDial
            :ref="((el: IFunDial) => mainDials[index] = el) as any"
            :items="mainDialItems"
            @rotate-finish="handleDial(player, index, $event as DialItem)"
          >
            <span
              v-for="item in mainDialItems"
              :key="item.action"
              :class="['dial-text', item.action]"
            >{{ item.label }}</span>
          </FunDial>
          <div class="player-stats">
            <div class="stats-line"><span v-i18n>Base#!fun.2</span> = {{ player.base }}×{{ player.scale }}</div>
            <div class="stats-line"><span v-i18n>Speed#!fun.3</span> = {{ player.speed }}</div>
          </div>
          <FunDial
            :ref="((el: IFunDial) => benifitDials[index] = el) as any"
            :items="benifitDialItems"
            @rotate-finish="handleDial(player, index, $event as DialItem)"
          >
            <span
              v-for="item in benifitDialItems"
              :key="item.action"
              :class="['dial-text', item.action]"
            >{{ item.label }}</span>
          </FunDial>
        </div>
      </div>
    </div>
  </TerminalPane>
</template>

<style lang="scss" scoped>
.fun-main {
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
  width: 0;
  padding-left: 1em;
}
.player-card {
  display: flex;
  gap: 1em;
  align-items: center;
  padding-left: 1em;
  border-left: 4px solid;
  :deep(.fun-dial) {
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
  width: 0;
}
</style>
