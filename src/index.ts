import { Logger } from "@aws-lambda-powertools/logger";
import { IBuilder } from "./types";
import { IncorrectBuilderError, IncorrectInput } from "./errors";

class HandlerBuilder<TState extends IBuilder.State = IBuilder.State>
  implements IBuilder.Type
{
  #logger?: Logger;
  #handler?: IBuilder.AddHandleLogic.Callback<TState>;

  attachLogger(serviceName: string) {
    if (this.#logger) {
      throw new IncorrectBuilderError("attachLogger");
    }

    if (!serviceName?.trim()) {
      throw new IncorrectInput("attachLogger", { serviceName });
    }

    this.#logger = new Logger({ serviceName });

    return this as never;
  }

  handleLogic<TEvent extends unknown, TResponse = any>(
    handler: IBuilder.AddHandleLogic.Callback<IBuilder.State, TEvent, TResponse>
  ) {
    if (this.#handler) {
      throw new IncorrectBuilderError("handleLogic");
    }

    this.#handler = handler;

    return this as unknown as IBuilder.AddHandleLogic.Return<TState, TResponse>;
  }

  async handle(event: any, context: any) {
    if (!this.#logger || !this.#handler) {
      throw new IncorrectBuilderError(
        "handle",
        "lack of either logger or handler"
      );
    }

    this.#logger!.addContext(context);

    const response = await this.#handler!({
      context,
      event,
      logger: this.#logger!,
    });

    return response;
  }
}

function getLambdaHandler(): IBuilder.Type {
  return new HandlerBuilder();
}
