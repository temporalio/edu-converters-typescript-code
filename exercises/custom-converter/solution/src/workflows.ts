import type * as activities from './activities';
import { proxyActivities, log } from '@temporalio/workflow';
import { User, Result } from './shared';

const { converterActivity } = proxyActivities<typeof activities>({
  startToCloseTimeout: '10 seconds',
});

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
