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
    // TODO Part B: Set a dataConverter key to use the `payloadConverter` from `payload-converter.ts`.
    // The shape should look like:
    // dataConverter: {
    //    payloadConverterPath: require.resolve('file-to-path')
    // }
    // TODO C: Add the path to `failure-converter.ts` into the dataConverter object as well. The key should be `failureConverterPath`.
  });

  await worker.run();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
