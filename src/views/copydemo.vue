<template>
  <div class="container">
    <div class="header">
      <button @click="handleBack" class="btn back-btn">← 返回首页</button>
      <h1>氮利用效率综合分析仪表板</h1>
      <div class="header-controls">
        <el-button type="success" @click="addNewRadarChart" icon="Plus">
          新增雷达图
        </el-button>
        <el-button type="primary" @click="exportAllCharts" :loading="exporting">
          <el-icon><Download /></el-icon>
          导出所有图表
        </el-button>
      </div>
    </div>

    <!-- 雷达图标签页管理 -->
    <el-card class="dashboard-tabs-card" shadow="hover">
      <el-tabs 
        v-model="activeRadarTab" 
        type="card" 
        closable 
        @tab-remove="removeRadarTab"
        @tab-click="handleTabClick"
        class="radar-tabs"
      >
        <el-tab-pane 
          v-for="tab in radarTabs" 
          :key="tab.id"
          :label="tab.title"
          :name="tab.id"
          :closable="tab.id !== 'default'"
        >
          <!-- 每个tab的完整功能区域 -->
          <div class="radar-dashboard">
            <!-- 数据管理区域 -->
            <el-card class="data-management-card" shadow="hover" v-if="tab.isEditing">
              <template #header>
                <div class="card-header">
                  <el-icon><Tools /></el-icon>
                  <span>数据配置 - {{ tab.title }}</span>
                  <div class="header-actions">
                    <el-button size="small" type="success" @click="saveRadarConfig(tab.id)">
                      <el-icon><Check /></el-icon>
                      保存配置
                    </el-button>
                    <el-button size="small" @click="cancelEditRadar(tab.id)">
                      <el-icon><Close /></el-icon>
                      取消编辑
                    </el-button>
                  </div>
                </div>
              </template>
              
              <!-- 基础配置 -->
              <div class="config-section">
                <h4>基础信息</h4>
                <el-form :model="tab.config" label-width="100px" :inline="true">
                  <el-form-item label="图表标题">
                    <el-input v-model="tab.config.title" placeholder="请输入图表标题" style="width: 200px;" />
                  </el-form-item>
                  <el-form-item label="图表描述">
                    <el-input v-model="tab.config.description" placeholder="请输入图表描述" style="width: 300px;" />
                  </el-form-item>
                </el-form>
              </div>

              <!-- 指标管理 -->
              <div class="config-section">
                <h4>指标配置 
                  <el-tooltip content="这些指标将作为雷达图的维度，每个维度代表一个评估方面">
                    <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip>
                </h4>
                <div class="indicators-config">
                  <div class="indicator-list">
                    <div 
                      v-for="(indicator, index) in tab.config.indicators" 
                      :key="index"
                      class="indicator-item"
                    >
                      <el-input v-model="indicator.name" placeholder="指标名称" style="width: 150px;" />
                      <el-input-number 
                        v-model="indicator.max" 
                        :min="1" 
                        :max="100" 
                        placeholder="最大值"
                        style="width: 100px;"
                      />
                      <el-button 
                        type="danger" 
                        size="small" 
                        @click="removeIndicator(tab.id, index)"
                        :disabled="tab.config.indicators.length <= 3"
                      >
                        删除
                      </el-button>
                    </div>
                  </div>
                  <el-button type="primary" @click="addIndicator(tab.id)" size="small">
                    添加指标
                  </el-button>
                </div>
              </div>

              <!-- 作物管理 -->
              <div class="config-section">
                <h4>作物配置
                  <el-tooltip content="不同的作物将在雷达图中以不同颜色的线条和区域显示">
                    <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip>
                </h4>
                <div class="crops-config">
                  <div class="crop-list">
                    <div 
                      v-for="(crop, index) in tab.config.crops" 
                      :key="index"
                      class="crop-item"
                    >
                      <el-input v-model="crop.name" placeholder="作物名称" style="width: 120px;" />
                      <el-color-picker v-model="crop.color" />
                      <el-button 
                        type="danger" 
                        size="small" 
                        @click="removeCrop(tab.id, index)"
                        :disabled="tab.config.crops.length <= 1"
                      >
                        删除
                      </el-button>
                    </div>
                  </div>
                  <el-button type="primary" @click="addCrop(tab.id)" size="small">
                    添加作物
                  </el-button>
                </div>
              </div>

              <!-- 时期管理 -->
              <div class="config-section">
                <h4>时期配置
                  <el-tooltip content="不同的生长时期对应不同的数据集，用户可以切换查看">
                    <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip>
                </h4>
                <div class="periods-config">
                  <div class="period-list">
                    <div 
                      v-for="(period, index) in tab.config.periods" 
                      :key="index"
                      class="period-item"
                    >
                      <el-input v-model="period.key" placeholder="时期标识" style="width: 120px;" />
                      <el-input v-model="period.name" placeholder="时期名称" style="width: 120px;" />
                      <el-button 
                        type="danger" 
                        size="small" 
                        @click="removePeriod(tab.id, index)"
                        :disabled="tab.config.periods.length <= 1"
                      >
                        删除
                      </el-button>
                    </div>
                  </div>
                  <el-button type="primary" @click="addPeriod(tab.id)" size="small">
                    添加时期
                  </el-button>
                </div>
              </div>

              <!-- 数据输入 -->
              <div class="config-section">
                <h4>数据输入
                  <el-tooltip content="为每个作物在每个时期输入对应指标的数值">
                    <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip>
                </h4>
                <div class="data-input-section">
                  <el-select v-model="selectedPeriodForEdit" placeholder="选择编辑时期" style="margin-bottom: 15px;">
                    <el-option 
                      v-for="period in tab.config.periods" 
                      :key="period.key"
                      :label="period.name"
                      :value="period.key"
                    />
                  </el-select>
                  
                  <el-table 
                    v-if="selectedPeriodForEdit"
                    :data="getDataInputTableData(tab.id)"
                    border
                    size="small"
                  >
                    <el-table-column prop="indicator" label="指标" width="120" fixed="left" />
                    <el-table-column 
                      v-for="crop in tab.config.crops" 
                      :key="crop.name"
                      :label="crop.name"
                      width="100"
                    >
                      <template #default="scope">
                        <el-input-number 
                          v-model="scope.row[crop.name]"
                          :min="0" 
                          :max="getIndicatorMax(tab.id, scope.$index)"
                          size="small"
                          @change="updateTabData(tab.id, selectedPeriodForEdit, scope.$index, crop.name, $event)"
                        />
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </div>
            </el-card>

            <!-- 控制面板 -->
            <el-card class="control-panel" shadow="hover" v-if="!tab.isEditing">
              <template #header>
                <div class="card-header">
                  <el-icon><Setting /></el-icon>
                  <span>控制面板 - {{ tab.title }}</span>
                  <div class="header-actions">
                    <el-button size="small" @click="editRadarConfig(tab.id)">
                      <el-icon><Edit /></el-icon>
                      编辑配置
                    </el-button>
                  </div>
                </div>
              </template>
              
              <el-row :gutter="20">
                <el-col :span="6">
                  <div class="control-group">
                    <label>显示模式</label>
                    <el-radio-group v-model="tab.displayMode" class="mode-selector">
                      <el-radio-button label="overview">概览</el-radio-button>
                      <el-radio-button label="comparison">对比</el-radio-button>
                      <el-radio-button label="timeseries">时序</el-radio-button>
                    </el-radio-group>
                  </div>
                </el-col>
                <el-col :span="6">
                  <div class="control-group">
                    <label>生长时期</label>
                    <el-select v-model="tab.selectedPeriod" placeholder="选择时期">
                      <el-option 
                        v-for="period in tab.config.periods" 
                        :key="period.key"
                        :label="period.name"
                        :value="period.key"
                      />
                    </el-select>
                  </div>
                </el-col>
                <el-col :span="6">
                  <div class="control-group">
                    <label>作物选择</label>
                    <el-checkbox-group v-model="tab.selectedCrops">
                      <el-checkbox 
                        v-for="crop in tab.config.crops" 
                        :key="crop.name"
                        :label="crop.name"
                      >
                        {{ crop.name }}
                      </el-checkbox>
                    </el-checkbox-group>
                  </div>
                </el-col>
                <el-col :span="6">
                  <div class="control-group">
                    <label>图表设置</label>
                    <el-switch 
                      v-model="tab.showAnimation" 
                      active-text="动画"
                      inactive-text="静态"
                    />
                    <br />
                    <el-switch 
                      v-model="tab.show3D" 
                      active-text="3D效果"
                      inactive-text="平面"
                    />
                  </div>
                </el-col>
              </el-row>
            </el-card>

            <!-- 主要图表区域 -->
            <div class="charts-grid" v-if="!tab.isEditing">
              <!-- 主雷达图 -->
              <el-card class="main-chart-card" shadow="hover">
                <template #header>
                  <div class="card-header">
                    <el-icon><TrendCharts /></el-icon>
                    <span>{{ getTabMainChartTitle(tab) }}</span>
                    <div class="chart-controls">
                      <el-button size="small" @click="resetTabChart(tab.id)">重置</el-button>
                      <el-button size="small" type="primary" @click="exportTabChart(tab.id)">导出</el-button>
                    </div>
                  </div>
                </template>
                
                <v-chart 
                  :ref="`mainChart_${tab.id}`" 
                  :option="getTabChartOption(tab)" 
                  autoresize 
                  class="main-chart" 
                />
              </el-card>

              <!-- 时序对比图 -->
              <el-card v-if="tab.displayMode === 'timeseries'" class="timeseries-chart-card" shadow="hover">
                <template #header>
                  <div class="card-header">
                    <el-icon><Timer /></el-icon>
                    <span>时序变化趋势</span>
                  </div>
                </template>
                
                <v-chart 
                  :ref="`timeseriesChart_${tab.id}`" 
                  :option="getTabTimeseriesOption(tab)" 
                  autoresize 
                  class="timeseries-chart" 
                />
              </el-card>

              <!-- 对比分析图 -->
              <el-card v-if="tab.displayMode === 'comparison'" class="comparison-chart-card" shadow="hover">
                <template #header>
                  <div class="card-header">
                    <el-icon><DataAnalysis /></el-icon>
                    <span>作物对比分析</span>
                  </div>
                </template>
                
                <v-chart 
                  :ref="`comparisonChart_${tab.id}`" 
                  :option="getTabComparisonOption(tab)" 
                  autoresize 
                  class="comparison-chart" 
                />
              </el-card>
            </div>

            <!-- 数据表格和统计信息 -->
            <el-row :gutter="20" class="data-section" v-if="!tab.isEditing">
              <el-col :span="16">
                <el-card class="data-table-card" shadow="hover">
                  <template #header>
                    <div class="card-header">
                      <el-icon><Grid /></el-icon>
                      <span>详细数据 - {{ getTabCurrentPeriodName(tab) }}</span>
                    </div>
                  </template>
                  
                  <el-table :data="getTabTableData(tab)" border stripe>
                    <el-table-column prop="indicator" label="指标" width="150" fixed="left" />
                    <el-table-column 
                      v-for="cropName in tab.selectedCrops" 
                      :key="cropName"
                      :prop="cropName"
                      :label="cropName"
                      width="120"
                    >
                      <template #default="scope">
                        <span :class="{ 'best-value': getTabBestClass(tab, scope.$index, cropName) }">
                          {{ scope.row[cropName] }}
                        </span>
                      </template>
                    </el-table-column>
                    <el-table-column prop="best" label="最优值" width="100" fixed="right">
                      <template #default="scope">
                        <span class="best-value">{{ scope.row.best }}</span>
                      </template>
                    </el-table-column>
                  </el-table>
                </el-card>
              </el-col>

              <el-col :span="8">
                <el-card class="stats-card" shadow="hover">
                  <template #header>
                    <div class="card-header">
                      <el-icon><DataBoard /></el-icon>
                      <span>统计分析</span>
                    </div>
                  </template>
                  
                  <div class="stats-grid">
                    <div class="stat-item" v-for="cropName in tab.selectedCrops" :key="cropName">
                      <div class="stat-header" :style="{ background: getCropColor(tab, cropName) }">{{ cropName }}</div>
                      <div class="stat-content">
                        <div class="stat-row">
                          <span>平均值:</span>
                          <span class="stat-value">{{ getTabAverage(tab, cropName).toFixed(1) }}</span>
                        </div>
                        <div class="stat-row">
                          <span>优势指标:</span>
                          <span class="stat-value">{{ getTabAdvantageCount(tab, cropName) }}项</span>
                        </div>
                        <div class="stat-row">
                          <span>最高值:</span>
                          <span class="stat-value">{{ getTabMaxValue(tab, cropName) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Download, Setting, TrendCharts, Timer, DataAnalysis, 
  Grid, DataBoard, Tools 
} from '@element-plus/icons-vue'
import { use } from 'echarts/core'
import { 
  RadarChart, LineChart, BarChart, ScatterChart 
} from 'echarts/charts'
import { 
  TitleComponent, TooltipComponent, RadarComponent, 
  LegendComponent, GridComponent, DataZoomComponent,
  ToolboxComponent, MarkLineComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'

use([
  RadarChart, LineChart, BarChart, ScatterChart,
  TitleComponent, TooltipComponent, RadarComponent, 
  LegendComponent, GridComponent, DataZoomComponent,
  ToolboxComponent, MarkLineComponent,
  CanvasRenderer
])

const router = useRouter()

// 响应式数据
const displayMode = ref('overview')
const selectedPeriod = ref('flowering')
const selectedCrops = ref(['小麦', '豌豆', '群体'])
const showAnimation = ref(true)
const show3D = ref(false)
const exporting = ref(false)
const activeTab = ref('indicator')

// 雷达图指标
const indicators = ref([
  { name: '氮素吸收量', max: 50 },
  { name: '生物量积累', max: 50 },
  { name: '籽粒产量', max: 50 },
  { name: '氮素转运效率', max: 50 },
  { name: '氮肥偏生产力', max: 50 },
  { name: '氮收获指数', max: 50 }
])

// 生长时期
const periods = ref([
  { key: 'seedling', name: '苗期' },
  { key: 'flowering', name: '花期' },
  { key: 'podding', name: '结荚期' },
  { key: 'maturity', name: '成熟期' }
])

// 可用作物
const availableCrops = ref(['小麦', '豌豆', '群体'])

// 不同时期的数据
const periodData = ref({
  seedling: {
    '小麦': [15, 18, 12, 20, 16, 14],
    '豌豆': [12, 15, 10, 18, 14, 12],
    '群体': [14, 17, 11, 19, 15, 13]
  },
  flowering: {
    '小麦': [35, 42, 38, 40, 33, 36],
    '豌豆': [28, 35, 45, 38, 41, 32],
    '群体': [32, 39, 42, 39, 37, 34]
  },
  podding: {
    '小麦': [42, 45, 44, 43, 40, 41],
    '豌豆': [38, 42, 48, 45, 46, 40],
    '群体': [40, 44, 46, 44, 43, 41]
  },
  maturity: {
    '小麦': [45, 48, 46, 47, 44, 45],
    '豌豆': [42, 45, 50, 48, 49, 44],
    '群体': [44, 47, 48, 48, 47, 45]
  }
})

// 作物颜色配置
const cropColors = ref({
  '小麦': { area: 'rgba(255, 193, 7, 0.4)', line: '#ffc107' },
  '豌豆': { area: 'rgba(40, 167, 69, 0.4)', line: '#28a745' },
  '群体': { area: 'rgba(108, 117, 125, 0.4)', line: '#6c757d' }
})

// 新增表单数据
const newIndicator = ref({ name: '', max: 50 })
const newCrop = ref({ name: '', color: '#007bff' })
const newPeriod = ref({ key: '', name: '' })

// 图表引用
const mainChart = ref(null)
const timeseriesChart = ref(null)
const comparisonChart = ref(null)

// 计算属性
const getCurrentData = () => {
  return periodData.value[selectedPeriod.value] || {}
}

const getCurrentPeriodName = () => {
  return periods.value.find(p => p.key === selectedPeriod.value)?.name || ''
}

const getMainChartTitle = () => {
  const modeMap = {
    overview: '氮利用效率概览',
    comparison: '作物对比分析',
    timeseries: '时序变化分析'
  }
  return `${modeMap[displayMode.value]} - ${getCurrentPeriodName()}`
}

const tableData = computed(() => {
  const currentData = getCurrentData()
  return indicators.value.map((indicator, index) => {
    const row = { indicator: indicator.name }
    selectedCrops.value.forEach(cropName => {
      if (currentData[cropName]) {
        row[cropName] = currentData[cropName][index]
      }
    })
    row.best = getBestValue(index)
    return row
  })
})

const mainChartOption = computed(() => {
  const currentData = getCurrentData()
  
  const seriesData = selectedCrops.value
    .filter(cropName => currentData[cropName])
    .map(cropName => ({
      value: currentData[cropName],
      name: cropName,
      areaStyle: {
        color: cropColors.value[cropName]?.area || 'rgba(0, 123, 255, 0.4)'
      },
      lineStyle: {
        color: cropColors.value[cropName]?.line || '#007bff',
        width: show3D.value ? 4 : 3
      },
      itemStyle: {
        color: cropColors.value[cropName]?.line || '#007bff',
        borderWidth: 2
      }
    }))

  return {
    title: {
      text: getMainChartTitle(),
      left: 'center',
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: function(params) {
        const data = params.data
        const indicatorNames = indicators.value.map(ind => ind.name)
        
        let html = `<strong>${data.name}</strong><br/>`
        data.value.forEach((value, index) => {
          html += `${indicatorNames[index]}: ${value}<br/>`
        })
        return html
      }
    },
    legend: {
      data: selectedCrops.value,
      top: 40,
      itemGap: 30
    },
    radar: {
      indicator: indicators.value,
      shape: 'polygon',
      radius: displayMode.value === 'overview' ? '75%' : '65%',
      center: ['50%', '55%'],
      splitNumber: 5,
      axisName: {
        color: '#333',
        fontSize: 12
      },
      splitLine: {
        lineStyle: {
          color: show3D.value ? 
            ['#e8e8e8', '#d0d0d0', '#b8b8b8', '#a0a0a0', '#888888'] :
            ['#f0f0f0', '#e0e0e0', '#d0d0d0', '#c0c0c0', '#b0b0b0']
        }
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: show3D.value ?
            ['rgba(114, 172, 209, 0.1)', 'rgba(114, 172, 209, 0.2)'] :
            ['rgba(114, 172, 209, 0.05)', 'rgba(114, 172, 209, 0.1)']
        }
      }
    },
    series: [
      {
        type: 'radar',
        data: seriesData,
        animation: showAnimation.value
      }
    ]
  }
})

const timeseriesChartOption = computed(() => {
  const periodKeys = periods.value.map(p => p.key)
  const periodNames = periods.value.map(p => p.name)
  
  const series = selectedCrops.value.map(cropName => {
    const data = periodKeys.map(periodKey => {
      const periodDataForCrop = periodData.value[periodKey]?.[cropName] || []
      return periodDataForCrop.reduce((sum, val) => sum + val, 0) / periodDataForCrop.length
    })
    
    return {
      name: cropName,
      type: 'line',
      data: data,
      smooth: true,
      lineStyle: {
        color: cropColors.value[cropName]?.line || '#007bff',
        width: 3
      },
      itemStyle: {
        color: cropColors.value[cropName]?.line || '#007bff'
      },
      areaStyle: showAnimation.value ? {
        color: cropColors.value[cropName]?.area || 'rgba(0, 123, 255, 0.3)'
      } : null
    }
  })

  return {
    title: {
      text: '不同时期氮利用效率变化趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: selectedCrops.value,
      top: 40
    },
    xAxis: {
      type: 'category',
      data: periodNames,
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '平均利用率'
    },
    series: series
  }
})

const comparisonChartOption = computed(() => {
  const currentData = getCurrentData()
  const indicatorNames = indicators.value.map(ind => ind.name)
  
  const series = selectedCrops.value
    .filter(cropName => currentData[cropName])
    .map(cropName => ({
      name: cropName,
      type: 'bar',
      data: currentData[cropName],
      itemStyle: {
        color: cropColors.value[cropName]?.line || '#007bff'
      }
    }))

  return {
    title: {
      text: `作物指标对比 - ${getCurrentPeriodName()}`,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: selectedCrops.value,
      top: 40
    },
    xAxis: {
      type: 'category',
      data: indicatorNames,
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value'
    },
    series: series
  }
})

// 方法
const getBestValue = (index) => {
  const currentData = getCurrentData()
  const values = selectedCrops.value
    .filter(cropName => currentData[cropName])
    .map(cropName => currentData[cropName][index])
  return Math.max(...values)
}

const getBestClass = (index, cropName) => {
  const currentData = getCurrentData()
  if (!currentData[cropName]) return false
  
  const values = selectedCrops.value
    .filter(name => currentData[name])
    .map(name => currentData[name][index])
  const maxValue = Math.max(...values)
  
  return currentData[cropName][index] === maxValue
}

const getAverage = (cropName) => {
  const currentData = getCurrentData()
  if (!currentData[cropName]) return 0
  
  const data = currentData[cropName]
  return data.reduce((sum, val) => sum + val, 0) / data.length
}

const getAdvantageCount = (cropName) => {
  let count = 0
  const currentData = getCurrentData()
  if (!currentData[cropName]) return 0
  
  for (let i = 0; i < indicators.value.length; i++) {
    const values = selectedCrops.value
      .filter(name => currentData[name])
      .map(name => currentData[name][i])
    const maxValue = Math.max(...values)
    
    if (currentData[cropName][i] === maxValue) {
      count++
    }
  }
  
  return count
}

const getMaxValue = (cropName) => {
  const currentData = getCurrentData()
  if (!currentData[cropName]) return 0
  
  return Math.max(...currentData[cropName])
}

const handleBack = () => {
  router.push('/')
}

const resetChart = () => {
  if (mainChart.value) {
    mainChart.value.chart.dispatchAction({
      type: 'restore'
    })
  }
}

const exportMainChart = async () => {
  if (!mainChart.value) return
  
  try {
    const url = mainChart.value.chart.getDataURL({
      type: 'png',
      pixelRatio: 2,
      backgroundColor: '#ffffff'
    })
    
    const a = document.createElement('a')
    a.href = url
    a.download = `integrated-radar-${Date.now()}.png`
    a.click()
    
    ElMessage.success('导出成功！')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

const exportAllCharts = async () => {
  exporting.value = true
  
  try {
    // 导出主图表
    await exportMainChart()
    
    // 根据模式导出其他图表
    if (displayMode.value === 'timeseries' && timeseriesChart.value) {
      setTimeout(() => {
        const url = timeseriesChart.value.chart.getDataURL({
          type: 'png',
          pixelRatio: 2,
          backgroundColor: '#ffffff'
        })
        const a = document.createElement('a')
        a.href = url
        a.download = `timeseries-chart-${Date.now()}.png`
        a.click()
      }, 500)
    }
    
    if (displayMode.value === 'comparison' && comparisonChart.value) {
      setTimeout(() => {
        const url = comparisonChart.value.chart.getDataURL({
          type: 'png',
          pixelRatio: 2,
          backgroundColor: '#ffffff'
        })
        const a = document.createElement('a')
        a.href = url
        a.download = `comparison-chart-${Date.now()}.png`
        a.click()
      }, 500)
    }
    
    ElMessage.success('所有图表导出成功！')
  } catch (error) {
    ElMessage.error('导出失败')
  } finally {
    exporting.value = false
  }
}

const addIndicator = () => {
  if (newIndicator.value.name && newIndicator.value.max > 0) {
    indicators.value.push({
      name: newIndicator.value.name,
      max: newIndicator.value.max
    })
    
    // 为所有时期的所有作物添加新指标的默认值
    Object.keys(periodData.value).forEach(periodKey => {
      Object.keys(periodData.value[periodKey]).forEach(cropName => {
        periodData.value[periodKey][cropName].push(0)
      })
    })
    
    newIndicator.value = { name: '', max: 50 }
    ElMessage.success('指标添加成功')
  }
}

const addCrop = () => {
  if (newCrop.value.name && !availableCrops.value.includes(newCrop.value.name)) {
    const cropName = newCrop.value.name
    availableCrops.value.push(cropName)
    
    // 为所有时期添加新作物
    Object.keys(periodData.value).forEach(periodKey => {
      periodData.value[periodKey][cropName] = new Array(indicators.value.length).fill(0)
    })
    
    // 设置默认颜色
    cropColors.value[cropName] = {
      area: newCrop.value.color + '66',
      line: newCrop.value.color
    }
    
    newCrop.value = { name: '', color: '#007bff' }
    ElMessage.success('作物添加成功')
  }
}

const addPeriod = () => {
  if (newPeriod.value.key && newPeriod.value.name) {
    periods.value.push({
      key: newPeriod.value.key,
      name: newPeriod.value.name
    })
    
    // 为新时期添加默认数据
    periodData.value[newPeriod.value.key] = {}
    availableCrops.value.forEach(cropName => {
      periodData.value[newPeriod.value.key][cropName] = new Array(indicators.value.length).fill(0)
    })
    
    newPeriod.value = { key: '', name: '' }
    ElMessage.success('时期添加成功')
  }
}

// 监听显示模式变化
watch(displayMode, (newMode) => {
  if (newMode === 'overview') {
    selectedCrops.value = ['小麦', '豌豆', '群体']
  }
})
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
  justify-content: space-between;
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
  
  .header-controls {
    display: flex;
    gap: 10px;
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
  margin-bottom: 15px;
  
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #333;
  }
  
  .mode-selector {
    width: 100%;
  }
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 25px;
  margin-bottom: 25px;
  
  &:has(.timeseries-chart-card),
  &:has(.comparison-chart-card) {
    grid-template-columns: 2fr 1fr;
  }
}

.main-chart-card,
.timeseries-chart-card,
.comparison-chart-card {
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

.chart-controls {
  display: flex;
  gap: 10px;
}

.main-chart {
  height: 600px;
}

.timeseries-chart,
.comparison-chart {
  height: 400px;
}

.data-section {
  margin-bottom: 25px;
}

.data-table-card,
.stats-card,
.data-management-card {
  margin-bottom: 20px;
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

.best-value {
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
  font-weight: bold;
  color: #155724;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #c3e6cb;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
}

.stat-item {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-header {
  padding: 12px 16px;
  font-weight: 600;
  color: white;
  
  &.小麦 {
    background: linear-gradient(135deg, #ffc107 0%, #ff8f00 100%);
  }
  
  &.豌豆 {
    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  }
  
  &.群体 {
    background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
  }
}

.stat-content {
  padding: 16px;
  background: white;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  
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
  .charts-grid {
    grid-template-columns: 1fr !important;
  }
  
  .data-section {
    .el-col {
      margin-bottom: 20px;
    }
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
  
  .control-panel .el-row {
    flex-direction: column;
  }
  
  .main-chart {
    height: 400px;
  }
}
</style>
