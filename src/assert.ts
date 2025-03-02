export function assert(truthy: boolean, msg: string, ...data: any[]): void {
  if (!truthy) {
    console.error(msg, ...data);
    throw new Error(msg);
  }
}