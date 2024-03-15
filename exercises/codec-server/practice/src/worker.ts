import { Worker } from '@temporalio/worker';
import { getDataConverter } from './data-converter';

async function run() {
  const worker = await Worker.create({
    workflowsPath: require.resolve('./workflows'),
    taskQueue: 'encryption',
    dataConverter: await getDataConverter(),
  });

  await worker.run();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
