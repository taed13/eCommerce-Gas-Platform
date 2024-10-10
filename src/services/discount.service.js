"use strict";

const {
    BadRequestError,
    NotFoundError
} = require("../core/error.response");
const discount = require("../models/discount.model");
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
    * Discount service
    1 - Generator discount code [Shop | Admin]
    2 - Get discount amount [User]
    3 - Get all discount [Shop | User]
    4 - Verify discount code [User]
    5 - Delete discount code [Shop | Admin]
    6 - Cancel discount code [User]
*/
class DiscountService {
    static async createDiscountCode(payload) {
        const {
            code,
            start_date,
            end_date,
            is_active,
            shopId,
            min_order_value,
            product_ids,
            applies_to,
            name,
            description,
            type,
            value,
            max_value,
            max_uses,
            uses_count,
            max_uses_per_user,
            users_used,
        } = payload;

        if (new Date() < new Date(start_date) || new Date() > new Date(end_date)) {
            throw new BadRequestError("Error: Invalid date");
        }

        if (new Date(start_date) >= new Date(end_date)) {
            throw new BadRequestError("Error: Start date must be less than end date");
        }

        //create index for discount code
        const foundDiscount = await discount
            .findOne({
                discount_code: code,
                discount_shopId: convertToObjectIdMongodb(shopId),
            })
            .lean();
        if (foundDiscount && foundDiscount.discount_is_active) {
            throw new BadRequestError("Error: Discount code already exists");
        }

        const newDiscount = await discount.create({
            discount_name: name,
            discount_description: description,
            discount_type: type,
            discount_code: code,
            discount_value: value,
            discount_min_order_value: min_order_value || 0,
            discount_max_value: max_value,
            discount_start_date: new Date(start_date),
            discount_end_date: new Date(end_date),
            discount_max_uses: max_uses,
            discount_uses_count: uses_count,
            discount_users_used: users_used,
            discount_shopId: shopId,
            discount_max_uses_per_user: max_uses_per_user,
            discount_is_active: is_active,
            discount_applies_to: applies_to,
            discount_product_ids: applies_to === "all" ? [] : product_ids,
        });

        return newDiscount;
    }

    static async updateDiscountCode() { }

    static async getAllDiscountCodesWithProduct({
        code,
        shopId,
        userId,
        limit,
        page,
    }) {
        //create index for discount_code
        const foundDiscount = await discount.findOne({
            discount_code: code,
            discount_shopId: convertToObjectIdMongodb(shopId),
        });
        if (!foundDiscount || !foundDiscount.discount_is_active) {
            throw new NotFoundError("Error: Discount code not found");
        }

        const {
            discount_applies_to,
            discount_product_ids
        } = foundDiscount;
        let products;

        if (discount_applies_to === "all") {
            products = await findAllProducts({
                filter: {
                    product_shop: convertToObjectIdMongodb(shopId),
                    isPublished: true,
                },
                limit: +limit,
                page: +page,
                sort: "ctime",
                select: ["product_name"],
            });
        }

        if (discount_applies_to === "specific") {
            products = await findAllProducts({
                filter: {
                    isPublished: true,
                    _id: {
                        $in: discount_product_ids
                    },
                },
                limit: +limit,
                page: +page,
                sort: "ctime",
                select: ["product_name"],
            });
        }

        return products;
    }

    static async getAllDiscountCodesByShop({
        limit,
        page,
        shopId
    }) {
        const discounts = await findAllDiscountCodesSelect({
            limit: +limit,
            page: +page,
            filter: {
                discount_shopId: convertToObjectIdMongodb(shopId),
                discount_is_active: true,
            },
            select: [
                "discount_name",
                "discount_code",
            ],
            model: discount,
        });

        return discounts;
    }

    /**
        Apply Discount Code
        products = [
            {
                product_id: "60c3d3c1c2b0e0b7c8b4b9b1",
                shopId: "60c3d3c1c2b0e0b7c8b4b9b1",
                quantity: 2,
                name: "product 1",
                price: 2000,
            },
            {
                product_id: "60c3d3c1c2b0e0b7c8b4b9b2",
                shopId: "60c3d3c1c2b0e0b7c8b4b9b1",
                quantity: 2,
                name: "product 2",
                price: 3000,
            }
        ]
    */
    static async getDiscountAmount({
        codeId,
        UserId,
        shopId,
        products
    }) {
        const foundDiscount = await checkDiscountExists({
            model: discount,
            filter: {
                discount_code: codeId,
                discount_shopId: convertToObjectIdMongodb(shopId),
            },
        });
        if (!foundDiscount) {
            throw new NotFoundError("Error: Discount code not found");
        }

        const {
            discount_is_active,
            discount_max_uses,
            discount_start_date,
            discount_end_date,
            discount_min_order_value,
            discount_max_uses_per_user,
            discount_users_used,
            discount_type,
            discount_value,
        } = foundDiscount;
        if (!discount_is_active) {
            throw new NotFoundError("Error: Discount code is not active");
        }
        if (discount_max_uses <= 0) {
            throw new NotFoundError("Error: Discount code has been exhausted");
        }
        if (new Date() < new Date(discount_start_date) || new Date() > new Date(discount_end_date)) {
            throw new NotFoundError("Error: Discount code has expired");
        }

        // check if min order value is met
        let totalOrder = 0;
        if (discount_min_order_value > 0) {
            // get total 
            totalOrder = products.reduce((acc, product) => {
                return acc + product.price * product.quantity;
            }, 0);

            if (totalOrder < discount_min_order_value) {
                throw new NotFoundError(`Error: Minimum order value not met of ${discount_min_order_value}`);
            }
        }

        if (discount_max_uses_per_user > 0) {
            const userUserDiscount = await discount_users_used.find((user) => user.userId === UserId);
            if (userUserDiscount) {
                throw new NotFoundError("Error: Maximum uses per user reached");
            }
        }

        // check discount fixed_amount or percentage
        const amount = discount_type === "fixed_amount" ? discount_value : (discount_value / 100) * totalOrder;

        return {
            totalOrder,
            discount: amount,
            totalPrice: totalOrder - amount,
        }
    }

    static async deleteDiscountCode({
        shopId,
        codeId
    }) {
        const deleted = await discount.deleteOne({
            discount_shopId: convertToObjectIdMongodb(shopId),
            discount_code: codeId,
        });

        return deleted;
    }

    /**
        Cancel Discount Code ()
    **/
    static async cancelDiscountCode({
        codeId,
        shopId,
        userId
    }) {
        const foundDiscount = await checkDiscountExists({
            model: discount,
            filter: {
                discount_code: codeId,
                discount_shopId: convertToObjectIdMongodb(shopId),
            },
        });
        if (!foundDiscount) {
            throw new NotFoundError("Error: Discount code not found");
        }

        const result = await discount.findByIdAndUpdate(foundDiscount._id, {
            $pull: {
                discount_users_used: {
                    userId,
                },
            },
            $inc: {
                discount_max_uses: 1,
                discount_uses_count: -1,
            },
        })

        return result;
    }
}

module.exports = DiscountService;