import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const hasToken = !!process.env.GITHUB_TOKEN;
  const tokenPrefix = process.env.GITHUB_TOKEN ? process.env.GITHUB_TOKEN.substring(0, 4) : 'none';
  
  res.status(200).json({
    ok: true,
    timestamp: new Date().toISOString(),
    env: {
      has_github_token: hasToken,
      token_prefix: tokenPrefix,
      node_env: process.env.NODE_ENV,
    }
  });
}
