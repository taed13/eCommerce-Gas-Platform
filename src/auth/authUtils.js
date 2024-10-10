"use strict";

const JWT = require("jsonwebtoken");
const asyncHandler = require("../helpers/asyncHandler");
const {
    HEADER
} = require("../configs/constants");
const {
    AuthFailureError,
    NotFoundError
} = require("../core/error.response");
const {
    findByUserId
} = require("../services/keyToken.service");

const createTokenPair = async (payload, publicKey, privateKey) => {
    try {
        // access token
        const accessToken = await JWT.sign(payload, publicKey, {
            expiresIn: "2 days",
        });

        // refresh token
        const refreshToken = await JWT.sign(payload, privateKey, {
            expiresIn: "7 days",
        });

        JWT.verify(accessToken, publicKey, (err, decoded) => {
            if (err) {
                console.log(`error verify::`, err);
            } else {
                console.log(`decoded verify::`, decoded);
            }
        });

        return {
            accessToken,
            refreshToken
        };
    } catch (error) {
        console.log(`error createTokenPair::`, error);
    }
};

const authentication = asyncHandler(async (req, res, next) => {
    /*
    1 - check userId missing  
    2 - get accessToken
    3 - verifyToken
    4 - check user in bds?
    5 - check keyStore with this userId
    6- OK all => return next()
     */

    const userId = req.headers[HEADER.CLIENT_ID];
    if (!userId) {
        throw new AuthFailureError("Invalid Request");
    }

    const keyStore = await findByUserId(userId);
    if (!keyStore) throw new NotFoundError("User not found");

    const accessToken = req.headers[HEADER.AUTHORIZATION];
    if (!accessToken) throw new AuthFailureError("Invalid Request");

    try {
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
        if (userId !== decodeUser.userId)
            throw new AuthFailureError("Invalid User");

        req.keyStore = keyStore;

        return next();
    } catch (error) {
        throw error;
    }
});

const authenticationV2 = asyncHandler(async (req, res, next) => {
    /*
    1 - check userId missing  
    2 - get accessToken
    3 - verifyToken
    4 - check user in bds?
    5 - check keyStore with this userId
    6- OK all => return next()
     */

    const userId = req.headers[HEADER.CLIENT_ID];
    if (!userId) {
        throw new AuthFailureError("Invalid Request");
    }

    const keyStore = await findByUserId(userId);
    if (!keyStore) throw new NotFoundError("User not found");

    if (req.headers[HEADER.REFRESH_TOKEN]) {
        const refreshToken = req.headers[HEADER.REFRESH_TOKEN];
        try {
            const decodeUser = JWT.verify(refreshToken, keyStore.privateKey);
            console.log("Decode user ", decodeUser);
            if (userId !== decodeUser.userId)
                throw new AuthFailureError("Invalid User");

            req.keyStore = keyStore;
            req.user = decodeUser;
            return next();
        } catch (error) {
            throw error;
        }
    }

    const accessToken = req.headers[HEADER.AUTHORIZATION];
    if (!accessToken) throw new AuthFailureError("Invalid Request");

    try {
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
        if (userId !== decodeUser.userId)
            throw new AuthFailureError("Invalid User");

        req.keyStore = keyStore;
        req.user = decodeUser;

        return next();
    } catch (error) {
        throw error;
    }
});

const verifyJWT = async (token, keySecret) => {
    return await JWT.verify(token, keySecret);
};

module.exports = {
    createTokenPair,
    authentication,
    verifyJWT,
    authenticationV2,
};