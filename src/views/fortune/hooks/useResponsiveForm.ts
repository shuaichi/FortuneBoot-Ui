import { ref, computed } from "vue";
import { useWindowSize } from "@vueuse/core";

export function useResponsiveForm(baseCount = 3) {
  const expanded = ref(false);
  // 使用 VueUse 自动监听窗口大小变化，自带防抖和组件卸载时的事件解绑
  const { width } = useWindowSize();

  const defaultCount = computed(() => {
    let count = baseCount;
    if (width.value <= 1280) {
      count -= 1; // 窄屏显示 2 个
    } else if (width.value >= 1921) {
      count += 1; // 宽屏显示 4 个
    }
    return count;
  });

  const visibleCount = computed(() =>
    expanded.value ? 100 : defaultCount.value
  );

  function isVisible(idx: number) {
    return idx < visibleCount.value;
  }

  return {
    width,
    expanded,
    isVisible
  };
}
