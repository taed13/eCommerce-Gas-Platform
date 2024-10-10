"use strict";
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const shopModel = require("../models/shop.model");
const {
    createTokenPair,
    verifyJWT
} = require("../auth/authUtils");
const {
    getInfoData
} = require("../utils");
const KeyTokenService = require("./keyToken.service");
const {
    BadRequestError,
    AuthFailureError,
    ForbiddenError,
} = require("../core/error.response");
const {
    findByEmail
} = require("./shop.service");
const {
    RoleShop
} = require("../configs/constants");

class AccessService {
    static handlerRefreshTokenV2 = async ({
        refreshToken,
        user,
        keyStore
    }) => {
        const {
            userId,
            email
        } = user;

        if (keyStore.refreshTokensUsed.includes(refreshToken)) {
            await KeyTokenService.deleteKeyById(userId);
            throw new ForbiddenError("Error: Token is used");
        }

        if (keyStore.refreshToken !== refreshToken) {
            throw new AuthFailureError("Error: Token is invalid");
        }

        const foundShop = findByEmail({
            email
        });
        if (!foundShop) throw new AuthFailureError("Error: Shop not found");

        // create private key, public key
        const tokens = await createTokenPair({
            userId,
            email
        },
            keyStore.publicKey,
            keyStore.privateKey
        );

        // update token
        await keyStore.updateOne({
            $set: {
                refreshToken: tokens.refreshToken,
            },
            $addToSet: {
                refreshTokensUsed: refreshToken,
            },
        });

        return {
            user,
            tokens,
        };
    };

    static handlerRefreshToken = async (refreshToken) => {
        /*
        check this token used
         */
        const foundToken = await KeyTokenService.findByRefreshTokenUsed(
            refreshToken
        );
        if (foundToken) {
            // decode who is user
            const {
                userId,
                email
            } = await verifyJWT(
                refreshToken,
                foundToken.privateKey
            );
            console.log(`[P]::handlerRefreshToken::`, {
                userId,
                email
            });

            // delete
            await KeyTokenService.deleteKeyById(userId);

            throw new ForbiddenError("Error: Token is used");
        }

        // check token
        const holderToken = await KeyTokenService.findByRefreshToken(refreshToken);
        if (!holderToken) {
            throw new AuthFailureError("Error: Token is invalid");
        }

        // verify token
        const {
            userId,
            email
        } = await verifyJWT(
            refreshToken,
            holderToken.privateKey
        );

        const foundShop = findByEmail({
            email
        });
        if (!foundShop) throw new AuthFailureError("Error: Shop not found");

        // create private key, public key
        const privateKey = crypto.randomBytes(64).toString("hex");
        const publicKey = crypto.randomBytes(64).toString("hex");
        const tokens = await createTokenPair({
            userId,
            email
        },
            publicKey,
            privateKey
        );

        // update token
        await holderToken.updateOne({
            $set: {
                refreshToken: tokens.refreshToken,
            },
            $addToSet: {
                refreshTokensUsed: refreshToken,
            },
        });

        return {
            user: {
                userId,
                email
            },
            tokens,
        };
    };

    static logout = async (keyStore) => {
        const delKey = await KeyTokenService.removeKeyById(keyStore._id);
        return delKey;
    };

    static login = async ({
        email,
        password,
        refreshToken = null
    }) => {
        /*
          1 - check email in db
          2 - check password
          3 - create token pair
          4 - save token pair in db
          5 - get data return login
        */
        const foundShop = await findByEmail({
            email
        });
        if (!foundShop) throw new BadRequestError("Error: Shop not found");

        const match = bcrypt.compare(password, foundShop.password);
        if (!match) throw new AuthFailureError("Error: Password is incorrect");

        // create private key, public key
        const privateKey = crypto.randomBytes(64).toString("hex");
        const publicKey = crypto.randomBytes(64).toString("hex");

        const {
            _id: userId
        } = foundShop;

        const tokens = await createTokenPair({
            userId,
            email
        },
            publicKey,
            privateKey
        );

        await KeyTokenService.createKeyToken({
            refreshToken: tokens.refreshToken,
            privateKey,
            publicKey,
            userId,
        });

        return {
            shop: getInfoData({
                fields: ["_id", "name", "email"],
                object: foundShop,
            }),
            tokens,
        };
    };

    static signUp = async ({
        name,
        email,
        password
    }) => {
        // Check if the email is already in use
        const hodelShop = await shopModel.findOne({
            email
        }).lean();

        if (hodelShop) {
            throw new BadRequestError("Error: Shop already exists");
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newShop = await shopModel.create({
            name,
            email,
            password: passwordHash,
            roles: [RoleShop.SHOP],
        });

        if (newShop) {
            // create private key, public key
            const privateKey = crypto.randomBytes(64).toString("hex");
            const publicKey = crypto.randomBytes(64).toString("hex");

            console.log({
                privateKey,
                publicKey
            }); // save collection KeyStore

            const keyStore = await KeyTokenService.createKeyToken({
                userId: newShop._id,
                publicKey,
                privateKey,
            });

            if (!keyStore) {
                throw new BadRequestError("Error: KeyStore not created");
            }

            // created token pair
            const tokens = await createTokenPair({
                userId: newShop._id,
                email
            },
                publicKey,
                privateKey
            );
            console.log(`Created token pair::`, tokens);

            return {
                code: "20001",
                metadata: {
                    shop: getInfoData({
                        fields: ["_id", "name", "email"],
                        object: newShop,
                    }),
                    tokens,
                },
            };
        }

        return {
            code: "20001",
            metadata: null,
        };
    };
}

module.exports = AccessService;