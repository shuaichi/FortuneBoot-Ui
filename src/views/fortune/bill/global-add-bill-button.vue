<template>
  <teleport to="body">
    <transition name="fade">
      <div
        v-if="showAddBillButton"
        class="global-add-bill-btn"
        :style="btnStyle"
        @mousedown="onDragStart"
        @touchstart="onDragStart"
        @mouseenter="hovering = true"
        @mouseleave="hovering = false"
      >
        <div
          class="ball-inner"
          :class="{ 'ball-hover': hovering }"
          @click="openAddBillDialog"
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <circle
              cx="18"
              cy="18"
              r="18"
              :fill="hovering ? '#409EFF' : '#4f8cff'"
            />
            <path
              d="M18 11v14M11 18h14"
              stroke="#fff"
              stroke-width="2.5"
              stroke-linecap="round"
            />
          </svg>
        </div>
      </div>
    </transition>
    <bill-form
      v-if="addBillDialogVisible"
      :model-value="addBillDialogVisible"
      type="add"
      :group-id="defaultGroupId"
      :book-id="defaultBookId"
      @update:modelValue="addBillDialogVisible = $event"
      @success="onAddBillSuccess"
    />
  </teleport>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import BillForm from "@/views/fortune/bill/bill-form.vue";
import { getDefaultGroupId, getGroupByIdApi } from "@/api/fortune/group";
import { message } from "@/utils/message";
import { emitter } from "@/utils/mitt";

// 判断是否为登录/注册页
const route = useRoute();
const showAddBillButton = computed(() => {
  const path = route.path.toLowerCase();
  return !["/login", "/register"].some(p => path.startsWith(p));
});

// 拖拽相关
const btnPos = ref({ x: window.innerWidth - 100, y: window.innerHeight - 150 });
const dragging = ref(false);
const offset = ref({ x: 0, y: 0 });
const hovering = ref(false);
// 用于防止拖动后立即触发点击
const justDragged = ref(false);
let dragMoved = false;
let dragStartPos = { x: 0, y: 0 };
const DRAG_THRESHOLD = 5;

const btnStyle = computed(() => ({
  position: "fixed",
  zIndex: 9999,
  right: "unset",
  bottom: "unset",
  left: btnPos.value.x + "px",
  top: btnPos.value.y + "px",
  transition: dragging.value ? "none" : "box-shadow 0.2s, transform 0.2s",
  cursor: dragging.value ? "grabbing" : "pointer",
  userSelect: "none"
}));

function onDragStart(e: MouseEvent | TouchEvent) {
  if ((e as MouseEvent).button !== undefined && (e as MouseEvent).button !== 0)
    return;
  dragging.value = true;
  hovering.value = false;
  dragMoved = false;
  const clientX =
    "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
  const clientY =
    "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
  dragStartPos = { x: clientX, y: clientY };
  offset.value = {
    x: clientX - btnPos.value.x,
    y: clientY - btnPos.value.y
  };
  document.addEventListener("mousemove", onDragMove);
  document.addEventListener("mouseup", onDragEnd);
  document.addEventListener("touchmove", onDragMove, { passive: false });
  document.addEventListener("touchend", onDragEnd);
}

function onDragMove(e: MouseEvent | TouchEvent) {
  if (!dragging.value) return;
  const clientX =
    "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
  const clientY =
    "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
  // 判断是否超过拖动阈值
  if (
    Math.abs(clientX - dragStartPos.x) > DRAG_THRESHOLD ||
    Math.abs(clientY - dragStartPos.y) > DRAG_THRESHOLD
  ) {
    dragMoved = true;
  }
  e.preventDefault?.();
  let x = clientX - offset.value.x;
  let y = clientY - offset.value.y;
  // 限制在窗口内
  x = Math.max(10, Math.min(window.innerWidth - 70, x));
  y = Math.max(10, Math.min(window.innerHeight - 70, y));
  btnPos.value = { x, y };
}

function onDragEnd() {
  dragging.value = false;
  if (dragMoved) {
    justDragged.value = true;
    requestAnimationFrame(() => {
      justDragged.value = false;
    });
  }
  document.removeEventListener("mousemove", onDragMove);
  document.removeEventListener("mouseup", onDragEnd);
  document.removeEventListener("touchmove", onDragMove);
  document.removeEventListener("touchend", onDragEnd);
}

// Dialog控制
const addBillDialogVisible = ref(false);

async function openAddBillDialog() {
  if (dragging.value) {
    return;
  }
  if (justDragged.value) {
    return;
  }
  const defaultGroup = await getDefaultGroupId();
  if (!defaultGroup.data) {
    message("请先启用或创建分组");
    return;
  }
  defaultGroupId.value = defaultGroup.data;
  const group = await getGroupByIdApi(defaultGroupId.value);
  defaultBookId.value = group.data.defaultBookId;
  addBillDialogVisible.value = true;
}

function onAddBillSuccess() {
  addBillDialogVisible.value = false;
  // 发出账单创建成功事件，通知账单列表页面刷新
  emitter.emit("billCreated");
}

// 默认groupId/bookId
const defaultGroupId = ref<number>();
const defaultBookId = ref<number>();

// 窗口resize时修正按钮位置
onMounted(async () => {
  window.addEventListener("resize", () => {
    btnPos.value.x = Math.min(btnPos.value.x, window.innerWidth - 70);
    btnPos.value.y = Math.min(btnPos.value.y, window.innerHeight - 70);
  });
});
</script>

<style scoped>
.global-add-bill-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  user-select: none;
  background: transparent;
  border-radius: 50%;
  box-shadow: 0 4px 16px 0 rgb(64 158 255 / 18%), 0 1.5px 6px 0 rgb(0 0 0 / 8%);
  transition: box-shadow 0.2s, transform 0.2s;
}

.ball-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  cursor: pointer;
  background: linear-gradient(135deg, #4f8cff 60%, #409eff 100%);
  border-radius: 50%;
  box-shadow: 0 2px 8px 0 rgb(64 158 255 / 12%);
  transition: transform 0.18s cubic-bezier(0.4, 2, 0.6, 1), box-shadow 0.18s;
  will-change: transform;
}

.ball-inner.ball-hover {
  background: linear-gradient(135deg, #409eff 60%, #4f8cff 100%);
  box-shadow: 0 6px 24px 0 rgb(64 158 255 / 22%);
  transform: scale(1.12) rotate(-8deg);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
