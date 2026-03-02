import { NextResponse } from 'next/server';
import { agents } from '@/config/agents/registry';

export async function GET() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const publicAgents = agents.map(({ configPath, ...rest }) => rest);
  return NextResponse.json(publicAgents);
}
