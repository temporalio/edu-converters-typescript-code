import { Client } from '@temporalio/client';
import { v4 as uuid } from 'uuid';
import { getDataConverter } from './data-converter';
import { example } from './workflows';

async function run() {
  const client = new Client({
    dataConverter: await getDataConverter(),
  });

  const handle = await client.workflow.start(example, {
    args: ['Alice: Private message for Bob.'],
    taskQueue: 'encryption',
    workflowId: `codec-server-123`,
  });

  console.log(`Started workflow ${handle.workflowId}`);
  console.log(await handle.result());
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
