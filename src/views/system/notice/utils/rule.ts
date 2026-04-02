import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
  noticeTitle: [
    { required: true, message: "公告标题为必填项", trigger: "blur" }
  ],
  noticeType: [
    { required: true, message: "公告类型为必填项", trigger: "change" }
  ],
  status: [{ required: true, message: "状态为必填项", trigger: "change" }],
  noticeContent: [
    { required: true, message: "公告内容为必填项", trigger: "blur" }
  ]
});
