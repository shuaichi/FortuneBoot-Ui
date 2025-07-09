<template>
  <v-dialog
    show-full-screen
    use-body-scrolling
    :fixed-body-height="false"
    :title="type === 'add' ? '新增周期记账规则' : '修改周期记账规则'"
    v-model="visible"
    :loading="loading"
    @confirm="handleConfirm"
    @cancel="visible = false"
    @opened="handleOpened"
  >
    <el-form :model="formData" label-width="120px" :rules="rules" ref="formRef">
      <el-row :gutter="30">
        <re-col :value="12">
          <el-form-item prop="billRequest.bookId" label="所属账本">
            <el-select
              :disabled="props.type === 'edit'"
              filterable
              v-model="formData.billRequest.bookId"
              placeholder="请选择账本"
              style="width: 100%"
              @change="handleBookOrBillTypeChange"
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
        <re-col :value="12">
          <el-form-item prop="ruleName" label="规则名称">
            <el-input v-model="formData.ruleName" placeholder="规则名称" />
          </el-form-item>
        </re-col>
      </el-row>
      <el-row :gutter="30">
        <re-col :value="12">
          <el-form-item prop="cronExpression" label="cron表达式">
            <el-input
              v-model="formData.cronExpression"
              placeholder="cron表达式"
              @blur="validateCronExpression"
            />
          </el-form-item>
        </re-col>
        <re-col :value="12">
          <el-form-item prop="startDate" label="开始日期">
            <el-date-picker
              v-model="formData.startDate"
              class="w-full"
              type="date"
              placeholder="开始日期"
              style="width: 100%"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </re-col>
      </el-row>
      <el-row :gutter="30">
        <re-col :value="12">
          <el-form-item prop="endDate" label="结束日期">
            <el-date-picker
              v-model="formData.endDate"
              class="w-full"
              type="date"
              placeholder="结束日期"
              style="width: 100%"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </re-col>
        <re-col :value="12">
          <el-form-item prop="recoveryStrategy" label="补偿策略">
            <el-select
              filterable
              v-model="formData.recoveryStrategy"
              placeholder="补偿策略"
              style="width: 100%"
              @change="handleRecoveryStrategyChange"
            >
              <el-option
                v-for="item in recoveryStrategyOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </re-col>
      </el-row>
      <el-row :gutter="30">
        <re-col :value="12">
          <el-form-item prop="maxRecoveryCount" label="最大补偿次数">
            <el-input-number
              v-model="formData.maxRecoveryCount"
              :precision="0"
              :controls="false"
              :min="0"
              :disabled="formData.recoveryStrategy !== 2"
              placeholder="请输入最大补偿次数"
              style="width: 100%"
            />
          </el-form-item>
        </re-col>
        <re-col :value="12">
          <el-form-item prop="billRequest.title" label="账单标题">
            <el-input
              v-model="formData.billRequest.title"
              placeholder="账单标题"
            />
          </el-form-item>
        </re-col>
      </el-row>
      <el-row :gutter="30">
        <re-col :value="12">
          <el-form-item prop="billRequest.billType" label="交易类型">
            <el-select
              filterable
              v-model="formData.billRequest.billType"
              placeholder="请选择类型"
              style="width: 100%"
              @change="handleBillTypeChange"
            >
              <el-option
                v-for="item in billTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </re-col>
        <re-col :value="12">
          <el-form-item
            prop="billRequest.accountId"
            :label="formData.billRequest.billType === 3 ? '转出账户' : '账户'"
          >
            <el-select
              filterable
              v-model="formData.billRequest.accountId"
              placeholder="请选择账户"
              style="width: 100%"
            >
              <el-option
                v-for="item in accountOptions"
                :key="item.accountId"
                :label="item.accountName"
                :value="item.accountId"
              />
            </el-select>
          </el-form-item>
        </re-col>
      </el-row>
      <div
        v-for="(item, index) in formData.billRequest.categoryAmountPair"
        :key="index"
        class="category-row"
      >
        <el-row :gutter="30" v-if="formData.billRequest.billType !== 3">
          <re-col :value="12">
            <el-form-item
              :prop="'billRequest.categoryAmountPair.' + index + '.amount'"
              label="金额"
              :rules="rules[`categoryAmountPair.${index}.amount`]"
            >
              <el-input-number
                v-model="item.amount"
                :precision="2"
                :controls="false"
                style="width: 100%"
              />
            </el-form-item>
          </re-col>
          <re-col :value="9">
            <el-form-item
              label="分类"
              :prop="'billRequest.categoryAmountPair.' + index + '.categoryId'"
              :rules="rules[`categoryAmountPair.${index}.categoryId`]"
            >
              <el-tree-select
                :key="
                  formData.billRequest.billType +
                  '-' +
                  index +
                  '-' +
                  categoryOptions.length +
                  '-' +
                  formData.billRequest.categoryAmountPair.length
                "
                v-model="item.categoryId"
                :data="categoryOptions"
                check-strictly
                filterable
                placeholder="请选择分类"
                style="width: 100%"
                :props="categoryTreeProps"
                clearable
              />
            </el-form-item>
          </re-col>
          <el-col :span="3" class="category-actions">
            <el-button type="text" @click="insertCategory(index)">
              添加
            </el-button>
            <el-button
              type="text"
              @click="removeCategory(index)"
              v-if="formData.billRequest.categoryAmountPair.length > 1"
            >
              删除
            </el-button>
          </el-col>
        </el-row>
      </div>

      <el-row :gutter="30">
        <re-col :value="12" v-if="formData.billRequest.billType === 3">
          <el-form-item prop="billRequest.amount" label="转出金额">
            <el-input-number
              v-model="formData.billRequest.amount"
              :precision="2"
              :controls="false"
              placeholder="请输入转出金额"
              style="width: 100%"
            />
          </el-form-item>
        </re-col>
        <re-col :value="12" v-if="formData.billRequest.billType === 3">
          <el-form-item prop="billRequest.toAccountId" label="转入账户">
            <el-select
              filterable
              v-model="formData.billRequest.toAccountId"
              placeholder="请选择转入账户"
              style="width: 100%"
            >
              <el-option
                v-for="item in toAccountOptions"
                :key="item.accountId"
                :label="item.accountName"
                :value="item.accountId"
              />
            </el-select>
          </el-form-item>
        </re-col>
        <re-col :value="12" v-if="showConvertedAmount">
          <el-form-item prop="billRequest.convertedAmount">
            <template #label>
              到账金额
              <el-tooltip
                effect="dark"
                placement="top"
                content="若不填写，系统将按汇率自动计算"
              >
                <el-icon style="margin-left: 4px; cursor: pointer">
                  <question-filled />
                </el-icon>
              </el-tooltip>
            </template>
            <el-input-number
              v-model="formData.billRequest.convertedAmount"
              :precision="2"
              :controls="false"
              style="width: 100%"
              placeholder="请输入到账金额"
            />
          </el-form-item>
        </re-col>
        <re-col :value="12">
          <el-form-item prop="billRequest.tagIdList" label="标签">
            <el-tree-select
              v-model="formData.billRequest.tagIdList"
              :data="tagOptions"
              placeholder="请选择标签"
              style="width: 100%"
              check-strictly
              filterable
              multiple
              :props="tagTreeProps"
            />
          </el-form-item>
        </re-col>
        <re-col :value="12" v-if="formData.billRequest.billType !== 3">
          <el-form-item prop="billRequest.payeeId" label="交易对象">
            <el-select
              filterable
              v-model="formData.billRequest.payeeId"
              placeholder="请选择交易对象"
              style="width: 100%"
            >
              <el-option
                v-for="item in payeeOptions"
                :key="item.payeeId"
                :label="item.payeeName"
                :value="item.payeeId"
              />
            </el-select>
          </el-form-item>
        </re-col>
      </el-row>
      <el-row :gutter="30">
        <re-col :value="8">
          <el-form-item prop="enable" label="启用状态">
            <el-switch
              v-model="formData.enable"
              active-text="启用"
              inactive-text="停用"
              inline-prompt
            />
          </el-form-item>
        </re-col>
        <re-col :value="8">
          <el-form-item prop="billRequest.confirm" label="确认状态">
            <el-switch
              v-model="formData.billRequest.confirm"
              active-text="已确认"
              inactive-text="未确认"
              inline-prompt
            />
          </el-form-item>
        </re-col>
        <re-col :value="8">
          <el-form-item prop="billRequest.include" label="统计状态">
            <el-switch
              v-model="formData.billRequest.include"
              active-text="统计"
              inactive-text="不统计"
              inline-prompt
            />
          </el-form-item>
        </re-col>
      </el-row>
      <el-row :gutter="30">
        <re-col :value="12">
          <el-form-item prop="remark" label="账单备注">
            <el-input
              type="textarea"
              v-model="formData.billRequest.remark"
              rows="5"
              placeholder="账单备注"
            />
          </el-form-item>
        </re-col>
        <re-col :value="12">
          <el-form-item prop="remark" label="规则备注">
            <el-input
              type="textarea"
              v-model="formData.remark"
              rows="5"
              placeholder="规则备注"
            />
          </el-form-item>
        </re-col>
      </el-row>
    </el-form>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessage, FormRules } from "element-plus";
import VDialog from "@/components/VDialog/VDialog.vue";
import ReCol from "@/components/ReCol";
import { BookVo, getBookById, getEnableBookList } from "@/api/fortune/book";
import { AccountVo, getEnableAccountList } from "@/api/fortune/account";
import { getEnableGroupList } from "@/api/fortune/group";
import { message } from "@/utils/message";
import { CategoryVo, getEnableCategoryList } from "@/api/fortune/category";
import { getEnablePayeeList, PayeeVo } from "@/api/fortune/payee";
import { getEnableTagList, TagVo } from "@/api/fortune/tag";
import { QuestionFilled } from "@element-plus/icons-vue";
import {
  addRecurringBillApi,
  AddRecurringBillCommand,
  checkCronExpression,
  getRecoveryStrategy,
  modifyRecurringBillApi,
  ModifyRecurringBillCommand,
  RecurringBillStrategyVo
} from "@/api/fortune/recurring-bill";

const props = defineProps<{
  type: "add" | "edit";
  modelValue: boolean;
  row?: ModifyRecurringBillCommand;
  groupId: number;
  bookId: number;
}>();

const emits = defineEmits(["update:modelValue", "success"]);
const visible = computed({
  get: () => props.modelValue,
  set: v => emits("update:modelValue", v)
});

const loading = ref<boolean>(false);
const formRef = ref();
const billTypeOptions = [
  { value: 1, label: "支出" },
  { value: 2, label: "收入" },
  { value: 3, label: "转账" }
];
const tagTreeProps = {
  label: "tagName",
  value: "tagId",
  children: "children"
};
const categoryTreeProps = {
  label: "categoryName",
  value: "categoryId",
  children: "children"
};
const formData = reactive<AddRecurringBillCommand | ModifyRecurringBillCommand>(
  {
    recoveryStrategy: 3,
    enable: true,
    billRequest: {
      billType: 1,
      confirm: true,
      include: true,
      categoryAmountPair: [{ categoryId: null, amount: null }]
    }
  }
);

const rules: FormRules = {
  ruleName: [{ required: true, message: "请输入规则名称" }],
  cronExpression: [{ required: true, message: "请输入cron表达式" }],

  "billRequest.bookId": [{ required: true, message: "请选择账本" }],
  "billRequest.billType": [{ required: true, message: "请选择交易类型" }],
  "billRequest.title": [{ required: true, message: "请输入标题" }],
  "billRequest.accountId": [
    { required: formData.billRequest.billType === 3, message: "请选择账户" }
  ],
  // 动态规则：categoryAmountPair 校验
  "billRequest.categoryAmountPair.0.categoryId": [
    {
      required: true,
      message: "请选择分类",
      trigger: "change"
    }
  ],
  "billRequest.categoryAmountPair.0.amount": [
    {
      required: true,
      message: "金额不能为空",
      trigger: "change"
    }
  ],
  "billRequest.toAccountId": [
    {
      required: true,
      message: "请选择转入账户",
      trigger: "blur",
      validator: (rule, value, callback) => {
        if (formData.billRequest.billType === 3 && !value) {
          const errorMessage =
            typeof rule.message === "function" ? rule.message() : rule.message;
          callback(new Error(errorMessage));
        } else {
          callback();
        }
      }
    }
  ]
};

// 数据选项
const bookOptions = ref<Array<BookVo>>();
const accountOptions = ref<Array<AccountVo>>();
const toAccountOptions = ref<Array<AccountVo>>();
const categoryOptions = ref<Array<CategoryVo>>([]);
const payeeOptions = ref<Array<PayeeVo>>();
const tagOptions = ref<Array<TagVo>>();
const recoveryStrategyOptions = ref<Array<RecurringBillStrategyVo>>();

onMounted(async () => {
  const [groupRes, booksRes] = await Promise.all([
    getEnableGroupList(),
    getEnableBookList(props.groupId)
  ]);
  if (groupRes.data.length === 0) {
    message("请先启用或创建分组");
    return;
  }
  if (booksRes.data.length === 0) {
    message("请先启用或创建账本");
    return;
  }
  bookOptions.value = booksRes.data;
  await initAccountOptions();
  await initRecoveryStrategy();
});
// 是否展示转入金额，当类型为转账、币种不一致时显示
const showConvertedAmount = computed(() => {
  if (formData.billRequest.billType !== 3) return false;
  const outAccount = accountOptions.value?.find(
    acc => acc.accountId === formData.billRequest.accountId
  );
  const inAccount = toAccountOptions.value?.find(
    acc => acc.accountId === formData.billRequest.toAccountId
  );
  if (!outAccount || !inAccount) return false;
  return outAccount.currencyCode !== inAccount.currencyCode;
});

async function initAccountOptions() {
  const accountsRes = await getEnableAccountList(props.groupId);
  if (!props.row || props.row.billRequest.billType === 1) {
    accountOptions.value = accountsRes.data.filter(item => item.canExpense);
  } else if (props.row.billRequest.billType === 2) {
    accountOptions.value = accountsRes.data.filter(item => item.canIncome);
  } else if (props.row.billRequest.billType === 3) {
    accountOptions.value = accountsRes.data.filter(item => item.canTransferOut);
    toAccountOptions.value = accountsRes.data.filter(
      item => item.canTransferIn
    );
  }
}

async function initRecoveryStrategy() {
  const recoveryStrategy = await getRecoveryStrategy();
  recoveryStrategyOptions.value = recoveryStrategy.data;
}

async function handleBillTypeChange(type: number) {
  const accountsRes = await getEnableAccountList(props.groupId);
  const bookRes = await getBookById(props.bookId);
  if (type === 1) {
    accountOptions.value = accountsRes.data.filter(item => item.canExpense);
    handleBookOrBillTypeChange();
    formData.billRequest.accountId = bookRes.data.defaultExpenseAccountId;
  } else if (type === 2) {
    accountOptions.value = accountsRes.data.filter(item => item.canIncome);
    handleBookOrBillTypeChange();
    formData.billRequest.accountId = bookRes.data.defaultIncomeAccountId;
  } else if (type === 3) {
    const tagRes = await getEnableTagList(
      formData.billRequest.bookId,
      formData.billRequest.billType
    );
    tagOptions.value = tagRes.data;
    accountOptions.value = accountsRes.data.filter(item => item.canTransferOut);
    toAccountOptions.value = accountsRes.data.filter(
      item => item.canTransferIn
    );
    formData.billRequest.tagIdList = [];
    formData.billRequest.categoryAmountPair = [];
    formData.billRequest.payeeId = null;
    formData.billRequest.accountId = bookRes.data.defaultTransferOutAccountId;
    formData.billRequest.toAccountId = bookRes.data.defaultTransferInAccountId;
  }
}

function handleBookOrBillTypeChange() {
  formData.billRequest.categoryAmountPair = [
    { categoryId: null, amount: null }
  ];
  formData.billRequest.payeeId = null;
  formData.billRequest.tagIdList = [];
  formData.billRequest.amount = null;
  formData.billRequest.toAccountId = null;
  handleCategoryPayeeTagRefresh();
}

function handleRecoveryStrategyChange() {
  formData.maxRecoveryCount = null;
}

async function handleCategoryPayeeTagRefresh() {
  const [categoryRes, payeeRes, tagRes] = await Promise.all([
    getEnableCategoryList(
      formData.billRequest.bookId,
      formData.billRequest.billType
    ),
    getEnablePayeeList(
      formData.billRequest.bookId,
      formData.billRequest.billType
    ),
    getEnableTagList(formData.billRequest.bookId, formData.billRequest.billType)
  ]);
  categoryOptions.value = categoryRes.data;
  payeeOptions.value = payeeRes.data;
  tagOptions.value = tagRes.data;
}

async function handleOpened() {
  if (props.row) {
    Object.assign(formData, props.row);
    const billRequestObj = JSON.parse(props.row.billRequest);
    console.log(billRequestObj.tagIdList);
    formData.billRequest = billRequestObj;
    handleCategoryPayeeTagRefresh();
  } else {
    formRef.value?.resetFields();
    formData.billRequest.bookId = props.bookId;
    const bookRes = await getBookById(props.bookId);
    formData.billRequest.accountId = bookRes.data.defaultExpenseAccountId;
    handleCategoryPayeeTagRefresh();
  }
}

function insertCategory(index: number) {
  formData.billRequest.categoryAmountPair.splice(index + 1, 0, {
    categoryId: null,
    amount: null
  });

  // 动态添加新规则
  const newIndex = index + 1;
  rules[`categoryAmountPair.${newIndex}.categoryId`] = [
    {
      required: true,
      message: "请选择分类",
      trigger: "change"
    }
  ];
  rules[`categoryAmountPair.${newIndex}.amount`] = [
    {
      required: true,
      message: "金额不能为空",
      trigger: "change"
    }
  ];
}

function removeCategory(index: number) {
  formData.billRequest.categoryAmountPair.splice(index, 1);
  // 清理对应规则
  delete rules[`categoryAmountPair.${index}.categoryId`];
  delete rules[`categoryAmountPair.${index}.amount`];

  // 重新排序后续规则
  formData.billRequest.categoryAmountPair.forEach((_, i) => {
    if (i >= index) {
      rules[`categoryAmountPair.${i}.categoryId`] =
        rules[`categoryAmountPair.${i + 1}.categoryId`];
      rules[`categoryAmountPair.${i}.amount`] =
        rules[`categoryAmountPair.${i + 1}.amount`];
    }
  });
}

async function handleConfirm() {
  try {
    await formRef.value.validate();
    loading.value = true;
    // 清理非转账类型的字段
    if (formData.billRequest.billType !== 3) {
      formData.billRequest.toAccountId = null;
    } else {
      formData.billRequest.categoryAmountPair = [];
    }
    formData.bookId = formData.billRequest.bookId;
    if (props.type === "add") {
      await addRecurringBillApi(formData);
    } else {
      formData.lastExecutedTime = null;
      formData.nextExecutionTime = null;
      formData.lastRecoveryCheck = null;
      await modifyRecurringBillApi(formData);
    }

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

// 添加 cron 表达式校验函数
async function validateCronExpression() {
  if (!formData.cronExpression) {
    ElMessage.warning("请输入cron表达式");
    return;
  }
  // 后端接口校验cron表达式
  const checkCronRes = await checkCronExpression(formData.cronExpression);
  if (!checkCronRes.data) {
    ElMessage.warning("cron表达式格式不正确");
  }
}
</script>
