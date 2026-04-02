<script setup lang="ts">
import { useUserStoreHook } from "@/store/modules/user";
import { OperationLogDTO } from "@/api/system/log";

/** TODO 有其他方式  来换掉这个props 父子组件传值吗？ */
const props = defineProps<OperationLogDTO>();

const operationLogStatusMap =
  useUserStoreHook().dictionaryMap["sysOperationLog.status"];

/**
 * 格式化JSON字符串
 * @param str 可能是JSON的字符串
 * @returns 格式化后的JSON字符串或原始字符串
 */
const formatJson = (str: string | undefined | null): string => {
  if (!str) return "";
  try {
    const parsed = JSON.parse(str);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return str;
  }
};
</script>

<template>
  <el-descriptions
    direction="horizontal"
    :column="2"
    :labelStyle="'white-space:nowrap;'"
    :contentStyle="'word-break:break-all;'"
    :size="'large'"
  >
    <!-- 开头前两列设置宽度 -->
    <el-descriptions-item label="操作编号:" :width="'25%'">{{
      props.operationId
    }}</el-descriptions-item>
    <el-descriptions-item label="请求模块:" :width="'25%'">{{
      props.requestModule
    }}</el-descriptions-item>
    <el-descriptions-item :span="2" label="操作类型:">{{
      props.businessTypeStr
    }}</el-descriptions-item>
    <el-descriptions-item label="操作人:">{{
      props.username
    }}</el-descriptions-item>
    <el-descriptions-item label="操作人ID:">{{
      props.userId
    }}</el-descriptions-item>
    <el-descriptions-item label="操作人类型:">{{
      props.operatorTypeStr
    }}</el-descriptions-item>
    <el-descriptions-item label="操作人IP:">{{
      props.operatorIp
    }}</el-descriptions-item>
    <el-descriptions-item :span="2" label="操作人地址:">{{
      props.operatorLocation
    }}</el-descriptions-item>

    <el-descriptions-item label="请求链接:">{{
      props.requestUrl
    }}</el-descriptions-item>
    <el-descriptions-item label="请求方式:">{{
      props.requestMethod
    }}</el-descriptions-item>
    <el-descriptions-item :span="2" label="请求参数:">
      <!-- JSON格式化展示，使用pre标签保留格式 -->
      <pre class="json-content">{{ formatJson(props.operationParam) }}</pre>
    </el-descriptions-item>
    <el-descriptions-item :span="2" label="调用方法:">
      <el-text>
        {{ props.calledMethod }}
      </el-text>
    </el-descriptions-item>
    <el-descriptions-item :span="2" label="返回结果:">
      <!-- JSON格式化展示，使用pre标签保留格式 -->
      <pre class="json-content">{{ formatJson(props.operationResult) }}</pre>
    </el-descriptions-item>
    <el-descriptions-item :span="2" label="错误详情:">
      <el-text>
        {{ props.errorStack }}
      </el-text>
    </el-descriptions-item>
    <el-descriptions-item label="状态:"
      ><el-tag
        :type="operationLogStatusMap[props.status].cssTag"
        effect="plain"
      >
        {{ operationLogStatusMap[props.status].label }}
      </el-tag></el-descriptions-item
    >
    <el-descriptions-item label="操作时间:">{{
      props.operationTime
    }}</el-descriptions-item>
  </el-descriptions>
</template>
<style>
.el-descriptions {
  margin-top: 20px;
}

.json-content {
  max-height: 400px;
  padding: 12px;
  margin: 0;
  overflow-y: auto;
  font-family: "Courier New", Courier, monospace;
  font-size: 13px;
  line-height: 1.5;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  background-color: #f5f7fa;
  border-radius: 4px;
}
</style>
