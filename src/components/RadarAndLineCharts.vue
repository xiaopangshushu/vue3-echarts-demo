<template>
  <div class="charts-container">
    <!-- 第1张图：生育时期折线图 + 两个雷达图 -->
    <el-card class="chart-card" shadow="hover">
      <template #header>
        <span>第1张图：生育时期与资源利用率</span>
      </template>
      <div class="chart-row">
        <!-- 上半部分：折线图 -->
        <div class="chart-half">
          <div ref="lineChartRef" class="chart"></div>
        </div>

        <!-- 下半部分：并列的两个雷达图 -->
        <div class="chart-half-bottom">
          <div class="radar-column">
            <div class="radar-item">
              <h4>小麦 / 豌豆 / 群体 氮资源利用率</h4>
              <div ref="nitrogenRadarRef" class="chart"></div>
            </div>
            <div class="radar-item">
              <h4>小麦 / 豌豆 / 群体 光资源利用率</h4>
              <div ref="lightRadarRef" class="chart"></div>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 第2张图：四个雷达图 (a)(b)(c)(d) -->
    <el-card class="chart-card" shadow="hover">
      <template #header>
        <span>第2张图：四个雷达图 (a)(b)(c)(d) — T1~T5 在 d10/d50/d90 指标上的分布</span>
      </template>
      <div class="four-radars">
        <div class="radar-small" v-for="(id, index) in ['a', 'b', 'c', 'd']" :key="id">
          <h4>雷达图 ({{ id }})</h4>
          <div :ref="el => setRadarRef(el, id)" class="chart"></div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'

// 折线图
const lineChartRef = ref<HTMLDivElement>()
// 两个雷达图（氮、光）
const nitrogenRadarRef = ref<HTMLDivElement>()
const lightRadarRef = ref<HTMLDivElement>()
// 四个小型雷达图 (a)(b)(c)(d)
const radarRefs = ref<{ [key: string]: HTMLDivElement | undefined }>({})

// 动态设置 (a)(b)(c)(d) 的 ref
const setRadarRef = (el: HTMLDivElement | null, key: string) => {
  if (el) radarRefs.value[key] = el
}

onMounted(() => {
  initLineChart()
  initNitrogenRadar()
  initLightRadar()
  initFourSmallRadars()
})

// 1. 折线图：生育时期
const initLineChart = () => {
  if (!lineChartRef.value) return

  const chart = echarts.init(lineChartRef.value)
  const option = {
    title: { text: 'Growth Stages', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['拔节期/分枝期', '开花期', '成熟期'],
    },
    yAxis: {
      type: 'value',
      min: -0.2,
      max: 0.2,
    },
    series: [
      {
        name: '某指标',
        type: 'line',
        data: [0.0, 0.1, -0.1], // 示例数据，请替换
        lineStyle: { color: '#5470c6' },
      },
    ],
  }
  chart.setOption(option)
}

// 2. 氮资源利用率雷达图
const initNitrogenRadar = () => {
  if (!nitrogenRadarRef.value) return

  const chart = echarts.init(nitrogenRadarRef.value)
  const option = {
    title: { text: '小麦 / 豌豆 / 群体 氮资源利用率', left: 'center' },
    radar: {
      indicator: [
        { name: 'W2P4', max: 50 },
        { name: 'MW', max: 50 },
        { name: 'W2P2', max: 50 },
        { name: 'W3P1', max: 50 },
        { name: 'W2P1', max: 50 },
      ],
    },
    series: [
      {
        type: 'radar',
        data: [
          { value: [40, 35, 30, 25, 20], name: '小麦', itemStyle: { color: 'yellow' } },
          { value: [30, 32, 28, 27, 29], name: '豌豆', itemStyle: { color: 'green' } },
          { value: [35, 33, 27, 26, 28], name: '群体', itemStyle: { color: 'blue' } },
        ],
      },
    ],
  }
  chart.setOption(option)
}

// 3. 光资源利用率雷达图
const initLightRadar = () => {
  if (!lightRadarRef.value) return

  const chart = echarts.init(lightRadarRef.value)
  const option = {
    title: { text: '小麦 / 豌豆 / 群体 光资源利用率', left: 'center' },
    radar: {
      indicator: [
        { name: 'W2P4', max: 2 },
        { name: 'MW', max: 2 },
        { name: 'W2P2', max: 2 },
        { name: 'W3P1', max: 2 },
        { name: 'W2P1', max: 2 },
      ],
    },
    series: [
      {
        type: 'radar',
        data: [
          { value: [1.8, 1.5, 1.6, 1.4, 1.7], name: '小麦', itemStyle: { color: 'yellow' } },
          { value: [1.5, 1.6, 1.4, 1.5, 1.6], name: '豌豆', itemStyle: { color: 'green' } },
          { value: [1.6, 1.5, 1.5, 1.4, 1.5], name: '群体', itemStyle: { color: 'blue' } },
        ],
      },
    ],
  }
  chart.setOption(option)
}

// 4. 四个小型雷达图 (a)(b)(c)(d) — 示例使用相同结构，可按需替换数据
const initFourSmallRadars = () => {
  const ids = ['a', 'b', 'c', 'd']
  const commonOption = {
    radar: {
      indicator: [
        { name: 'd10', max: 10 },
        { name: 'd50', max: 10 },
        { name: 'd90', max: 10 },
      ],
    },
    series: [
      {
        type: 'radar',
        data: [
          { value: [9, 6, 8], name: 'T1' },
          { value: [7, 8, 5], name: 'T2' },
          { value: [6, 7, 9], name: 'T3' },
          { value: [5, 9, 7], name: 'T4' },
          { value: [8, 5, 6], name: 'T5' },
        ],
      },
    ],
  }

  ids.forEach(id => {
    const el = radarRefs.value[id]
    if (!el) return
    const chart = echarts.init(el)
    // 可以在这里为每个 (a)(b)(c)(d) 设置不同标题或数据
    chart.setOption({
      ...commonOption,
      title: { text: `雷达图 (${id})`, left: 'center' },
    })
  })
}
</script>

<style lang="scss" scoped>
.charts-container {
  padding: 20px;
}

.chart-card {
  margin-bottom: 30px;

  .chart-row {
    display: flex;
    gap: 20px;

    .chart-half {
      flex: 1;
      .chart {
        height: 400px;
      }
    }

    .chart-half-bottom {
      flex: 1;
      .radar-column {
        display: flex;
        flex-direction: column;
        gap: 20px;

        .radar-item {
          h4 {
            margin: 0 0 10px 0;
            font-size: 14px;
            color: #333;
          }

          .chart {
            height: 350px;
          }
        }
      }
    }
  }
}

.four-radars {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  .radar-small {
    h4 {
      margin: 0 0 10px 0;
      font-size: 14px;
      color: #333;
    }

    .chart {
      height: 300px;
    }
  }
}
</style>