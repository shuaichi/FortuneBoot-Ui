<template>
  <div class="full-width-container">
    <el-radio-group
      v-model="recycleBinType"
      size="large"
      class="fortune-full-width-group"
    >
      <el-radio-button :label="1">账 户</el-radio-button>
      <el-radio-button :label="2">账 本</el-radio-button>
      <el-radio-button :label="3">分 类</el-radio-button>
      <el-radio-button :label="4">标 签</el-radio-button>
      <el-radio-button :label="5">交 易 对 象</el-radio-button>
      <el-radio-button :label="6">成 员</el-radio-button>
    </el-radio-group>

    <account-recycle v-if="recycleBinType === 1" />

    <book-recycle v-if="recycleBinType === 2" />

    <category-recycle v-if="recycleBinType === 3" />

    <tag-recycle v-if="recycleBinType === 4" />

    <payee-recycle v-if="recycleBinType === 5" />

    <member-recycle v-if="recycleBinType === 6" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import AccountRecycle from "./components/AccountRecycle.vue";
import BookRecycle from "./components/BookRecycle.vue";
import CategoryRecycle from "@/views/fortune/recycle-bin/components/CategoryRecycle.vue";
import TagRecycle from "@/views/fortune/recycle-bin/components/TagRecycle.vue";
import PayeeRecycle from "@/views/fortune/recycle-bin/components/PayeeRecycle.vue";
import MemberRecycle from "@/views/fortune/recycle-bin/components/MemberRecycle.vue";

/** 组件name最好和菜单表中的router_name一致 */
defineOptions({
  name: "FortuneRecycleBin"
});

const recycleBinType = ref(1);
</script>

<style scoped>
.full-width-container {
  width: 100%;
}
</style>
