<template>
  <v-dialog
    show-full-screen
    :fixed-body-height="false"
    :title="type === 'add' ? '新增物品' : '编辑物品'"
    v-model="visible"
    :loading="loading"
    @confirm="handleConfirm"
    @cancel="visible = false"
    @opened="handleOpened"
  >
    <el-form :model="formData" label-width="82px" :rules="rules" ref="formRef">
      <el-row :gutter="30">
        <re-col :value="12">
          <el-form-item prop="bookId" label="账本" required>
            <el-select
              :disabled="props.type !== 'add'"
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
        <re-col :value="12">
          <el-form-item
            prop="goodsName"
            label="物品名称"
            required
            inline-message
          >
            <el-input
              v-model="formData.goodsName"
              placeholder="请输入分组名称"
            />
          </el-form-item>
        </re-col>
      </el-row>
      <el-row :gutter="30">
        <re-col :value="12">
          <el-form-item prop="price" label="价格" required>
            <el-input v-model="formData.price" placeholder="请输入分组名称" />
          </el-form-item>
        </re-col>
        <re-col :value="12">
          <el-form-item prop="purchaseDate" label="购买日期" required>
            <el-date-picker
              v-model="formData.purchaseDate"
              type="date"
              placeholder="选择购买日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
        </re-col>
      </el-row>
      <el-row :gutter="30">
        <re-col :value="12">
          <el-form-item prop="categoryId" label="分类">
            <el-tree-select
              v-model="formData.categoryId"
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
        <re-col :value="12">
          <el-form-item prop="tagId" label="标签">
            <el-tree-select
              v-model="formData.tagId"
              :data="tagOptions"
              placeholder="请选择标签"
              style="width: 100%"
              check-strictly
              filterable
              :props="tagTreeProps"
            />
          </el-form-item>
        </re-col>
      </el-row>
      <el-row :gutter="30">
        <re-col :value="12">
          <el-form-item prop="warrantyDate" label="保修日期">
            <el-date-picker
              v-model="formData.warrantyDate"
              type="date"
              placeholder="选择保修日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
        </re-col>
        <re-col :value="3">
          <el-form-item prop="useByTimes" label="按次使用">
            <el-switch
              v-model="formData.useByTimes"
              class="ml-2"
              style="
                --el-switch-on-color: #13ce66;
                --el-switch-off-color: #ff4949;
              "
            />
          </el-form-item>
        </re-col>
        <re-col :value="9">
          <el-form-item prop="usageNum" label="使用次数">
            <el-input-number
              v-model="formData.usageNum"
              :disabled="!formData.useByTimes"
              :precision="0"
              :min="0"
              :controls="false"
              style="width: 100%"
            />
          </el-form-item>
        </re-col>
      </el-row>
      <el-row :gutter="30">
        <re-col :value="12">
          <el-form-item prop="status" label="状态">
            <el-select
              filterable
              v-model="formData.status"
              placeholder="请选择状态"
              style="width: 100%"
            >
              <el-option
                v-for="item in statusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </re-col>
        <re-col :value="12">
          <el-form-item prop="retiredDate" label="退役日期">
            <el-date-picker
              :disabled="formData.status === 1"
              v-model="formData.retiredDate"
              type="date"
              placeholder="选择退役日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
        </re-col>
        <re-col :value="12">
          <el-form-item prop="soldPrice" label="出售价格">
            <el-input
              v-model="formData.soldPrice"
              placeholder="请输入二手出售价格"
              :disabled="formData.status !== 3"
            />
          </el-form-item>
        </re-col>
      </el-row>
      <el-row :gutter="30">
        <re-col :value="24">
          <el-form-item prop="remark" label="备注" style="margin-bottom: 0">
            <el-input
              type="textarea"
              v-model="formData.remark"
              rows="6"
              placeholder="请输入备注"
            />
          </el-form-item>
        </re-col>
      </el-row>
    </el-form>
  </v-dialog>
</template>

<script setup lang="ts">
import VDialog from "@/components/VDialog/VDialog.vue";
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessage, FormRules } from "element-plus";
import ReCol from "@/components/ReCol";
import { BookVo, getBookByGroupId } from "@/api/fortune/book";
import {
  addGoodsKeeperApi,
  modifyGoodsKeeperApi,
  AddGoodsKeeperCommand,
  ModifyGoodsKeeperCommand,
  GoodsKeeperVo
} from "@/api/fortune/goods-keeper";
import { CategoryVo, getEnableCategoryList } from "@/api/fortune/category";
import { getEnableTagList, TagVo } from "@/api/fortune/tag";
import dayjs from "dayjs";

const props = defineProps<Props>();
const loading = ref(false);
const formRef = ref();
const categoryOptions = ref<Array<CategoryVo>>([]);
const statusOptions = ref([
  {
    label: "在役",
    value: 1
  },
  {
    label: "退役",
    value: 2
  },
  {
    label: "已出售",
    value: 3
  }
]);
const tagOptions = ref<Array<TagVo>>();

const bookOptions = ref<Array<BookVo>>();
const fileList = ref([]);

onMounted(async () => {
  formData.bookId = props.bookId;
  formData.status = 1;
  formData.purchaseDate = dayjs(new Date()).format("YYYY-MM-DD");
  const book = await getBookByGroupId(props.groupId);
  bookOptions.value = book.data;

  const [categoryRes, tagRes] = await Promise.all([
    getEnableCategoryList(props.bookId, 1),
    getEnableTagList(props.bookId, 1)
  ]);
  categoryOptions.value = categoryRes.data;
  tagOptions.value = tagRes.data;
});

interface Props {
  type: "add" | "modify";
  modelValue: boolean;
  row?: GoodsKeeperVo;
  groupId: number;
  bookId: number;
}

const emits = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
  (e: "success"): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set(v) {
    emits("update:modelValue", v);
  }
});

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

const formData = reactive<AddGoodsKeeperCommand | ModifyGoodsKeeperCommand>({});

function handleOpened() {
  if (props.row) {
    Object.assign(formData, props.row);
  } else {
    //formRef.value?.resetFields();
  }
}

async function handleConfirm() {
  try {
    await formRef.value.validate();
    loading.value = true;
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
    console.log(formDataObj);
    switch (props.type) {
      case "add":
        await addGoodsKeeperApi(formDataObj);
        break;
      case "modify":
        await modifyGoodsKeeperApi(formDataObj);
        break;
      default:
        break;
    }
    ElMessage.info("提交成功");
    visible.value = false;
    console.log(visible.value);
    emits("success");
  } catch (e) {
    console.error(e);
    if (!e.message.includes("validate")) {
      ElMessage.error((e as Error)?.message || "提交失败");
    }
  } finally {
    loading.value = false;
  }
}

const rules: FormRules = {
  bookId: [
    {
      required: true,
      message: "请选择账本"
    }
  ],
  goodsName: [
    {
      required: true,
      message: "请输入物品名称"
    }
  ],
  price: [
    {
      required: true,
      message: "请输入价格"
    }
  ],
  categoryId: [
    {
      required: true,
      message: "请选择分类"
    }
  ],
  purchaseDate: [
    {
      required: true,
      message: "请选择购买日期"
    }
  ],
  retiredDate: [
    {
      validator: (rule, value, callback) => {
        if ((formData.status === 2 || formData.status === 3) && !value) {
          callback(new Error("请选择退役日期"));
        } else {
          callback();
        }
      }
    }
  ],
  usageNum: [
    {
      validator: (rule, value, callback) => {
        if (formData.useByTimes && !value) {
          callback(new Error("请输入使用次数"));
        } else {
          callback();
        }
      }
    }
  ]
};
</script>
