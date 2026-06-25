<template>
  <v-dialog
    v-model="visible"
    title="导入账单"
    :loading="uploading"
    confirm-text="上传"
    :fixed-body-height="false"
    @opened="handleOpened"
    @confirm="handleSubmit"
    @cancel="visible = false"
  >
    <el-form label-width="100px">
      <el-form-item label="所属账本" required>
        <el-select
          v-model="selectedBookId"
          :loading="loadingBooks"
          :disabled="loadingBooks || uploading"
          filterable
          placeholder="请选择账本"
          style="width: 100%"
        >
          <el-option
            v-for="item in bookOptions"
            :key="item.bookId"
            :label="item.bookName"
            :value="item.bookId"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="导入模板">
        <el-button
          type="primary"
          :loading="downloadingTemplate"
          :disabled="!selectedBookId || uploading"
          @click="handleDownloadTemplate"
        >
          下载模板
        </el-button>
      </el-form-item>

      <el-form-item label="Excel文件" required>
        <el-upload
          ref="uploadRef"
          v-model:file-list="fileList"
          accept=".xls,.xlsx"
          :auto-upload="false"
          :limit="1"
          :disabled="uploading"
          :on-change="handleFileChange"
          :on-exceed="handleFileExceed"
        >
          <el-button :disabled="uploading">选择文件</el-button>
          <template #tip>
            <div class="el-upload__tip">
              仅支持 .xls / .xlsx，文件大小不超过 10MB
            </div>
          </template>
        </el-upload>
      </el-form-item>
    </el-form>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { AxiosResponse } from "axios";
import type { UploadFile, UploadInstance, UploadRawFile } from "element-plus";
import { genFileId } from "element-plus";
import { downloadByData } from "@pureadmin/utils";
import VDialog from "@/components/VDialog/VDialog.vue";
import { getEnableBookList, type BookVo } from "@/api/fortune/book";
import {
  downloadBillExcelTemplateApi,
  importBillApi,
  type FortuneBillImportResultVo
} from "@/api/fortune/bill";
import { message } from "@/utils/message";

interface Props {
  modelValue: boolean;
  groupId?: number;
  bookId?: number;
}

interface ImportResponse extends ResponseData<FortuneBillImportResultVo> {}

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const EXCEL_EXTENSIONS = [".xls", ".xlsx"];

const props = defineProps<Props>();
const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [];
}>();

const visible = computed({
  get: () => props.modelValue,
  set: value => {
    emit("update:modelValue", value);
    if (!value) {
      resetDialog();
    }
  }
});

const uploadRef = ref<UploadInstance>();
const bookOptions = ref<BookVo[]>([]);
const selectedBookId = ref<number>();
const fileList = ref<UploadFile[]>([]);
const loadingBooks = ref(false);
const downloadingTemplate = ref(false);
const uploading = ref(false);

const handleOpened = async () => {
  await loadBookOptions();
};

const loadBookOptions = async () => {
  if (!props.groupId) {
    message("请先选择分组", { type: "warning" });
    return;
  }

  loadingBooks.value = true;
  try {
    const res = await getEnableBookList(props.groupId);
    bookOptions.value = res.data;
    const currentBook = bookOptions.value.find(
      item => item.bookId === props.bookId
    );
    selectedBookId.value = currentBook?.bookId ?? bookOptions.value[0]?.bookId;
    if (bookOptions.value.length === 0) {
      message("请先启用或创建账本", { type: "warning" });
    }
  } finally {
    loadingBooks.value = false;
  }
};

const handleDownloadTemplate = async () => {
  if (!selectedBookId.value) {
    message("请选择账本", { type: "warning" });
    return;
  }

  downloadingTemplate.value = true;
  try {
    const response = await downloadBillExcelTemplateApi(selectedBookId.value);
    if (await handleJsonErrorResponse(response)) {
      return;
    }
    downloadBlobResponse(response, "账单导入模板.xlsx");
  } catch (error) {
    handleRequestError(error, "模板下载失败");
  } finally {
    downloadingTemplate.value = false;
  }
};

const handleFileChange = (file: UploadFile) => {
  const rawFile = file.raw;
  if (!rawFile) {
    fileList.value = [];
    return;
  }

  if (!validateExcelFile(rawFile)) {
    fileList.value = [];
    uploadRef.value?.clearFiles();
    return;
  }

  fileList.value = [file];
};

const handleFileExceed = (files: File[]) => {
  uploadRef.value?.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  uploadRef.value?.handleStart(file);
};

const handleSubmit = async () => {
  if (!selectedBookId.value) {
    message("请选择账本", { type: "warning" });
    return;
  }

  const file = fileList.value[0]?.raw;
  if (!file) {
    message("请选择Excel文件", { type: "warning" });
    return;
  }

  if (!validateExcelFile(file)) {
    return;
  }

  uploading.value = true;
  try {
    const response = await importBillApi(selectedBookId.value, file);
    const contentType = getResponseContentType(response);

    if (contentType.includes("application/json")) {
      const result = await parseBlobJson<ImportResponse>(response.data);
      if (!isSuccessCode(result.code)) {
        message(result.msg || "导入失败", { type: "error" });
        return;
      }

      message(result.data?.message || result.msg || "导入成功", {
        type: "success"
      });
      visible.value = false;
      emit("success");
      return;
    }

    downloadBlobResponse(response, "账单导入错误.xlsx");
    message("导入失败，请根据错误文件修改后重新上传", { type: "warning" });
  } catch (error) {
    handleRequestError(error, "导入失败");
  } finally {
    uploading.value = false;
  }
};

const resetDialog = () => {
  fileList.value = [];
  uploading.value = false;
  downloadingTemplate.value = false;
  uploadRef.value?.clearFiles();
};

const validateExcelFile = (file: File): boolean => {
  if (!isExcelFile(file)) {
    message("仅支持 .xls / .xlsx 文件", { type: "warning" });
    return false;
  }

  if (file.size > MAX_FILE_SIZE) {
    message("文件大小不能超过 10MB", { type: "warning" });
    return false;
  }

  return true;
};

const isExcelFile = (file: File): boolean => {
  const fileName = file.name.toLowerCase();
  return EXCEL_EXTENSIONS.some(extension => fileName.endsWith(extension));
};

const handleJsonErrorResponse = async (
  response: AxiosResponse<Blob>
): Promise<boolean> => {
  const contentType = getResponseContentType(response);
  if (!contentType.includes("application/json")) {
    return false;
  }

  const result = await parseBlobJson<ImportResponse>(response.data);
  if (!isSuccessCode(result.code)) {
    message(result.msg || "操作失败", { type: "error" });
    return true;
  }

  return false;
};

const isSuccessCode = (code: number): boolean => code === 0 || code === 200;

const getResponseContentType = (response: AxiosResponse<Blob>): string => {
  return String(response.headers["content-type"] ?? response.data.type ?? "");
};

const parseBlobJson = async <T,>(blob: Blob): Promise<T> => {
  const text = await blob.text();
  return JSON.parse(text) as T;
};

const getFilenameFromDisposition = (
  disposition: string | undefined,
  fallback: string
): string => {
  if (!disposition) {
    return fallback;
  }

  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return sanitizeFilename(safeDecodeURIComponent(utf8Match[1]), fallback);
  }

  const filenameMatch = disposition.match(/filename="?([^";]+)"?/i);
  if (filenameMatch?.[1]) {
    return sanitizeFilename(safeDecodeURIComponent(filenameMatch[1]), fallback);
  }

  return fallback;
};

const safeDecodeURIComponent = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const sanitizeFilename = (filename: string, fallback: string): string => {
  const sanitized = filename
    .replace(/[\\/:*?"<>|\r\n\u0000-\u001f\u007f-\u009f\u202a-\u202e]/g, "")
    .trim()
    .slice(0, 120);

  if (!sanitized || !isExcelFilename(sanitized)) {
    return fallback;
  }

  return sanitized;
};

const isExcelFilename = (filename: string): boolean => {
  const lowerFilename = filename.toLowerCase();
  return EXCEL_EXTENSIONS.some(extension => lowerFilename.endsWith(extension));
};

const downloadBlobResponse = (
  response: AxiosResponse<Blob>,
  fallbackName: string
) => {
  const filename = getFilenameFromDisposition(
    response.headers["content-disposition"],
    fallbackName
  );
  downloadByData(response.data, filename);
};

const handleRequestError = (error: unknown, fallbackMessage: string) => {
  if (isAxiosErrorWithStatus(error, 403)) {
    message("没有该账本的导入权限", { type: "error" });
    return;
  }

  if (error instanceof Error) {
    message(error.message || fallbackMessage, { type: "error" });
    return;
  }

  message(fallbackMessage, { type: "error" });
};

const isAxiosErrorWithStatus = (error: unknown, status: number): boolean => {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "status" in error.response &&
    error.response.status === status
  );
};
</script>
