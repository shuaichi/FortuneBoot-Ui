<template>
  <v-dialog
    show-full-screen
    :fixed-body-height="false"
    :title="type === 'add' ? '新增物品' : '修改物品'"
    v-model="visible"
    :loading="loading"
    @confirm="handleConfirm"
    @cancel="visible = false"
    @opened="handleOpened"
  >
    <el-form :model="formData" label-width="82px" :rules="rules" ref="formRef">
      <el-row :gutter="30">
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
        <re-col :value="12">
          <el-form-item prop="price" label="价格" required>
            <el-input v-model="formData.price" placeholder="请输入分组名称" />
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
import {
  addGroupApi,
  AddGroupCommand,
  getBookTemplate,
  getCurrencyTemplate,
  GroupVo,
  modifyGroupApi,
  ModifyGroupCommand
} from "@/api/fortune/group";
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessage, FormRules } from "element-plus";
import ReCol from "@/components/ReCol";
import { BookVo, getBookByGroupId } from "@/api/fortune/book";
// import { usePublicHooks } from "@/views/system/hooks";
import {
  AddGoodsKeeperCommand,
  ModifyGoodsKeeperCommand
} from "@/api/fortune/goods-keeper";

const props = defineProps<Props>();
const loading = ref(false);
// const { switchStyle } = usePublicHooks();
const bookTemplateOptions = ref();
const currencyTemplateOptions = ref();

const bookOptions = ref<Array<BookVo>>();
onMounted(async () => {
  const bookTemplate = await getBookTemplate();
  bookTemplateOptions.value = bookTemplate.data;
  const currency = await getCurrencyTemplate();
  currencyTemplateOptions.value = currency.data;
  if (props.type !== "add") {
    const book = await getBookByGroupId(props.row.groupId);
    bookOptions.value = book.data;
  }
});

interface Props {
  type: "add" | "upload";
  modelValue: boolean;
  row?: GroupVo;
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
    loading.value = true;
    switch (props.type) {
      case "add":
        await addGroupApi(formData as AddGroupCommand);
        break;
      case "upload":
        await modifyGroupApi(formData as ModifyGroupCommand);
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
    ElMessage.error((e as Error)?.message || "提交失败");
  } finally {
    loading.value = false;
  }
}

const rules: FormRules = {
  goodsName: [
    {
      required: true,
      message: "物品名称不能为空"
    }
  ]
};
</script>
