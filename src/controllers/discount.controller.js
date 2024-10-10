'use strict';

const {
    SuccessResponse
} = require("../core/success.response");
const DiscountService = require("../services/discount.service");

class DiscountController {
    createDiscountCode = async (req, res, next) => {
        new SuccessResponse({
            message: "Discount code created successfully",
            metadata: await DiscountService.createDiscountCode({
                ...req.body,
                shopId: req.user.userId,
            }),
        }).send(res);
    };

    getAllDiscountCodes = async (req, res, next) => {
        new SuccessResponse({
            message: "Get all discount codes successfully",
            metadata: await DiscountService.getAllDiscountCodesByShop({
                shopId: req.user.userId,
                ...req.query,
            }),
        }).send(res);
    };

    getDiscountAmount = async (req, res, next) => {
        new SuccessResponse({
            message: "Get discount amount successfully",
            metadata: await DiscountService.getDiscountAmount({
                ...req.body,
            }),
        }).send(res);
    };

    getAllDiscountCodesWithProducts = async (req, res, next) => {
        new SuccessResponse({
            message: "Get all discount codes successfully",
            metadata: await DiscountService.getAllDiscountCodesWithProduct({
                ...req.query,
            }),
        }).send(res);
    };
}

module.exports = new DiscountController();