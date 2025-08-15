<template>
  <div class="container">
    <div class="header">
      <button @click="handleBack" class="btn back-btn">← 返回首页</button>
      <h1>雷达图 Demo（纯 JS）</h1>
    </div>

    <!-- 添加数据 -->
    <el-card class="add-data-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>添加维度</span>
        </div>
      </template>
      
      <el-form :model="newItem" label-width="80px" inline>
        <el-form-item label="名称">
          <el-input v-model="newItem.name" placeholder="请输入维度名称" />
        </el-form-item>
        <el-form-item label="最大值">
          <el-input-number v-model="newItem.max" :min="1" :max="1000" />
        </el-form-item>
        <el-form-item label="数值">
          <el-input-number v-model="newItem.value" :min="0" :max="newItem.max" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="add">添加</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 当前数据 -->
    <el-card class="current-data-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>当前数据</span>
        </div>
      </template>
      
      <el-table :data="list" border stripe>
        <el-table-column prop="name" label="维度名称" width="150" />
        <el-table-column prop="value" label="当前数值" width="120" />
        <el-table-column prop="max" label="最大值" width="120" />
        <el-table-column label="操作" width="100">
          <template #default="scope">
            <el-button type="danger" size="small" @click="remove(scope.$index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 图表 -->
    <section class="box">
      <v-chart ref="chart" :option="option" autoresize class="chart" />
    </section>

    <!-- 导出设置 -->
    <el-card class="download-card" shadow="hover">
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
import { TitleComponent, TooltipComponent, RadarComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'

use([RadarChart, TitleComponent, TooltipComponent, RadarComponent, CanvasRenderer])

const router = useRouter()

const list = ref([
  { name: '销售', max: 100, value: 80 },
  { name: '管理', max: 100, value: 90 },
  { name: '技术', max: 100, value: 70 }
])

const newItem = ref({ name: '', max: 100, value: 0 })

// 导出配置
const exportConfig = ref({
  width: 800,
  height: 600,
  backgroundColor: '#ffffff',
  format: 'png'
})

const exporting = ref(false)
const chart = ref(null)

const option = computed(() => ({
  title: { text: '动态雷达图' },
  tooltip: {},
  radar: {
    indicator: list.value.map(({ name, max }) => ({ name, max }))
  },
  series: [
    {
      type: 'radar',
      data: [{ value: list.value.map(i => i.value), name: '数据' }]
    }
  ]
}))

const add = () => {
  if (newItem.value.name) {
    list.value.push({ ...newItem.value })
    newItem.value = { name: '', max: 100, value: 0 }
  }
}
const remove = i => list.value.splice(i, 1)

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
    a.download = `radar-${Date.now()}.${exportConfig.value.format}`
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
}

.chart {
  width: 100%;
  height: 400px;
}

// Element Plus 卡片样式
.add-data-card,
.current-data-card,
.download-card {
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

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: #fff;
  font-weight: bold;
  
  &.back-btn {
    background: #6c757d;
    color: #fff;
    
    &:hover {
      background: #5a6268;
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
  .export-actions {
    margin-top: 20px;
  }
}
</style>