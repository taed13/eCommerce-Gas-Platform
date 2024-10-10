'use strict';

const { cart } = require("../models/cart.model");

const {
    BadRequestError,
    NotFoundError
} = require("../core/error.response");
const {
    findAllDiscountCodesUnSelect,
    checkDiscountExists,
    findAllDiscountCodesSelect,
} = require("../models/repositories/discount.repo");
const {
    findAllProducts
} = require("../models/repositories/product.repo");
const {
    convertToObjectIdMongodb
} = require("../utils");

/**
    Key features: Cart Service
    - Add product to cart [USER]
    - Reduce product quatity by one [USER]
    - Increase product quatity by one [USER]
    - Get cart by user [USER]
    - Delete cart [USER]
    - Delete cart item [USER]
 */

class CartService {
    // START REPO CART
    static async createUserCart({ userId, product }) {
        const query = { cart_userId: userId, cart_state: "active" },
            updateOrInsert = {
                $addToSet: {
                    cart_products: product
                }
            },
            options = { upsert: true, new: true };

        return await cart.findOneAndUpdate(query, updateOrInsert, options);
    }

    static async updateUserCartQuantity({ userId, product }) {
        const { productId, quantity } = product;
        const query = { cart_userId: userId, "cart_products.productId": productId, cart_state: "active" },
            updateSet = {
                $inc: {
                    "cart_products.$.quantity": quantity
                }
            },
            options = { upsert: true, new: true };

        return await cart.findOneAndUpdate(query, updateSet, options);
    }

    // END REPO CART

    static async addToCart({ userId, product = {} }) {
        // Add product to cart

        // Check if product exists in cart
        const userCart = await cart.findOne({
            cart_userId: userId
        });
        if (!userCart) {
            // create new cart for User
            return await CartService.createUserCart({ userId, product });
        }

        // if cart is empty
        if (!userCart.cart_products.length) {
            userCart.cart_products.push(product);

            return await userCart.save();
        }

        // if cart exists, and product is in cart already, update quantity
        return await CartService.updateUserCartQuantity({ userId, product });
    }

    static async reduceProductQuantity(payload) {
        // Reduce product quantity by one
    }

    static async increaseProductQuantity(payload) {
        // Increase product quantity by one
    }

    static async getCartByUser(payload) {
        // Get cart by user
    }

    static async deleteCart(payload) {
        // Delete cart
    }

    static async deleteCartItem(payload) {
        // Delete cart item
    }
}

module.exports = CartService;