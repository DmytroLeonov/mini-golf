function runAssert(msg: string, ...data: any[]): never {
  console.error(msg, ...data);
  throw new Error(msg);
}

export function assert(truthy: boolean, msg: string, ...data: any[]): void {
  if (!truthy) {
    runAssert(msg, data);
  }
}

export function never(msg: string, ...data: any[]): never {
  runAssert(msg, data);
}
