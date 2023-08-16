export class IncorrectBuilderError extends Error {
  constructor(methodImplementationError: MethodNames, extraMetadata = "") {
    const base = `incorrect calling of ${methodImplementationError}`;
    const msg = extraMetadata ? base + ` ${extraMetadata}` : base;
    super(msg);
  }
}

export class IncorrectInput extends Error {
  constructor(methodName: MethodNames, metadata: Record<string, unknown>) {
    super(`Invalid inputs passed to ${methodName} => ${metadata}`);
  }
}

type MethodNames = "attachLogger" | "handleLogic" | "handle";
