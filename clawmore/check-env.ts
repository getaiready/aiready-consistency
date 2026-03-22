import { auth } from './auth';

console.log('AUTH_SECRET exists:', !!process.env.AUTH_SECRET);
console.log('NEXTAUTH_SECRET exists:', !!process.env.NEXTAUTH_SECRET);
console.log('GOOGLE_CLIENT_ID exists:', !!process.env.GOOGLE_CLIENT_ID);
console.log('GITHUB_CLIENT_ID exists:', !!process.env.GITHUB_CLIENT_ID);
console.log('DYNAMO_TABLE:', process.env.DYNAMO_TABLE);
console.log('SES_FROM_EMAIL:', process.env.SES_FROM_EMAIL);
