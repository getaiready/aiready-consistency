import { updateAccountStatus } from '../lib/db';

export const handler = async (event: any) => {
  const { awsAccountId, status } = event.detail;

  if (status === 'SUCCESS' && awsAccountId) {
    console.log(`[DeploymentComplete] Account ${awsAccountId} is now ACTIVE.`);
    await updateAccountStatus(awsAccountId, 'ACTIVE');
  }

  return { statusCode: 200 };
};
