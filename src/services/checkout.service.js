'use strict';

const {
    findCartById
} = require("../models/repositories/cart.repo");

const {
    BadRequestError,
    NotFoundError
} = require("../core/error.response");
const {
    checkProductByServer
} = require("../models/repositories/product.repo");

const {
    getDiscountAmount
} = require("../services/discount.service");
const { aquireLock, releaseLock } = require("./redis.service");
const { order } = require("../models/order.model");

class CheckoutService {
    // login and without login

    /*
        {
            "cardId": "",
            "userId": "",
            "shop_order_ids": [
                {
                    "shopId": "",
                    "shop_discounts": [],
                    "item_products": {
                        "price": 0,
                        "quantity": 0,
                        "product_id": ""
                    }
                },
                {
                    "shopId": "",
                    "shop_discounts": [
                        {
                            "shopId": "",
                            "discountId": "",
                            "codeId": 0
                        }
                    ],
                    "item_products": {
                        "price": 0,
                        "quantity": 0,
                        "product_id": ""
                    }
                }
            ]
        }
    */
    static async checkoutReview({
        cardId,
        userId,
        shop_order_ids = []
    }) {
        // check cartId ton tai khong?
        const foundCart = await findCartById(cardId);
        if (!foundCart) {
            throw new BadRequestError("Cart not found");
        }

        const checkout_order = {
            totalPrice: 0,
            feeShip: 0,
            totalDiscount: 0,
            totalCheckout: 0,
        },
            shop_order_ids_new = [];

        for (let i = 0; i < shop_order_ids.length; i++) {
            const {
                shopId,
                shop_discounts = [],
                item_products = []
            } = shop_order_ids[i];

            const checkProductByServer = await checkProductByServer(item_products);
            console.log(`checkProductByServer::`, checkProductByServer);
            if (!checkProductByServer[0]) {
                throw new BadRequestError("Product not found");
            }

            // tong tien don hang
            const checkoutPrice = checkProductByServer.reduce((acc, product) => {
                return acc + product.price * product.quantity;
            }, 0);

            // tong tien truoc khi giam gia
            checkout_order.totalPrice += checkoutPrice;

            const itemCheckout = {
                shopId,
                shop_discounts,
                priceRaw: checkoutPrice, // tien truoc khi giam gia
                priceApplyDiscount: checkoutPrice, // tien sau khi giam gia
                item_product: checkProductByServer
            }

            if (shop_discounts.length > 0) {
                // giam gia
                const {
                    totalPrice = 0,
                    discount = 0
                } = await getDiscountAmount({
                    codeId: shop_discounts[0].codeId,
                    userId,
                    shopId,
                    products: checkProductByServer
                });

                // tong cong discount giam gia
                checkout_order.totalDiscount += discount;

                // neu tien giam gia lon hon 0
                if (discount > 0) {
                    itemCheckout.priceApplyDiscount = checkoutPrice - discount;
                }
            }

            // tong tien don hang sau khi giam gia
            checkout_order.totalCheckout += itemCheckout.priceApplyDiscount;
            shop_order_ids_new.push(itemCheckout);
        }

        return {
            shop_order_ids,
            shop_order_ids_new,
            checkout_order
        }
    }

    // order
    static async orderByUser({
        shop_order_ids,
        cartId,
        userId,
        user_address = {},
        user_payment = {}
    }) {
        const { shop_order_ids_new, checkout_order } = await CheckoutService.checkoutReview({
            cardId: cartId,
            userId,
            shop_order_ids: shop_order_ids_new
        });

        // check lai 1 lan nua xem co ton tai khong
        // get new array products
        const products = shop_order_ids_new.flatMap(item => item.item_products);
        console.log(`PRODUCTS::`, products);
        const acquireProduct = [];

        for (let i = 0; i < products.length; i++) {
            const { productId, quantity } = products[i];
            const keyLock = await aquireLock(productId, quantity, cartId);
            acquireProduct.push(keyLock ? true : false);

            if (keyLock) {
                await releaseLock(keyLock);
            }
        }

        // check if one of the product is not available in stock
        if (acquireProduct.includes(false)) {
            throw new BadRequestError("Product not available in stock, please try again");
        }

        const newOrder = await order.create({
            order_userId: userId,
            order_checkout: checkout_order,
            order_shipping: user_address,
            order_payment: user_payment,
            order_products: shop_order_ids_new
        });

        // if insert order success, remove cart
        if (newOrder) {
            // remove cart
            await foundCart.remove();
        }

        return newOrder;
    }

    /*
        1> Query Orders [Users]
    */
    static async getOrdersByUser(userId) {

    }

    /*
        2> Query Order Using Id [Users]
    */
    static async getOneOrderByUser(userId, orderId) {

    }

    /*
        3> Cancel Order [Users]
    */
    static async cancelOrderByUser(userId, orderId) {

    }

    /*
        4> Update Order Status [Admin | Shop]
    */
    static async updateOrderStatusByShop(orderId, newStatus) {

    }
}

module.exports = CheckoutService;