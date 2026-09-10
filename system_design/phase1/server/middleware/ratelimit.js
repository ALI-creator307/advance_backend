import { redis } from "../index.js"

const rateLimitter = async (req, res, next) => {
    const ip = req.ip
    const key = `ratelimit:${ip}`

    const requests = await redis.incr(key)

    if (requests == 1) {
        await redis.expire(key, 30)
    }

    if (requests > 5) {
        return res.status(429).json({
            "msg": "request limit exceeds"
        })
    }

    next()
}

export default rateLimitter