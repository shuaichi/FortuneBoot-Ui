// // bill-hook.tsx
// import { reactive, ref } from "vue";
// import { message } from "@/utils/message";
// import { ElMessageBox } from "element-plus";
// import { usePublicHooks } from "@/views/system/hooks";
// import {
//   BillQuery,
//   BillVo,
//   getBillPage,
//   deleteBillApi,
//   confirmBillApi,
//   unconfirmBillApi,
//   includeBillApi,
//   excludeBillApi
// } from "@/api/fortune/bill";
//
// export function useHook() {
//   const { tagStyle } = usePublicHooks();
//   const loading = ref(false);
//   const dataList = ref<BillVo[]>([]);
//   const searchFormParams = reactive<BillQuery>({});
//   const pagination = reactive({
//     total: 0,
//     pageSize: 10,
//     currentPage: 1,
//     background: true
//   });
//
//   const billTypeOptions = [
//     { value: 1, label: "支出" },
//     { value: 2, label: "收入" },
//     { value: 3, label: "转账" }
//   ];
//
//   const columns: TableColumnList = [
//     {
//       label: "标题",
//       prop: "title",
//       width: 200,
//       align: "left"
//     },
//     {
//       label: "类型",
//       prop: "billType",
//       width: 100,
//       formatter: ({ billType }) =>
//         billTypeOptions.find(t => t.value === billType)?.label
//     },
//     {
//       label: "金额",
//       prop: "amount",
//       width: 150,
//       formatter: ({ amount, currencyCode }) =>
//         `${currencyCode} ${amount.toFixed(2)}`
//     },
//     {
//       label: "账户",
//       prop: "accountName",
//       width: 150
//     },
//     {
//       label: "交易时间",
//       prop: "tradeTime",
//       width: 180
//     },
//     {
//       label: "确认状态",
//       prop: "confirm",
//       width: 120,
//       cellRenderer: ({ row, props }) => (
//         <el-tag
//           size={props.size}
//           style={tag
