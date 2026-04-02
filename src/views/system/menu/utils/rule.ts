import type { FormRules } from "element-plus";

/**
 * 获取菜单表单校验规则
 * @param getFormData 获取表单数据的函数，用于动态校验
 */
export const getFormRules = (
  getFormData: () => {
    isButton?: boolean;
    menuType?: number;
  }
): FormRules => ({
  menuName: [{ required: true, message: "请输入菜单名称", trigger: "blur" }],
  path: [
    {
      validator: (_rule, value, callback) => {
        const formData = getFormData();
        // 菜单类型为页面(1)或目录(2)时，path 必填
        if (
          formData.isButton === false &&
          (formData.menuType === 1 || formData.menuType === 2)
        ) {
          if (!value || value.trim() === "") {
            callback(new Error("请输入路径"));
          } else {
            callback();
          }
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ],
  permission: [
    {
      validator: (_rule, value, callback) => {
        const formData = getFormData();
        // 按钮类型时，permission 必填
        if (formData.isButton === true) {
          if (!value || value.trim() === "") {
            callback(new Error("请输入权限标识"));
          } else {
            callback();
          }
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ]
});

/** 兼容旧版本的静态导出（无动态校验能力） */
export const formRules: FormRules = {
  menuName: [{ required: true, message: "请输入菜单名称", trigger: "blur" }]
};
