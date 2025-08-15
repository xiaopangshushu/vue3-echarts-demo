<template>
  <div class="container">
    <div class="header">
      <button @click="handleBack" class="btn back-btn">← 返回首页</button>
      <h1>氮利用效率时序对比</h1>
    </div>
    
    <!-- 时期选择 -->
    <el-card class="period-selector-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>生长时期选择</span>
        </div>
      </template>
      
      <el-radio-group v-model="selectedPeriod" class="period-selector">
        <el-radio-button 
          v-for="period in periods" 
          :key="period.key"
          :label="period.key"
        >
          {{ period.name }}
        </el-radio-button>
      </el-radio-group>
    </el-card>

    <!-- 图表 -->
    <el-card class="chart-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>雷达图 - {{ getCurrentPeriodName() }}</span>
        </div>
      </template>
      
      <v-chart ref="chart" :option="option" autoresize class="chart" />
    </el-card>

    <!-- 数据表格 -->
    <el-card class="data-table-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>详细数据 - {{ getCurrentPeriodName() }}</span>
        </div>
      </template>
      
      <el-table :data="tableData" border stripe>
        <el-table-column prop="indicator" label="指标" width="150" />
        <el-table-column 
          v-for="cropName in Object.keys(getCurrentData())" 
          :key="cropName"
          :prop="cropName"
          :label="cropName"
          width="120"
        >
          <template #default="scope">
            <span :class="{ 'best-value': getBestClass(scope.$index, cropName) }">
              {{ scope.row[cropName] }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="best" label="最优值" width="100">
          <template #default="scope">
            <span class="best-value">{{ scope.row.best }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 数据管理 -->
    <el-card class="data-management-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>数据管理</span>
        </div>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card shadow="never" class="inner-card">
            <template #header>
              <span>添加新生长时期</span>
            </template>
            <el-form :model="newPeriod" label-width="80px">
              <el-form-item label="时期标识">
                <el-input v-model="newPeriod.key" placeholder="请输入时期标识" />
              </el-form-item>
              <el-form-item label="时期名称">
                <el-input v-model="newPeriod.name" placeholder="请输入时期名称" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="addPeriod">添加时期</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card shadow="never" class="inner-card">
            <template #header>
              <span>添加新指标</span>
            </template>
            <el-form :model="newIndicator" label-width="80px">
              <el-form-item label="指标名称">
                <el-input v-model="newIndicator.name" placeholder="请输入指标名称" />
              </el-form-item>
              <el-form-item label="最大值">
                <el-input-number v-model="newIndicator.max" :min="1" :max="100" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="addIndicator">添加指标</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card shadow="never" class="inner-card">
            <template #header>
              <span>添加新作物</span>
            </template>
            <el-form :model="newCrop" label-width="80px">
              <el-form-item label="作物名称">
                <el-input v-model="newCrop.name" placeholder="请输入作物名称" />
              </el-form-item>
              <el-form-item label="颜色">
                <el-color-picker v-model="newCrop.color" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="addCrop">添加作物</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <!-- 统计分析 -->
    <el-card class="stats-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>统计分析</span>
        </div>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card shadow="never" class="stat-card">
            <template #header>
              <span>平均利用率</span>
            </template>
            <div class="stat-values">
              <div v-for="cropName in Object.keys(getCurrentData())" :key="cropName" class="stat-item">
                <span class="crop-name" :class="cropName">{{ cropName }}</span>
                <span class="stat-value">{{ getAverage(cropName).toFixed(1) }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card shadow="never" class="stat-card">
            <template #header>
              <span>优势指标数量</span>
            </template>
            <div class="stat-values">
              <div v-for="cropName in Object.keys(getCurrentData())" :key="cropName" class="stat-item">
                <span class="crop-name" :class="cropName">{{ cropName }}</span>
                <span class="stat-value">{{ getAdvantageCount(cropName) }}项</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <!-- 导出设置 -->
    <el-card class="export-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>导出图表</span>
        </div>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form :model="exportConfig" label-width="100px">
            <el-form-item label="图片尺寸">
              <el-row :gutter="10">
                <el-col :span="12">
                  <el-input-number v-model="exportConfig.width" :min="400" :max="2000" placeholder="宽度" />
                </el-col>
                <el-col :span="12">
                  <el-input-number v-model="exportConfig.height" :min="300" :max="1500" placeholder="高度" />
                </el-col>
              </el-row>
            </el-form-item>
            
            <el-form-item label="背景颜色">
              <el-color-picker v-model="exportConfig.backgroundColor" show-alpha />
              <span class="color-preview" :style="{ backgroundColor: exportConfig.backgroundColor }"></span>
            </el-form-item>
            
            <el-form-item label="图片格式">
              <el-radio-group v-model="exportConfig.format">
                <el-radio label="png">PNG</el-radio>
                <el-radio label="jpg">JPG</el-radio>
                <el-radio label="svg">SVG</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
        </el-col>
        
        <el-col :span="12">
          <div class="export-actions">
            <el-button type="primary" size="large" @click="download" :loading="exporting">
              <el-icon><Download /></el-icon>
              导出图片
            </el-button>
            
            <div class="preset-buttons">
              <el-button size="small" @click="setPreset('web')">网页尺寸</el-button>
              <el-button size="small" @click="setPreset('print')">打印尺寸</el-button>
              <el-button size="small" @click="setPreset('mobile')">移动端</el-button>
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
import { Download } from '@element-plus/icons-vue'
import { use } from 'echarts/core'
import { RadarChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, RadarComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'

use([RadarChart, TitleComponent, TooltipComponent, RadarComponent, LegendComponent, CanvasRenderer])

const router = useRouter()

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

const selectedPeriod = ref('flowering')

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
const newPeriod = ref({ key: '', name: '' })
const newIndicator = ref({ name: '', max: 50 })
const newCrop = ref({ name: '', color: '#007bff' })

// 导出配置
const exportConfig = ref({
  width: 800,
  height: 600,
  backgroundColor: '#ffffff',
  format: 'png'
})

const exporting = ref(false)
const chart = ref(null)

const tableData = computed(() => {
  const currentData = getCurrentData()
  return indicators.value.map((indicator, index) => {
    const row = { indicator: indicator.name }
    Object.keys(currentData).forEach(cropName => {
      row[cropName] = currentData[cropName][index]
    })
    row.best = getBestValue(index)
    return row
  })
})

const option = computed(() => {
  const currentData = periodData.value[selectedPeriod.value]
  
  const seriesData = Object.keys(currentData).map(cropName => ({
    value: currentData[cropName],
    name: cropName,
    areaStyle: {
      color: cropColors.value[cropName]?.area || 'rgba(0, 123, 255, 0.4)'
    },
    lineStyle: {
      color: cropColors.value[cropName]?.line || '#007bff',
      width: 3
    },
    itemStyle: {
      color: cropColors.value[cropName]?.line || '#007bff',
      borderWidth: 2
    }
  }))
  
  return {
    title: {
      text: `氮利用效率雷达图 - ${getCurrentPeriodName()}`,
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
      data: Object.keys(currentData),
      top: 40,
      itemGap: 30
    },
    radar: {
      indicator: indicators.value,
      shape: 'polygon',
      radius: '65%',
      center: ['50%', '55%'],
      splitNumber: 5,
      axisName: {
        color: '#333',
        fontSize: 12
      },
      splitLine: {
        lineStyle: {
          color: ['#e8e8e8', '#d0d0d0', '#b8b8b8', '#a0a0a0', '#888888']
        }
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ['rgba(114, 172, 209, 0.05)', 'rgba(114, 172, 209, 0.1)']
        }
      }
    },
    series: [
      {
        type: 'radar',
        data: seriesData
      }
    ]
  }
})

const getCurrentPeriodName = () => {
  return periods.value.find(p => p.key === selectedPeriod.value)?.name || ''
}

const getCurrentData = () => {
  return periodData.value[selectedPeriod.value]
}

const getBestValue = (index) => {
  const currentData = getCurrentData()
  const values = Object.values(currentData).map(cropData => cropData[index])
  return Math.max(...values)
}

const getBestClass = (index, cropName) => {
  const currentData = getCurrentData()
  const values = Object.values(currentData).map(cropData => cropData[index])
  const maxValue = Math.max(...values)
  
  return currentData[cropName][index] === maxValue ? 'best' : ''
}

const getAverage = (cropName) => {
  const data = getCurrentData()[cropName]
  return data.reduce((sum, val) => sum + val, 0) / data.length
}

const getAdvantageCount = (cropName) => {
  let count = 0
  const currentData = getCurrentData()
  
  for (let i = 0; i < indicators.value.length; i++) {
    const values = Object.values(currentData).map(cropData => cropData[i])
    const maxValue = Math.max(...values)
    
    if (currentData[cropName][i] === maxValue) {
      count++
    }
  }
  
  return count
}

const handleBack = () => {
  router.push('/')
}

const addPeriod = () => {
  if (newPeriod.value.key && newPeriod.value.name) {
    periods.value.push({
      key: newPeriod.value.key,
      name: newPeriod.value.name
    })
    
    // 为新时期添加默认数据
    const cropNames = Object.keys(periodData.value[Object.keys(periodData.value)[0]])
    periodData.value[newPeriod.value.key] = {}
    
    cropNames.forEach(cropName => {
      periodData.value[newPeriod.value.key][cropName] = new Array(indicators.value.length).fill(0)
    })
    
    newPeriod.value = { key: '', name: '' }
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
  }
}

const addCrop = () => {
  if (newCrop.value.name) {
    const cropName = newCrop.value.name
    
    // 为所有时期添加新作物
    Object.keys(periodData.value).forEach(periodKey => {
      periodData.value[periodKey][cropName] = new Array(indicators.value.length).fill(0)
    })
    
    // 设置默认颜色
    cropColors.value[cropName] = {
      area: newCrop.value.color + '66', // 添加透明度
      line: newCrop.value.color
    }
    
    newCrop.value = { name: '', color: '#007bff' }
  }
}

const setPreset = (type) => {
  const presets = {
    web: { width: 1200, height: 800, backgroundColor: '#ffffff' },
    print: { width: 1600, height: 1200, backgroundColor: '#ffffff' },
    mobile: { width: 750, height: 1000, backgroundColor: '#ffffff' }
  }
  
  const preset = presets[type]
  exportConfig.value.width = preset.width
  exportConfig.value.height = preset.height
  exportConfig.value.backgroundColor = preset.backgroundColor
}

const download = async () => {
  if (!chart.value) return
  
  exporting.value = true
  
  try {
    // 设置背景色
    const originalBackground = chart.value.chart.getOption().backgroundColor
    chart.value.chart.setOption({ backgroundColor: exportConfig.value.backgroundColor })
    
    // 等待渲染完成
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const url = chart.value.chart.getDataURL({
      type: exportConfig.value.format,
      pixelRatio: 2,
      width: exportConfig.value.width,
      height: exportConfig.value.height,
      backgroundColor: exportConfig.value.backgroundColor
    })
    
    // 恢复原始背景色
    chart.value.chart.setOption({ backgroundColor: originalBackground })
    
    const a = document.createElement('a')
    a.href = url
    a.download = `nitrogen-timeseries-${Date.now()}.${exportConfig.value.format}`
    a.click()
    
    ElMessage.success('导出成功！')
  } catch (error) {
    ElMessage.error('导出失败，请重试')
    console.error('Export error:', error)
  } finally {
    exporting.value = false
  }
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
  background: rgba(255, 255, 255, 0.9);
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

.box {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 6px;
  background: #fff;
}

.period-selector-card,
.chart-card,
.data-management-card,
.data-table-card {
  margin-bottom: 25px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: none;
  overflow: hidden;
  
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

.period-selector {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}

.chart {
  width: 100%;
  height: 500px;
}

.data-table-card {
  margin-bottom: 20px;
}

.best-value {
  background: #d4edda;
  font-weight: bold;
  color: #155724;
  padding: 2px 6px;
  border-radius: 3px;
}

.stats-card,
.export-card {
  margin-bottom: 25px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: none;
  overflow: hidden;
  
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

.stat-card {
  height: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  .el-card__header {
    padding: 15px 20px;
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
    font-weight: 600;
    border-radius: 8px 8px 0 0;
  }
  
  .el-card__body {
    padding: 20px;
    background: rgba(255, 255, 255, 0.9);
  }
}

.data-management-card {
  margin-bottom: 20px;
}

.inner-card {
  height: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  .el-card__header {
    padding: 15px 20px;
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
    font-weight: 600;
    border-radius: 8px 8px 0 0;
  }
  
  .el-card__body {
    padding: 20px;
    background: rgba(255, 255, 255, 0.9);
  }
}

.stat-values {
  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #eee;
    
    &:last-child {
      border-bottom: none;
    }
  }
  
  .crop-name {
    font-weight: 600;
    
    &.小麦 { color: #ffc107; }
    &.豌豆 { color: #28a745; }
    &.群体 { color: #6c757d; }
  }
  
  .stat-value {
    font-weight: bold;
    color: #333;
    background: #f8f9fa;
    padding: 4px 8px;
    border-radius: 4px;
  }
}

.export-actions {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  justify-content: center;
  height: 100%;
  
  .preset-buttons {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: center;
  }
}

.color-preview {
  display: inline-block;
  width: 30px;
  height: 30px;
  border-radius: 4px;
  margin-left: 10px;
  border: 2px solid #ddd;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: #fff;
  font-weight: bold;
  
  &.back-btn {
    background: #6c757d;
    
    &:hover {
      background: #5a6268;
    }
  }
  
  &.primary { 
    background: #007bff;
    
    &:hover {
      background: #0056b3;
    }
  }
}

@media (max-width: 768px) {
  .period-selector {
    flex-direction: column;
    align-items: center;
  }
  
  .el-col {
    margin-bottom: 20px;
  }
  
  .export-actions {
    margin-top: 20px;
  }
}
</style>
