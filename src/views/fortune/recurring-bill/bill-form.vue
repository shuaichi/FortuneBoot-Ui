<template>
  <v-dialog
    show-full-screen
    use-body-scrolling
    :fixed-body-height="false"
    :title="type === 'add' ? '新增账单' : '修改账单'"
    v-model="visible"
    :loading="loading"
    @confirm="handleConfirm"
    @cancel="visible = false"
    @opened="handleOpened"
  >
    <el-form :model="formData" label-width="120px" :rules="rules" ref="formRef">
      <el-row :gutter="30">
        <re-col :value="12">
          <el-form-item prop="bookId" label="所属账本">
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
          <el-form-item prop="billType" label="交易类型">
            <el-select
              :disabled="props.type === 'edit'"
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
      </el-row>

      <el-row :gutter="30">
        <re-col :value="24">
          <el-form-item prop="title" label="标题">
            <el-input
              v-model="formData.billRequest.title"
              placeholder="请输入标题"
            />
          </el-form-item>
        </re-col>
      </el-row>

      <el-row :gutter="30">
        <re-col :value="12">
          <el-form-item
            prop="accountId"
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
              :prop="'categoryAmountPair.' + index + '.amount'"
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
              :prop="'categoryAmountPair.' + index + '.categoryId'"
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
          <el-form-item prop="amount" label="转出金额">
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
          <el-form-item prop="toAccountId" label="转入账户">
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
          <el-form-item prop="convertedAmount">
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
          <el-form-item prop="tagIdList" label="标签">
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
          <el-form-item prop="payeeId" label="交易对象">
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
        <re-col :value="12">
          <el-form-item prop="confirm" label="确认状态">
            <el-switch
              v-model="formData.billRequest.confirm"
              active-text="已确认"
              inactive-text="未确认"
              inline-prompt
            />
          </el-form-item>
        </re-col>
        <re-col :value="12">
          <el-form-item prop="include" label="统计状态">
            <el-switch
              v-model="formData.billRequest.include"
              active-text="统计"
              inactive-text="不统计"
              inline-prompt
            />
          </el-form-item>
        </re-col>
      </el-row>

      <el-form-item prop="remark" label="备注">
        <el-input
          type="textarea"
          v-model="formData.billRequest.remark"
          rows="4"
          placeholder="请输入备注"
        />
      </el-form-item>
    </el-form>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessage, FormRules } from "element-plus";
import VDialog from "@/components/VDialog/VDialog.vue";
import ReCol from "@/components/ReCol";
import { BillVo } from "@/api/fortune/bill";
import { BookVo, getBookById, getEnableBookList } from "@/api/fortune/book";
import { AccountVo, getEnableAccountList } from "@/api/fortune/account";
import { getEnableGroupList } from "@/api/fortune/group";
import { message } from "@/utils/message";
import { CategoryVo, getEnableCategoryList } from "@/api/fortune/category";
import { getEnablePayeeList, PayeeVo } from "@/api/fortune/payee";
import { getEnableTagList, TagVo } from "@/api/fortune/tag";
import dayjs from "dayjs";
import { QuestionFilled } from "@element-plus/icons-vue";
import { AddRecurringBillCommand } from "@/api/fortune/recurring-bill";

const props = defineProps<{
  type: "add" | "edit";
  modelValue: boolean;
  row?: BillVo;
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
const formData = reactive<AddRecurringBillCommand>({
  billRequest: {
    billType: 1,
    confirm: true,
    include: true,
    categoryAmountPair: [{ categoryId: null, amount: null }]
  }
});

const rules: FormRules = {
  bookId: [{ required: true, message: "请选择账本" }],
  billType: [{ required: true, message: "请选择交易类型" }],
  title: [{ required: true, message: "请输入标题" }],
  tradeTime: [{ required: true, message: "请选择交易时间" }],
  accountId: [
    { required: formData.billRequest.billType === 3, message: "请选择账户" }
  ],
  // 动态规则：categoryAmountPair 校验
  "categoryAmountPair.0.categoryId": [
    {
      required: true,
      message: "请选择分类",
      trigger: "change"
    }
  ],
  "categoryAmountPair.0.amount": [
    {
      required: true,
      message: "金额不能为空",
      trigger: "change"
    }
  ],
  toAccountId: [
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
  if (!props.row || props.row.billType === 1) {
    accountOptions.value = accountsRes.data.filter(item => item.canExpense);
  } else if (props.row.billType === 2) {
    accountOptions.value = accountsRes.data.filter(item => item.canIncome);
  } else if (props.row.billType === 3) {
    accountOptions.value = accountsRes.data.filter(item => item.canTransferOut);
    toAccountOptions.value = accountsRes.data.filter(
      item => item.canTransferIn
    );
  }
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
    // formData.billRequest.tagIdList = billRequestObj.tagIdList
    //   ? billRequestObj.tagIdList.map((item: any) => item.tagId)
    //   : [];
    handleCategoryPayeeTagRefresh();
  } else {
    formRef.value?.resetFields();
    formData.billRequest.bookId = props.bookId;
    // 设置默认交易时间为当前时间
    formData.billRequest.tradeTime = dayjs(new Date()).format(
      "YYYY-MM-DD HH:mm:ss"
    );
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
    if (props.type === "add") {
      // await addBillApi(formDataObj);
    } else {
      // await modifyBillApi(formDataObj);
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
</script>
