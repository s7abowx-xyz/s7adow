// api/github.js
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    res.setHeader('Content-Type', 'application/json')

    if (req.method === 'OPTIONS') {
        return res.status(200).end()
    }

    const { action, code } = req.query

    // بدأ تسجيل الدخول - توجيه إلى GitHub
    if (action === 'login' && req.method === 'GET') {
        const clientId = process.env.GITHUB_CLIENT_ID || 'YOUR_GITHUB_CLIENT_ID'
        const redirectUri = process.env.REDIRECT_URI || 'https://your-site.vercel.app/api/github?action=callback'
        
        const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`
        
        return res.redirect(307, githubAuthUrl)
    }
    
    // معاودة الاتصال من GitHub
    if (action === 'callback' && req.method === 'GET') {
        if (!code) {
            return res.status(400).json({ success: false, error: 'No code provided' })
        }
        
        try {
            // تبادل الكود للحصول على access_token
            const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    client_id: process.env.GITHUB_CLIENT_ID || 'YOUR_GITHUB_CLIENT_ID',
                    client_secret: process.env.GITHUB_CLIENT_SECRET || 'YOUR_GITHUB_CLIENT_SECRET',
                    code: code
                })
            })
            
            const tokenData = await tokenResponse.json()
            const accessToken = tokenData.access_token
            
            if (!accessToken) {
                throw new Error('Failed to get access token')
            }
            
            // جلب معلومات المستخدم من GitHub
            const userResponse = await fetch('https://api.github.com/user', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/json'
                }
            })
            
            const userData = await userResponse.json()
            
            // جلب البريد الإلكتروني
            const emailResponse = await fetch('https://api.github.com/user/emails', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/json'
                }
            })
            
            const emails = await emailResponse.json()
            const primaryEmail = emails.find(e => e.primary)?.email || emails[0]?.email
            
            // توجيه المستخدم إلى لوحة التحكم مع token
            const token = Buffer.from(`${userData.id}:${Date.now()}`).toString('base64')
            
            const redirectUrl = `https://your-site.vercel.app/dashboard.html?token=${token}&name=${encodeURIComponent(userData.name || userData.login)}&avatar=${userData.avatar_url}&email=${primaryEmail}`
            
            return res.redirect(307, redirectUrl)
            
        } catch (error) {
            return res.status(500).json({ success: false, error: error.message })
        }
    }
    
    return res.status(404).json({ success: false, error: 'Endpoint not found' })
}
