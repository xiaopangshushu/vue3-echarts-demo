<script setup>
// import TheWelcome from '../components/TheWelcome.vue'
</script>

<template>
  <main>
    <div class="container">
      <h1>Vue3 + ECharts 雷达图演示</h1>
      
      <div class="demo-grid">

        <div class="demo-card">
          <h3>氮利用效率综合仪表板</h3>
          <p>整合所有功能的综合分析仪表板，支持多模式切换</p>
          <router-link to="/integrated-dashboard" class="btn primary featured">查看演示</router-link>
        </div>

        <div class="demo-card">
          <h3>基础雷达图</h3>
          <p>动态添加维度，支持数据修改和图表下载</p>
          <router-link to="/radar" class="btn primary">查看演示</router-link>
        </div>
        
        <div class="demo-card">
          <h3>氮资源利用率雷达图</h3>
          <p>展示小麦、豌豆和群体的氮利用效率多维指标对比</p>
          <router-link to="/nitrogen-utilization" class="btn primary">查看演示</router-link>
        </div>
        
        <div class="demo-card">
          <h3>氮利用效率时序对比</h3>
          <p>不同生长时期的氮利用效率对比分析</p>
          <router-link to="/nitrogen-timeseries" class="btn primary">查看演示</router-link>
        </div>
        
        <div class="demo-card">
          <h3>交互式氮利用效率分析</h3>
          <p>实时调整数据，动态对比分析氮利用效率</p>
          <router-link to="/nitrogen-interactive" class="btn primary">查看演示</router-link>
        </div>

        <div class="demo-card">
          <h3>生长阶段饼状雷达图</h3>
          <p>模拟图片中的饼状雷达图，展示生长阶段氮利用率分布</p>
          <router-link to="/growth-stage-radar" class="btn primary">查看演示</router-link>
        </div>

        <div class="demo-card">
          <h3>径向生长阶段图分析仪表板</h3>
          <p>专业径向图表分析工具，支持多tab管理、数据编辑、导出功能和SnapDOM下载</p>
          <router-link to="/radial-stage-analysis" class="btn primary featured">查看演示</router-link>
        </div>

      </div>
    </div>
    
    <!-- <TheWelcome /> -->
  </main>
</template>

<style scoped lang="scss">
.container {
  width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
  text-align: center;
}

h1 {
  margin-bottom: 40px;
  color: #333;
  font-size: 2.5rem;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 60px;
}

.demo-card {
  padding: 30px;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
  
  h3 {
    margin: 0 0 15px 0;
    color: #495057;
    font-size: 1.4rem;
  }
  
  p {
    margin: 0 0 20px 0;
    color: #6c757d;
    line-height: 1.6;
  }
}

.btn {
  display: inline-block;
  padding: 12px 24px;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &.primary {
    background: #007bff;
    color: #fff;
    
    &:hover {
      background: #0056b3;
      transform: translateY(-2px);
    }
    
    &.featured {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-size: 1.1rem;
      padding: 14px 28px;
      
      &:hover {
        background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
      }
    }
  }
}

@media (max-width: 768px) {
  .demo-grid {
    grid-template-columns: 1fr;
  }
  
  h1 {
    font-size: 2rem;
  }
}
</style>
