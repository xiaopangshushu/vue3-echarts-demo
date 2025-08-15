<template>
  <div class="container">
    <div class="header">
      <button @click="handleBack" class="btn back-btn">← 返回首页</button>
      <h1>氮利用效率交互式对比分析</h1>
    </div>
    
    <!-- 对比模式选择 -->
    <section class="box">
      <h3>对比模式</h3>
      <div class="mode-selector">
        <label class="radio-label">
          <input type="radio" v-model="comparisonMode" value="all" />
          <span>三种作物对比</span>
        </label>
        <label class="radio-label">
          <input type="radio" v-model="comparisonMode" value="custom" />
          <span>自定义对比</span>
        </label>
      </div>
      
      <div v-if="comparisonMode === 'custom'" class="custom-controls">
        <div class="crop-toggles">
          <label class="toggle-label">
            <input type="checkbox" v-model="showWheat" />
            <span class="wheat">显示小麦</span>
          </label>
          <label class="toggle-label">
            <input type="checkbox" v-model="showPea" />
            <span class="pea">显示豌豆</span>
          </label>
          <label class="toggle-label">
            <input type="checkbox" v-model="showPopulation" />
            <span class="population">显示群体</span>
          </label>
        </div>
      </div>
    </section>

    <!-- 图表容器 -->
    <section class="box">
      <div class="chart-container">
        <v-chart ref="chart" :option="option" autoresize class="chart" />
        
        <!-- 图表控制按钮 -->
        <div class="chart-controls">
          <button @click="resetZoom" class="btn secondary">重置视图</button>
          <button @click="toggleAnimation" class="btn primary">
            {{ animationEnabled ? '关闭动画' : '开启动画' }}
          </button>
          <button @click="exportChart" class="btn success">导出图表</button>
        </div>
      </div>
    </section>

    <!-- 实时数据调整 -->
    <section class="box">
      <h3>实时数据调整</h3>
      <div class="data-adjustment">
        <div class="adjustment-tabs">
          <button 
            v-for="crop in ['wheat', 'pea', 'population']" 
            :key="crop"
            :class="['tab-btn', { active: activeTab === crop }]"
            @click="activeTab = crop"
          >
            {{ getCropName(crop) }}
          </button>
        </div>
        
        <div class="adjustment-panel">
          <div v-for="(indicator, index) in indicators" :key="indicator.name" class="adjustment-row">
            <label>{{ indicator.name }}</label>
            <div class="slider-container">
              <input 
                v-model.number="cropData[activeTab][index]" 
                type="range" 
                min="0" 
                max="50" 
                step="0.1"
                @input="updateChart"
              />
              <input 
                v-model.number="cropData[activeTab][index]" 
                type="number" 
                min="0" 
                max="50" 
                step="0.1"
                class="value-input"
                @input="updateChart"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 分析结果 -->
    <el-card class="analysis-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>分析结果</span>
        </div>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card shadow="never" class="result-card">
            <template #header>
              <span>综合评分</span>
            </template>
            <div class="scores">
              <div v-if="showWheat || comparisonMode === 'all'" class="score-item wheat">
                <span>小麦</span>
                <div class="score-bar">
                  <div class="score-fill" :style="{ width: getOverallScore('wheat') + '%' }"></div>
                </div>
                <span>{{ getOverallScore('wheat').toFixed(1) }}</span>
              </div>
              <div v-if="showPea || comparisonMode === 'all'" class="score-item pea">
                <span>豌豆</span>
                <div class="score-bar">
                  <div class="score-fill" :style="{ width: getOverallScore('pea') + '%' }"></div>
                </div>
                <span>{{ getOverallScore('pea').toFixed(1) }}</span>
              </div>
              <div v-if="showPopulation || comparisonMode === 'all'" class="score-item population">
                <span>群体</span>
                <div class="score-bar">
                  <div class="score-fill" :style="{ width: getOverallScore('population') + '%' }"></div>
                </div>
                <span>{{ getOverallScore('population').toFixed(1) }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card shadow="never" class="result-card">
            <template #header>
              <span>优势分析</span>
            </template>
            <div class="advantages">
              <div v-for="analysis in getAdvantageAnalysis()" :key="analysis.crop" class="advantage-item">
                <h5>{{ getCropName(analysis.crop) }}</h5>
                <ul>
                  <li v-for="advantage in analysis.advantages" :key="advantage">{{ advantage }}</li>
                </ul>
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
import { ref, computed, watch } from 'vue'
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

// 基础配置
const indicators = ref([
  { name: '氮吸收效率', max: 50 },
  { name: '氮利用效率', max: 50 },
  { name: '氮转化效率', max: 50 },
  { name: '氮分配效率', max: 50 },
  { name: '氮残留利用率', max: 50 },
  { name: '根系氮吸收能力', max: 50 }
])

// 对比模式和显示控制
const comparisonMode = ref('all')
const showWheat = ref(true)
const showPea = ref(true)
const showPopulation = ref(true)
const activeTab = ref('wheat')
const animationEnabled = ref(true)

// 作物数据
const cropData = ref({
  wheat: [35, 42, 38, 40, 33, 36],
  pea: [28, 35, 45, 38, 41, 32],
  population: [32, 39, 42, 39, 37, 34]
})

// 导出配置
const exportConfig = ref({
  width: 800,
  height: 600,
  backgroundColor: '#ffffff',
  format: 'png'
})

const exporting = ref(false)
const chart = ref(null)

const option = computed(() => {
  const seriesData = []
  
  if (comparisonMode.value === 'all' || showWheat.value) {
    seriesData.push({
      value: cropData.value.wheat,
      name: '小麦',
      areaStyle: { color: 'rgba(255, 193, 7, 0.3)' },
      lineStyle: { color: '#ffc107', width: 2 },
      itemStyle: { color: '#ffc107' }
    })
  }
  
  if (comparisonMode.value === 'all' || showPea.value) {
    seriesData.push({
      value: cropData.value.pea,
      name: '豌豆',
      areaStyle: { color: 'rgba(40, 167, 69, 0.3)' },
      lineStyle: { color: '#28a745', width: 2 },
      itemStyle: { color: '#28a745' }
    })
  }
  
  if (comparisonMode.value === 'all' || showPopulation.value) {
    seriesData.push({
      value: cropData.value.population,
      name: '群体',
      areaStyle: { color: 'rgba(108, 117, 125, 0.3)' },
      lineStyle: { color: '#6c757d', width: 2 },
      itemStyle: { color: '#6c757d' }
    })
  }

  return {
    title: {
      text: '氮利用效率交互式对比分析',
      left: 'center',
      textStyle: { fontSize: 18, fontWeight: 'bold' }
    },
    animation: animationEnabled.value,
    animationDuration: 1000,
    tooltip: {
      trigger: 'item',
      formatter: function(params) {
        const data = params.data
        const indicators = ['氮吸收效率', '氮利用效率', '氮转化效率', '氮分配效率', '氮残留利用率', '根系氮吸收能力']
        
        let html = `<strong>${data.name}</strong><br/>`
        data.value.forEach((value, index) => {
          html += `${indicators[index]}: ${value.toFixed(1)}<br/>`
        })
        return html
      }
    },
    legend: {
      data: seriesData.map(item => item.name),
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
        fontSize: 12,
        fontWeight: 'bold'
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
    series: [{ type: 'radar', data: seriesData }]
  }
})

// 方法
const getCropName = (crop) => {
  const names = { wheat: '小麦', pea: '豌豆', population: '群体' }
  return names[crop] || crop
}

const updateChart = () => {
  // 触发图表更新
}

const resetZoom = () => {
  if (chart.value) {
    chart.value.chart.dispatchAction({ type: 'restore' })
  }
}

const toggleAnimation = () => {
  animationEnabled.value = !animationEnabled.value
}

const exportChart = () => {
  if (chart.value) {
    const url = chart.value.chart.getDataURL({
      type: 'png',
      pixelRatio: 2,
      width: 800,
      height: 600
    })
    const a = document.createElement('a')
    a.href = url
    a.download = `nitrogen-comparison-${Date.now()}.png`
    a.click()
  }
}

const getOverallScore = (crop) => {
  const data = cropData.value[crop]
  return (data.reduce((sum, val) => sum + val, 0) / data.length)
}

const getAdvantageAnalysis = () => {
  const analysis = []
  const crops = comparisonMode.value === 'all' 
    ? ['wheat', 'pea', 'population']
    : Object.keys(cropData.value).filter(crop => {
        if (crop === 'wheat') return showWheat.value
        if (crop === 'pea') return showPea.value
        if (crop === 'population') return showPopulation.value
        return false
      })

  crops.forEach(crop => {
    const advantages = []
    const data = cropData.value[crop]
    
    data.forEach((value, index) => {
      const isAdvantage = crops.every(otherCrop => 
        otherCrop === crop || cropData.value[otherCrop][index] <= value
      )
      
      if (isAdvantage && crops.length > 1) {
        advantages.push(indicators.value[index].name)
      }
    })
    
    if (advantages.length > 0) {
      analysis.push({
        crop,
        advantages
      })
    }
  })
  
  return analysis
}

const handleBack = () => {
  router.push('/')
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
    a.download = `nitrogen-interactive-${Date.now()}.${exportConfig.value.format}`
    a.click()
    
    ElMessage.success('导出成功！')
  } catch (error) {
    ElMessage.error('导出失败，请重试')
    console.error('Export error:', error)
  } finally {
    exporting.value = false
  }
}

// 监听对比模式变化
watch(comparisonMode, (newMode) => {
  if (newMode === 'all') {
    showWheat.value = true
    showPea.value = true
    showPopulation.value = true
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
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.mode-selector {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.radio-label, .toggle-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  
  input {
    margin: 0;
  }
  
  span {
    font-weight: 500;
    
    &.wheat { color: #ffc107; }
    &.pea { color: #28a745; }
    &.population { color: #6c757d; }
  }
}

.custom-controls {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
}

.crop-toggles {
  display: flex;
  gap: 20px;
}

.chart-container {
  position: relative;
}

.chart {
  width: 100%;
  height: 500px;
}

.chart-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 10px;
}

.data-adjustment {
  .adjustment-tabs {
    display: flex;
    border-bottom: 2px solid #eee;
    margin-bottom: 20px;
    
    .tab-btn {
      padding: 10px 20px;
      border: none;
      background: none;
      cursor: pointer;
      border-bottom: 3px solid transparent;
      
      &:hover {
        background: #f8f9fa;
      }
      
      &.active {
        color: #007bff;
        border-bottom-color: #007bff;
      }
    }
  }
  
  .adjustment-panel {
    .adjustment-row {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      
      label {
        flex: 0 0 150px;
        font-weight: 500;
      }
      
      .slider-container {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 15px;
        
        input[type="range"] {
          flex: 1;
        }
        
        .value-input {
          width: 80px;
          padding: 5px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
      }
    }
  }
}

.analysis-results {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.result-card {
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #f8f9fa;
  
  h4 {
    margin: 0 0 15px 0;
    color: #333;
  }
}

.scores {
  .score-item {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 10px;
    
    span:first-child {
      flex: 0 0 60px;
      font-weight: 500;
    }
    
    .score-bar {
      flex: 1;
      height: 20px;
      background: #e9ecef;
      border-radius: 10px;
      overflow: hidden;
      
      .score-fill {
        height: 100%;
        transition: width 0.3s ease;
      }
    }
    
    span:last-child {
      flex: 0 0 40px;
      text-align: right;
      font-weight: bold;
    }
    
    &.wheat .score-fill { background: #ffc107; }
    &.pea .score-fill { background: #28a745; }
    &.population .score-fill { background: #6c757d; }
  }
}

.advantages {
  .advantage-item {
    margin-bottom: 15px;
    
    h5 {
      margin: 0 0 8px 0;
      color: #495057;
    }
    
    ul {
      margin: 0;
      padding-left: 20px;
      
      li {
        margin-bottom: 4px;
        color: #666;
      }
    }
  }
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  
  &.back-btn {
    background: #6c757d;
    color: #fff;
    font-size: 14px;
    padding: 8px 16px;
    
    &:hover {
      background: #5a6268;
    }
  }
  
  &.primary { background: #007bff; color: #fff; }
  &.secondary { background: #6c757d; color: #fff; }
  &.success { background: #28a745; color: #fff; }
  
  &:hover {
    opacity: 0.9;
  }
}

.mode-selector-card,
.data-adjustment-card,
.analysis-card,
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

.result-card {
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

@media (max-width: 768px) {
  .analysis-results {
    grid-template-columns: 1fr;
  }
  
  .crop-toggles {
    flex-direction: column;
  }
  
  .chart-controls {
    position: static;
    justify-content: center;
    margin-top: 15px;
  }
  
  .export-actions {
    margin-top: 20px;
  }
}
</style>
