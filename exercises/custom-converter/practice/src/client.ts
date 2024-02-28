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
    // TODO Part B: Set a dataConverter key to use the `payloadConverter` from `payload-converter.ts`.
    // The shape should look like: 
    // dataConverter: {
    //    payloadConverterPath: require.resolve('file-to-path')
    // }
    // TODO C: Add the path to `failure-converter.ts` into the dataConverter object as well. The key should be `failureConverterPath`.
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
