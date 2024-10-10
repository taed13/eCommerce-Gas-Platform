'use strict';

const {
    model,
    Schema
} = require('mongoose');

const DOCUMENT_NAME = 'Cart';
const COLLECTION_NAME = 'Carts';

const cartSchema = new Schema({
    cart_state: {
        type: String,
        required: true,
        enum: ['active', 'failed', 'completed', 'pending'],
        default: 'active',
    },
    cart_products: {
        type: Array,
        required: true,
        default: [],
    },
    /*
    [
        {
            productId,
            shopId, 
            quantity,
            name,
            price,
        }
    ]
    */
    cart_count_product: {
        type: Number,
        required: true,
        default: 0,
    },
    cart_userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

}, {
    collection: COLLECTION_NAME,
    timeseries: {
        createdAt: 'createdOn',
        updatedAt: 'modifiedOn',
    }
});

module.exports = {
    cart: model(DOCUMENT_NAME, cartSchema),
}