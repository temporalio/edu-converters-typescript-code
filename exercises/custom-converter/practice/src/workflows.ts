import type * as activities from './activities';
import { proxyActivities, log } from '@temporalio/workflow';
import { User, Result } from './shared';

const { converterActivity } = proxyActivities<typeof activities>({
  startToCloseTimeout: '10 seconds',
});

// // Workflow is a standard workflow definition.
// // Note that the Workflow and Activity don't need to care that
// // their inputs/results are being encoded.
// export async function converterWorkflow(input: string): Promise<string> {
//   log.info('Converter workflow started', { input });

//   try {
//     const result = await converterActivity(input);
//     export async function example(user: User): Promise<Result> {
//       const success =
//         user.createdAt.getTime() < Date.now() &&
//         user.hp > 50 &&
//         user.matcher.test('Kaladin Stormblessed') &&
//         user.token instanceof Uint8Array;
//       return { success, at: new Date() };
//     }
//     log.info('Converter workflow completed.', { input });
//     return result;
//   } catch (err) {
//     log.error('Activity failed.', { err });
//     throw err;
//   }
// }

export async function converterWorkflow(user: User): Promise<Result> {
  try {
    await converterActivity(user.id);
    const success =
      user.createdAt.getTime() < Date.now() &&
      user.hp > 50 &&
      user.matcher.test('Kaladin Stormblessed') &&
      user.token instanceof Uint8Array;
    return { success, at: new Date() };
  } catch (err) {
    log.error('Activity failed.', { err });
    throw err;
  }
}
