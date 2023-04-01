import { BcryptService } from './externalService.js'
import { PlatformService } from './platformService.js'
import { ProductService } from './productService.js'
import { UserService } from './userService.js'

export class ConstraintService {
    static async uniqueUserUsername(username) {
        const user = await UserService.getUserByUsername(username)
        if (user) {
            throw Error(`User with username ${username} already exists.`)
        }
        return true
    }

    static async checkPassword(username, password) {
        const user = await UserService.getUserByUsername(username)
        if (!user) {
            throw Error(`Invalid username ${username}`)
        }
        if (!(await BcryptService.compare(password, user.password))) {
            throw Error(`Invalid password for username ${username}`)
        }
        delete user.password
        return user
    }

    static async uniquePlatformName(name) {
        const platform = await PlatformService.getPlatformByName(name)
        if (platform) {
            throw Error(`Platform with name ${name} already exists.`)
        }
        return true
    }

    static async checkUserPlatform(userId, platformId) {
        const platform = await PlatformService.getPlatformById(platformId)
        if (platform.userId != userId) {
            throw Error(`No platformId ${platformId} exists for userId ${userId}.`)
        }
        return platform
    }

    static async checkUserProduct(userId, productId) {
        const product = await ProductService.getProductById(productId)
        if (!product) {
            throw Error(`No product with productId ${productId}.`)
        }
        await ConstraintService.checkUserPlatform(userId, product.platformId)
        return product
    }

    static async checkProductCategory(platform, category) {
        if (!platform.categories.includes(category)) {
            throw Error(`Platform does not have ${category} category.`)
        }
        return true
    }
}
