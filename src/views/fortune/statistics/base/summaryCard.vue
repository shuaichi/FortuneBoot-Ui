<template>
  <el-card class="summary-card" :style="{ '--accent': accent }">
    <div class="summary-icon">
      <el-icon>
        <component :is="icon" />
      </el-icon>
    </div>
    <div class="summary-content">
      <div class="summary-label">{{ label }}</div>
      <div class="summary-value">
        <span>{{ displayValue }}</span>
        <span
          v-if="ringRate !== undefined && ringRate !== null"
          class="summary-ring"
          :class="ringClass"
        >
          {{ ringText }}
        </span>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed, type Component } from "vue";

const props = defineProps<{
  label: string;
  value: number | string;
  icon: Component;
  accent?: string;
  currency?: string;
  /** 环比百分比，正数上升 */
  ringRate?: number;
  /** 直接展示文本时置 true，不做货币格式化 */
  plain?: boolean;
}>();

const accent = computed(() => props.accent || "#409eff");

const displayValue = computed(() => {
  if (props.plain || typeof props.value === "string") {
    return props.value;
  }
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: props.currency || "CNY",
    minimumFractionDigits: 2
  }).format(props.value);
});

const ringClass = computed(() =>
  (props.ringRate ?? 0) >= 0 ? "is-up" : "is-down"
);

const ringText = computed(() => {
  const rate = props.ringRate ?? 0;
  const arrow = rate >= 0 ? "↑" : "↓";
  return `${arrow}${Math.abs(rate)}%`;
});
</script>

<style scoped lang="scss">
.summary-card {
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: 8px;
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-5px);
  }

  :deep(.el-card__body) {
    display: flex;
    flex: 1;
    align-items: center;
  }

  .summary-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    margin-right: 16px;
    background-color: var(--accent);
    border-radius: 50%;

    .el-icon {
      font-size: 24px;
      color: #fff;
    }
  }

  .summary-content {
    flex: 1;
    min-width: 0;

    .summary-label {
      margin-bottom: 8px;
      font-size: 14px;
      color: #909399;
    }

    .summary-value {
      display: flex;
      align-items: baseline;
      font-size: 24px;
      font-weight: 600;
      color: var(--accent);

      .summary-ring {
        margin-left: 8px;
        font-size: 13px;
        font-weight: 500;

        &.is-up {
          color: #f56c6c;
        }

        &.is-down {
          color: #67c23a;
        }
      }
    }
  }
}
</style>
