import dayjs from "dayjs";
import editForm from "../form.vue";
import { handleTree, setDisabledForTreeOptions } from "@/utils/tree";
import { message } from "@/utils/message";
import { transferToStandardRouterData } from "./menuLogic";
import {
  type MenuDTO,
  type MenuRequest,
  getMenuListApi,
  addMenuApi,
  deleteMenuApi,
  getMenuInfoApi,
  updateMenuApi,
  type MenuDetailDTO
} from "@/api/system/menu";
import { usePublicHooks } from "../../hooks";
import { addDialog } from "@/components/ReDialog";
import { reactive, ref, onMounted, h, computed } from "vue";
import { isAllEmpty } from "@pureadmin/utils";
import { IconifyIconOnline } from "@/components/ReIcon";

/**
 * 过滤树结构，保留命中节点及其所有祖先节点
 * @param treeData 树形数据
 * @param predicate 过滤条件函数，返回 true 表示该节点命中
 * @returns 过滤后的树形数据
 */
function filterTree<T extends { children?: T[] }>(
  treeData: T[],
  predicate: (node: T) => boolean
): T[] {
  const result: T[] = [];

  for (const node of treeData) {
    // 递归过滤子节点
    const filteredChildren = node.children
      ? filterTree(node.children, predicate)
      : [];

    // 如果当前节点命中，或者有子节点命中，则保留该节点
    if (predicate(node) || filteredChildren.length > 0) {
      result.push({
        ...node,
        children: filteredChildren.length > 0 ? filteredChildren : node.children
      });
    }
  }

  return result;
}

export function useHook() {
  const searchFormParams = reactive({
    menuName: "",
    status: null
  });

  const formRef = ref();

  const originalDataList = ref([]);
  const dataList = computed(() => {
    // 先将原始数据转成树结构
    const treeData = handleTree(originalDataList.value);

    // 判断是否有搜索条件
    const hasMenuNameFilter = !isAllEmpty(searchFormParams.menuName);
    const hasStatusFilter = !isAllEmpty(searchFormParams.status);

    // 如果没有任何搜索条件，直接返回完整的树结构
    if (!hasMenuNameFilter && !hasStatusFilter) {
      return [...treeData];
    }

    // 在树结构上进行过滤，保留命中节点及其所有祖先节点
    return filterTree(treeData, (item: MenuDTO) => {
      let match = true;
      if (hasMenuNameFilter) {
        match = match && item.menuName.includes(searchFormParams.menuName);
      }
      if (hasStatusFilter) {
        match = match && item.status === searchFormParams.status;
      }
      return match;
    });
  });
  const loading = ref(true);
  const { tagStyle } = usePublicHooks();

  const columns: TableColumnList = [
    {
      label: "菜单名称",
      prop: "menuName",
      width: 200,
      align: "left"
    },
    {
      label: "页面路径",
      prop: "path",
      minWidth: 170
    },
    {
      label: "路由名称",
      prop: "routerName",
      width: 160,
      align: "center"
    },
    {
      label: "图标",
      prop: "row.icon",
      minWidth: 40,
      cellRenderer: ({ row }) => (
        <div class="flex justify-center">
          <IconifyIconOnline icon={row.icon} />
        </div>
      )
    },
    {
      label: "状态",
      prop: "status",
      minWidth: 100,
      cellRenderer: ({ row, props }) => (
        <el-tag size={props.size} style={tagStyle.value(row.status)}>
          {row.status === 1 ? "启用" : "停用"}
        </el-tag>
      )
    },
    {
      label: "类型",
      prop: "isButton",
      minWidth: 100,
      formatter: ({ isButton }) => (isButton ? "按钮" : "菜单")
    },
    {
      label: "子类型",
      prop: "menuTypeStr",
      minWidth: 100
    },
    {
      label: "排序",
      prop: "rank",
      minWidth: 70
    },
    {
      label: "创建时间",
      minWidth: 200,
      prop: "createTime",
      formatter: ({ createTime }) =>
        dayjs(createTime).format("YYYY-MM-DD HH:mm:ss")
    },
    {
      label: "操作",
      fixed: "right",
      width: 240,
      slot: "operation"
    }
  ];

  function resetForm(formEl) {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  }

  async function onSearch() {
    loading.value = true;
    // 这里是返回一维数组结构，前端自行处理成树结构，返回格式要求：唯一id加父节点parentId，parentId取父节点id
    const { data } = await getMenuListApi({ isButton: null }).finally(() => {
      loading.value = false;
    });
    originalDataList.value = data;
  }

  /**
   * 测试用例
   * 1.添加外链跳转菜单
   * 2.添加iframe菜单  外链+内链
   * 3.添加目录
   * 4.添加一级菜单
   * 5.添加按钮
   * 6.iframe和外链跳转不允许添加按钮
   * 7.只允许目录添加子菜单
   * 8.基于目录 测试以上1~5的步骤
   * @param row dialog表单数据
   * @param done
   */
  async function handleAdd(row, done) {
    await addMenuApi(row).then(() => {
      message(`您新增了菜单:${row.menuName}`, {
        type: "success"
      });
      // 关闭弹框
      done();
      // 刷新列表
      onSearch();
    });
  }

  /**
   * 测试用例
   * 1.编辑页面/目录/iframe/外链/按钮的数据
   * 2.更换父级菜单
   * 3.不允许改变类型(会导致逻辑变复杂，比如改变类型需要考虑子节点)
   * @param row
   * @param done
   */
  async function handleUpdate(row, done) {
    await updateMenuApi(row.id, row).then(() => {
      message(`您更新了菜单:${row.menuName}`, {
        type: "success"
      });
      // 关闭弹框
      done();
      // 刷新列表
      onSearch();
    });
  }

  async function openDialog(title = "新增", row?: MenuDTO) {
    // 下拉选项需要排除掉按钮
    const { data } = await getMenuListApi({ isButton: false });
    const optionTree = setDisabledForTreeOptions(handleTree(data), "status");

    let meta = undefined;
    if (title === "编辑") {
      row = (await getMenuInfoApi(row.id + "")).data;
      meta = (row as MenuDetailDTO).meta;
    }

    console.log(row);

    // TODO 为什么声明一个formInline变量,把变量填充进去，  再给props.formInline 结果就不生效
    addDialog({
      title: `${title}菜单`,
      props: {
        formInline: {
          id: row?.id ?? 0,
          parentId: row?.parentId ?? 0,
          menuName: row?.menuName ?? "",
          routerName: row?.routerName ?? "",
          path: row?.path ?? "",
          isButton: row?.isButton,
          permission: row?.permission ?? "",
          menuType: row?.menuType ?? undefined,
          status: row?.status ?? 1,
          meta: meta ?? { rank: 0 }
        },
        higherMenuOptions: [...optionTree]
      },
      width: "60%",
      draggable: true,
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as MenuRequest;

        // 将菜单的数据转换为标准的路由数据
        transferToStandardRouterData(curData, optionTree);

        console.log(curData);

        FormRef.validate(valid => {
          if (valid) {
            // 表单规则校验通过
            if (title === "新增") {
              handleAdd(curData, done);
            } else {
              // 实际开发先调用编辑接口，再进行下面操作
              handleUpdate(curData, done);
            }
          }
        });
      }
    });
  }

  async function handleDelete(row) {
    await deleteMenuApi(row.id).then(() => {
      message(`您删除了${row.menuName}`, { type: "success" });
      // 刷新列表
      onSearch();
    });
  }

  onMounted(() => {
    onSearch();
  });

  return {
    searchFormParams,
    loading,
    columns,
    dataList,
    onSearch,
    resetForm,
    openDialog,
    handleDelete
  };
}
