<!--&lt;!&ndash; bill-form.vue &ndash;&gt;-->
<!--<template>-->
<!--  <v-dialog-->
<!--    show-full-screen-->
<!--    :fixed-body-height="false"-->
<!--    :title="type === 'add' ? '新增账单' : '修改账单'"-->
<!--    v-model="visible"-->
<!--    :loading="loading"-->
<!--    @confirm="handleConfirm"-->
<!--    @cancel="visible = false"-->
<!--    @opened="handleOpened"-->
<!--  >-->
<!--    <el-form :model="formData" label-width="120px" :rules="rules" ref="formRef">-->
<!--      <el-row :gutter="30">-->
<!--        <re-col :value="12">-->
<!--          <el-form-item prop="bookId" label="所属账本">-->
<!--            <el-select-->
<!--              v-model="formData.bookId"-->
<!--              placeholder="请选择账本"-->
<!--              style="width: 100%"-->
<!--              @change="handleBookChange"-->
<!--            >-->
<!--              <el-option-->
<!--                v-for="item in bookOptions"-->
<!--                :key="item.bookId"-->
<!--                :label="item.bookName"-->
<!--                :value="item.bookId"-->
<!--              />-->
<!--            </el-select>-->
<!--          </el-form-item>-->
<!--        </re-col>-->
<!--        <re-col :value="12">-->
<!--          <el-form-item prop="billType" label="交易类型">-->
<!--            <el-select-->
<!--              v-model="formData.billType"-->
<!--              placeholder="请选择类型"-->
<!--              style="width: 100%"-->
<!--              @change="handleBillTypeChange"-->
<!--            >-->
<!--              <el-option-->
<!--                v-for="item in billTypeOptions"-->
<!--                :key="item.value"-->
<!--                :label="item.label"-->
<!--                :value="item.value"-->
<!--              />-->
<!--            </el-select>-->
<!--          </el-form-item>-->
<!--        </re-col>-->
<!--      </el-row>-->

<!--      <el-row :gutter="30">-->
<!--        <re-col :value="24">-->
<!--          <el-form-item prop="title" label="标题">-->
<!--            <el-input v-model="formData.title" placeholder="请输入标题" />-->
<!--          </el-form-item>-->
<!--        </re-col>-->
<!--      </el-row>-->

<!--      <el-row :gutter="30">-->
<!--        <re-col :value="12">-->
<!--          <el-form-item prop="tradeTime" label="交易时间">-->
<!--            <el-date-picker-->
<!--              v-model="formData.tradeTime"-->
<!--              type="datetime"-->
<!--              placeholder="选择日期时间"-->
<!--              value-format="YYYY-MM-DD HH:mm:ss"-->
<!--              style="width: 100%"-->
<!--            />-->
<!--          </el-form-item>-->
<!--        </re-col>-->
<!--        <re-col :value="12">-->
<!--          <el-form-item prop="accountId" label="账户">-->
<!--            <el-select-->
<!--              v-model="formData.accountId"-->
<!--              placeholder="请选择账户"-->
<!--              style="width: 100%"-->
<!--            >-->
<!--              <el-option-->
<!--                v-for="item in accountOptions"-->
<!--                :key="item.accountId"-->
<!--                :label="item.accountName"-->
<!--                :value="item.accountId"-->
<!--              />-->
<!--            </el-select>-->
<!--          </el-form-item>-->
<!--        </re-col>-->
<!--      </el-row>-->

<!--      <el-row :gutter="30">-->
<!--        <re-col :value="12">-->
<!--          <el-form-item prop="categoryId" label="分类">-->
<!--            <el-select-->
<!--              v-model="formData.categoryId"-->
<!--              placeholder="请选择分类"-->
<!--              style="width: 100%"-->
<!--            >-->
<!--              <el-option-->
<!--                v-for="item in categoryOptions"-->
<!--                :key="item.categoryId"-->
<!--                :label="item.categoryName"-->
<!--                :value="item.categoryId"-->
<!--              />-->
<!--            </el-select>-->
<!--          </el-form-item>-->
<!--        </re-col>-->
<!--        <re-col :value="12">-->
<!--          <el-form-item prop="payeeId" label="交易对象">-->
<!--            <el-select-->
<!--              v-model="formData.payeeId"-->
<!--              placeholder="请选择交易对象"-->
<!--              style="width: 100%"-->
<!--            >-->
<!--              <el-option-->
<!--                v-for="item in payeeOptions"-->
<!--                :key="item.payeeId"-->
<!--                :label="item.payeeName"-->
<!--                :value="item.payeeId"-->
<!--              />-->
<!--            </el-select>-->
<!--          </el-form-item>-->
<!--        </re-col>-->
<!--      </el-row>-->

<!--      <el-row :gutter="30">-->
<!--        <re-col :value="12">-->
<!--          <el-form-item prop="amount" label="金额">-->
<!--            <el-input-number-->
<!--              v-model="formData.amount"-->
<!--              :min="0.01"-->
<!--              :precision="2"-->
<!--              :controls="false"-->
<!--              style="width: 100%"-->
<!--            />-->
<!--          </el-form-item>-->
<!--        </re-col>-->
<!--        <re-col :value="12" v-if="formData.billType === 3">-->
<!--          <el-form-item prop="toAccountId" label="转入账户">-->
<!--            <el-select-->
<!--              v-model="formData.toAccountId"-->
<!--              placeholder="请选择转入账户"-->
<!--              style="width: 100%"-->
<!--            >-->
<!--              <el-option-->
<!--                v-for="item in accountOptions"-->
<!--                :key="item.accountId"-->
<!--                :label="item.accountName"-->
<!--                :value="item.accountId"-->
<!--              />-->
<!--            </el-select>-->
<!--          </el-form-item>-->
<!--        </re-col>-->
<!--      </el-row>-->

<!--      <el-row :gutter="30">-->
<!--        <re-col :value="12">-->
<!--          <el-form-item prop="confirm" label="是否确认">-->
<!--            <el-switch-->
<!--              v-model="formData.confirm"-->
<!--              active-text="已确认"-->
<!--              inactive-text="未确认"-->
<!--              inline-prompt-->
<!--            />-->
<!--          </el-form-item>-->
<!--        </re-col>-->
<!--        <re-col :value="12">-->
<!--          <el-form-item prop="include" label="是否统计">-->
<!--            <el-switch-->
<!--              v-model="formData.include"-->
<!--              active-text="统计"-->
<!--              inactive-text="不统计"-->
<!--              inline-prompt-->
<!--            />-->
<!--          </el-form-item>-->
<!--        </re-col>-->
<!--      </el-row>-->

<!--      <el-form-item prop="remark" label="备注">-->
<!--        <el-input-->
<!--          type="textarea"-->
<!--          v-model="formData.remark"-->
<!--          rows="4"-->
<!--          placeholder="请输入备注"-->
<!--        />-->
<!--      </el-form-item>-->
<!--    </el-form>-->
<!--  </v-dialog>-->
<!--</template>-->

<!--<script setup lang="ts">-->
<!--import { computed, onMounted, reactive, ref, watch } from "vue";-->
<!--import { ElMessage, FormRules } from "element-plus";-->
<!--import VDialog from "@/components/VDialog/VDialog.vue";-->
<!--import ReCol from "@/components/ReCol";-->
<!--import {-->
<!--  addBillApi,-->
<!--  modifyBillApi,-->
<!--  getCategoryList,-->
<!--  getPayeeList-->
<!--} from "@/api/fortune/bill";-->
<!--import { getEnableBookList } from "@/api/fortune/book";-->
<!--import { getAccountList } from "@/api/fortune/account";-->

<!--const props = defineProps<{-->
<!--  type: "add" | "edit";-->
<!--  modelValue: boolean;-->
<!--  row?: any;-->
<!--}>();-->

<!--const emits = defineEmits(["update:modelValue", "success"]);-->
<!--const visible = computed({-->
<!--  get: () => props.modelValue,-->
<!--  set: v => emits("update:modelValue", v)-->
<!--});-->

<!--const loading = ref(false);-->
<!--const formRef = ref();-->
<!--const billTypeOptions = [-->
<!--  { value: 1, label: "支出" },-->
<!--  { value: 2, label: "收入" },-->
<!--  { value: 3, label: "转账" }-->
<!--];-->

<!--const formData = reactive({-->
<!--  billId: null,-->
<!--  bookId: null,-->
<!--  title: "",-->
<!--  tradeTime: null,-->
<!--  accountId: null,-->
<!--  categoryId: null,-->
<!--  amount: 0,-->
<!--  payeeId: null,-->
<!--  billType: 1,-->
<!--  toAccountId: null,-->
<!--  confirm: true,-->
<!--  include: true,-->
<!--  remark: ""-->
<!--});-->

<!--const rules: FormRules = {-->
<!--  bookId: [{ required: true, message: "请选择账本" }],-->
<!--  billType: [{ required: true, message: "请选择交易类型" }],-->
<!--  title: [{ required: true, message: "请输入标题" }],-->
<!--  tradeTime: [{ required: true, message: "请选择交易时间" }],-->
<!--  accountId: [{ required: true, message: "请选择账户" }],-->
<!--  categoryId: [{ required: true, message: "请选择分类" }],-->
<!--  amount: [{ required: true, message: "请输入金额" }],-->
<!--  toAccountId: [-->
<!--    {-->
<!--      required: true,-->
<!--      message: "请选择转入账户",-->
<!--      trigger: "blur",-->
<!--      validator: (rule, value, callback) => {-->
<!--        if (formData.billType === 3 && !value) {-->
<!--          callback(new Error(rule.message));-->
<!--        } else {-->
<!--          callback();-->
<!--        }-->
<!--      }-->
<!--    }-->
<!--  ]-->
<!--};-->

<!--// 数据选项-->
<!--const bookOptions = ref([]);-->
<!--const accountOptions = ref([]);-->
<!--const categoryOptions = ref([]);-->
<!--const payeeOptions = ref([]);-->

<!--onMounted(async () => {-->
<!--  const [booksRes, accountsRes] = await Promise.all([-->
<!--    getEnableBookList(),-->
<!--    getAccountList()-->
<!--  ]);-->
<!--  bookOptions.value = booksRes.data;-->
<!--  accountOptions.value = accountsRes.data;-->
<!--});-->

<!--async function handleBookChange(bookId) {-->
<!--  const [categoryRes, payeeRes] = await Promise.all([-->
<!--    getCategoryList(bookId),-->
<!--    getPayeeList(bookId)-->
<!--  ]);-->
<!--  categoryOptions.value = categoryRes.data;-->
<!--  payeeOptions.value = payeeRes.data;-->
<!--}-->

<!--function handleBillTypeChange(type) {-->
<!--  if (type !== 3) {-->
<!--    formData.toAccountId = null;-->
<!--  }-->
<!--}-->

<!--function handleOpened() {-->
<!--  if (props.row) {-->
<!--    Object.assign(formData, props.row);-->
<!--    handleBookChange(props.row.bookId);-->
<!--  } else {-->
<!--    formRef.value?.resetFields();-->
<!--  }-->
<!--}-->

<!--async function handleConfirm() {-->
<!--  try {-->
<!--    await formRef.value.validate();-->
<!--    loading.value = true;-->

<!--    const params = { ...formData };-->
<!--    // 清理非转账类型的字段-->
<!--    if (params.billType !== 3) {-->
<!--      params.toAccountId = null;-->
<!--    }-->

<!--    if (props.type === "add") {-->
<!--      await addBillApi(params);-->
<!--    } else {-->
<!--      await modifyBillApi(params);-->
<!--    }-->

<!--    ElMessage.success("操作成功");-->
<!--    visible.value = false;-->
<!--    emits("success");-->
<!--  } catch (e) {-->
<!--    if (!e.message.includes("validate")) {-->
<!--      ElMessage.error(e.message || "操作失败");-->
<!--    }-->
<!--  } finally {-->
<!--    loading.value = false;-->
<!--  }-->
<!--}-->
<!--</script>-->
