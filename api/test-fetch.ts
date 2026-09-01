import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    // Test basic fetch
    const githubRes = await fetch('https://api.github.com/repos/Pablodd1/Cedexx-Website/contents/data/members.json?ref=main', {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN || ''}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    
    res.status(200).json({ 
      ok: true, 
      github_status: githubRes.status,
      has_token: !!process.env.GITHUB_TOKEN,
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
}
