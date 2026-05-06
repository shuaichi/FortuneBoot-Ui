<template>
  <v-dialog
    v-model="visible"
    show-full-screen
    use-body-scrolling
    :fixed-body-height="false"
    :title="type === 'add' ? '新增账单' : '修改账单'"
    :loading="loading"
    @confirm="handleConfirm"
    @cancel="visible = false"
    @opened="handleOpened"
  >
    <el-form ref="formRef" :model="formData" label-width="120px" :rules="rules">
      <el-row :gutter="30">
        <re-col :value="12">
          <el-form-item prop="bookId" label="所属账本">
            <el-select
              v-model="formData.bookId"
              :disabled="props.type === 'edit'"
              filterable
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
              v-model="formData.billType"
              :disabled="props.type === 'edit'"
              filterable
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
        <re-col
          v-if="formData.billType !== 7 && formData.billType !== 8"
          :value="24"
        >
          <el-form-item prop="title" label="标题">
            <el-input v-model="formData.title" placeholder="请输入标题" />
          </el-form-item>
        </re-col>
        <re-col
          v-if="formData.billType === 7 || formData.billType === 8"
          :value="12"
        >
          <el-form-item prop="title" label="标题">
            <el-input v-model="formData.title" placeholder="请输入标题" />
          </el-form-item>
        </re-col>
        <re-col
          v-if="formData.billType === 7 || formData.billType === 8"
          :value="12"
        >
          <el-form-item
            prop="orderId"
            label="单据"
            :required="formData.billType === 7 || formData.billType === 8"
          >
            <el-select
              v-model="formData.orderId"
              filterable
              placeholder="请选择单据"
              style="width: 100%"
              clearable
            >
              <el-option
                v-for="item in financeOrderOptions"
                :key="item.orderId"
                :label="item.title"
                :value="item.orderId"
              />
            </el-select>
          </el-form-item>
        </re-col>
      </el-row>

      <el-row :gutter="30">
        <re-col :value="12">
          <el-form-item prop="tradeTime" label="交易时间">
            <el-date-picker
              v-model="formData.tradeTime"
              type="datetime"
              placeholder="选择日期时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
            />
          </el-form-item>
        </re-col>
        <re-col :value="12">
          <el-form-item
            prop="accountId"
            :label="formData.billType === 3 ? '转出账户' : '账户'"
            :required="formData.billType === 3"
          >
            <el-select
              v-model="formData.accountId"
              filterable
              placeholder="请选择账户"
              style="width: 100%"
              clearable
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
        v-for="(item, index) in formData.categoryAmountPair"
        :key="index"
        class="category-row"
      >
        <el-row v-if="formData.billType !== 3" :gutter="30">
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
                  formData.billType +
                  '-' +
                  index +
                  '-' +
                  categoryOptions.length +
                  '-' +
                  formData.categoryAmountPair.length
                "
                v-model="item.categoryId"
                :data="categoryOptions"
                check-strictly
                filterable
                placeholder="请选择分类"
                style="width: 100%"
                :props="categoryTreeProps"
                clearable
                node-key="categoryId"
                :filter-node-method="filterNodeMethod('categoryName')"
              />
            </el-form-item>
          </re-col>
          <el-col :span="3" class="category-actions">
            <el-button type="text" @click="insertCategory(index)">
              添加
            </el-button>
            <el-button
              v-if="formData.categoryAmountPair.length > 1"
              type="text"
              @click="removeCategory(index)"
            >
              删除
            </el-button>
          </el-col>
        </el-row>

        <!-- 附加费用/优惠（关联到当前分类金额组） -->
        <el-form-item
          v-if="formData.billType !== 3"
          label=" "
          class="extra-form-item"
        >
          <div class="extra-panel">
            <div class="extra-actions">
              <button
                type="button"
                class="extra-add-btn extra-add-btn--fee"
                @click="handleAddExtra(1, item.categoryId)"
              >
                <span class="extra-add-btn__plus">+</span>
                手续费
              </button>
              <button
                type="button"
                class="extra-add-btn extra-add-btn--discount"
                @click="handleAddExtra(2, item.categoryId)"
              >
                <span class="extra-add-btn__plus">+</span>
                优惠
              </button>
            </div>
            <div
              v-for="extraIdx in getExtraIndexesByCategory(item.categoryId)"
              :key="extraIdx"
              :class="[
                'extra-row',
                formData.extras[extraIdx].extraType === 1
                  ? 'extra-row--fee'
                  : 'extra-row--discount'
              ]"
            >
              <span
                :class="[
                  'extra-chip',
                  formData.extras[extraIdx].extraType === 1
                    ? 'extra-chip--fee'
                    : 'extra-chip--discount'
                ]"
              >
                {{
                  formData.extras[extraIdx].extraType === 1 ? "手续费" : "优惠"
                }}
              </span>
              <el-input-number
                v-model="formData.extras[extraIdx].amount"
                :precision="2"
                :controls="false"
                placeholder="金额"
                class="extra-amount"
              />
              <el-input
                v-model="formData.extras[extraIdx].remark"
                placeholder="备注（选填）"
                class="extra-remark"
              />
              <el-button
                type="danger"
                size="small"
                link
                class="extra-remove-btn"
                @click="removeExtra(extraIdx)"
              >
                删除
              </el-button>
            </div>
          </div>
        </el-form-item>
      </div>

      <el-row :gutter="30">
        <re-col v-if="formData.billType === 3" :value="12">
          <el-form-item prop="amount" label="转出金额">
            <el-input-number
              v-model="formData.amount"
              :precision="2"
              :controls="false"
              placeholder="请输入转出金额"
              style="width: 100%"
            />
          </el-form-item>
        </re-col>
        <re-col v-if="formData.billType === 3" :value="12">
          <el-form-item prop="toAccountId" label="转入账户">
            <el-select
              v-model="formData.toAccountId"
              filterable
              placeholder="请选择转入账户"
              style="width: 100%"
              clearable
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
        <re-col v-if="showConvertedAmount" :value="12">
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
              v-model="formData.convertedAmount"
              :precision="2"
              :controls="false"
              style="width: 100%"
              placeholder="请输入到账金额"
              clearable
            />
          </el-form-item>
        </re-col>
        <re-col :value="12">
          <el-form-item prop="tagIdList" label="标签">
            <el-tree-select
              v-model="formData.tagIdList"
              :data="tagOptions"
              placeholder="请选择标签"
              style="width: 100%"
              check-strictly
              filterable
              multiple
              clearable
              :props="tagTreeProps"
              node-key="tagId"
              :filter-node-method="filterNodeMethod('tagName')"
            />
          </el-form-item>
        </re-col>
        <re-col v-if="formData.billType !== 3" :value="12">
          <el-form-item prop="payeeId" label="交易对象">
            <el-select
              v-model="formData.payeeId"
              filterable
              placeholder="请选择交易对象"
              clearable
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
        <!-- 加入成员的选择 -->
        <re-col v-if="formData.billType !== 3" :value="12">
          <el-form-item prop="memberIdList" label="成员">
            <el-select
              v-model="formData.memberIdList"
              filterable
              multiple
              placeholder="请选择成员"
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="item in memberOptions"
                :key="item.memberId"
                :label="item.memberName"
                :value="item.memberId"
              />
            </el-select>
          </el-form-item>
        </re-col>
      </el-row>
      <el-row :gutter="30">
        <re-col :value="12">
          <el-form-item prop="confirm" label="确认状态">
            <el-switch
              v-model="formData.confirm"
              active-text="已确认"
              inactive-text="未确认"
              inline-prompt
            />
          </el-form-item>
        </re-col>
        <re-col :value="12">
          <el-form-item prop="include" label="统计状态">
            <el-switch
              v-model="formData.include"
              active-text="统计"
              inactive-text="不统计"
              inline-prompt
            />
          </el-form-item>
        </re-col>
      </el-row>

      <!-- 转账场景：附加费用/优惠（无分类，须选择账户方向） -->
      <el-form-item
        v-if="formData.billType === 3"
        label=" "
        class="extra-form-item"
      >
        <div class="extra-panel">
          <div class="extra-actions">
            <button
              type="button"
              class="extra-add-btn extra-add-btn--fee"
              @click="addExtra(1, null)"
            >
              <span class="extra-add-btn__plus">+</span>
              手续费
            </button>
            <button
              type="button"
              class="extra-add-btn extra-add-btn--discount"
              @click="addExtra(2, null)"
            >
              <span class="extra-add-btn__plus">+</span>
              优惠
            </button>
          </div>
          <div
            v-for="idx in getExtraIndexesByCategory(null)"
            :key="idx"
            :class="[
              'extra-row',
              formData.extras[idx].extraType === 1
                ? 'extra-row--fee'
                : 'extra-row--discount'
            ]"
          >
            <span
              :class="[
                'extra-chip',
                formData.extras[idx].extraType === 1
                  ? 'extra-chip--fee'
                  : 'extra-chip--discount'
              ]"
            >
              {{ formData.extras[idx].extraType === 1 ? "手续费" : "优惠" }}
            </span>
            <el-input-number
              v-model="formData.extras[idx].amount"
              :precision="2"
              :controls="false"
              placeholder="金额"
              class="extra-amount"
            />
            <el-select
              v-model="formData.extras[idx].accountSide"
              placeholder="账户方向"
              class="extra-side"
            >
              <el-option
                v-for="opt in accountSideOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
            <el-input
              v-model="formData.extras[idx].remark"
              placeholder="备注（选填）"
              class="extra-remark"
            />
            <el-button
              type="danger"
              size="small"
              link
              class="extra-remove-btn"
              @click="removeExtra(idx)"
            >
              删除
            </el-button>
          </div>
        </div>
      </el-form-item>

      <el-form-item prop="remark" label="备注">
        <el-input
          v-model="formData.remark"
          type="textarea"
          rows="4"
          placeholder="请输入备注"
        />
      </el-form-item>
      <!-- 新增附件上传部分 -->
      <el-form-item prop="fileList" label="附件">
        <el-upload
          multiple
          :auto-upload="false"
          list-type="picture"
          :on-change="handleFileChange"
          :on-remove="handleFileRemove"
          :file-list="fileListDisplay"
          :on-preview="handleFilePreview"
        >
          <el-icon>
            <plus-icon />
          </el-icon>
        </el-upload>
      </el-form-item>
    </el-form>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { FormRules } from "element-plus";
import VDialog from "@/components/VDialog/VDialog.vue";
import ReCol from "@/components/ReCol";
import {
  addBillApi,
  AddBillCommand,
  BillVo,
  modifyBillApi,
  ModifyBillCommand
} from "@/api/fortune/bill";
import { BookVo, getBookById, getEnableBookList } from "@/api/fortune/book";
import { AccountVo, getEnableAccountList } from "@/api/fortune/account";
import { getEnableGroupList } from "@/api/fortune/group";
import { message } from "@/utils/message";
import { CategoryVo, getEnableCategoryList } from "@/api/fortune/category";
import { getEnablePayeeList, PayeeVo } from "@/api/fortune/payee";
import { getEnableTagList, TagVo } from "@/api/fortune/tag";
import { getEnableMemberList, MemberVo } from "@/api/fortune/member";
import { Plus as PlusIcon } from "@element-plus/icons-vue";
import { getFileByBillId } from "@/api/fortune/file";
import dayjs from "dayjs";
import { QuestionFilled } from "@element-plus/icons-vue";
import {
  FinanceOrderVo,
  getUsingFinanceOrderApi
} from "@/api/fortune/finance-order";
import {
  filterNodeMethod,
  categoryTreeProps,
  tagTreeProps
} from "./utils/helper";

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
  { value: 3, label: "转账" },
  { value: 7, label: "垫付" },
  { value: 8, label: "报销" }
];

const formData = reactive<AddBillCommand | ModifyBillCommand>({
  billType: 1,
  confirm: true,
  include: true,
  categoryAmountPair: [{ categoryId: null, amount: null }],
  extras: []
});

const rules: FormRules = {
  bookId: [{ required: true, message: "请选择账本" }],
  billType: [{ required: true, message: "请选择交易类型" }],
  title: [{ required: true, message: "请输入标题" }],
  tradeTime: [{ required: true, message: "请选择交易时间" }],
  orderId: [
    {
      message: "请选择单据",
      trigger: "change",
      validator: (rule, value, callback) => {
        if ((formData.billType === 7 || formData.billType === 8) && !value) {
          callback(new Error(rule.message as string));
        } else {
          callback();
        }
      }
    }
  ],
  accountId: [
    {
      message: "请选择账户",
      trigger: "change",
      validator: (rule, value, callback) => {
        if (formData.billType === 3 && !value) {
          callback(new Error(rule.message as string));
        } else {
          callback();
        }
      }
    }
  ],

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
        if (formData.billType === 3 && !value) {
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
const memberOptions = ref<Array<MemberVo>>();
const fileList = ref([]);
const financeOrderOptions = ref(Array<FinanceOrderVo>());
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

const showConvertedAmount = computed(() => {
  if (formData.billType !== 3) {
    return false;
  }
  const outAccount = accountOptions.value?.find(
    acc => acc.accountId === formData.accountId
  );
  const inAccount = toAccountOptions.value?.find(
    acc => acc.accountId === formData.toAccountId
  );
  if (!outAccount || !inAccount) {
    return false;
  }
  return outAccount.currencyCode !== inAccount.currencyCode;
});

async function initAccountOptions() {
  const accountsRes = await getEnableAccountList(props.groupId);
  if (!props.row || props.row.billType === 1 || props.row.billType === 7) {
    accountOptions.value = accountsRes.data.filter(item => item.canExpense);
  } else if (props.row.billType === 2 || props.row.billType === 8) {
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
    formData.accountId = bookRes.data.defaultExpenseAccountId;
  } else if (type === 2) {
    accountOptions.value = accountsRes.data.filter(item => item.canIncome);
    handleBookOrBillTypeChange();
    formData.accountId = bookRes.data.defaultIncomeAccountId;
  } else if (type === 3) {
    const tagRes = await getEnableTagList(formData.bookId, formData.billType);
    tagOptions.value = tagRes.data;
    accountOptions.value = accountsRes.data.filter(item => item.canTransferOut);
    toAccountOptions.value = accountsRes.data.filter(
      item => item.canTransferIn
    );
    formData.tagIdList = [];
    formData.memberIdList = [];
    formData.categoryAmountPair = [];
    formData.payeeId = null;
    formData.extras = [];
    formData.accountId = bookRes.data.defaultTransferOutAccountId;
    formData.toAccountId = bookRes.data.defaultTransferInAccountId;
  } else if (type === 7) {
    accountOptions.value = accountsRes.data.filter(item => item.canExpense);
    handleBookOrBillTypeChange();
    formData.accountId = bookRes.data.defaultExpenseAccountId;
  } else if (type === 8) {
    accountOptions.value = accountsRes.data.filter(item => item.canIncome);
    handleBookOrBillTypeChange();
    formData.accountId = bookRes.data.defaultIncomeAccountId;
  }
}

async function handleBookOrBillTypeChange() {
  formData.categoryAmountPair = [{ categoryId: null, amount: null }];
  formData.payeeId = null;
  formData.tagIdList = [];
  formData.memberIdList = [];
  formData.amount = null;
  formData.toAccountId = null;
  formData.orderId = null;
  formData.extras = [];
  categoryOptions.value = [];
  payeeOptions.value = [];
  tagOptions.value = [];
  memberOptions.value = [];
  handleCategoryPayeeTagRefresh();
  const financeOrderRes = await getUsingFinanceOrderApi(formData.bookId);
  financeOrderOptions.value = financeOrderRes.data;
}

async function handleCategoryPayeeTagRefresh() {
  let billType = formData.billType;
  if (formData.billType === 7) {
    billType = 1;
  } else if (formData.billType === 8) {
    billType = 2;
  }
  const [categoryRes, payeeRes, tagRes, memberRes] = await Promise.all([
    getEnableCategoryList(formData.bookId, billType),
    getEnablePayeeList(formData.bookId, billType),
    getEnableTagList(formData.bookId, billType),
    getEnableMemberList(formData.bookId)
  ]);
  categoryOptions.value = categoryRes.data;
  payeeOptions.value = payeeRes.data;
  tagOptions.value = tagRes.data;
  memberOptions.value = memberRes.data;
}

async function handleOpened() {
  if (props.row) {
    Object.assign(formData, props.row);
    formData.tagIdList = props.row.tagList
      ? props.row.tagList.map(item => item.tagId)
      : [];
    formData.memberIdList = props.row.memberList
      ? props.row.memberList.map(item => item.memberId)
      : [];
    // 不可变：创建新数组副本，避免修改原始 row.extras
    formData.extras = props.row.extras
      ? props.row.extras.map(e => ({ ...e }))
      : [];
    handleCategoryPayeeTagRefresh();
    const financeOrderRes = await getUsingFinanceOrderApi(formData.bookId);
    financeOrderOptions.value = financeOrderRes.data;
    const fileRes = await getFileByBillId(props.row.billId);
    fileList.value = fileRes.data.map(file => ({
      uid: file.fileId,
      name: file.originalName,
      size: file.size,
      url: URL.createObjectURL(handleFile2Blob(file)),
      raw: new File([handleFile2Blob(file)], file.originalName, {
        type: file.contentType
      }),
      status: "success",
      type: file.contentType,
      isExisting: true
    }));
  } else {
    formRef.value?.resetFields();
    formData.bookId = props.bookId;
    formData.tradeTime = dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss");
    formData.memberIdList = [];
    formData.extras = [];
    const bookRes = await getBookById(props.bookId);
    formData.accountId = bookRes.data.defaultExpenseAccountId;
    handleCategoryPayeeTagRefresh();
  }
}

function handleFile2Blob(file: any) {
  const byteCharacters = atob(file.fileData);
  const byteArrays = [];
  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = Array.from(slice, char => char.charCodeAt(0));
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  return new Blob(byteArrays, { type: file.contentType });
}

const handleFilePreview = async (file: any) => {
  const originalFile = fileList.value.find(f => f.uid === file.uid);
  if (!originalFile) return;

  if (isImageFile(file.name)) {
    window.open(originalFile.url, "_blank");
  } else {
    const a = document.createElement("a");
    a.href = originalFile.url;
    a.download = file.name || originalFile.url.split("/").pop();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};

function insertCategory(index: number) {
  formData.categoryAmountPair.splice(index + 1, 0, {
    categoryId: null,
    amount: null
  });

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
  // 先记录将被删除分类对应的 categoryId，再清理同分类下的附加项
  const removedCategoryId =
    formData.categoryAmountPair[index]?.categoryId ?? null;
  formData.categoryAmountPair.splice(index, 1);
  if (removedCategoryId != null) {
    formData.extras = (formData.extras ?? []).filter(
      e => e.categoryId !== removedCategoryId
    );
  }
  delete rules[`categoryAmountPair.${index}.categoryId`];
  delete rules[`categoryAmountPair.${index}.amount`];

  formData.categoryAmountPair.forEach((_, i) => {
    if (i >= index) {
      rules[`categoryAmountPair.${i}.categoryId`] =
        rules[`categoryAmountPair.${i + 1}.categoryId`];
      rules[`categoryAmountPair.${i}.amount`] =
        rules[`categoryAmountPair.${i + 1}.amount`];
    }
  });

  const lastIndex = formData.categoryAmountPair.length;
  delete rules[`categoryAmountPair.${lastIndex}.categoryId`];
  delete rules[`categoryAmountPair.${lastIndex}.amount`];
}

// 附加项常量
const ACCOUNT_SIDE = { FROM: 1, TO: 2 } as const;
const accountSideOptions = [
  { label: "转出账户", value: ACCOUNT_SIDE.FROM },
  { label: "转入账户", value: ACCOUNT_SIDE.TO }
];

/**
 * 添加一条附加费用/优惠
 * @param extraType 1=手续费，2=优惠
 * @param categoryId 关联的分类ID（来自 categoryAmountPair 行；转账场景为 null）
 */
function addExtra(extraType: 1 | 2, categoryId: number | null) {
  // 不可变：创建新数组并附加新对象
  const next = [
    ...(formData.extras ?? []),
    {
      extraType,
      amount: null,
      accountSide: ACCOUNT_SIDE.FROM,
      categoryId,
      remark: ""
    }
  ];
  formData.extras = next;
}

/**
 * 分类金额组行内"添加手续费/优惠"按钮处理器。
 * 若该行尚未选分类，则提示用户先选分类；否则追加一条附加项。
 */
function handleAddExtra(extraType: 1 | 2, categoryId: number | null) {
  if (categoryId == null) {
    message("请先选择分类后，再添加手续费/优惠", { type: "warning" });
    return;
  }
  addExtra(extraType, categoryId);
}

function removeExtra(index: number) {
  // 不可变：返回不包含该索引的新数组
  formData.extras = (formData.extras ?? []).filter((_, i) => i !== index);
}

/** 获取属于指定分类的附加项的真实索引列表（在 formData.extras 中的索引） */
function getExtraIndexesByCategory(categoryId: number | null): number[] {
  const list = formData.extras ?? [];
  return list.reduce<number[]>((acc, extra, i) => {
    if ((extra.categoryId ?? null) === (categoryId ?? null)) {
      acc.push(i);
    }
    return acc;
  }, []);
}

/**
 * 提交前清理 extras：
 * - 过滤掉 amount 为空或 <= 0 的无效项
 * - 非转账：仅保留 categoryId 在当前分类金额组中的项（清理"孤儿"）
 * - 转账：categoryId 强制为 null，accountSide 必须填
 * 返回新数组，不修改入参（不可变）
 */
function sanitizeExtrasForSubmit(
  extras: Array<{
    extraType?: number;
    amount?: number;
    accountSide?: number;
    categoryId?: number;
    remark?: string;
  }>,
  pairs: Array<{ categoryId?: number; amount?: number }>,
  billType: number
) {
  const validCategoryIds = new Set(
    (pairs ?? []).map(p => p?.categoryId).filter(id => id != null) as number[]
  );
  return extras
    .filter(e => e && e.amount != null && Number(e.amount) > 0)
    .map(e => {
      if (billType === 3) {
        // 不可变：返回新对象
        return {
          ...e,
          categoryId: null,
          accountSide: e.accountSide ?? ACCOUNT_SIDE.FROM
        };
      }
      return {
        ...e,
        accountSide: ACCOUNT_SIDE.FROM
      };
    })
    .filter(e => {
      if (billType === 3) return true;
      return e.categoryId != null && validCategoryIds.has(e.categoryId);
    });
}

const isImageFile = (file: any) => {
  if (typeof file === "object") {
    if (file.type && file.type.startsWith("image/")) {
      return true;
    }
    if (file.contentType && file.contentType.startsWith("image/")) {
      return true;
    }
    if (file.raw && file.raw.type && file.raw.type.startsWith("image/")) {
      return true;
    }

    if (file.name) {
      return isImageByFileName(file.name);
    }
    return false;
  }

  if (typeof file === "string") {
    return isImageByFileName(file);
  }

  return false;
};

const isImageByFileName = (fileName: string) => {
  const imageExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".bmp",
    ".webp",
    ".svg",
    ".tiff",
    ".ico",
    ".heif",
    ".heic"
  ];
  const name = fileName.toLowerCase();
  return imageExtensions.some(ext => name.endsWith(ext));
};

const getFileIcon = file => {
  const ext = file.name.split(".").pop()?.toLowerCase();
  const icons = {
    pdf: "/file-icons/pdf.png",
    doc: "/file-icons/word.png",
    docx: "/file-icons/word.png",
    xls: "/file-icons/excel.png",
    xlsx: "/file-icons/excel.png",
    txt: "/file-icons/txt.png",
    ppt: "/file-icons/ppt.png",
    pptx: "/file-icons/ppt.png"
  };
  return icons[ext] || "/file-icons/default.svg";
};

const fileListDisplay = computed(() => {
  return fileList.value.map(file => {
    const isImage = isImageFile(file.name);
    return {
      uid: file.uid,
      name: file.name,
      url: isImage ? file.url : getFileIcon(file),
      status: file.status || "success"
    };
  });
});

const handleFileChange = uploadFile => {
  fileList.value.push(uploadFile);
};

const handleFileRemove = file => {
  const index = fileList.value.findIndex(f => f.uid === file.uid);
  if (index !== -1) {
    fileList.value.splice(index, 1);
  }
};

async function handleConfirm() {
  if (loading.value) {
    return;
  }
  try {
    await formRef.value.validate();

    if (
      formData.billType === 3 &&
      formData.accountId === formData.toAccountId
    ) {
      message("转出账户与转入账户不能相同", { type: "warning" });
      return;
    }

    loading.value = true;
    if (formData.billType !== 3) {
      formData.toAccountId = null;
    } else {
      formData.categoryAmountPair = [];
    }

    // 清理孤儿附加项 + 标准化字段（不可变：构建新数组用于提交）
    const cleanedExtras = sanitizeExtrasForSubmit(
      formData.extras ?? [],
      formData.categoryAmountPair ?? [],
      formData.billType
    );

    const submitPayload = { ...formData, extras: cleanedExtras };
    const formDataObj = new FormData();
    formDataObj.append(
      "data",
      new Blob([JSON.stringify(submitPayload)], {
        type: "application/json"
      })
    );
    if (fileList.value.length !== 0) {
      fileList.value.forEach(file => {
        formDataObj.append(`files`, file.raw);
      });
    }
    if (props.type === "add") {
      await addBillApi(formDataObj);
    } else {
      await modifyBillApi(formDataObj);
    }

    message("操作成功", { type: "success" });
    visible.value = false;
    emits("success");
  } catch (e) {
    if (!e.message.includes("validate")) {
      message(e.message || "操作失败", { type: "error" });
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.el-upload-list__item-thumbnail {
  object-fit: contain;
  background: #f5f7fa;
}

.el-upload-list__item[data-filetype^="image/"] .el-upload-list__item-thumbnail {
  background: transparent;
}

/* ===== 附加费用/优惠 ===== */
.extra-form-item {
  margin-bottom: 12px;
}

/* 让 form-item 的 label 占位但不显示文字，从而天然对齐到 label 右侧 */
.extra-form-item :deep(.el-form-item__label) {
  visibility: hidden;
}

.extra-panel {
  width: 100%;
  padding: 10px 12px;
  background: var(--el-fill-color-lighter, #fafafa);
  border: 1px solid var(--el-border-color-lighter, #ebeef5);
  border-radius: 8px;
}

.extra-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.extra-add-btn {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  height: 26px;
  padding: 0 10px;
  font-size: 12px;
  line-height: 1;
  color: var(--el-text-color-regular, #606266);
  cursor: pointer;
  background: #fff;
  border: 1px dashed var(--el-border-color, #dcdfe6);
  border-radius: 14px;
  transition: all 0.2s;
}

.extra-add-btn__plus {
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
}

.extra-add-btn--fee:hover {
  color: #e6a23c;
  background: #fdf6ec;
  border-color: #e6a23c;
}

.extra-add-btn--discount:hover {
  color: #67c23a;
  background: #f0f9eb;
  border-color: #67c23a;
}

.extra-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  padding: 8px 10px;
  margin-top: 8px;
  background: #fff;
  border: 1px solid var(--el-border-color-lighter, #ebeef5);
  border-left-width: 3px;
  border-radius: 6px;
}

.extra-row--fee {
  border-left-color: #e6a23c;
}

.extra-row--discount {
  border-left-color: #67c23a;
}

.extra-chip {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  font-size: 12px;
  border-radius: 4px;
}

.extra-chip--fee {
  color: #b88230;
  background: #fdf6ec;
}

.extra-chip--discount {
  color: #529b2e;
  background: #f0f9eb;
}

.extra-amount {
  width: 140px;
}

.extra-side {
  width: 128px;
}

.extra-remark {
  flex: 1;
  min-width: 180px;
}

.extra-remove-btn {
  margin-left: auto;
}
</style>
