// 通用的树形下拉框过滤方法
// 解决 el-tree-select 开启 filterable 后自定义节点过滤失效/错乱的 bug
export const filterNodeMethod = (key: string) => {
  return (value: string, data: any) => {
    if (!value) return true;
    return (
      data[key] && String(data[key]).toLowerCase().includes(value.toLowerCase())
    );
  };
};

// 标签下拉树配置
export const tagTreeProps = {
  label: "tagName",
  value: "tagId",
  children: "children"
};

// 分类下拉树配置
export const categoryTreeProps = {
  label: "categoryName",
  value: "categoryId",
  children: "children"
};

// 是/否 选项配置
export const trueFalseOptions = [
  { value: 1, label: "是" },
  { value: 0, label: "否" }
];
