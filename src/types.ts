import { Logger } from "@aws-lambda-powertools/logger";
import { Context } from "aws-lambda";

export namespace IBuilder {
  export type State = {
    event?: Event;
    context?: Context;
    logger?: Logger;
    handler?: Function;
  };
  type Event = any;

  export type Type<TState extends IBuilder.State = IBuilder.State> =
    ConditionallyAddAttachLogger<TState> &
      ConditionallyAddHandleLogic<TState> &
      ConditionallyAddHandle<TState>;

  type ConditionallyAddAttachLogger<TState extends IBuilder.State> =
    T.CheckIfNotDefined<TState, "logger", AttachLogger<TState>, {}>;

  type ConditionallyAddHandle<TState extends IBuilder.State> =
    T.CheckIfNotDefined<TState, "logger" | "handler", {}, Handle<TState>>;

  type ConditionallyAddHandleLogic<TState extends IBuilder.State> =
    T.CheckIfNotDefined<
      TState,
      "logger",
      {},
      T.CheckIfNotDefined<TState, "handler", AddHandleLogic<TState>, {}>
    >;

  type AddHandleLogic<TState extends IBuilder.State> = {
    handleLogic<TEvent extends Event, TResponse = any>(
      func: AddHandleLogic.Callback<TState, TEvent, TResponse>
    ): AddHandleLogic.Return<TState, (...args: never[]) => TResponse>;
  };

  type AttachLogger<TState extends IBuilder.State> = {
    attachLogger<TServiceName extends string>(
      serviceName: TServiceName
    ): T.IsEmptyString<TServiceName> extends true
      ? { error: "service name must not be empty" }
      : AttachLogger.Return<TState>;
  };

  type Handle<_TState extends IBuilder.State> = {
    handle(event: any, ctx: any): Promise<unknown>;
  };

  export namespace AttachLogger {
    export type This = ThisType<
      T.UpdateSingle<IBuilder.State, "logger", Logger>
    >;

    export type Return<TState extends IBuilder.State> = Type<
      T.UpdateSingle<TState, "logger", Logger>
    >;
  }

  export namespace AddHandleLogic {
    export type Return<TState extends IBuilder.State, TResponse = any> = Type<
      T.UpdateSingle<TState, "handler", (...args: any[]) => TResponse>
    >;

    export type Callback<
      TState extends IBuilder.State,
      TEvent extends Event = Event,
      TResponse = any
    > = (props: Props<TState, TEvent>) => Promise<TResponse>;

    export type Props<TState extends IBuilder.State, TEvent extends Event> = {
      event: TEvent;
      context: Context;
      logger: NonNullable<TState["logger"]>;
    };
  }
}

namespace T {
  type Whitespace = " " | "\t" | "\r" | "\n";

  type TrimLeft<
    Text extends string,
    Chars extends string | number = Whitespace
  > = Text extends `${Chars}${infer Rest}` ? TrimLeft<Rest, Chars> : Text;

  type TrimRight<
    Text extends string,
    Chars extends string | number = Whitespace
  > = Text extends `${infer Rest}${Chars}` ? TrimRight<Rest, Chars> : Text;

  export type Trim<
    Text extends string,
    Chars extends string | number = Whitespace
  > = TrimRight<TrimLeft<Text, Chars>, Chars>;

  export type IsEmptyString<T extends string> = "" extends T ? true : false;

  export type IfElse<Value, Is, Do, Otherwise> = Value extends Is
    ? Do
    : Otherwise;

  export type KeyIsOptional<
    TType,
    TKey extends keyof TType
  > = TKey extends keyof {
    [K in keyof TType as TType extends Record<K, unknown>
      ? never
      : K]?: unknown;
  }
    ? true
    : false;

  export type CheckIfNotDefined<
    TState,
    TKey extends keyof TState,
    Do,
    OtherWise
  > = IfElse<KeyIsOptional<TState, TKey>, true, Do, OtherWise>;

  export type UpdateSingle<
    TValue,
    TKey extends keyof TValue,
    TNewValue extends TValue[TKey]
  > = Prettify<Omit<TValue, TKey> & { [_ in TKey]: TNewValue }>;

  export type UpdateMulti<
    TValue,
    TKey extends keyof TValue,
    NewValues extends { [K in TKey]: any }
  > = Prettify<Omit<TValue, TKey> & NewValues>;

  export type Prettify<T> = { [K in keyof T]: T[K] } & {};
}
