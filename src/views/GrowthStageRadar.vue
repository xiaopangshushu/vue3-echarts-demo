<template>
  <div class="container">
    <div class="header">
      <button @click="handleBack" class="btn back-btn">← 返回首页</button>
      <h1>生长阶段饼状雷达图分析</h1>
    </div>

    <!-- 控制面板 -->
    <el-card class="control-panel" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon><Setting /></el-icon>
          <span>图表设置</span>
        </div>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="control-group">
            <label>图表类型</label>
            <el-radio-group v-model="chartType">
              <el-radio-button label="pie-radar">饼状雷达图</el-radio-button>
              <el-radio-button label="circular">环形图</el-radio-button>
            </el-radio-group>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="control-group">
            <label>显示标签</label>
            <el-switch v-model="showLabels" active-text="显示" inactive-text="隐藏" />
          </div>
        </el-col>
        <el-col :span="8">
          <div class="control-group">
            <label>图表大小</label>
            <el-slider v-model="chartSize" :min="50" :max="100" show-input />
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 图表容器 -->
    <div class="charts-container">
      <div class="chart-section">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>小麦氮素利用率</span>
              <div class="legend-indicators">
                <span class="legend-item yellow">小麦氮素利用率</span>
                <span class="legend-item green">豌豆氮素利用率</span>
                <span class="legend-item blue">群体氮素利用率</span>
              </div>
            </div>
          </template>
          
          <v-chart ref="wheatChart" :option="wheatChartOption" autoresize class="pie-chart" />
        </el-card>
      </div>

      <div class="chart-section">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>豌豆氮素利用率</span>
              <div class="legend-indicators">
                <span class="legend-item yellow">小麦氮素利用率</span>
                <span class="legend-item green">豌豆氮素利用率</span>
                <span class="legend-item blue">群体氮素利用率</span>
              </div>
            </div>
          </template>
          
          <v-chart ref="peaChart" :option="peaChartOption" autoresize class="pie-chart" />
        </el-card>
      </div>
    </div>

    <!-- 数据表格 -->
    <el-card class="data-table-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon><Grid /></el-icon>
          <span>生长阶段数据详情</span>
        </div>
      </template>
      
      <el-table :data="stageData" border stripe>
        <el-table-column prop="stage" label="生长阶段" width="120" />
        <el-table-column prop="code" label="阶段代码" width="100" />
        <el-table-column prop="wheat" label="小麦利用率(%)" width="120">
          <template #default="scope">
            <el-progress 
              :percentage="scope.row.wheat" 
              :color="getProgressColor(scope.row.wheat)"
              :show-text="false"
            />
            <span class="value-text">{{ scope.row.wheat }}%</span>
          </template>
        </el-table-column>
        <el-table-column prop="pea" label="豌豆利用率(%)" width="120">
          <template #default="scope">
            <el-progress 
              :percentage="scope.row.pea" 
              :color="getProgressColor(scope.row.pea)"
              :show-text="false"
            />
            <span class="value-text">{{ scope.row.pea }}%</span>
          </template>
        </el-table-column>
        <el-table-column prop="population" label="群体利用率(%)" width="120">
          <template #default="scope">
            <el-progress 
              :percentage="scope.row.population" 
              :color="getProgressColor(scope.row.population)"
              :show-text="false"
            />
            <span class="value-text">{{ scope.row.population }}%</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="阶段描述" />
      </el-table>
    </el-card>

    <!-- 统计分析 -->
    <el-card class="stats-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon><DataBoard /></el-icon>
          <span>统计分析</span>
        </div>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="stat-box wheat-stat">
            <div class="stat-header">小麦</div>
            <div class="stat-content">
              <div class="stat-item">
                <span>平均利用率:</span>
                <span class="stat-value">{{ getAverageEfficiency('wheat') }}%</span>
              </div>
              <div class="stat-item">
                <span>最高阶段:</span>
                <span class="stat-value">{{ getBestStage('wheat') }}</span>
              </div>
              <div class="stat-item">
                <span>增长趋势:</span>
                <span class="stat-value">{{ getTrend('wheat') }}</span>
              </div>
            </div>
          </div>
        </el-col>
        
        <el-col :span="8">
          <div class="stat-box pea-stat">
            <div class="stat-header">豌豆</div>
            <div class="stat-content">
              <div class="stat-item">
                <span>平均利用率:</span>
                <span class="stat-value">{{ getAverageEfficiency('pea') }}%</span>
              </div>
              <div class="stat-item">
                <span>最高阶段:</span>
                <span class="stat-value">{{ getBestStage('pea') }}</span>
              </div>
              <div class="stat-item">
                <span>增长趋势:</span>
                <span class="stat-value">{{ getTrend('pea') }}</span>
              </div>
            </div>
          </div>
        </el-col>
        
        <el-col :span="8">
          <div class="stat-box population-stat">
            <div class="stat-header">群体</div>
            <div class="stat-content">
              <div class="stat-item">
                <span>平均利用率:</span>
                <span class="stat-value">{{ getAverageEfficiency('population') }}%</span>
              </div>
              <div class="stat-item">
                <span>最高阶段:</span>
                <span class="stat-value">{{ getBestStage('population') }}</span>
              </div>
              <div class="stat-item">
                <span>增长趋势:</span>
                <span class="stat-value">{{ getTrend('population') }}</span>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Setting, Grid, DataBoard } from '@element-plus/icons-vue'
import { use } from 'echarts/core'
import { PieChart, ScatterChart, LineChart, BarChart } from 'echarts/charts'
import { 
  TitleComponent, TooltipComponent, LegendComponent,
  GraphicComponent, PolarComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'

use([
  PieChart, ScatterChart, LineChart, BarChart, TitleComponent, TooltipComponent, 
  LegendComponent, GraphicComponent, PolarComponent, CanvasRenderer
])

const router = useRouter()

// 响应式数据
const chartType = ref('pie-radar')
const showLabels = ref(true)
const chartSize = ref(80)

// 生长阶段数据 - 模拟图片中的数据
const stageData = ref([
  { 
    stage: '苗期早期', 
    code: 'W1P1', 
    wheat: 15, 
    pea: 18, 
    population: 16,
    description: '幼苗建立期，氮素需求较低'
  },
  { 
    stage: '苗期中期', 
    code: 'W1P2', 
    wheat: 22, 
    pea: 25, 
    population: 23,
    description: '营养生长加速期'
  },
  { 
    stage: '苗期晚期', 
    code: 'W1P3', 
    wheat: 28, 
    pea: 32, 
    population: 30,
    description: '茎叶快速发育期'
  },
  { 
    stage: '分蘖初期', 
    code: 'W2P1', 
    wheat: 35, 
    pea: 38, 
    population: 36,
    description: '分蘖发生，氮需求增加'
  },
  { 
    stage: '分蘖盛期', 
    code: 'W2P2', 
    wheat: 42, 
    pea: 45, 
    population: 43,
    description: '大量分蘖，氮素利用高峰'
  },
  { 
    stage: '拔节期', 
    code: 'W3P1', 
    wheat: 48, 
    pea: 52, 
    population: 50,
    description: '茎秆伸长，氮素转运活跃'
  },
  { 
    stage: '孕穗期', 
    code: 'W3P2', 
    wheat: 55, 
    pea: 58, 
    population: 56,
    description: '穗部分化，氮素集中利用'
  },
  { 
    stage: '抽穗期', 
    code: 'W4P1', 
    wheat: 62, 
    pea: 65, 
    population: 63,
    description: '穗部露出，生殖生长开始'
  },
  { 
    stage: '开花期', 
    code: 'W4P2', 
    wheat: 68, 
    pea: 72, 
    population: 70,
    description: '开花授粉，氮素需求调整'
  },
  { 
    stage: '灌浆初期', 
    code: 'W5P1', 
    wheat: 75, 
    pea: 78, 
    population: 76,
    description: '籽粒开始充实'
  },
  { 
    stage: '灌浆中期', 
    code: 'W5P2', 
    wheat: 82, 
    pea: 85, 
    population: 83,
    description: '籽粒快速充实期'
  },
  { 
    stage: '灌浆后期', 
    code: 'W5P3', 
    wheat: 88, 
    pea: 90, 
    population: 89,
    description: '籽粒成熟，氮素利用达峰值'
  },
  { 
    stage: '成熟期', 
    code: 'MP', 
    wheat: 85, 
    pea: 87, 
    population: 86,
    description: '生理成熟，氮素利用完成'
  }
])

// 图表配置 - 扇形雷达图
const wheatChartOption = computed(() => {
  return {
    title: {
      text: '小麦氮素利用率',
      left: 'center',
      top: 20,
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: function(params) {
        const stageInfo = stageData.value[params.dataIndex]
        return `
          <strong>${stageInfo?.stage || params.name}</strong><br/>
          代码: ${stageInfo?.code}<br/>
          利用率: ${stageInfo?.wheat}%<br/>
          描述: ${stageInfo?.description || ''}
        `
      }
    },
    polar: {
      radius: [20, '80%']
    },
    radiusAxis: {
      type: 'category',
      data: stageData.value.map(item => item.code),
      z: 10,
      axisLabel: {
        show: showLabels.value,
        fontSize: 10,
        margin: 8
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      }
    },
    angleAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: {
        show: false
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#e0e0e0',
          type: 'dashed'
        }
      },
      axisLine: {
        show: false
      }
    },
    series: [
      {
        type: 'bar',
        coordinateSystem: 'polar',
        data: stageData.value.map(item => item.wheat),
        itemStyle: {
          color: function(params) {
            return getStageColor(params.value)
          },
          borderColor: '#fff',
          borderWidth: 1
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        },
        label: {
          show: showLabels.value,
          position: 'middle',
          formatter: '{c}%',
          fontSize: 10,
          color: '#333'
        }
      }
    ]
  }
})

const peaChartOption = computed(() => {
  return {
    title: {
      text: '豌豆氮素利用率',
      left: 'center',
      top: 20,
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: function(params) {
        const stageInfo = stageData.value[params.dataIndex]
        return `
          <strong>${stageInfo?.stage || params.name}</strong><br/>
          代码: ${stageInfo?.code}<br/>
          利用率: ${stageInfo?.pea}%<br/>
          描述: ${stageInfo?.description || ''}
        `
      }
    },
    polar: {
      radius: [20, '80%']
    },
    radiusAxis: {
      type: 'category',
      data: stageData.value.map(item => item.code),
      z: 10,
      axisLabel: {
        show: showLabels.value,
        fontSize: 10,
        margin: 8
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      }
    },
    angleAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: {
        show: false
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#e0e0e0',
          type: 'dashed'
        }
      },
      axisLine: {
        show: false
      }
    },
    series: [
      {
        type: 'bar',
        coordinateSystem: 'polar',
        data: stageData.value.map(item => item.pea),
        itemStyle: {
          color: function(params) {
            return getStageColor(params.value)
          },
          borderColor: '#fff',
          borderWidth: 1
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        },
        label: {
          show: showLabels.value,
          position: 'middle',
          formatter: '{c}%',
          fontSize: 10,
          color: '#333'
        }
      }
    ]
  }
})

// 方法
const handleBack = () => {
  router.push('/')
}

const getStageColor = (value) => {
  // 根据值的大小返回不同的颜色
  if (value < 30) return '#FFE066' // 黄色 - 低利用率
  if (value < 50) return '#52C41A' // 绿色 - 中等利用率  
  if (value < 70) return '#1890FF' // 蓝色 - 高利用率
  return '#722ED1' // 紫色 - 很高利用率
}

const getProgressColor = (value) => {
  if (value < 30) return '#faad14'
  if (value < 50) return '#52c41a'
  if (value < 70) return '#1890ff'
  return '#722ed1'
}

const getAverageEfficiency = (crop) => {
  const total = stageData.value.reduce((sum, item) => sum + item[crop], 0)
  return Math.round(total / stageData.value.length)
}

const getBestStage = (crop) => {
  const maxItem = stageData.value.reduce((max, item) => 
    item[crop] > max[crop] ? item : max
  )
  return maxItem.stage
}

const getTrend = (crop) => {
  const values = stageData.value.map(item => item[crop])
  const firstHalf = values.slice(0, Math.floor(values.length / 2))
  const secondHalf = values.slice(Math.floor(values.length / 2))
  
  const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length
  
  const diff = secondAvg - firstAvg
  if (diff > 5) return '显著上升'
  if (diff > 0) return '轻微上升'
  if (diff > -5) return '基本稳定'
  return '下降趋势'
}
</script>

<style scoped lang="scss">
.container {
  width: 1000px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  
  h1 {
    margin: 0;
    font-size: 2.2rem;
    font-weight: 700;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.control-panel {
  margin-bottom: 25px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: none;
  
  .el-card__header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-weight: 600;
    font-size: 1.1rem;
    padding: 20px 25px;
  }
  
  .el-card__body {
    padding: 25px;
    background: rgba(255, 255, 255, 0.95);
  }
}

.control-group {
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #333;
  }
}

.charts-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
  margin-bottom: 25px;
}

.chart-card {
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: none;
  
  .el-card__header {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    color: white;
    font-weight: 600;
    font-size: 1.1rem;
    padding: 20px 25px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .el-card__body {
    padding: 0;
    background: rgba(255, 255, 255, 0.95);
  }
}

.legend-indicators {
  display: flex;
  gap: 15px;
  font-size: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  
  &::before {
    content: '';
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }
  
  &.yellow::before {
    background: #FFE066;
  }
  
  &.green::before {
    background: #52C41A;
  }
  
  &.blue::before {
    background: #1890FF;
  }
}

.pie-chart {
  height: 500px;
}

.data-table-card,
.stats-card {
  margin-bottom: 25px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: none;
  
  .el-card__header {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
    font-weight: 600;
    font-size: 1.1rem;
    padding: 20px 25px;
  }
  
  .el-card__body {
    padding: 25px;
    background: rgba(255, 255, 255, 0.95);
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
}

.value-text {
  margin-left: 10px;
  font-weight: 600;
  color: #333;
}

.stat-box {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  
  &.wheat-stat .stat-header {
    background: linear-gradient(135deg, #ffc107 0%, #ff8f00 100%);
  }
  
  &.pea-stat .stat-header {
    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  }
  
  &.population-stat .stat-header {
    background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
  }
}

.stat-header {
  padding: 15px 20px;
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
  text-align: center;
}

.stat-content {
  padding: 20px;
  background: white;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.stat-value {
  font-weight: bold;
  color: #333;
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &.back-btn {
    background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
    }
  }
}

@media (max-width: 1200px) {
  .charts-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 15px;
  }
  
  .header {
    flex-direction: column;
    gap: 15px;
    
    h1 {
      font-size: 1.8rem;
    }
  }
  
  .pie-chart {
    height: 400px;
  }
}
</style>
