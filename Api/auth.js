// api/auth.js
import { createHash } from 'crypto'

// تخزين مؤقت للمستخدمين (في الإنتاج استخدم قاعدة بيانات)
const users = new Map()

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    res.setHeader('Content-Type', 'application/json')

    if (req.method === 'OPTIONS') {
        return res.status(200).end()
    }

    const { action } = req.query

    // تسجيل الدخول
    if (action === 'login' && req.method === 'POST') {
        const { email, password } = req.body
        
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'البريد الإلكتروني وكلمة المرور مطلوبة' })
        }
        
        const hashedPassword = createHash('sha256').update(password).digest('hex')
        const user = users.get(email)
        
        if (!user || user.password !== hashedPassword) {
            return res.status(401).json({ success: false, error: 'بريد إلكتروني أو كلمة مرور غير صحيحة' })
        }
        
        return res.status(200).json({
            success: true,
            user: {
                name: user.name,
                email: user.email,
                plan: user.plan
            },
            token: Buffer.from(email + ':' + Date.now()).toString('base64')
        })
    }
    
    // تسجيل حساب جديد
    if (action === 'register' && req.method === 'POST') {
        const { name, email, password, purpose } = req.body
        
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, error: 'جميع الحقول مطلوبة' })
        }
        
        if (users.has(email)) {
            return res.status(400).json({ success: false, error: 'البريد الإلكتروني مستخدم بالفعل' })
        }
        
        const hashedPassword = createHash('sha256').update(password).digest('hex')
        
        users.set(email, {
            name: name,
            email: email,
            password: hashedPassword,
            purpose: purpose || 'personal',
            plan: 'free',
            createdAt: new Date().toISOString()
        })
        
        return res.status(201).json({
            success: true,
            message: 'تم إنشاء الحساب بنجاح',
            user: { name, email, plan: 'free' }
        })
    }
    
    // التحقق من المستخدم
    if (action === 'verify' && req.method === 'GET') {
        const token = req.headers.authorization?.split(' ')[1]
        
        if (!token) {
            return res.status(401).json({ success: false, error: 'غير مصرح' })
        }
        
        try {
            const decoded = Buffer.from(token, 'base64').toString()
            const email = decoded.split(':')[0]
            const user = users.get(email)
            
            if (!user) {
                return res.status(401).json({ success: false, error: 'مستخدم غير موجود' })
            }
            
            return res.status(200).json({
                success: true,
                user: {
                    name: user.name,
                    email: user.email,
                    plan: user.plan
                }
            })
        } catch (error) {
            return res.status(401).json({ success: false, error: 'رمز غير صالح' })
        }
    }
    
    return res.status(404).json({ success: false, error: 'المسار غير موجود' })
                                         }
