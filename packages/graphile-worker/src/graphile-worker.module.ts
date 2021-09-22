import { DiscoveryModule, DiscoveryService } from '@golevelup/nestjs-discovery';
import {
  createConfigurableDynamicRootModule,
  IConfigurableDynamicRootModule,
} from '@golevelup/nestjs-modules';
import {
  DynamicModule,
  Logger,
  Module,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ExternalContextCreator } from '@nestjs/core/helpers/external-context-creator';
import { fromPairs, groupBy } from 'lodash';
import {
  GRAPHILE_WORKER_CONFIG_TOKEN,
  GRAPHILE_WORKER_HANDLER,
} from './graphile-worker.constants';
import { GraphileWorkerConfig } from './graphile-worker.interfaces';
import { makeWorkerUtils, run, Runner, WorkerUtils } from 'graphile-worker';
import { GRAPHILE_WORKER_UTILS, InjectGraphileWorkerConfig } from '.';

declare const placeholder: IConfigurableDynamicRootModule<
  GraphileWorkerModule,
  GraphileWorkerConfig
>;

@Module({
  imports: [DiscoveryModule],
})
export class GraphileWorkerModule
  extends createConfigurableDynamicRootModule<
    GraphileWorkerModule,
    GraphileWorkerConfig
  >(GRAPHILE_WORKER_CONFIG_TOKEN, {
    providers: [
      {
        provide: GRAPHILE_WORKER_UTILS,
        useFactory: async (config: GraphileWorkerConfig) => {
          console.log(config);
          const workerUtils = await makeWorkerUtils({
            connectionString: config.connectionString,
          });

          return workerUtils;
        },
        inject: [GRAPHILE_WORKER_CONFIG_TOKEN],
      },
    ],
    exports: [GRAPHILE_WORKER_UTILS],
  })
  implements OnModuleDestroy, OnModuleInit {
  private readonly logger = new Logger(GraphileWorkerModule.name);
  private runner!: Runner;

  constructor(
    private readonly discover: DiscoveryService,
    @InjectGraphileWorkerConfig() private readonly config: GraphileWorkerConfig,
    private readonly externalContextCreator: ExternalContextCreator
  ) {
    super();
  }

  async onModuleDestroy() {
    // this.logger.verbose('Closing AMQP Connection');
    // await this.amqpConnection.managedConnection.close();
  }

  public async onModuleInit() {
    this.logger.log('Initializing Graphile Workers');

    // const runner = await run({

    // })

    const workerMeta = await this.discover.providerMethodsWithMetaAtKey<{
      name: string;
    }>(GRAPHILE_WORKER_HANDLER);

    console.log(workerMeta);

    this.runner = await run({
      connectionString: this.config.connectionString,
      taskList: fromPairs(
        workerMeta.map((x) => [x.meta.name, x.discoveredMethod.handler])
      ),
    });

    // const grouped = groupBy(
    //   rabbitMeta,
    //   (x) => x.discoveredMethod.parentClass.name
    // );

    // const providerKeys = Object.keys(grouped);

    // for (const key of providerKeys) {
    //   this.logger.log(`Registering rabbitmq handlers from ${key}`);
    //   await Promise.all(
    //     grouped[key].map(async ({ discoveredMethod, meta: config }) => {
    //       const handler = this.externalContextCreator.create(
    //         discoveredMethod.parentClass.instance,
    //         discoveredMethod.handler,
    //         discoveredMethod.methodName
    //       );

    //       const { exchange, routingKey, queue } = config;

    //       const handlerDisplayName = `${discoveredMethod.parentClass.name}.${
    //         discoveredMethod.methodName
    //       } {${config.type}} -> ${exchange}::${routingKey}::${
    //         queue || 'amqpgen'
    //       }`;

    //       if (
    //         config.type === 'rpc' &&
    //         !this.amqpConnection.configuration.enableDirectReplyTo
    //       ) {
    //         this.logger.warn(
    //           `Direct Reply-To Functionality is disabled. RPC handler ${handlerDisplayName} will not be registered`
    //         );
    //         return;
    //       }

    //       this.logger.log(handlerDisplayName);

    //       return config.type === 'rpc'
    //         ? this.amqpConnection.createRpc(handler, config)
    //         : this.amqpConnection.createSubscriber(handler, config);
    //     })
    //   );
    // }
  }
}
