<script setup lang="ts">
import resetPwd from "./resetPwd.vue";
import userInfo from "./userInfo.vue";
import userAvatar from "./userAvatar.vue";
import { onMounted, reactive, ref } from "vue";
import { getUserProfileApi, UserDTO } from "@/api/system/user";
import type { UserProfileRequest } from "@/api/system/user";

const activeTab = ref("userinfo");
const state = reactive({
  user: {},
  roleName: {},
  postName: {}
});
onMounted(async () => {
  const userRes = await getUserProfileApi();
  currentUserInfo.value = userRes.data.user;
  state.user = userRes.data.user;
});
/** 用户名 */
const currentUserInfo = ref<UserDTO>({});
// 刷新用户信息（保存成功后或需要时调用）
const refreshProfile = async (payload?: UserProfileRequest) => {
  if (payload) {
    currentUserInfo.value = { ...currentUserInfo.value, ...payload };
    state.user = { ...state.user, ...payload };
    return;
  }
  const userRes = await getUserProfileApi();
  currentUserInfo.value = userRes.data.user;
  state.user = userRes.data.user;
};
</script>
<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="6" :xs="24">
        <el-card class="box-card">
          <template v-slot:header>
            <div class="clearfix">
              <span>个人信息</span>
            </div>
          </template>
          <div>
            <div class="text-center">
              <userAvatar :user="currentUserInfo" />
            </div>

            <el-row>
              <el-descriptions :column="1">
                <el-descriptions-item label="账户：">{{
                  currentUserInfo.username
                }}</el-descriptions-item>
                <el-descriptions-item label="昵称：">{{
                  currentUserInfo.nickname
                }}</el-descriptions-item>
                <el-descriptions-item label="手机：">{{
                  currentUserInfo.phoneNumber
                }}</el-descriptions-item>
                <el-descriptions-item label="邮箱：">{{
                  currentUserInfo.email
                }}</el-descriptions-item>
                <el-descriptions-item label="角色：">
                  {{ currentUserInfo.roleName }}
                </el-descriptions-item>
              </el-descriptions>
            </el-row>
          </div>
        </el-card>
      </el-col>
      <el-col :span="18" :xs="24">
        <el-card>
          <template v-slot:header>
            <div class="clearfix">
              <span>基本资料</span>
            </div>
          </template>
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本资料" name="userinfo">
              <userInfo
                :user="currentUserInfo"
                @profile-updated="refreshProfile"
              />
            </el-tab-pane>
            <el-tab-pane label="修改密码" name="resetPwd">
              <resetPwd :user="state.user" />
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
