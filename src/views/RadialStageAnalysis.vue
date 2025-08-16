<template>
  <div class="container">
    <div class="header">
      <button @click="handleBack" class="btn back-btn">← 返回首页</button>
      <h1>径向生长阶段图分析仪表板</h1>
    </div>

    <!-- 主要内容卡片 -->
    <el-card class="main-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon><Grid /></el-icon>
          <span>径向生长阶段图分析</span>
          <div class="header-actions">
            <el-button type="primary" @click="addNewRadialChart">
              <el-icon><Plus /></el-icon>
              新增分析
            </el-button>
            <el-select v-model="selectedExportFormat" placeholder="导出格式" style="width: 120px; margin-left: 10px;">
              <el-option label="PNG" value="png" />
              <el-option label="JPG" value="jpg" />
              <el-option label="SVG" value="svg" />
            </el-select>
            <el-button @click="exportAllCharts" :loading="isExporting">
              <el-icon><Download /></el-icon>
              导出全部
            </el-button>
          </div>
        </div>
      </template>
      
      <!-- 标签页 -->
      <el-tabs 
        v-model="activeRadialTab" 
        type="card" 
        @tab-remove="removeRadialTab"
        @tab-click="handleTabClick"
      >
        <el-tab-pane 
          v-for="tab in radialTabs" 
          :key="tab.id"
          :label="tab.title"
          :name="tab.id"
          :closable="tab.id !== 'default'"
        >
          <!-- 每个tab的完整功能区域 -->
          <div class="radial-dashboard">
            <!-- 数据管理区域 -->
            <el-card class="data-management-card" shadow="hover" v-if="tab.isEditing">
              <template #header>
                <div class="card-header">
                  <el-icon><Tools /></el-icon>
                  <span>数据配置 - {{ tab.title }}</span>
                  <div class="header-actions">
                    <el-button size="small" type="success" @click="saveRadialConfig(tab.id)">
                      <el-icon><Check /></el-icon>
                      保存配置
                    </el-button>
                    <el-button size="small" @click="cancelEditRadial(tab.id)">
                      <el-icon><Close /></el-icon>
                      取消编辑
                    </el-button>
                  </div>
                </div>
              </template>
              
              <el-row :gutter="20">
                <el-col :span="8">
                  <div class="config-section">
                    <h4>生长阶段配置</h4>
                    <div v-for="(stage, index) in tab.config.stages" :key="index" class="config-item">
                      <el-input v-model="stage.name" placeholder="阶段名称" />
                      <el-input v-model="stage.code" placeholder="阶段代码" />
                      <el-button size="small" type="danger" @click="removeStage(tab.id, index)">删除</el-button>
                    </div>
                    <el-button @click="addStage(tab.id)" size="small" type="primary">添加阶段</el-button>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="config-section">
                    <h4>作物配置</h4>
                    <div v-for="(crop, index) in tab.config.crops" :key="index" class="config-item">
                      <el-input v-model="crop.name" placeholder="作物名称" />
                      <el-button size="small" type="danger" @click="removeCrop(tab.id, index)">删除</el-button>
                    </div>
                    <el-button @click="addCrop(tab.id)" size="small" type="primary">添加作物</el-button>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="config-section">
                    <h4>时期配置</h4>
                    <div v-for="(period, index) in tab.config.periods" :key="index" class="config-item">
                      <el-input v-model="period.name" placeholder="时期名称" />
                      <el-button size="small" type="danger" @click="removePeriod(tab.id, index)">删除</el-button>
                    </div>
                    <el-button @click="addPeriod(tab.id)" size="small" type="primary">添加时期</el-button>
                  </div>
                </el-col>
              </el-row>
            </el-card>

            <!-- 控制面板 -->
            <el-card class="control-panel" shadow="hover" v-if="!tab.isEditing">
              <template #header>
                <div class="card-header">
                  <el-icon><Setting /></el-icon>
                  <span>控制面板 - {{ tab.title }}</span>
                  <div class="header-actions">
                    <el-button size="small" @click="editRadialConfig(tab.id)">
                      <el-icon><Edit /></el-icon>
                      编辑配置
                    </el-button>
                    <el-button size="small" @click="exportTabChart(tab.id)" :loading="tab.isExporting">
                      <el-icon><Download /></el-icon>
                      导出图表
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
                    </el-radio-group>
                  </div>
                </el-col>
                <el-col :span="6">
                  <div class="control-group">
                    <label>当前时期</label>
                    <el-select v-model="tab.selectedPeriod" placeholder="选择时期">
                      <el-option 
                        v-for="period in tab.config.periods" 
                        :key="period.name"
                        :label="period.name" 
                        :value="period.name" 
                      />
                    </el-select>
                  </div>
                </el-col>
                <el-col :span="6">
                  <div class="control-group">
                    <label>显示标签</label>
                    <el-switch v-model="tab.showLabels" active-text="显示" inactive-text="隐藏" />
                  </div>
                </el-col>
                <el-col :span="6">
                  <div class="control-group">
                    <label>图表大小</label>
                    <el-slider v-model="tab.chartSize" :min="50" :max="100" show-input />
                  </div>
                </el-col>
              </el-row>
            </el-card>

            <!-- 径向图表容器 -->
            <div class="charts-container" v-if="!tab.isEditing">
              <!-- 概览模式 -->
              <div v-if="tab.displayMode === 'overview'">
                <el-row :gutter="20">
                  <el-col :span="12" v-for="crop in tab.selectedCrops" :key="crop">
                    <el-card class="chart-card" shadow="hover">
                      <template #header>
                        <div class="card-header">
                          <span>径向生长阶段图 - {{ crop }}</span>
                          <div class="legend-indicators">
                            <span class="legend-item yellow">早期</span>
                            <span class="legend-item green">中期</span>
                            <span class="legend-item blue">后期</span>
                          </div>
                        </div>
                      </template>
                      
                      <v-chart 
                        :ref="el => setChartRef(tab.id, crop, el)"
                        :option="getRadialChartOption(tab, crop)" 
                        autoresize 
                        class="radial-chart" 
                      />
                    </el-card>
                  </el-col>
                </el-row>
              </div>
              
              <!-- 对比模式 -->
              <div v-if="tab.displayMode === 'comparison'" class="comparison-container">
                <el-card class="chart-card comparison-card" shadow="hover">
                  <template #header>
                    <div class="card-header">
                      <span>作物生长阶段对比分析</span>
                      <div class="legend-indicators">
                        <span v-for="crop in tab.selectedCrops" :key="crop" class="legend-item" 
                              :style="{ color: getCropComparisonColor(crop) }">
                          {{ crop }}
                        </span>
                      </div>
                    </div>
                  </template>
                  
                  <v-chart 
                    :ref="el => setChartRef(tab.id, 'comparison', el)"
                    :option="getComparisonChartOption(tab)" 
                    autoresize 
                    class="radial-chart comparison-chart" 
                  />
                </el-card>
              </div>
            </div>

            <!-- 数据表格和统计信息 -->
            <div class="data-section" v-if="!tab.isEditing">
              <!-- 数据表格 -->
              <el-row class="table-row">
                <el-col :span="24">
                  <el-card class="data-table-card" shadow="hover">
                    <template #header>
                      <div class="card-header">
                        <el-icon><Grid /></el-icon>
                        <span>生长阶段数据详情 - {{ getTabCurrentPeriodName(tab) }}</span>
                        <div class="header-actions">
                          <el-button size="small" @click="downloadTableAsImage(tab.id)" :loading="tab.isDownloadingTable">
                            <el-icon><Download /></el-icon>
                            下载表格
                          </el-button>
                        </div>
                      </div>
                    </template>
                    
                    <div :id="`table-${tab.id}`">
                      <el-table :data="getTabTableData(tab)" border stripe>
                        <el-table-column prop="stage" label="生长阶段" width="150" fixed="left" />
                        <el-table-column prop="code" label="阶段代码" width="100" />
                        <el-table-column 
                          v-for="cropName in tab.selectedCrops" 
                          :key="cropName"
                          :label="`${cropName}利用率(%)`"
                          width="150"
                        >
                          <template #default="scope">
                            <el-input-number
                              :model-value="scope.row[cropName]"
                              @update:model-value="updateTableData(tab, scope.$index, cropName, $event)"
                              :min="0"
                              :max="100"
                              size="small"
                              :precision="0"
                              style="width: 100%;"
                            />
                          </template>
                        </el-table-column>
                        <el-table-column prop="average" label="平均值" width="100">
                          <template #default="scope">
                            <span class="average-value">{{ scope.row.average }}</span>
                          </template>
                        </el-table-column>
                        <el-table-column prop="max" label="最大值" width="100">
                          <template #default="scope">
                            <span class="max-value">{{ scope.row.max }}</span>
                          </template>
                        </el-table-column>
                        <el-table-column prop="min" label="最小值" width="100" fixed="right">
                          <template #default="scope">
                            <span class="min-value">{{ scope.row.min }}</span>
                          </template>
                        </el-table-column>
                      </el-table>
                    </div>
                  </el-card>
                </el-col>
              </el-row>

              <!-- 统计分析 -->
              <el-row class="stats-row">
                <el-col :span="24">
                  <el-card class="stats-card" shadow="hover">
                    <template #header>
                      <div class="card-header">
                        <el-icon><DataBoard /></el-icon>
                        <span>统计分析</span>
                        <div class="header-actions">
                          <el-button size="small" @click="downloadStatsAsImage(tab.id)" :loading="tab.isDownloadingStats">
                            <el-icon><Download /></el-icon>
                            下载统计
                          </el-button>
                        </div>
                      </div>
                    </template>
                    
                    <div :id="`stats-${tab.id}`" class="stats-grid">
                      <div class="stat-item" v-for="cropName in tab.selectedCrops" :key="cropName">
                        <div class="stat-header" :style="{ background: getCropColor(tab, cropName) }">{{ cropName }}</div>
                        <div class="stat-content">
                          <div class="stat-row">
                            <span>平均利用率:</span>
                            <span class="stat-value">{{ getTabAverage(tab, cropName).toFixed(1) }}%</span>
                          </div>
                          <div class="stat-row">
                            <span>最高阶段:</span>
                            <span class="stat-value">{{ getTabBestStage(tab, cropName) }}</span>
                          </div>
                          <div class="stat-row">
                            <span>最高值:</span>
                            <span class="stat-value">{{ getTabMaxValue(tab, cropName) }}</span>
                          </div>
                          <div class="stat-row">
                            <span>增长趋势:</span>
                            <span class="stat-value">{{ getTabTrend(tab, cropName) }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </el-card>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Setting, Grid, DataBoard, Plus, Download, Tools, Edit, Check, Close } from '@element-plus/icons-vue'
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { 
  TitleComponent, TooltipComponent, LegendComponent,
  GraphicComponent, PolarComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import html2canvas from 'html2canvas'

use([
  BarChart, TitleComponent, TooltipComponent, 
  LegendComponent, GraphicComponent, PolarComponent, CanvasRenderer
])

const router = useRouter()

// 径向图表标签页管理
const radialTabs = ref([
  {
    id: 'default',
    title: '默认分析',
    isEditing: false,
    isExporting: false,
    isDownloadingTable: false,
    isDownloadingStats: false,
    displayMode: 'overview',
    selectedPeriod: '春季',
    showLabels: true,
    chartSize: 80,
    selectedCrops: ['小麦', '豌豆'],
    config: {
      stages: [
        { name: '苗期早期', code: 'W1P1' },
        { name: '苗期中期', code: 'W1P2' },
        { name: '苗期晚期', code: 'W1P3' },
        { name: '分蘖初期', code: 'W2P1' },
        { name: '分蘖盛期', code: 'W2P2' },
        { name: '拔节期', code: 'W3P1' },
        { name: '孕穗期', code: 'W3P2' },
        { name: '抽穗期', code: 'W4P1' },
        { name: '开花期', code: 'W4P2' },
        { name: '灌浆初期', code: 'W5P1' },
        { name: '灌浆中期', code: 'W5P2' },
        { name: '灌浆后期', code: 'W5P3' },
        { name: '成熟期', code: 'MP' }
      ],
      crops: [
        { name: '小麦' },
        { name: '豌豆' },
        { name: '群体' }
      ],
      periods: [
        { name: '春季' },
        { name: '夏季' },
        { name: '秋季' },
        { name: '冬季' }
      ]
    },
    data: {
      '春季': {
        '小麦': [15, 22, 28, 35, 42, 48, 55, 62, 68, 75, 82, 88, 85],
        '豌豆': [18, 25, 32, 38, 45, 52, 58, 65, 72, 78, 85, 90, 87],
        '群体': [16, 23, 30, 36, 43, 50, 56, 63, 70, 76, 83, 89, 86]
      },
      '夏季': {
        '小麦': [20, 27, 33, 40, 47, 53, 60, 67, 73, 80, 87, 93, 90],
        '豌豆': [23, 30, 37, 43, 50, 57, 63, 70, 77, 83, 90, 95, 92],
        '群体': [21, 28, 35, 41, 48, 55, 61, 68, 75, 81, 88, 94, 91]
      }
    }
  }
])

const activeRadialTab = ref('default')
const selectedExportFormat = ref('png')
const isExporting = ref(false)
const tabCounter = ref(1)
const chartRefs = ref(new Map())

// 设置图表引用
const setChartRef = (tabId, cropName, el) => {
  if (el) {
    const key = `${tabId}-${cropName}`
    chartRefs.value.set(key, el)
  }
}

// 添加新的径向图表标签
const addNewRadialChart = () => {
  const newTab = {
    id: `tab-${tabCounter.value++}`,
    title: `分析 ${tabCounter.value}`,
    isEditing: true,
    isExporting: false,
    isDownloadingTable: false,
    isDownloadingStats: false,
    displayMode: 'overview',
    selectedPeriod: '春季',
    showLabels: true,
    chartSize: 80,
    selectedCrops: ['小麦', '豌豆'],
    config: JSON.parse(JSON.stringify(radialTabs.value[0].config)),
    data: JSON.parse(JSON.stringify(radialTabs.value[0].data))
  }
  
  radialTabs.value.push(newTab)
  activeRadialTab.value = newTab.id
  ElMessage.success('新增径向分析图表成功')
}

// 删除径向图表标签
const removeRadialTab = (targetName) => {
  const tabs = radialTabs.value
  let activeName = activeRadialTab.value
  
  if (activeName === targetName) {
    tabs.forEach((tab, index) => {
      if (tab.id === targetName) {
        const nextTab = tabs[index + 1] || tabs[index - 1]
        if (nextTab) {
          activeName = nextTab.id
        }
      }
    })
  }
  
  activeRadialTab.value = activeName
  radialTabs.value = tabs.filter(tab => tab.id !== targetName)
  ElMessage.success('删除径向分析图表成功')
}

// 处理标签点击
const handleTabClick = (tab) => {
  // 可以在这里添加标签切换的逻辑
}

// 径向图表配置
const getRadialChartOption = (tab, cropName) => {
  const currentData = tab.data[tab.selectedPeriod]
  if (!currentData || !currentData[cropName]) return {}

  const stages = tab.config.stages
  const data = currentData[cropName]

  return {
    title: {
      text: `${cropName}生长阶段径向图`,
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
        const stageInfo = stages[params.dataIndex]
        return `
          <strong>${stageInfo?.name}</strong><br/>
          代码: ${stageInfo?.code}<br/>
          利用率: ${params.value}%
        `
      }
    },
    polar: {
      radius: [30, `${tab.chartSize}%`]
    },
    radiusAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: {
        show: true,
        fontSize: 10,
        color: '#666'
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#e0e0e0',
          type: 'dashed',
          width: 1
        }
      },
      axisLine: {
        show: false
      }
    },
    angleAxis: {
      type: 'category',
      data: stages.map(stage => stage.code),
      boundaryGap: false,
      axisLabel: {
        show: tab.showLabels,
        fontSize: 10,
        color: '#333',
        margin: 15
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#e0e0e0',
          type: 'solid',
          width: 1
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
        data: data.map((value, index) => ({
          value: value,
          itemStyle: {
            color: getStageColor(value),
            borderColor: '#fff',
            borderWidth: 2,
            shadowBlur: 5,
            shadowColor: 'rgba(0, 0, 0, 0.2)',
            shadowOffsetY: 2
          }
        })),
        barWidth: '60%',
        emphasis: {
          itemStyle: {
            shadowBlur: 15,
            shadowColor: 'rgba(0, 0, 0, 0.4)'
          }
        },
        label: {
          show: tab.showLabels,
          position: 'outside',
          formatter: '{c}%',
          fontSize: 10,
          color: '#333',
          fontWeight: 'bold'
        }
      }
    ]
  }
}

// 对比模式图表配置
const getComparisonChartOption = (tab) => {
  const currentData = tab.data[tab.selectedPeriod]
  if (!currentData) return {}

  const stages = tab.config.stages
  const series = []
  
  tab.selectedCrops.forEach((cropName, index) => {
    if (currentData[cropName]) {
      series.push({
        type: 'bar',
        coordinateSystem: 'polar',
        name: cropName,
        data: currentData[cropName].map(value => ({
          value: value,
          itemStyle: {
            color: getCropComparisonColor(cropName),
            borderColor: '#fff',
            borderWidth: 1,
            shadowBlur: 3,
            shadowColor: 'rgba(0, 0, 0, 0.1)',
            opacity: 0.8
          }
        })),
        barWidth: '20%',
        barGap: '5%',
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
            opacity: 1
          }
        },
        label: {
          show: tab.showLabels,
          position: 'outside',
          formatter: '{c}%',
          fontSize: 9,
          color: '#333'
        }
      })
    }
  })

  return {
    title: {
      text: '作物生长阶段对比分析',
      left: 'center',
      top: 10,
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: function(params) {
        const stageInfo = stages[params.dataIndex]
        return `
          <strong>${params.seriesName} - ${stageInfo?.name}</strong><br/>
          代码: ${stageInfo?.code}<br/>
          利用率: ${params.value}%
        `
      }
    },
    legend: {
      top: 40,
      left: 'center',
      data: tab.selectedCrops,
      textStyle: {
        fontSize: 12
      }
    },
    polar: {
      radius: [40, `${tab.chartSize}%`],
      center: ['50%', '60%']
    },
    radiusAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: {
        show: true,
        fontSize: 10,
        color: '#666'
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#e0e0e0',
          type: 'dashed',
          width: 1
        }
      },
      axisLine: {
        show: false
      }
    },
    angleAxis: {
      type: 'category',
      data: stages.map(stage => stage.code),
      boundaryGap: false,
      axisLabel: {
        show: tab.showLabels,
        fontSize: 10,
        color: '#333',
        margin: 20
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#e0e0e0',
          type: 'solid',
          width: 1
        }
      },
      axisLine: {
        show: false
      }
    },
    series: series
  }
}

// 获取表格数据
const getTabTableData = (tab) => {
  const currentData = tab.data[tab.selectedPeriod] || {}
  return tab.config.stages.map((stage, index) => {
    const row = { stage: stage.name, code: stage.code }
    const values = []
    
    // 添加每个作物的数据
    tab.selectedCrops.forEach(cropName => {
      if (currentData[cropName]) {
        const value = currentData[cropName][index]
        row[cropName] = value
        values.push(value)
      }
    })
    
    // 计算统计值
    if (values.length > 0) {
      row.average = (values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(1)
      row.max = Math.max(...values)
      row.min = Math.min(...values)
    } else {
      row.average = 0
      row.max = 0
      row.min = 0
    }
    
    return row
  })
}

// 更新表格数据
const updateTableData = (tab, stageIndex, cropName, newValue) => {
  if (!tab.data[tab.selectedPeriod]) {
    tab.data[tab.selectedPeriod] = {}
  }
  if (!tab.data[tab.selectedPeriod][cropName]) {
    tab.data[tab.selectedPeriod][cropName] = new Array(tab.config.stages.length).fill(0)
  }
  
  tab.data[tab.selectedPeriod][cropName][stageIndex] = newValue || 0
}

// 统计方法
const getTabAverage = (tab, cropName) => {
  const currentData = tab.data[tab.selectedPeriod]
  if (!currentData || !currentData[cropName]) return 0
  
  const values = currentData[cropName]
  return values.reduce((sum, val) => sum + val, 0) / values.length
}

const getTabBestStage = (tab, cropName) => {
  const currentData = tab.data[tab.selectedPeriod]
  if (!currentData || !currentData[cropName]) return ''
  
  const values = currentData[cropName]
  const maxIndex = values.indexOf(Math.max(...values))
  return tab.config.stages[maxIndex]?.name || ''
}

const getTabMaxValue = (tab, cropName) => {
  const currentData = tab.data[tab.selectedPeriod]
  if (!currentData || !currentData[cropName]) return 0
  
  return Math.max(...currentData[cropName])
}

const getTabTrend = (tab, cropName) => {
  const currentData = tab.data[tab.selectedPeriod]
  if (!currentData || !currentData[cropName]) return '无数据'
  
  const values = currentData[cropName]
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

// 配置管理方法
const editRadialConfig = (tabId) => {
  const tab = radialTabs.value.find(t => t.id === tabId)
  if (tab) {
    tab.isEditing = true
  }
}

const saveRadialConfig = (tabId) => {
  const tab = radialTabs.value.find(t => t.id === tabId)
  if (tab) {
    tab.isEditing = false
    ElMessage.success('配置保存成功')
  }
}

const cancelEditRadial = (tabId) => {
  const tab = radialTabs.value.find(t => t.id === tabId)
  if (tab) {
    tab.isEditing = false
    ElMessage.info('取消编辑')
  }
}

// 添加/删除配置项的方法
const addStage = (tabId) => {
  const tab = radialTabs.value.find(t => t.id === tabId)
  if (tab) {
    tab.config.stages.push({ name: '', code: '' })
  }
}

const removeStage = (tabId, index) => {
  const tab = radialTabs.value.find(t => t.id === tabId)
  if (tab) {
    tab.config.stages.splice(index, 1)
  }
}

const addCrop = (tabId) => {
  const tab = radialTabs.value.find(t => t.id === tabId)
  if (tab) {
    tab.config.crops.push({ name: '' })
  }
}

const removeCrop = (tabId, index) => {
  const tab = radialTabs.value.find(t => t.id === tabId)
  if (tab) {
    tab.config.crops.splice(index, 1)
  }
}

const addPeriod = (tabId) => {
  const tab = radialTabs.value.find(t => t.id === tabId)
  if (tab) {
    tab.config.periods.push({ name: '' })
  }
}

const removePeriod = (tabId, index) => {
  const tab = radialTabs.value.find(t => t.id === tabId)
  if (tab) {
    tab.config.periods.splice(index, 1)
  }
}

// 导出功能
const exportTabChart = async (tabId) => {
  const tab = radialTabs.value.find(t => t.id === tabId)
  if (!tab) return
  
  tab.isExporting = true
  try {
    for (const cropName of tab.selectedCrops) {
      const chartKey = `${tabId}-${cropName}`
      const chartInstance = chartRefs.value.get(chartKey)
      
      if (chartInstance) {
        const dataURL = chartInstance.getDataURL({
          type: selectedExportFormat.value,
          pixelRatio: 2,
          backgroundColor: '#fff'
        })
        
        const link = document.createElement('a')
        link.download = `径向图-${tab.title}-${cropName}.${selectedExportFormat.value}`
        link.href = dataURL
        link.click()
      }
    }
    ElMessage.success(`导出${tab.title}成功`)
  } catch (error) {
    ElMessage.error('导出失败')
    console.error(error)
  } finally {
    tab.isExporting = false
  }
}

const exportAllCharts = async () => {
  isExporting.value = true
  try {
    for (const tab of radialTabs.value) {
      if (!tab.isEditing) {
        await exportTabChart(tab.id)
      }
    }
    ElMessage.success('导出全部图表成功')
  } catch (error) {
    ElMessage.error('导出失败')
    console.error(error)
  } finally {
    isExporting.value = false
  }
}

// 下载表格和统计图片
const downloadTableAsImage = async (tabId) => {
  const tab = radialTabs.value.find(t => t.id === tabId)
  if (!tab) return
  
  tab.isDownloadingTable = true
  try {
    const tableElement = document.getElementById(`table-${tabId}`)
    if (tableElement) {
      const canvas = await html2canvas(tableElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: false
      })
      
      const link = document.createElement('a')
      link.download = `生长阶段数据详情-${tab.title}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      
      ElMessage.success('表格下载成功')
    }
  } catch (error) {
    ElMessage.error('下载失败')
    console.error(error)
  } finally {
    tab.isDownloadingTable = false
  }
}

const downloadStatsAsImage = async (tabId) => {
  const tab = radialTabs.value.find(t => t.id === tabId)
  if (!tab) return
  
  tab.isDownloadingStats = true
  try {
    const statsElement = document.getElementById(`stats-${tabId}`)
    if (statsElement) {
      const canvas = await html2canvas(statsElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: false
      })
      
      const link = document.createElement('a')
      link.download = `统计分析-${tab.title}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      
      ElMessage.success('统计分析下载成功')
    }
  } catch (error) {
    ElMessage.error('下载失败')
    console.error(error)
  } finally {
    tab.isDownloadingStats = false
  }
}

// 工具方法
const handleBack = () => {
  router.push('/')
}

const getTabCurrentPeriodName = (tab) => {
  return tab.selectedPeriod || '未选择'
}

const getStageColor = (value) => {
  if (value < 30) return '#FFE066' // 黄色 - 低利用率
  if (value < 50) return '#52C41A' // 绿色 - 中等利用率  
  if (value < 70) return '#1890FF' // 蓝色 - 高利用率
  return '#722ED1' // 紫色 - 很高利用率
}

const getCropColor = (tab, cropName) => {
  const colors = {
    '小麦': 'linear-gradient(135deg, #ffc107 0%, #ff8f00 100%)',
    '豌豆': 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
    '群体': 'linear-gradient(135deg, #6c757d 0%, #495057 100%)'
  }
  return colors[cropName] || 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)'
}

const getCropComparisonColor = (cropName) => {
  const colors = {
    '小麦': '#ffc107',
    '豌豆': '#28a745', 
    '群体': '#6c757d'
  }
  return colors[cropName] || '#007bff'
}
</script>

<style scoped lang="scss">
.container {
  width: 100%;
  max-width: 1400px;
  min-width: 1000px;
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

.main-card {
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: none;
  min-width: 950px;
  
  .el-card__header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-weight: 600;
    font-size: 1.2rem;
    padding: 20px 25px;
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.data-section {
  margin-bottom: 25px;
}

.table-row {
  margin-bottom: 20px;
}

.stats-row {
  margin-top: 0;
}

.data-table-card,
.stats-card,
.data-management-card,
.control-panel {
  width: 100%;
  min-width: 950px;
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

.control-panel .el-card__header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.control-group {
  margin-bottom: 20px;
  
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #333;
  }
}

.mode-selector {
  width: 100%;
}

.charts-container {
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

.radial-chart {
  height: 500px;
}

.comparison-container {
  width: 100%;
}

.comparison-card {
  width: 100%;
  
  .el-card__header {
    margin-bottom: 15px;
  }
  
  .el-card__body {
    padding-top: 15px;
  }
}

.comparison-chart {
  height: 600px;
}

.config-section {
  min-width: 280px;
  
  h4 {
    margin-bottom: 15px;
    color: #333;
    font-weight: 600;
  }
}

.config-item {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
  min-width: 260px;
  
  .el-input {
    flex: 1;
    min-width: 80px;
  }
  
  .el-button {
    flex-shrink: 0;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 10px;
}

.stat-item {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
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

.stat-row {
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

.average-value {
  color: #1890ff;
  font-weight: 600;
}

.max-value {
  color: #52c41a;
  font-weight: 600;
}

.min-value {
  color: #ff4d4f;
  font-weight: 600;
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

@media (max-width: 768px) {
  .container {
    padding: 15px;
    min-width: auto;
  }
  
  .main-card,
  .data-table-card,
  .stats-card,
  .data-management-card,
  .control-panel {
    min-width: auto;
  }
  
  .config-section,
  .config-item {
    min-width: auto;
  }
  
  .header {
    flex-direction: column;
    gap: 15px;
    
    h1 {
      font-size: 1.8rem;
    }
  }
  
  .radial-chart {
    height: 400px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
}
</style>
