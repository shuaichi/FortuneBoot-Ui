<script setup lang="ts">
import resetPwd from "./resetPwd.vue";
import userInfo from "./userInfo.vue";
import userAvatar from "./userAvatar.vue";
import { onMounted, reactive, ref } from "vue";
import { getUserProfileApi, UserDTO } from "@/api/system/user";

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

state.user = currentUserInfo;
console.log(currentUserInfo);
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
                <el-descriptions-item label="用户名称">{{
                  currentUserInfo.username
                }}</el-descriptions-item>
                <el-descriptions-item label="用户昵称">{{
                  currentUserInfo.nickname
                }}</el-descriptions-item>
                <el-descriptions-item label="手机号码">{{
                  currentUserInfo.phoneNumber
                }}</el-descriptions-item>
                <el-descriptions-item label="用户邮箱">{{
                  currentUserInfo.email
                }}</el-descriptions-item>
                <el-descriptions-item label="角色">
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
              <userInfo :user="currentUserInfo" />
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
