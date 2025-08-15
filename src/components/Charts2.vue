<template>
  <div class="chart-container">
    <!-- 第一个雷达柱状图 -->
    <div ref="chart1Ref" class="my-chart"></div>
    <!-- 第二个雷达柱状图 -->
    <div ref="chart2Ref" class="my-chart"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';

// 两个图表的 DOM 引用
const chart1Ref = ref(null);
const chart2Ref = ref(null);

// 图表实例引用
let chart1Instance = null;
let chart2Instance = null;

// 数据示例（需替换为你自己的真实数据）
const chart1Data = {
  // 小麦氮资源利用率（黄色）
  wheatNitrogen: [/* 各维度数值 */],
  // 糖用甜菜氮资源利用率（绿色）
  sugarBeetNitrogen: [/* 各维度数值 */],
  // 群体氮资源利用率（蓝色）
  groupNitrogen: [/* 各维度数值 */],
  // 极坐标的维度名（示例，对应你图里的 W2P4、W3P3 … 等）
  dimensions: ["W2P4", "W3P3", "W4P2", "W4P4", "W3P1", "W2P2", "MW", "MSW", "M3P1", "M4P1", "W2N4", "W2N2"]
};
const chart2Data = {
  // 小麦光资源利用率（黄色）
  wheatLight: [/* 各维度数值 */],
  // 糖用甜菜光资源利用率（绿色）
  sugarBeetLight: [/* 各维度数值 */],
  // 群体光资源利用率（蓝色）
  groupLight: [/* 各维度数值 */],
  // 极坐标的维度名（和 chart1 保持一致，保证坐标对应）
  dimensions: ["W2P4", "W3P3", "W4P2", "W4P4", "W3P1", "W2P2", "MW", "MSW", "M3P1", "M4P1", "W2N4", "W2N2"]
};

// 初始化图表
const initCharts = () => {
  // 图表 1 配置
  const option1 = {
    // 1. 开启极坐标
    polar: {},
    // 2. 坐标轴：角度轴（对应各个扇形方向）
    angleAxis: {
      type: 'category',
      data: chart1Data.dimensions,
      // 让文字在扇形外侧更美观
      axisLabel: {
        rotate: 45,        // 文字旋转角度
        margin: 20,         // 文字与轴线的距离
        color: '#333'
      },
      // 隐藏坐标轴线
      axisLine: {
        show: false
      },
      // 隐藏刻度线
      axisTick: {
        show: false
      }
    },
    // 3. 坐标轴：径向轴（对应从圆心向外的半径）
    radiusAxis: {
      type: 'value',
      // 隐藏刻度
      axisTick: {
        show: false
      },
      // 隐藏轴线
      axisLine: {
        show: false
      },
      // 隐藏刻度标签
      axisLabel: {
        show: false
      }
    },
    // 4. 系列：多个 bar 系列，每个系列对应一种“资源利用率”
    series: [
      {
        name: '小麦氮资源利用率',
        type: 'bar',
        // 极坐标下，bar 的坐标系设为 polar
        coordinateSystem: 'polar',
        // 数据对应 angleAxis 的 index
        data: chart1Data.wheatNitrogen,
        // 柱形样式
        itemStyle: {
          color: '#FFEB3B' // 黄色
        },
        // 让柱子从圆心向外延伸（radiusAxis 对应的值）
        radiusAxisIndex: 0,
        // 控制柱形的宽度（可理解为每个扇区里柱子的粗细）
        barWidth: 15,
        // 是否显示动画
        animation: true
      },
      {
        name: '糖用甜菜氮资源利用率',
        type: 'bar',
        coordinateSystem: 'polar',
        data: chart1Data.sugarBeetNitrogen,
        itemStyle: {
          color: '#8BC34A' // 绿色
        },
        radiusAxisIndex: 0,
        barWidth: 15,
        animation: true
      },
      {
        name: '群体氮资源利用率',
        type: 'bar',
        coordinateSystem: 'polar',
        data: chart1Data.groupNitrogen,
        itemStyle: {
          color: '#2196F3' // 蓝色
        },
        radiusAxisIndex: 0,
        barWidth: 15,
        animation: true
      }
    ]
  };

  // 图表 2 配置（和图表 1 结构类似，仅数据和名称不同）
  const option2 = {
    polar: {},
    angleAxis: {
      type: 'category',
      data: chart2Data.dimensions,
      axisLabel: {
        rotate: 45,
        margin: 20,
        color: '#333'
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      }
    },
    radiusAxis: {
      type: 'value',
      axisTick: {
        show: false
      },
      axisLine: {
        show: false
      },
      axisLabel: {
        show: false
      }
    },
    series: [
      {
        name: '小麦光资源利用率',
        type: 'bar',
        coordinateSystem: 'polar',
        data: chart2Data.wheatLight,
        itemStyle: {
          color: '#FFEB3B'
        },
        radiusAxisIndex: 0,
        barWidth: 15,
        animation: true
      },
      {
        name: '糖用甜菜光资源利用率',
        type: 'bar',
        coordinateSystem: 'polar',
        data: chart2Data.sugarBeetLight,
        itemStyle: {
          color: '#8BC34A'
        },
        radiusAxisIndex: 0,
        barWidth: 15,
        animation: true
      },
      {
        name: '群体光资源利用率',
        type: 'bar',
        coordinateSystem: 'polar',
        data: chart2Data.groupLight,
        itemStyle: {
          color: '#2196F3'
        },
        radiusAxisIndex: 0,
        barWidth: 15,
        animation: true
      }
    ]
  };

  // 初始化图表实例
  chart1Instance = echarts.init(chart1Ref.value);
  chart2Instance = echarts.init(chart2Ref.value);

  // 设置配置项
  chart1Instance.setOption(option1);
  chart2Instance.setOption(option2);

  // 窗口大小变化时，自动resize图表
  window.addEventListener('resize', () => {
    chart1Instance?.resize();
    chart2Instance?.resize();
  });
};

onMounted(() => {
  initCharts();
});
</script>

<style scoped>
.chart-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  height: 400px; /* 可根据需要调整 */
}
.my-chart {
  width: 100%;
  height: 100%;
}
</style>