'use strict';

const redis = require("redis");
const {
    promisify
} = require("util");
const { reservationInventory } = require("../models/repositories/inventory.repo");
const redisClient = redis.createClient();

const pexpire = promisify(redisClient.pExpire).bind(redisClient);
const setnxAsync = promisify(redisClient.setNX).bind(redisClient);

const aquireLock = async (productId, quantity, cartId) => {
    const key = `lock_v2024_${productId}`;

    const retriesTime = 10;
    const expiresTime = 3000;

    for (let i = 0; i < retriesTime; i++) {
        // tao 1 key, thang nao nam giu duoc vao thanh toan
        const result = await setnxAsync(key, expiresTime);
        console.log(`result:: ${result}`);
        if (result === 1) {
            // thao tac voi inventory
            const isReservations = await reservationInventory({
                productId,
                quantity,
                cartId
            });

            if (isReservations.modifiedCount) {
                await pexpire(key, expiresTime);

                return key;
            }

            return null;
        } else {
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }
}

const releaseLock = async (key) => {
    const deleteAsyncKey = promisify(redisClient.del).bind(redisClient);

    return await deleteAsyncKey(key);
}

module.exports = {
    aquireLock,
    releaseLock
}