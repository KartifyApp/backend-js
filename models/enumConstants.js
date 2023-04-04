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

export const TableNames = Object.freeze({
    USER: 'users',
    PLATFORM: 'platform',
    PLATFORM_REVIEW: 'platform_review'
})

export const PrimaryKeys = Object.freeze({
    users: 'user_id',
    platform: 'platform_id',
    platform_review: 'platform_review_id'
})
