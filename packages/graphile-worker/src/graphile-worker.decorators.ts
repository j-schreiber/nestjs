import { makeInjectableDecorator } from '@golevelup/nestjs-common';
import { SetMetadata } from '@nestjs/common';
import {
  GRAPHILE_WORKER_CONFIG_TOKEN,
  GRAPHILE_WORKER_HANDLER,
  GRAPHILE_WORKER_UTILS,
} from './graphile-worker.constants';
// import { RabbitHandlerConfig } from './graphile-worker.interfaces';

export const GraphileWorkerHandler = (config: { name: string }) =>
  SetMetadata(GRAPHILE_WORKER_HANDLER, config);

// export const makeRabbitDecorator = <T extends Partial<RabbitHandlerConfig>>(
//   input: T
// ) => (
//   config: Pick<RabbitHandlerConfig, Exclude<keyof RabbitHandlerConfig, keyof T>>
// ) => (target, key, descriptor) =>
//   SetMetadata(RABBIT_HANDLER, { ...input, ...config })(target, key, descriptor);

// export const RabbitHandler = (config: RabbitHandlerConfig) => (
//   target,
//   key,
//   descriptor
// ) => SetMetadata(RABBIT_HANDLER, config)(target, key, descriptor);

// export const RabbitSubscribe = makeRabbitDecorator({ type: 'subscribe' });

// export const RabbitRPC = makeRabbitDecorator({ type: 'rpc' });

export const InjectGraphileWorkerConfig = makeInjectableDecorator(
  GRAPHILE_WORKER_CONFIG_TOKEN
);

export const InjectGraphileWorkerUtils = makeInjectableDecorator(
  GRAPHILE_WORKER_UTILS
);
