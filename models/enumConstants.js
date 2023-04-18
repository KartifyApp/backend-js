export const StatusCode = Object.freeze({
    SUCCESSFUL: 200,
    UNAUTHORIZED: 401
})

export const UserType = Object.freeze({
    ADMIN: 'ADMIN',
    PROVIDER: 'PROVIDER',
    CONSUMER: 'CONSUMER',
    DELIVERY: 'DELIVERY'
})

export const PlatformStatus = Object.freeze({
    LIST_ITEMS: 'LIST_ITEMS',
    DELIVERY: 'DELIVERY',
    PAYMENT_GATEWAY: 'PAYMENT_GATEWAY',
    DOWNTIME: 'DOWNTIME'
})

export const DeliveryStatus = Object.freeze({
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    WORKING: 'WORKING'
})

export const OrderStatus = Object.freeze({
    PLACED: 'PLACED',
    CONFIRMED: 'CONFIRMED',
    PICKUP: 'PICKUP',
    SHIPPED: 'SHIPPED',
    DELIVERED: 'DELIVERED',
    TAKE: 'TAKE',
    RETURNED: 'RETURNED',
    RECEIVED: 'RECEIVED',
    CANCELLED: 'CANCELLED'
})

export const PaymentStatus = Object.freeze({
    PAYMENT_INIT: 'PAYMENT_INIT',
    PAYMENT_PROCESSING: 'PAYMENT_PROCESSING',
    PAYMENT_CONFIRMED: 'PAYMENT_CONFIRMED',
    REFUND_PROCESSING: 'REFUND_PROCESSING',
    REFUND_CONFIRMED: 'REFUND_CONFIRMED'
})

export const PaymentMethod = Object.freeze({
    CASH_ON_DELIVERY: 'CASH_ON_DELIVERY',
    ONLINE_TRANSACTION: 'ONLINE_TRANSACTION'
})

export const TableNames = Object.freeze({
    USER: 'users',
    PLATFORM: 'platform',
    PLATFORM_REVIEW: 'platform_review',
    PRODUCT: 'product',
    PRODUCT_REVIEW: 'product_review',
    DELIVERY_JOB: 'delivery_job',
    ORDER: 'orders',
    ORDER_PRODUCT: 'order_product',
    PRODUCT_JOIN_ORDER_PRODUCT: 'product NATURAL JOIN order_product'
})

export const AddressKeys = ['postOffice', 'pinCode', 'city', 'country', 'phoneNumber']

export const PrimaryKeys = Object.freeze({
    users: 'user_id',
    platform: 'platform_id',
    platform_review: 'platform_review_id',
    product: 'product_id',
    product_review: 'product_review_id',
    delivery_job: 'delivery_job_id',
    orders: 'order_id',
    order_product: 'order_product_id',
    'product NATURAL JOIN order_product': 'product_id'
})
