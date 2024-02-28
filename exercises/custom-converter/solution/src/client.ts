import { converterWorkflow } from './workflows';
import { v4 as uuid } from 'uuid';
import { TASK_QUEUE_NAME, User } from './shared';
import { Connection, Client } from '@temporalio/client';

const user: User = {
  id: uuid(),
  // age: 1000n, BigInt isn't supported
  hp: Infinity,
  matcher: /.*Stormblessed/,
  token: Uint8Array.from([1, 2, 3]),
  createdAt: new Date(),
};

async function run() {
  const connection = await Connection.connect({ address: 'localhost:7233' });

  const client = new Client({
    connection,
    dataConverter: {
      payloadConverterPath: require.resolve('./payload-converter.ts'),
      failureConverterPath: require.resolve('./failure-converter.ts'),
    },
  });

  const handle = await client.workflow.start(converterWorkflow, {
    args: [user],
    taskQueue: TASK_QUEUE_NAME,
    workflowId: 'converters-workflowID',
  });

  // optional: wait for client result
  console.log(await handle.result());
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
