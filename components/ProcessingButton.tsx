import {
  useState,
  forwardRef,
  ButtonHTMLAttributes,
  ReactNode,
  useRef,
  useEffect,
} from "react";
import { DownloadIcon, CheckmarkIcon, XIcon } from "./Icons";

/* Utility */
const cn = (...classes: any[]) =>
  classes
    .flatMap((cls) => {
      if (typeof cls === "string") return cls;
      if (typeof cls === "object" && cls)
        return Object.entries(cls)
          .filter(([, ok]) => ok)
          .map(([k]) => k);
      return [];
    })
    .join(" ");

/* ------------------------- Base Button ------------------------- */

const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      {...props}
      className={cn(
        "inline-flex items-center justify-center",
        "rounded-md text-sm font-medium",
        "focus-visible:outline-none",
        "disabled:pointer-events-none disabled:opacity-50",
        "whitespace-nowrap",
        "h-9 px-3",
        className
      )}
    >
      {children}
    </button>
  );
});
Button.displayName = "Button";

/* ----------------------- Processing Button ----------------------- */

type ProcessingButtonProps = {
  onProcess: () => Promise<boolean>;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const ProcessingButton = ({
  className,
  onProcess,
  children,
  disabled,
  ...props
}: ProcessingButtonProps) => {
  const [state, setState] = useState<"idle" | "processing" | "success" | "error">("idle");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  async function handleClick() {
    if (state !== "idle") return;

    setState("processing");
    try {
      const ok = await onProcess();
      setState(ok ? "success" : "error");
    } catch (err) {
      console.error("ProcessingButton onProcess failed:", err);
      setState("error");
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setState("idle");
    }, 1500);
  }

  const isProcessing = state === "processing";

  return (
    <Button
      {...props}
      disabled={isProcessing || disabled}
      onClick={handleClick}
      className={cn(
        "overflow-visible",
        "whitespace-nowrap",
        "flex items-center gap-2",
        "px-3 h-9",
        {
          "cursor-wait": isProcessing, "bg-gray-100 dark:bg-bg-active hover:bg-gray-200 dark:hover:bg-tab-active":
            state === "idle" || state === "processing",
          "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-200 border border-green-300 dark:border-green-800":
            state === "success",
          "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-200 border border-red-300 dark:border-red-800":
            state === "error",
        },
        className
      )}
    >
      {state === "idle" && (
        <>
          {children}
        </>
      )}

      {state === "processing" && (
        <>
          <DownloadIcon className="w-4 h-4 flex-shrink-0 animate-bounce" />
          <span className="sm:inline">Processing...</span>
        </>
      )}

      {state === "success" && (
        <>
          <CheckmarkIcon className="w-4 h-4 flex-shrink-0" />
          <span className="font-semibold sm:inline">Complete!</span>
        </>
      )}

      {state === "error" && (
        <>
          <XIcon className="w-4 h-4 flex-shrink-0" />
          <span className="font-semibold sm:inline">Failed</span>
        </>
      )}
    </Button>
  );
};