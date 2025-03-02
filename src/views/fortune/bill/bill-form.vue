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
        <re-col :value="24">
          <el-form-item prop="title" label="标题">
            <el-input v-model="formData.title" placeholder="请输入标题" />
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
          >
            <el-select
              filterable
              v-model="formData.accountId"
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
        v-for="(item, index) in formData.categoryAmountPair"
        :key="index"
        class="category-row"
      >
        <el-row :gutter="30" v-if="formData.billType !== 3">
          <re-col :value="12">
            <el-form-item
              :prop="'categoryAmountPair.' + index + '.amount'"
              label="金额"
              required
            >
              <el-input-number
                v-model="item.amount"
                :min="0"
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
              :required="formData.billType !== 3"
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
          <el-form-item prop="amount" label="金额" required>
            <el-input-number
              v-model="formData.amount"
              :precision="2"
              :controls="false"
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
  modifyBillApi,
  ModifyBillCommand
} from "@/api/fortune/bill";
import { BookVo, getEnableBookList } from "@/api/fortune/book";
import { AccountVo, getEnableAccountList } from "@/api/fortune/account";
import { getEnableGroupList } from "@/api/fortune/group";
import { message } from "@/utils/message";
import { CategoryVo, getEnableCategoryList } from "@/api/fortune/category";
import { getEnablePayeeList, PayeeVo } from "@/api/fortune/payee";
import { getEnableTagList, TagVo } from "@/api/fortune/tag";
import { Plus as PlusIcon } from "@element-plus/icons-vue";
import { getFileByBillId } from "@/api/fortune/file";

const props = defineProps<{
  type: "add" | "edit";
  modelValue: boolean;
  row?: any;
  groupId: number;
  bookId: number;
}>();

const emits = defineEmits(["update:modelValue", "success"]);
const visible = computed({
  get: () => props.modelValue,
  set: v => emits("update:modelValue", v)
});

const loading = ref(false);
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
  accountId: [{ required: formData.billType === 3, message: "请选择账户" }],
  // 动态规则：categoryAmountPair 校验
  categoryAmountPair: [
    {
      validator: (rule, value, callback) => {
        // 检查所有分类和金额是否有效
        const hasEmptyCategory = value.some(item => !item.categoryId);
        const hasInvalidAmount = value.some(
          item => item.amount === null || item.amount <= 0
        );

        if (hasEmptyCategory) {
          callback(new Error("请填写所有分类"));
          return;
        }
        if (hasInvalidAmount) {
          callback(new Error("金额必须大于0"));
          return;
        }
        callback();
      },
      trigger: "blur"
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
const categoryOptions = ref<Array<CategoryVo>>();
const payeeOptions = ref<Array<PayeeVo>>();
const tagOptions = ref<Array<TagVo>>();
const fileList = ref([]);

onMounted(async () => {
  const [groupRes, booksRes, accountsRes] = await Promise.all([
    getEnableGroupList(),
    getEnableBookList(props.groupId),
    getEnableAccountList(props.groupId)
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
  accountOptions.value = accountsRes.data.filter(item => item.canExpense);
});

async function handleBillTypeChange(type: number) {
  if (type === 1) {
    const accountsRes = await getEnableAccountList(props.groupId);
    accountOptions.value = accountsRes.data.filter(item => item.canExpense);
    handleBookOrBillTypeChange();
    formData.toAccountId = null;
  } else if (type === 2) {
    const accountsRes = await getEnableAccountList(props.groupId);
    accountOptions.value = accountsRes.data.filter(item => item.canIncome);
    handleBookOrBillTypeChange();
  } else if (type === 3) {
    const [tagRes, accountsRes] = await Promise.all([
      getEnableTagList(formData.bookId, formData.billType),
      getEnableAccountList(props.groupId)
    ]);
    tagOptions.value = tagRes.data;
    accountOptions.value = accountsRes.data.filter(item => item.canTransferOut);
    toAccountOptions.value = accountsRes.data.filter(
      item => item.canTransferIn
    );
    formData.tagIdList = [];
    formData.categoryAmountPair = [];
    formData.payeeId = null;
  }
}

function handleBookOrBillTypeChange() {
  formData.categoryAmountPair = [{ categoryId: null, amount: null }];
  formData.payeeId = null;
  formData.tagIdList = [];
  formData.amount = null;
  handleCategoryPayeeTagRefresh();
}

async function handleCategoryPayeeTagRefresh() {
  const [categoryRes, payeeRes, tagRes] = await Promise.all([
    getEnableCategoryList(formData.bookId, formData.billType),
    getEnablePayeeList(formData.bookId, formData.billType),
    getEnableTagList(formData.bookId, formData.billType)
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
  const imageExtensions = [
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".tiff",
    ".svg",
    ".psd",
    ".webp",
    ".bmp",
    ".ico",
    ".heif",
    ".heic",
    ".raw",
    ".nef",
    ".cr2"
  ];
  const n = file.name.toLowerCase();
  if (imageExtensions.some(ext => n.endsWith(ext))) {
    // 如果是图片，直接预览
    window.open(file.url, "_blank");
  } else {
    console.log(file);
    // 如果是非图片文件，使用文件的实际 URL 进行下载
    const a = document.createElement("a");
    a.href = file.url;
    a.download = file.name || file.url.split("/").pop();
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
}

function removeCategory(index: number) {
  formData.categoryAmountPair.splice(index, 1);
}

// 计算显示列表（处理不同状态）
const fileListDisplay = computed(() => {
  return fileList.value.map(file => ({
    uid: file.uid,
    name: file.name,
    url: file.url,
    // url: file.fileType?.startsWith("image/") ? file.url : getFileIcon(file),
    status: file.status || "success"
  }));
});

// 文件类型图标映射
// const getFileIcon = file => {
//   const ext = file.name.split(".").pop()?.toLowerCase();
//   const icons = {
//     pdf: "/file-icons/pdf.png",
//     doc: "/file-icons/word.png",
//     xls: "/file-icons/excel.png",
//     txt: "/file-icons/pdf.png"
//     // TODO 其他类型获取图片
//   };
//   return icons[ext] || "/file-icons/default.png";
// };

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
