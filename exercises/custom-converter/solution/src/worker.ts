import { TASK_QUEUE_NAME } from './shared';
import * as activities from './activities';
import { NativeConnection, Worker } from '@temporalio/worker';

async function run() {
  const connection = await NativeConnection.connect({ address: 'localhost:7233' });

  const worker = await Worker.create({
    taskQueue: TASK_QUEUE_NAME,
    connection,
    workflowsPath: require.resolve('./workflows'),
    activities,
    dataConverter: {
      payloadConverterPath: require.resolve('./payload-converter'),
      failureConverterPath: require.resolve('./failure-converter'),
    },
  });

  await worker.run();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
