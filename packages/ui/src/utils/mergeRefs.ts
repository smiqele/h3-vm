import type { MutableRefObject, Ref, RefCallback } from "react";

function assignRef<Value>(ref: Ref<Value> | undefined, value: Value | null) {
  if (!ref) return;

  if (typeof ref === "function") {
    ref(value);
    return;
  }

  (ref as MutableRefObject<Value | null>).current = value;
}

export function mergeRefs<Value>(
  ...refs: Array<Ref<Value> | undefined>
): RefCallback<Value> {
  return (value) => {
    refs.forEach((ref) => assignRef(ref, value));
  };
}
