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
              v-model="formData.bookId"
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
              v-model="formData.billType"
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
          :value="24"
          v-if="formData.billType !== 7 && formData.billType !== 8"
        >
          <el-form-item prop="title" label="标题">
            <el-input v-model="formData.title" placeholder="请输入标题" />
          </el-form-item>
        </re-col>
        <re-col
          :value="12"
          v-if="formData.billType === 7 || formData.billType === 8"
        >
          <el-form-item prop="title" label="标题">
            <el-input v-model="formData.title" placeholder="请输入标题" />
          </el-form-item>
        </re-col>
        <re-col
          :value="12"
          v-if="formData.billType === 7 || formData.billType === 8"
        >
          <el-form-item
            prop="orderId"
            label="单据"
            :required="formData.billType === 7 || formData.billType === 8"
          >
            <el-select
              filterable
              v-model="formData.orderId"
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
              filterable
              v-model="formData.accountId"
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
        <el-row :gutter="30" v-if="formData.billType !== 3">
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
              v-if="formData.categoryAmountPair.length > 1"
            >
              删除
            </el-button>
          </el-col>
        </el-row>
      </div>

      <el-row :gutter="30">
        <re-col :value="12" v-if="formData.billType === 3">
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
        <re-col :value="12" v-if="formData.billType === 3">
          <el-form-item prop="toAccountId" label="转入账户">
            <el-select
              filterable
              v-model="formData.toAccountId"
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
            />
          </el-form-item>
        </re-col>
        <re-col :value="12" v-if="formData.billType !== 3">
          <el-form-item prop="payeeId" label="交易对象">
            <el-select
              filterable
              v-model="formData.payeeId"
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

      <el-form-item prop="remark" label="备注">
        <el-input
          type="textarea"
          v-model="formData.remark"
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
import { ElMessage, FormRules } from "element-plus";
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
import { Plus as PlusIcon } from "@element-plus/icons-vue";
import { getFileByBillId } from "@/api/fortune/file";
import dayjs from "dayjs";
import { QuestionFilled } from "@element-plus/icons-vue";
import {
  FinanceOrderVo,
  getUsingFinanceOrderApi
} from "@/api/fortune/finance-order";

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
const formData = reactive<AddBillCommand | ModifyBillCommand>({
  billType: 1,
  confirm: true,
  include: true,
  categoryAmountPair: [{ categoryId: null, amount: null }]
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
        if (formData.billType !== 7 && formData.billType !== 8 && !value) {
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
// 是否展示转入金额，当类型为转账、币种不一致时显示
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
    formData.categoryAmountPair = [];
    formData.payeeId = null;
    formData.accountId = bookRes.data.defaultTransferOutAccountId;
    formData.toAccountId = bookRes.data.defaultTransferInAccountId;
  } else if (type === 7 || type === 8) {
    accountOptions.value = accountsRes.data.filter(item => item.canExpense);
    handleBookOrBillTypeChange();
    formData.accountId = bookRes.data.defaultExpenseAccountId;
  }
}

async function handleBookOrBillTypeChange() {
  formData.categoryAmountPair = [{ categoryId: null, amount: null }];
  formData.payeeId = null;
  formData.tagIdList = [];
  formData.amount = null;
  formData.toAccountId = null;
  formData.orderId = null;
  categoryOptions.value = [];
  payeeOptions.value = [];
  tagOptions.value = [];
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
  const [categoryRes, payeeRes, tagRes] = await Promise.all([
    getEnableCategoryList(formData.bookId, billType),
    getEnablePayeeList(formData.bookId, billType),
    getEnableTagList(formData.bookId, billType)
  ]);
  categoryOptions.value = categoryRes.data;
  payeeOptions.value = payeeRes.data;
  tagOptions.value = tagRes.data;
}

async function handleOpened() {
  if (props.row) {
    Object.assign(formData, props.row);
    formData.tagIdList = props.row.tagList
      ? props.row.tagList.map(item => item.tagId)
      : [];
    handleCategoryPayeeTagRefresh();
    const financeOrderRes = await getUsingFinanceOrderApi(formData.bookId);
    financeOrderOptions.value = financeOrderRes.data;
    const fileRes = await getFileByBillId(props.row.billId);
    fileList.value = fileRes.data.map(file => ({
      // 使用后端返回的fileId作为唯一标识
      uid: file.fileId,
      name: file.originalName,
      size: file.size,
      url: URL.createObjectURL(handleFile2Blob(file)),
      raw: new File([handleFile2Blob(file)], file.originalName, {
        type: file.contentType
      }),
      status: "success",
      type: file.contentType,
      // 标记为已存在的文件
      isExisting: true
    }));
  } else {
    formRef.value?.resetFields();
    formData.bookId = props.bookId;
    // 设置默认交易时间为当前时间
    formData.tradeTime = dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const bookRes = await getBookById(props.bookId);
    formData.accountId = bookRes.data.defaultExpenseAccountId;
    handleCategoryPayeeTagRefresh();
  }
}

function handleFile2Blob(file: any) {
  // 将 Base64 编码的图片数据转换为 Blob 对象
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

// 文件预览/下载处理
const handleFilePreview = async (file: any) => {
  // 获取原始文件列表中的对应文件
  const originalFile = fileList.value.find(f => f.uid === file.uid);
  if (!originalFile) return;

  if (isImageFile(file.name)) {
    // 如果是图片，直接预览
    window.open(originalFile.url, "_blank");
  } else {
    // 如果是非图片文件，使用文件的实际 URL 进行下载
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
  formData.categoryAmountPair.splice(index, 1);
  // 清理对应规则
  delete rules[`categoryAmountPair.${index}.categoryId`];
  delete rules[`categoryAmountPair.${index}.amount`];

  // 重新排序后续规则
  formData.categoryAmountPair.forEach((_, i) => {
    if (i >= index) {
      rules[`categoryAmountPair.${i}.categoryId`] =
        rules[`categoryAmountPair.${i + 1}.categoryId`];
      rules[`categoryAmountPair.${i}.amount`] =
        rules[`categoryAmountPair.${i + 1}.amount`];
    }
  });
}

// 判断是否为图片文件
const isImageFile = (file: any) => {
  // 如果传入的是文件对象
  if (typeof file === "object") {
    // 检查MIME类型
    if (file.type && file.type.startsWith("image/")) {
      return true;
    }
    if (file.contentType && file.contentType.startsWith("image/")) {
      return true;
    }
    // 如果有raw属性（上传的文件）
    if (file.raw && file.raw.type && file.raw.type.startsWith("image/")) {
      return true;
    }

    // 如果没有类型信息，尝试通过文件名判断
    if (file.name) {
      return isImageByFileName(file.name);
    }
    return false;
  }

  // 如果传入的是文件名字符串
  if (typeof file === "string") {
    return isImageByFileName(file);
  }

  return false;
};

// 通过文件名判断是否为图片
const isImageByFileName = (fileName: string) => {
  // 常见图片扩展名
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

// 文件类型图标映射
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

// 计算显示列表（处理不同状态）
const fileListDisplay = computed(() => {
  return fileList.value.map(file => {
    // 检查是否为图片类型
    const isImage = isImageFile(file.name);
    return {
      uid: file.uid,
      name: file.name,
      // 图片文件显示实际预览，非图片文件显示图标
      url: isImage ? file.url : getFileIcon(file),
      status: file.status || "success"
    };
  });
});

// 文件变化处理
const handleFileChange = uploadFile => {
  fileList.value.push(uploadFile);
};

// 文件移除处理
const handleFileRemove = file => {
  const index = fileList.value.findIndex(f => f.uid === file.uid);
  if (index !== -1) {
    fileList.value.splice(index, 1);
  }
};

async function handleConfirm() {
  try {
    await formRef.value.validate();
    loading.value = true;
    // 清理非转账类型的字段
    if (formData.billType !== 3) {
      formData.toAccountId = null;
    } else {
      formData.categoryAmountPair = [];
    }
    const formDataObj = new FormData();
    formDataObj.append(
      "data",
      new Blob([JSON.stringify({ ...formData })], {
        type: "application/json"
      })
    );
    // 处理文件列表
    if (fileList.value.length !== 0) {
      // 2. 处理文件列表（正确格式）
      fileList.value.forEach(file => {
        // 确保上传的是原始文件对象
        console.log("file ===== ", file);
        formDataObj.append(`files`, file.raw);
      });
    }
    if (props.type === "add") {
      await addBillApi(formDataObj);
    } else {
      await modifyBillApi(formDataObj);
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
<style scoped>
/* 自定义文件类型图标 */
.el-upload-list__item-thumbnail {
  object-fit: contain;
  background: #f5f7fa;
}

/* 非图片文件显示类型图标 */
.el-upload-list__item[data-filetype^="image/"] .el-upload-list__item-thumbnail {
  background: transparent;
}
</style>
