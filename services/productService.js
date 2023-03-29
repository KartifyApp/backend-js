import { client } from '../models/db.js'
import { UtilityService } from './utilityService.js'

export class ProductService {
    static async createProduct(product) {
        try {
            const createdProduct = await client.query(
                `INSERT INTO product (name, image, brand, category, description, price, stock_count, platform_id)
                VALUES ('${product.name}', '${product.image}', '${product.brand}', '${product.category}', '${product.description}', 
                '${product.price}', '${product.stockCount}', '${product.platformId}') RETURNING * `
            )
            return createdProduct.rowCount > 0 ? UtilityService.camelCaseObject(createdProduct.rows[0]) : null
        } catch (error) {
            console.log(`INSERT INTO product (name, image, brand, category, description, price, stock_count, platform_id)
            VALUES ('${product.name}', '${product.image}', '${product.brand}', '${product.category}', '${product.description}', 
            '${product.price}', '${product.stockCount}', '${product.platformId}') RETURNING * `)
            console.log(error)
            throw Error(`Error in creating product ${product.name}.`)
        }
    }
}
