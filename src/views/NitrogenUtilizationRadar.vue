<template>
  <div class="container">
    <div class="header">
      <button @click="handleBack" class="btn back-btn">← 返回首页</button>
      <h1>氮资源利用率雷达图</h1>
    </div>
    
    <!-- 数据展示区域 -->
    <section class="box">
      <h3>氮利用效率多维指标对比</h3>
      <div class="legend">
        <div class="legend-item">
          <span class="color-dot wheat"></span>
          <span>小麦</span>
        </div>
        <div class="legend-item">
          <span class="color-dot pea"></span>
          <span>豌豆</span>
        </div>
        <div class="legend-item">
          <span class="color-dot population"></span>
          <span>群体</span>
        </div>
      </div>
    </section>

    <!-- 图表 -->
    <section class="box">
      <v-chart ref="chart" :option="option" autoresize class="chart" />
    </section>

    <!-- 数据管理 -->
    <el-card class="data-management-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>数据管理</span>
        </div>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="12">
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
        
        <el-col :span="12">
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

    <!-- 控制面板 -->
    <el-card class="control-panel-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>参数调整</span>
        </div>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="8" v-for="(cropData, cropName) in allCropData" :key="cropName" style="margin-top: 10px;">
          <el-card shadow="never" class="crop-control-card">
            <template #header>
              <div class="crop-header">
                <span>{{ cropName }}</span>
                <el-button 
                  v-if="Object.keys(allCropData).length > 1"
                  type="danger" 
                  size="small" 
                  @click="removeCrop(cropName)"
                >
                  删除
                </el-button>
              </div>
            </template>
            
            <div class="control-items">
              <div v-for="(indicator, index) in indicators" :key="indicator.name" class="control-item">
                <div class="indicator-label">{{ indicator.name }}</div>
                <div class="slider-container">
                  <el-slider
                    v-model="cropData[index]"
                    :min="0"
                    :max="indicator.max"
                    :step="0.5"
                    show-input
                    :show-input-controls="false"
                    input-size="small"
                  />
                </div>
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
  { name: '氮吸收效率', max: 50 },
  { name: '氮利用效率', max: 50 },
  { name: '氮转化效率', max: 50 },
  { name: '氮分配效率', max: 50 },
  { name: '氮残留利用率', max: 50 },
  { name: '根系氮吸收能力', max: 50 }
])

// 作物数据管理
const allCropData = ref({
  '小麦': [35, 42, 38, 40, 33, 36],
  '豌豆': [28, 35, 45, 38, 41, 32],
  '群体': [32, 39, 42, 39, 37, 34]
})

// 作物颜色配置
const cropColors = ref({
  '小麦': { area: 'rgba(255, 193, 7, 0.3)', line: '#ffc107' },
  '豌豆': { area: 'rgba(40, 167, 69, 0.3)', line: '#28a745' },
  '群体': { area: 'rgba(108, 117, 125, 0.3)', line: '#6c757d' }
})

// 新增指标和作物的表单数据
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

const option = computed(() => {
  const seriesData = Object.keys(allCropData.value).map(cropName => ({
    value: allCropData.value[cropName],
    name: cropName,
    areaStyle: {
      color: cropColors.value[cropName]?.area || 'rgba(0, 123, 255, 0.3)'
    },
    lineStyle: {
      color: cropColors.value[cropName]?.line || '#007bff',
      width: 2
    },
    itemStyle: {
      color: cropColors.value[cropName]?.line || '#007bff'
    }
  }))

  return {
    title: {
      text: '氮资源利用率多维指标对比',
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
      data: Object.keys(allCropData.value),
      top: 40,
      itemGap: 30
    },
    radar: {
      indicator: indicators.value,
      shape: 'polygon',
      radius: '70%',
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

const handleBack = () => {
  router.push('/')
}

const addIndicator = () => {
  if (newIndicator.value.name && newIndicator.value.max > 0) {
    indicators.value.push({
      name: newIndicator.value.name,
      max: newIndicator.value.max
    })
    
    // 为所有作物添加新指标的默认值
    Object.keys(allCropData.value).forEach(cropName => {
      allCropData.value[cropName].push(0)
    })
    
    newIndicator.value = { name: '', max: 50 }
  }
}

const addCrop = () => {
  if (newCrop.value.name) {
    const cropName = newCrop.value.name
    allCropData.value[cropName] = new Array(indicators.value.length).fill(0)
    
    // 设置默认颜色
    cropColors.value[cropName] = {
      area: newCrop.value.color + '40', // 添加透明度
      line: newCrop.value.color
    }
    
    newCrop.value = { name: '', color: '#007bff' }
  }
}

const removeCrop = (cropName) => {
  delete allCropData.value[cropName]
  delete cropColors.value[cropName]
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
    a.download = `nitrogen-utilization-radar-${Date.now()}.${exportConfig.value.format}`
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
@use "sass:color";
@use "../assets/scss/main.scss" as *;

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

.legend {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin: 10px 0;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  
  &.wheat {
    background-color: #ffc107;
  }
  
  &.pea {
    background-color: #28a745;
  }
  
  &.population {
    background-color: #6c757d;
  }
}

.chart {
  width: 100%;
  height: 500px;
}

// Element Plus 卡片样式
.data-management-card,
.control-panel-card,
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

.card-header {
  font-weight: bold;
  color: white;
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

.crop-control-card {
  height: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  .el-card__header {
    padding: 15px 20px;
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    color: white;
    font-weight: 600;
    border-radius: 8px 8px 0 0;
  }
  
  .el-card__body {
    padding: 20px;
    background: rgba(255, 255, 255, 0.9);
  }
}

.crop-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  color: #333;
}

.control-items {
  .control-item {
    margin-bottom: 15px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.indicator-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
}

.slider-container {
  .el-slider {
    margin: 0;
  }
}

.row {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

input[type="number"] {
  padding: 6px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 80px;
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
    background: $primary;
    
    &:hover {
      background: color.adjust($primary, $lightness: -10%);
    }
  }
  
  &.danger { 
    background: $danger;
    
    &:hover {
      background: color.adjust($danger, $lightness: -10%);
    }
  }
  
  &.success { 
    background: $success;
    
    &:hover {
      background: color.adjust($success, $lightness: -10%);
    }
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
  .el-col {
    margin-bottom: 20px;
  }
  
  .legend {
    flex-direction: column;
    align-items: center;
  }
  
  .export-actions {
    margin-top: 20px;
  }
}
</style>
