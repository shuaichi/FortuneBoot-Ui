import "./circled.css";
import Cropper from "cropperjs";
import { ElUpload } from "element-plus";
import type { CSSProperties } from "vue";
import { useResizeObserver } from "@vueuse/core";
import { longpress } from "@/directives/longpress";
import { useTippy, directive as tippy } from "vue-tippy";
import { delay, debounce, isArray, downloadByBase64 } from "@pureadmin/utils";
import {
  ref,
  unref,
  computed,
  type PropType,
  onMounted,
  onUnmounted,
  defineComponent
} from "vue";
import {
  Reload,
  Upload,
  ArrowH,
  ArrowV,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ChangeIcon,
  ArrowRight,
  RotateLeft,
  SearchPlus,
  RotateRight,
  SearchMinus,
  DownloadIcon
} from "./svg";

// CropperJS v2: 选项通过 template 上的 Web Component 属性设置
// 保持 defaultOptions 用于内部参数映射
const defaultOptions = {
  aspectRatio: 1,
  movable: true,
  resizable: true,
  zoomable: true
};

const props = {
  src: { type: String, required: true },
  alt: { type: String },
  circled: { type: Boolean, default: false },
  realTimePreview: { type: Boolean, default: true },
  height: { type: [String, Number], default: "360px" },
  crossorigin: {
    type: String as PropType<"" | "anonymous" | "use-credentials" | undefined>,
    default: undefined
  },
  imageStyle: { type: Object as PropType<CSSProperties>, default: () => ({}) },
  options: {
    type: Object as PropType<Record<string, any>>,
    default: () => ({})
  }
};

export default defineComponent({
  name: "ReCropper",
  props,
  setup(props, { attrs, emit }) {
    const tippyElRef = ref<ElRef<HTMLImageElement>>();
    const imgElRef = ref<ElRef<HTMLImageElement>>();
    const cropper = ref<any>(null);
    const isReady = ref(false);
    const imgBase64 = ref();
    const inCircled = ref(props.circled);
    const inSrc = ref(props.src);
    let scaleX = 1;
    let scaleY = 1;

    const debounceRealTimeCroppered = debounce(realTimeCroppered, 80);

    const getImageStyle = computed((): CSSProperties => {
      return {
        height: props.height,
        maxWidth: "100%",
        ...props.imageStyle
      };
    });

    const getClass = computed(() => {
      return [
        attrs.class,
        {
          ["re-circled"]: inCircled.value
        }
      ];
    });

    const iconClass = computed(() => {
      return [
        "p-[6px]",
        "h-[30px]",
        "w-[30px]",
        "outline-none",
        "rounded-[4px]",
        "cursor-pointer",
        "hover:bg-[rgba(0,0,0,0.06)]"
      ];
    });

    const getWrapperStyle = computed((): CSSProperties => {
      return { height: `${props.height}`.replace(/px/, "") + "px" };
    });

    onMounted(init);

    onUnmounted(() => {
      cropper.value?.destroy();
    });

    useResizeObserver(tippyElRef, () => {
      handCropper("reset");
    });

    // CropperJS v2 的初始化方式
    async function init() {
      const imgEl = unref(imgElRef);
      if (!imgEl) return;

      // CropperJS v2: 使用 template 定义裁剪器布局
      const mergedOptions = { ...defaultOptions, ...props.options };
      const aspectRatio = mergedOptions.aspectRatio || NaN;

      cropper.value = new Cropper(imgEl, {
        container: unref(tippyElRef) || undefined,
        template: `
          <cropper-canvas background>
            <cropper-image
              rotatable
              scalable
              skewable
              translatable
            ></cropper-image>
            <cropper-shade hidden></cropper-shade>
            <cropper-handle action="select" plain></cropper-handle>
            <cropper-selection
              initial-coverage="0.5"
              movable
              resizable
              zoomable
              ${!isNaN(aspectRatio) ? `aspect-ratio="${aspectRatio}"` : ""}
            >
              <cropper-grid role="grid" covered></cropper-grid>
              <cropper-crosshair centered></cropper-crosshair>
              <cropper-handle action="move" theme-color="rgba(255, 255, 255, 0.35)"></cropper-handle>
              <cropper-handle action="n-resize"></cropper-handle>
              <cropper-handle action="e-resize"></cropper-handle>
              <cropper-handle action="s-resize"></cropper-handle>
              <cropper-handle action="w-resize"></cropper-handle>
              <cropper-handle action="ne-resize"></cropper-handle>
              <cropper-handle action="nw-resize"></cropper-handle>
              <cropper-handle action="se-resize"></cropper-handle>
              <cropper-handle action="sw-resize"></cropper-handle>
            </cropper-selection>
          </cropper-canvas>
        `
      });

      // 监听 ready 事件
      const canvas = cropper.value.getCropperCanvas();
      if (canvas) {
        canvas.addEventListener("ready", () => {
          isReady.value = true;
          realTimeCroppered();
          delay(400).then(() => emit("readied", cropper.value));
        });
        canvas.addEventListener("actionend", () => {
          debounceRealTimeCroppered();
        });
      }
    }

    function realTimeCroppered() {
      props.realTimePreview && croppered();
    }

    async function croppered() {
      if (!cropper.value) return;
      const selection = cropper.value.getCropperSelection();
      if (!selection) return;

      try {
        let canvas: HTMLCanvasElement;
        if (inCircled.value) {
          const sourceCanvas = await selection.$toCanvas();
          canvas = getRoundedCanvas(sourceCanvas);
        } else {
          canvas = await selection.$toCanvas();
        }

        canvas.toBlob(blob => {
          if (!blob) return;
          const fileReader: FileReader = new FileReader();
          fileReader.readAsDataURL(blob);
          fileReader.onloadend = e => {
            if (!e.target?.result || !blob) return;
            imgBase64.value = e.target.result;
            emit("cropper", {
              base64: e.target.result,
              blob,
              info: {
                size: blob.size,
                x: selection.x || 0,
                y: selection.y || 0,
                width: selection.width || 0,
                height: selection.height || 0
              }
            });
          };
          fileReader.onerror = () => {
            emit("error");
          };
        });
      } catch {
        // 选区可能尚未就绪
      }
    }

    function getRoundedCanvas(sourceCanvas: HTMLCanvasElement) {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d")!;
      const width = sourceCanvas.width;
      const height = sourceCanvas.height;
      canvas.width = width;
      canvas.height = height;
      context.imageSmoothingEnabled = true;
      context.drawImage(sourceCanvas, 0, 0, width, height);
      context.globalCompositeOperation = "destination-in";
      context.beginPath();
      context.arc(
        width / 2,
        height / 2,
        Math.min(width, height) / 2,
        0,
        2 * Math.PI,
        true
      );
      context.fill();
      return canvas;
    }

    // CropperJS v2: 通过 CropperImage 和 CropperSelection 的方法操作
    function handCropper(event: string, arg?: number | Array<number>) {
      const image = cropper.value?.getCropperImage?.();
      const selection = cropper.value?.getCropperSelection?.();

      if (!image && !selection) return;

      switch (event) {
        case "reset":
          image?.$resetTransform?.();
          selection?.$reset?.();
          break;
        case "move":
          if (isArray(arg)) {
            image?.$move?.(arg[0], arg[1]);
          }
          break;
        case "rotate":
          image?.$rotate?.(arg as number);
          debounceRealTimeCroppered();
          break;
        case "zoom":
          image?.$zoom?.(arg as number);
          debounceRealTimeCroppered();
          break;
        case "scaleX":
          scaleX = scaleX === -1 ? 1 : -1;
          image?.$scale?.(scaleX, undefined);
          debounceRealTimeCroppered();
          break;
        case "scaleY":
          scaleY = scaleY === -1 ? 1 : -1;
          image?.$scale?.(undefined, scaleY);
          debounceRealTimeCroppered();
          break;
      }
    }

    function beforeUpload(file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      inSrc.value = "";
      reader.onload = e => {
        inSrc.value = e.target?.result as string;
      };
      reader.onloadend = () => {
        // CropperJS v2: 销毁旧实例并重新初始化
        cropper.value?.destroy();
        isReady.value = false;
        delay(100).then(() => init());
      };
      return false;
    }

    const menuContent = defineComponent({
      directives: {
        tippy,
        longpress
      },
      setup() {
        return () => (
          <div class="flex flex-wrap w-[60px] justify-between">
            <ElUpload
              accept="image/*"
              show-file-list={false}
              before-upload={beforeUpload}
            >
              <Upload
                class={iconClass.value}
                v-tippy={{
                  content: "上传",
                  placement: "left-start"
                }}
              />
            </ElUpload>
            <DownloadIcon
              class={iconClass.value}
              v-tippy={{
                content: "下载",
                placement: "right-start"
              }}
              onClick={() => downloadByBase64(imgBase64.value, "cropping.png")}
            />
            <ChangeIcon
              class={iconClass.value}
              v-tippy={{
                content: "圆形、矩形裁剪",
                placement: "left-start"
              }}
              onClick={() => {
                inCircled.value = !inCircled.value;
                realTimeCroppered();
              }}
            />
            <Reload
              class={iconClass.value}
              v-tippy={{
                content: "重置",
                placement: "right-start"
              }}
              onClick={() => handCropper("reset")}
            />
            <ArrowUp
              class={iconClass.value}
              v-tippy={{
                content: "上移（可长按）",
                placement: "left-start"
              }}
              v-longpress={[() => handCropper("move", [0, -10]), "0:100"]}
            />
            <ArrowDown
              class={iconClass.value}
              v-tippy={{
                content: "下移（可长按）",
                placement: "right-start"
              }}
              v-longpress={[() => handCropper("move", [0, 10]), "0:100"]}
            />
            <ArrowLeft
              class={iconClass.value}
              v-tippy={{
                content: "左移（可长按）",
                placement: "left-start"
              }}
              v-longpress={[() => handCropper("move", [-10, 0]), "0:100"]}
            />
            <ArrowRight
              class={iconClass.value}
              v-tippy={{
                content: "右移（可长按）",
                placement: "right-start"
              }}
              v-longpress={[() => handCropper("move", [10, 0]), "0:100"]}
            />
            <ArrowH
              class={iconClass.value}
              v-tippy={{
                content: "水平翻转",
                placement: "left-start"
              }}
              onClick={() => handCropper("scaleX", -1)}
            />
            <ArrowV
              class={iconClass.value}
              v-tippy={{
                content: "垂直翻转",
                placement: "right-start"
              }}
              onClick={() => handCropper("scaleY", -1)}
            />
            <RotateLeft
              class={iconClass.value}
              v-tippy={{
                content: "逆时针旋转",
                placement: "left-start"
              }}
              onClick={() => handCropper("rotate", -45)}
            />
            <RotateRight
              class={iconClass.value}
              v-tippy={{
                content: "顺时针旋转",
                placement: "right-start"
              }}
              onClick={() => handCropper("rotate", 45)}
            />
            <SearchPlus
              class={iconClass.value}
              v-tippy={{
                content: "放大（可长按）",
                placement: "left-start"
              }}
              v-longpress={[() => handCropper("zoom", 0.1), "0:100"]}
            />
            <SearchMinus
              class={iconClass.value}
              v-tippy={{
                content: "缩小（可长按）",
                placement: "right-start"
              }}
              v-longpress={[() => handCropper("zoom", -0.1), "0:100"]}
            />
          </div>
        );
      }
    });

    function onContextmenu(event) {
      event.preventDefault();

      const { show, setProps } = useTippy(tippyElRef, {
        content: menuContent,
        arrow: false,
        theme: "light",
        trigger: "manual",
        interactive: true,
        appendTo: "parent",
        // hideOnClick: false,
        animation: "perspective",
        placement: "bottom-start"
      });

      setProps({
        getReferenceClientRect: () => ({
          width: 0,
          height: 0,
          top: event.clientY,
          bottom: event.clientY,
          left: event.clientX,
          right: event.clientX
        })
      });

      show();
    }

    return {
      inSrc,
      props,
      imgElRef,
      tippyElRef,
      getClass,
      getWrapperStyle,
      getImageStyle,
      isReady,
      croppered,
      onContextmenu
    };
  },

  render() {
    const {
      inSrc,
      isReady,
      getClass,
      getImageStyle,
      onContextmenu,
      getWrapperStyle
    } = this;
    const { alt, crossorigin } = this.props;

    return inSrc ? (
      <div
        ref="tippyElRef"
        class={getClass}
        style={getWrapperStyle}
        onContextmenu={event => onContextmenu(event)}
      >
        <img
          v-show={isReady}
          ref="imgElRef"
          style={getImageStyle}
          src={inSrc}
          alt={alt}
          crossorigin={crossorigin}
        />
      </div>
    ) : null;
  }
});
