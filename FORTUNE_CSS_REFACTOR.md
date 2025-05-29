# Fortune 模块 CSS 重构说明

## 重构目标

减少 `src/views/fortune/` 文件夹下页面中大量重复的 CSS 样式，提高代码维护性和一致性。

## 重构方案

### 1. 创建通用样式文件

创建了 `src/style/fortune-common.scss` 文件，统一管理 Fortune 模块的通用样式。

### 2. 通用样式类

#### `.fortune-grid-form`

- 搜索表单的网格布局样式
- 包含响应式断点设置
- 统一表单项标签和内容区域样式
- 统一输入控件的宽度和高度

#### `.fortune-search-buttons`

- 搜索按钮容器的布局样式
- 统一按钮的对齐和间距

#### `.fortune-number-range-picker`

- 金额范围选择器的样式
- 用于数字输入框的范围选择

#### `.fortune-full-width-container`

- 全宽度单选按钮组容器样式
- 支持 `.quarter-width` 和 `.half-width` 子元素

#### `.fortune-table`

- 表格相关的通用样式

#### `.fortune-main`

- 主容器样式

#### `.fortune-page-header`

- 页面头部样式

### 3. 响应式设计

通用样式包含以下响应式断点：

- `width > 1920px`: 5 列网格
- `width <= 1920px`: 4 列网格
- `width <= 1280px`: 3 列网格

## 重构的文件列表

### 已重构的页面

- `src/views/fortune/bill/index.vue` - 账单管理页面
- `src/views/fortune/goods-keeper/index.vue` - 物品管理页面
- `src/views/fortune/account/index.vue` - 账户管理页面
- `src/views/fortune/category/index.vue` - 分类管理页面
- `src/views/fortune/book/index.vue` - 账本管理页面
- `src/views/fortune/currency/index.vue` - 币种管理页面
- `src/views/fortune/payee/index.vue` - 交易对象管理页面
- `src/views/fortune/tag/index.vue` - 标签管理页面

### 样式替换对照表

| 原样式类               | 新样式类                       |
| ---------------------- | ------------------------------ |
| `grid-form`            | `fortune-grid-form`            |
| `search-buttons`       | `fortune-search-buttons`       |
| `number-range-picker`  | `fortune-number-range-picker`  |
| `full-width-container` | `fortune-full-width-container` |

## 重构效果

### 代码减少量

- 每个页面减少约 100-150 行重复 CSS 代码
- 总计减少约 1000+行重复代码

### 维护性提升

- 样式统一管理，修改一处即可影响所有页面
- 新增页面可直接使用通用样式类
- 减少了样式不一致的问题

### 一致性改善

- 所有 Fortune 模块页面使用相同的视觉规范
- 响应式行为统一
- 表单布局和交互体验一致

## 使用指南

### 新页面开发

在新的 Fortune 模块页面中，直接使用通用样式类：

```vue
<template>
  <div class="main">
    <!-- 搜索表单 -->
    <el-form
      class="search-form bg-bg_color w-[99/100] pl-8 pr-8 pt-[12px] fortune-grid-form"
    >
      <!-- 表单项 -->
      <el-form-item class="fortune-search-buttons">
        <!-- 搜索按钮 -->
      </el-form-item>
    </el-form>

    <!-- 单选按钮组 -->
    <div class="fortune-full-width-container">
      <el-radio-group class="full-width-group">
        <el-radio-button class="quarter-width">选项1</el-radio-button>
        <el-radio-button class="quarter-width">选项2</el-radio-button>
      </el-radio-group>
    </div>
  </div>
</template>

<style scoped>
/* 页面特有样式可以在这里添加 */
</style>
```

### 样式扩展

如需扩展通用样式，在 `src/style/fortune-common.scss` 中添加新的样式类。

### 页面特有样式

页面特有的样式仍然在各自的 `<style scoped>` 中定义。

## 注意事项

1. **向后兼容**: 重构保持了原有的视觉效果和交互行为
2. **响应式**: 所有页面保持原有的响应式特性
3. **可扩展**: 通用样式文件支持后续扩展和维护
4. **命名规范**: 使用 `fortune-` 前缀避免样式冲突

## 后续优化建议

1. 可以考虑将表格相关的重复样式也提取到通用文件中
2. 可以统一按钮样式和间距规范
3. 可以考虑使用 CSS 变量来管理颜色和尺寸常量
4. 可以为其他模块创建类似的通用样式文件
