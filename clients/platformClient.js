import { client } from '../models/db.js'
import { UtilityService } from '../services/utilityService.js'

export class PlatformClient {
    static async getPlatforms(platformData) {
        try {
            const platforms = await client.query(`SELECT * FROM platform ${UtilityService.whereClause(platformData)}`)
            return platforms.rows.map((row) => UtilityService.camelCaseObject(row))
        } catch (error) {
            throw Error(`Error fetching platforms with query params ${platformData}.`)
        }
    }

    static async createPlatform(platform) {
        try {
            const createdPlatform = await client.query(
                `INSERT INTO platform (name, description, user_id, categories, platform_status, platform_address)
                VALUES ('${platform.name}', '${platform.description}', '${platform.userId}', '${JSON.stringify(platform.categories)}', 
                '${platform.platformStatus}', '${JSON.stringify(platform.platformAddress)}') RETURNING * `
            )
            return createdPlatform.rowCount > 0 ? UtilityService.camelCaseObject(createdPlatform.rows[0]) : null
        } catch (error) {
            throw Error(`Error in creating platform ${platform.name}.`)
        }
    }

    static async updatePlatform(platform) {
        try {
            const updatedPlatform = await client.query(
                `UPDATE platform SET name = '${platform.name}', description = '${platform.description}', categories = '${JSON.stringify(platform.categories)}',
                platform_status = '${platform.platformStatus}', platform_address = '${JSON.stringify(platform.platformAddress)}' 
                WHERE platform_id = '${platform.platformId}' RETURNING *`
            )
            return updatedPlatform.rowCount > 0 ? UtilityService.camelCaseObject(updatedPlatform.rows[0]) : null
        } catch (error) {
            throw Error(`Error updating platform with platformId ${platform.platformId}.`)
        }
    }

    static async deletePlatform(platform) {
        try {
            const deletedPlatform = await client.query(`DELETE FROM platform WHERE platform_id = '${platform.platformId}' RETURNING *`)
            return deletedPlatform.rowCount > 0 ? UtilityService.camelCaseObject(deletedPlatform.rows[0]) : null
        } catch (error) {
            throw Error(`Error deleting platform with platformId ${platform.platformId}.`)
        }
    }
}

export class PlatformReviewClient {
    static async getPlatformReviewById(platformReviewId) {
        try {
            const platformReview = await client.query(`SELECT * FROM platform_review WHERE platform_review_id = '${platformReviewId}'`)
            return platformReview.rowCount > 0 ? UtilityService.camelCaseObject(platformReview.rows[0]) : null
        } catch (error) {
            throw Error(`Error fetching platform review eith platformReviewId ${platformReviewId}.`)
        }
    }

    // static async getPlatformReviews(platformId) {
    //     try {
    //         const platformReviews = await client.query(`SELECT * FROM platfrom_review WHERE platform_id = '${platformId}'`)
    //         return platformReviews.rows.map((row) => UtilityService.camelCaseObject(row))
    //     } catch (error) {
    //         throw Error(`Error fetching platform reviews for platform with platformId ${platformId}.`)
    //     }
    // }

    static async getPlatformReviews(platformData) {
        try {
            const platformReviews = await client.query(`SELECT * FROM platform_review ${UtilityService.whereClause(platformData)}`)
            return platformReviews.rows.map((row) => UtilityService.camelCaseObject(row))
        } catch (error) {
            throw Error(`Error fetching platform_reviews.`)
        }
    }

    static async createPlatformReview(platformReview) {
        try {
            const createdPlatformReview = await client.query(
                `INSERT INTO platform_review (comment, rating, user_id, platform_id) VALUES ('${platformReview.comment}', 
                '${platformReview.rating}', '${platformReview.userId}', '${platformReview.platformId}') RETURNING *`
            )
            return createdPlatformReview.rowCount > 0 ? UtilityService.camelCaseObject(createdPlatformReview.rows[0]) : null
        } catch (error) {
            throw Error(`Error creating platform review on platformId ${platformReview.platformId}.`)
        }
    }
}
