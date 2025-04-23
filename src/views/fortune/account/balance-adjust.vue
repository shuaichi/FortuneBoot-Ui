<template>
  <v-dialog
    show-full-screen
    :fixed-body-height="false"
    title="余额调整"
    v-model="visible"
    :loading="loading"
    @confirm="handleConfirm"
    @cancel="visible = false"
    @opened="handleOpened"
    width="480px"
  >
    <el-form :model="formData" label-width="120px" :rules="rules" ref="formRef">
      <el-row :gutter="30">
        <re-col :value="24">
          <el-form-item prop="bookId" label="账本" required>
            <el-select
              filterable
              v-model="formData.bookId"
              placeholder="请选择账本"
              style="width: 100%"
            >
              <el-option
                v-for="item in bookOptions"
                :key="item.bookId"
                :label="item.bookName"
                :value="item.bookId"
              />
            </el-select>
          </el-form-item>
        </re-col>
      </el-row>
      <el-row :gutter="30">
        <re-col :value="24">
          <el-form-item prop="title" label="标题">
            <el-input v-model="formData.title" placeholder="请输入标题" />
          </el-form-item>
        </re-col>
      </el-row>
      <el-row :gutter="30">
        <re-col :value="24">
          <el-form-item prop="tradeTime" label="时间" required>
            <el-date-picker
              v-model="formData.tradeTime"
              type="datetime"
              placeholder="选择日期时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
            />
          </el-form-item>
        </re-col>
      </el-row>
      <el-row :gutter="30">
        <re-col :value="24">
          <el-form-item prop="balance" label="金额" required>
            <el-input-number
              v-model="formData.balance"
              :precision="2"
              :controls="false"
              style="width: 100%"
            />
          </el-form-item>
        </re-col>
      </el-row>
      <el-form-item prop="remark" label="备注">
        <el-input
          type="textarea"
          v-model="formData.remark"
          rows="4"
          placeholder="请输入备注"
        />
      </el-form-item>
    </el-form>
  </v-dialog>
</template>
<script setup lang="ts">
import VDialog from "@/components/VDialog/VDialog.vue";
import ReCol from "@/components/ReCol";
import { computed, reactive, ref } from "vue";
import {
  AccountVo,
  balanceAdjustApi,
  BalanceAdjustCommand
} from "@/api/fortune/account";
import { ElMessage, FormRules } from "element-plus";
import { getGroupByIdApi } from "@/api/fortune/group";
import { BookVo, getEnableBookList } from "@/api/fortune/book";
import dayjs from "dayjs";

const loading = ref<boolean>(false);
const bookOptions = ref<Array<BookVo>>();
const formData = reactive<BalanceAdjustCommand>({});
const props = defineProps<{
  modelValue: boolean;
  row?: AccountVo;
}>();

const emits = defineEmits(["update:modelValue", "success"]);
const visible = computed({
  get: () => props.modelValue,
  set: v => emits("update:modelValue", v)
});
const rules: FormRules = {
  bookId: [{ required: true, message: "请选择账本" }],
  balance: [{ required: true, message: "请输入余额" }],
  tradeDate: [{ required: true, message: "请选择时间" }]
};
async function handleOpened() {
  formData.accountId = props.row.accountId;
  formData.balance = props.row.balance;
  formData.tradeTime = dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss");
  const [group, bookRes] = await Promise.all([
    getGroupByIdApi(props.row.groupId),
    getEnableBookList(props.row.groupId)
  ]);
  formData.bookId = group.data.defaultBookId;
  bookOptions.value = bookRes.data;
}

async function handleConfirm() {
  try {
    loading.value = true;
    await balanceAdjustApi(formData);
    ElMessage.success("操作成功");
    visible.value = false;
    emits("success");
  } catch (e) {
    if (!e.message.includes("validate")) {
      ElMessage.error(e.message || "操作失败");
    }
  } finally {
    loading.value = false;
  }
}
</script>
