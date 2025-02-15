<template>
  <v-dialog
    show-full-screen
    :fixed-body-height="false"
    title="邀请用户"
    v-model="visible"
    :loading="loading"
    @confirm="handleConfirm"
    @cancel="visible = false"
    @opened="handleOpened"
    width="360px"
  >
    <el-form :model="formData" label-width="82px" :rules="rules" ref="formRef">
      <el-row :gutter="30">
        <re-col :value="24">
          <el-form-item prop="roleType" label="角色" required inline-message>
            <el-select
              v-model="formData.roleType"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="item in roleTypeOptions"
                :key="item.value"
                :label="item.desc"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </re-col>
      </el-row>
      <el-row :gutter="30">
        <re-col :value="24">
          <el-form-item prop="username" label="用户名" required inline-message>
            <el-input v-model="formData.username" placeholder="请输入用户名" />
          </el-form-item>
        </re-col>
      </el-row>
    </el-form>
  </v-dialog>
</template>
<script setup lang="ts">
import VDialog from "@/components/VDialog/VDialog.vue";
import { computed, reactive, ref } from "vue";
import {
  getRoleTypes,
  inviteUserApi,
  InviteUserCommand,
  RolesBefore,
  RoleType
} from "@/api/fortune/group";
import ReCol from "@/components/ReCol";
import { ElMessage, FormRules } from "element-plus";

const props = defineProps<{
  modelValue: boolean;
  groupId?: number;
}>();
const emits = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
  (e: "success"): void;
}>();
const loading = ref(false);
const visible = computed({
  get: () => props.modelValue,
  set: v => emits("update:modelValue", v)
});
const formData = reactive<InviteUserCommand>({});
const roleTypeOptions = ref<Array<RoleType>>();
async function handleOpened() {
  const roleTypes = await getRoleTypes();
  roleTypeOptions.value = convertRolesToArray(roleTypes.data);
  formData.groupId = props.groupId;
}

function convertRolesToArray(roles: RolesBefore): RoleType[] {
  return Object.entries(roles).map(([key, value]) => {
    return {
      value: parseInt(key, 10),
      desc: value
      // 使用类型断言来确保返回的对象符合 RoleType 接口
    } as RoleType;
  });
}

const rules: FormRules = {
  groupId: [{ required: true, message: "分组id不能为空" }],
  roleType: [{ required: true, message: "角色不能为空" }],
  username: [{ required: true, message: "被邀请人用户名不能为空" }]
};

async function handleConfirm() {
  try {
    loading.value = true;
    await inviteUserApi(formData);
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
</script>
