import type { PaginationProps, TableColumn } from "@pureadmin/table";
import type { Sort } from "element-plus";
import ExcelJS from "exceljs";
import { message } from "./message";
import { pinyin } from "pinyin-pro";

export class CommonUtils {
  static getBeginTimeSafely(timeRange: string[]): string {
    if (timeRange == null) {
      return undefined;
    }

    if (timeRange.length <= 0) {
      return undefined;
    }

    if (timeRange[0] == null) {
      return undefined;
    }

    return timeRange[0];
  }

  static getEndTimeSafely(timeRange: string[]): string {
    if (timeRange == null) {
      return undefined;
    }

    if (timeRange.length <= 1) {
      return undefined;
    }

    if (timeRange[1] == null) {
      return undefined;
    }

    return timeRange[1];
  }

  static fillPaginationParams(
    baseQuery: BasePageQuery,
    pagination: PaginationProps
  ) {
    baseQuery.pageNum = pagination.currentPage;
    baseQuery.pageSize = pagination.pageSize;
  }

  static fillSortParams(baseQuery: BasePageQuery, sort: Sort) {
    if (sort == null) {
      return;
    }
    baseQuery.orderColumn = sort.prop;
    baseQuery.orderDirection = sort.order;
  }

  /** 适用于BaseQuery中固定的时间参数  beginTime和endTime参数 */
  static fillTimeRangeParams(baseQuery: any, timeRange: string[]) {
    if (timeRange == null || timeRange.length == 0 || timeRange === undefined) {
      baseQuery["beginTime"] = undefined;
      baseQuery["endTime"] = undefined;
      return;
    }

    if (baseQuery == null || baseQuery === undefined) {
      return;
    }

    baseQuery["beginTime"] = CommonUtils.getBeginTimeSafely(timeRange);
    baseQuery["endTime"] = CommonUtils.getEndTimeSafely(timeRange);
  }

  static async exportExcel(
    columns: TableColumnList,
    originalDataList: any[],
    excelName: string
  ) {
    if (
      !Array.isArray(columns) ||
      !Array.isArray(originalDataList) ||
      typeof excelName !== "string"
    ) {
      message("参数异常，导出失败", { type: "error" });
      return;
    }

    // columns和dataList为空的话 弹出提示 不执行导出
    if (columns.length === 0 || originalDataList.length === 0) {
      message("无法导出空列表", { type: "warning" });
      return;
    }

    const titleList: string[] = [];
    const dataKeyList: string[] = [];
    // 把columns里面的label取出来作为excel的列标题，把prop取出来等下从dataList里面根据作为key取对象中的值
    columns.forEach((column: TableColumn) => {
      if (column.label && column.prop) {
        titleList.push(column.label);
        dataKeyList.push(column.prop as string);
      }
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(excelName);

    // 添加表头
    worksheet.addRow(titleList);

    // 添加数据行
    originalDataList.forEach(item => {
      const row = dataKeyList.map(dataKey => item[dataKey]);
      worksheet.addRow(row);
    });

    // 导出为文件并下载
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${excelName}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
  }

  static paginateList(dataList: any[], pagination: PaginationProps): any[] {
    // 计算起始索引
    const startIndex = (pagination.currentPage - 1) * pagination.pageSize;

    // 截取数组
    const endIndex = startIndex + pagination.pageSize;
    const paginatedList = dataList.slice(startIndex, endIndex);

    // 返回截取后的数组
    return paginatedList;
  }

  static toPinyin(chineseStr: string): string {
    if (chineseStr == null || chineseStr === undefined || chineseStr === "") {
      return chineseStr;
    }

    const pinyinStr = pinyin(chineseStr, { toneType: "none" });
    return pinyinStr.replace(/\s/g, "");
  }

  // 私有构造函数，防止类被实例化
  private constructor() {}
}
