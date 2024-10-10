'use strict';

const {
    SuccessResponse
} = require("../core/success.response");
const CartService = require("../services/cart.service");

class CartController {
    addToCart = async (req, res, next) => {
        new SuccessResponse({
            message: "Product added to cart successfully",
            metadata: await CartService.addToCart(req.body),
        }).send(res);
    }

    update = async (req, res, next) => {
        new SuccessResponse({
            message: "Product quantity updated successfully",
            metadata: await CartService.addToCartV2(req.body),
        }).send(res);
    }

    delete = async (req, res, next) => {
        new SuccessResponse({
            message: "Product deleted from cart successfully",
            metadata: await CartService.deleteUserCart(req.body),
        }).send(res);
    }

    listToCart = async (req, res, next) => {

        new SuccessResponse({
            message: "Get list product in cart successfully",
            metadata: await CartService.getListUserCart(req.query),
        }).send(res);
    }
}

module.exports = new CartController();