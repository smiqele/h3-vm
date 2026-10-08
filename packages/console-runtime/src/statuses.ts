import { resourceStatuses } from "./statuses.generated";

export { resourceStatuses };
export type StatusResource = keyof typeof resourceStatuses;
export type VmStatusValue = keyof typeof resourceStatuses["virtual-machine"];

/** Unknown API values are displayed explicitly instead of implying a healthy state. */
export function getResourceStatusPresentation(resource: StatusResource, status: string) {
  const entries = resourceStatuses[resource];
  return Object.entries(entries).find(([value]) => value === status)?.[1] ?? entries.unknown;
}

export function getVmStatusPresentation(status: string) {
  return getResourceStatusPresentation("virtual-machine", status);
}
