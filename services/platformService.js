import { client } from '../models/db.js'
import { UtilityService } from './utilityService.js'

export class PlatformService {
    static async getPlatformByName(name) {
        try {
            const platform = await client.query(`SELECT * FROM platform WHERE name = '${name}'`)
            return platform.rowCount > 0 ? UtilityService.camelCaseObject(platform.rows[0]) : null
        } catch (error) {
            throw Error(`Error fetching platform with name ${name}`)
        }
    }

    static async getUserPlatforms(userId, platformId = null) {
        try {
            const platforms = await client.query(`SELECT * FROM platform WHERE user_id = '${userId}' ${platformId ? `AND platform_id = '${platformId}'` : ''}`)
            return platforms.rows
        } catch (error) {
            throw Error(`Error fetching platforms for user ${userId}`)
        }
    }

    static async createPlatform(platform) {
        try {
            await client.query(
                `INSERT INTO platform (name, description, user_id, categories, platform_status)
                VALUES ('${platform.name}', '${platform.description}', '${platform.userId}', '${JSON.stringify(platform.categories)}', '${platform.platformStatus}')`
            )
            return true
        } catch (error) {
            throw Error(`Error in creating platform ${platform.name}.`)
        }
    }
}
