'use strict';

const {
    cart
} = require("../models/cart.model");

const {
    BadRequestError,
    NotFoundError
} = require("../core/error.response");
const {
    getProductById
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
    static async createUserCart({
        userId,
        product
    }) {
        const query = {
            cart_userId: userId,
            cart_state: "active"
        },
            updateOrInsert = {
                $addToSet: {
                    cart_products: product
                }
            },
            options = {
                upsert: true,
                new: true
            };

        return await cart.findOneAndUpdate(query, updateOrInsert, options);
    }

    static async updateUserCartQuantity({
        userId,
        product
    }) {
        const {
            productId,
            quantity
        } = product;
        const query = {
            cart_userId: userId,
            "cart_products.productId": productId,
            cart_state: "active"
        },
            updateSet = {
                $inc: {
                    "cart_products.$.quantity": quantity
                }
            },
            options = {
                upsert: true,
                new: true
            };

        return await cart.findOneAndUpdate(query, updateSet, options);
    }

    // END REPO CART

    static async addToCart({
        userId,
        product = {}
    }) {
        // Add product to cart

        // Check if product exists in cart
        const userCart = await cart.findOne({
            cart_userId: userId
        });
        if (!userCart) {
            // create new cart for User
            return await CartService.createUserCart({
                userId,
                product
            });
        }

        // if cart is empty
        if (!userCart.cart_products.length) {
            userCart.cart_products.push(product);

            return await userCart.save();
        }

        // if cart exists, and product is in cart already, update quantity
        return await CartService.updateUserCartQuantity({
            userId,
            product
        });
    }

    // update cart 
    /**
        shop_order_ids: [
            {
                shopId,
                item_products: [
                    {
                        quantity,
                        price,
                        shopId,
                        old_quantity,
                        productId,
                    }
                ],
                version,
            }
        ]
     */
    static async addToCartV2({
        userId,
        shop_order_ids
    }) {
        // Update cart
        const {
            productId,
            quantity,
            old_quantity
        } = shop_order_ids[0]?.item_products[0];

        // check product
        console.log("productId", productId);
        const foundProduct = await getProductById({ productId });

        if (!foundProduct) {
            throw new NotFoundError("Product not found");
        }

        // compare old_quantity with quantity
        if (foundProduct.product_shop.toString() !== shop_order_ids[0].shopId.toString()) {
            throw new BadRequestError("Product not found in shop");
        }

        if (quantity < 1) {
            // delete product from cart
        }

        return await CartService.updateUserCartQuantity({
            userId,
            product: {
                productId,
                quantity: quantity - old_quantity
            }
        });
    }

    static async deleteUserCart({ userId, productId }) {
        const query = {
            cart_userId: userId,
            cart_state: "active"
        }, updateSet = {
            $pull: {
                cart_products: {
                    productId
                }
            }
        };

        const deletedCart = await cart.updateOne(query, updateSet);

        return deletedCart;
    }

    static async getListUserCart({ userId }) {
        const userCart = await cart.findOne({
            cart_userId: convertToObjectIdMongodb(userId),
        }).lean();

        return userCart;
    }
}

module.exports = CartService;