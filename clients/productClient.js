import { client } from '../models/db.js'
import { UtilityService } from '../services/utilityService.js'

export class ProductClient {
    static async getProductById(productId) {
        try {
            const product = await client.query(`SELECT * FROM product WHERE product_id = '${productId}'`)
            return product.rowCount > 0 ? UtilityService.camelCaseObject(product.rows[0]) : null
        } catch (error) {
            throw Error(`Error fetching product with productId ${productId}.`)
        }
    }

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

    static async updateProduct(product) {
        try {
            const updatedProduct = await client.query(
                `UPDATE product SET name = '${product.name}', image = '${product.image}', brand = '${product.brand}', category = '${product.category}', 
                description = '${product.description}', price = '${product.price}', stock_count = '${product.stockCount}' WHERE product_id = '${product.productId}' RETURNING *`
            )
            return updatedProduct.rowCount > 0 ? UtilityService.camelCaseObject(updatedProduct.rows[0]) : null
        } catch (error) {
            throw Error(`Error in updating product with productId ${product.productId}.`)
        }
    }
}
