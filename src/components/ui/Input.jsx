import { forwardRef } from "react";
import { cn } from "../../lib/utils";

export const Input = forwardRef(({ className, type = "text", error, ...props }, ref) => {
  return (
    <div className="w-full">
      <input
        type={type}
        className={cn(
          // ⬇️ Yahan text-slate-900 dark:text-white add kiya hai
          "flex h-11 w-full rounded-lg border bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-white transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50",
          error ? "border-red-500 focus-visible:ring-red-500" : "border-slate-200 dark:border-slate-800",
          className
        )}
        ref={ref}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
});
Input.displayName = "Input";