import { useCallback, useRef, useState } from "react";
import ConfirmDialog from "../components/ConfirmDialog";

export default function useConfirm() {
  const [options, setOptions] = useState(null);
  const resolverRef = useRef(null);

  const confirm = useCallback((opts) => {
    const normalized = typeof opts === "string" ? { message: opts } : opts;
    resolverRef.current?.(false);
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setOptions(normalized);
    });
  }, []);

  const close = useCallback((result) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setOptions(null);
  }, []);

  const dialog = options ? (
    <ConfirmDialog
      {...options}
      onConfirm={() => close(true)}
      onCancel={() => close(false)}
    />
  ) : null;

  return [dialog, confirm];
}
