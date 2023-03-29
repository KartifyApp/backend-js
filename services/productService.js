import { client } from '../models/db.js'
import { UtilityService } from './utilityService.js'

export class ProductService {
    static async getPlatformProducts(platformId, category) {
        try {
            const products = await client.query(`SELECT * FROM product WHERE platform_id = '${platformId}' ${category ? `AND category = '${category}'` : ''}`)
            return products.rows.map((row) => UtilityService.camelCaseObject(row))
        } catch (error) {
            throw Error(`Error fetching platform products from platformId ${platformId}.`)
        }
    }

    static async createProduct(product) {
        try {
            const createdProduct = await client.query(
                `INSERT INTO product (name, image, brand, category, description, price, stock_count, platform_id)
                VALUES ('${product.name}', '${product.image}', '${product.brand}', '${product.category}', '${product.description}', 
                '${product.price}', '${product.stockCount}', '${product.platformId}') RETURNING * `
            )
            return createdProduct.rowCount > 0 ? UtilityService.camelCaseObject(createdProduct.rows[0]) : null
        } catch (error) {
            throw Error(`Error in creating product ${product.name}.`)
        }
    }
}
