<template>
  <v-dialog
    show-full-screen
    :fixed-body-height="false"
    :title="type === 'add' ? '新增账户' : '修改账户'"
    v-model="visible"
    :loading="loading"
    @confirm="handleConfirm"
    @cancel="visible = false"
    @opened="handleOpened"
  >
    <el-form :model="formData" label-width="120px" :rules="rules" ref="formRef">
      <el-row :gutter="30">
        <re-col :value="12">
          <el-form-item prop="groupId" label="所属分组">
            <el-select
              v-model="formData.groupId"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="item in groupOptions"
                :key="item.groupId"
                :label="item.groupName"
                :value="item.groupId"
              />
            </el-select>
          </el-form-item>
        </re-col>
        <re-col :value="12">
          <el-form-item prop="accountName" label="账户名称">
            <el-input
              v-model="formData.accountName"
              placeholder="请输入账户名称"
            />
          </el-form-item>
        </re-col>
      </el-row>

      <el-row :gutter="30">
        <re-col :value="12">
          <el-form-item prop="accountType" label="账户类型">
            <el-select
              v-model="formData.accountType"
              placeholder="请选择类型"
              style="width: 100%"
            >
              <el-option
                v-for="item in accountTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </re-col>
        <re-col :value="12">
          <el-form-item prop="currencyCode" label="币种">
            <el-select
              v-model="formData.currencyCode"
              placeholder="请选择"
              filterable
              style="width: 100%"
            >
              <el-option
                v-for="item in currencyOptions"
                :key="item.value"
                :label="item.label"
                :value="item.label"
              />
            </el-select>
          </el-form-item>
        </re-col>
      </el-row>
      <el-row :gutter="30">
        <re-col :value="12">
          <el-form-item prop="cardNo" label="卡号">
            <el-input v-model="formData.cardNo" placeholder="请输入卡号" />
          </el-form-item>
        </re-col>
        <re-col :value="12">
          <el-form-item prop="sort" label="顺序">
            <el-input-number
              v-model="formData.sort"
              :min="0"
              :precision="0"
              style="width: 100%"
            />
          </el-form-item>
        </re-col>
      </el-row>

      <el-row :gutter="30">
        <re-col :value="12">
          <el-form-item prop="balance" label="余额">
            <el-input-number
              v-model="formData.balance"
              :precision="2"
              style="width: 100%"
            />
          </el-form-item>
        </re-col>
        <re-col
          :value="12"
          v-if="formData.accountType === 2 || formData.accountType === 4"
        >
          <el-form-item prop="creditLimit" label="额度">
            <el-input-number
              v-model="formData.creditLimit"
              :min="0"
              :precision="2"
              style="width: 100%"
            />
          </el-form-item>
        </re-col>
      </el-row>
      <el-row
        :gutter="30"
        v-if="formData.accountType === 2 || formData.accountType === 4"
      >
        <re-col :value="12" v-if="formData.accountType === 2">
          <el-form-item prop="billDay" label="账单日">
            <el-date-picker
              v-model="formData.billDay"
              type="date"
              placeholder="选择日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
        </re-col>
        <re-col :value="12" v-if="formData.accountType === 4">
          <el-form-item prop="apr" label="利率（%）">
            <el-input-number
              v-model="formData.apr"
              :min="0"
              :precision="2"
              style="width: 100%"
            />
          </el-form-item>
        </re-col>
        <re-col :value="12">
          <el-form-item prop="repayDay" label="还款日">
            <el-date-picker
              v-model="formData.repayDay"
              type="date"
              placeholder="选择日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
        </re-col>
      </el-row>
      <el-row :gutter="30">
        <re-col :value="8">
          <el-form-item prop="include" label="计入总资产">
            <el-switch v-model="formData.include" :style="switchStyle" />
          </el-form-item>
        </re-col>
        <re-col :value="8">
          <el-form-item prop="canExpense" label="支出状态">
            <el-switch v-model="formData.canExpense" :style="switchStyle" />
          </el-form-item>
        </re-col>
        <re-col :value="8">
          <el-form-item prop="canIncome" label="收入状态">
            <el-switch v-model="formData.canIncome" :style="switchStyle" />
          </el-form-item>
        </re-col>
      </el-row>
      <el-row :gutter="30">
        <re-col :value="8">
          <el-form-item prop="enable" label="启用状态">
            <el-switch v-model="formData.enable" :style="switchStyle" />
          </el-form-item>
        </re-col>
        <re-col :value="8">
          <el-form-item prop="canTransferOut" label="转出状态">
            <el-switch v-model="formData.canTransferOut" :style="switchStyle" />
          </el-form-item>
        </re-col>
        <re-col :value="8">
          <el-form-item prop="canTransferIn" label="转入状态">
            <el-switch v-model="formData.canTransferIn" :style="switchStyle" />
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
import { usePublicHooks } from "@/views/system/hooks";
import { computed, onMounted, reactive, ref } from "vue";
import {
  AccountVo,
  addAccountApi,
  AddAccountCommand,
  modifyAccountApi,
  ModifyAccountCommand
} from "@/api/fortune/account";
import { useHook } from "@/views/fortune/account/utils/hook";
import ReCol from "@/components/ReCol";
import VDialog from "@/components/VDialog/VDialog.vue";
import { ElMessage, FormRules } from "element-plus";
import {
  getCurrencyTemplate,
  getEnableGroupList,
  GroupVo
} from "@/api/fortune/group";

const props = defineProps<{
  type: "add" | "edit";
  modelValue: boolean;
  row?: AccountVo;
}>();

const { switchStyle } = usePublicHooks();
const emits = defineEmits(["update:modelValue", "success"]);
const visible = computed({
  get: () => props.modelValue,
  set: v => emits("update:modelValue", v)
});
const loading = ref(false);
const formRef = ref();
const { accountTypeOptions } = useHook();
const currencyOptions = ref([]);
const groupOptions = ref<Array<GroupVo>>();

const formData = reactive<AddAccountCommand | ModifyAccountCommand>({
  accountId: null,
  groupId: null,
  accountName: null,
  currencyCode: "CNY",
  balance: null,
  accountType: null,
  cardNo: null,
  billDay: null,
  repayDay: null,
  canExpense: true,
  canIncome: true,
  canTransferOut: true,
  canTransferIn: true,
  include: true,
  creditLimit: null,
  enable: true,
  apr: null,
  initialBalance: null,
  sort: null,
  remark: null
});

const rules: FormRules = {
  groupId: [{ required: true, message: "所属分组不能为空" }],
  accountName: [{ required: true, message: "账户名称不能为空" }],
  accountType: [{ required: true, message: "账户名称不能为空" }],
  currencyCode: [{ required: true, message: "币种不能为空" }],
  canExpense: [{ required: true, message: "支出状态不能为空" }],
  canIncome: [{ required: true, message: "收入状态不能为空" }],
  canTransferOut: [{ required: true, message: "转出状态不能为空" }],
  canTransferIn: [{ required: true, message: "转入状态不能为空" }],
  include: [{ required: true, message: "计入净资产状态不能为空" }],
  enable: [{ required: true, message: "启用状态不能为空" }]
};

onMounted(async () => {
  const [currencyRes, groupRes] = await Promise.all([
    getCurrencyTemplate(),
    getEnableGroupList()
  ]);
  currencyOptions.value = currencyRes.data;
  groupOptions.value = groupRes.data;
});

function handleOpened() {
  if (props.row) {
    Object.assign(formData, props.row);
  } else {
    formRef.value?.resetFields();
  }
}

async function handleConfirm() {
  try {
    loading.value = true;
    if (props.type === "add") {
      await addAccountApi(formData);
    } else {
      await modifyAccountApi(formData);
    }
    ElMessage.success("操作成功");
    visible.value = false;
    emits("success");
  } catch (e) {
    ElMessage.error(e.message || "操作失败");
  } finally {
    loading.value = false;
  }
}
</script>
