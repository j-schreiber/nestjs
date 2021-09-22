import { Injectable, Module } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WorkerUtils } from 'graphile-worker';
import { GraphileWorkerHandler } from '.';
import { GRAPHILE_WORKER_UTILS } from './graphile-worker.constants';
import { GraphileWorkerModule } from './graphile-worker.module';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

@Injectable()
class TestService {
  @GraphileWorkerHandler({
    name: 'test',
  })
  doSomething(args) {
    console.log('IN THE HANDLER!');
    console.log(args);
  }
}

@Module({
  providers: [TestService],
  exports: [TestService],
})
class TestModule {}

describe('Graphile Worker Module', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [
        TestModule,
        GraphileWorkerModule.forRoot(GraphileWorkerModule, {
          connectionString: 'postgresql://postgres:password@localhost:33432',
        }),
      ],
    }).compile();

    await app.init();
  });

  it('can resolve the runner obj', async () => {
    const utils = app.get<WorkerUtils>(GRAPHILE_WORKER_UTILS);
    expect(utils).toBeDefined();

    await utils.addJob('test', { message: 'hello world' });

    await sleep(4000);
    // console.log(runner);
  });
});
