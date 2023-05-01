import { client } from '../models/db.js'
import { PrimaryKeys } from '../models/enumConstants.js'

export class StringService {
    static snakeCase(str) {
        return str.replace(/[A-Z]/g, (chr) => `_${chr.toLowerCase()}`)
    }

    static camelCase(str) {
        return str.replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
    }

    static camelCaseObject(obj) {
        var newObj = {}
        Object.entries(obj).forEach(([key, val]) => {
            newObj[StringService.camelCase(key)] = val
        })
        return newObj
    }

    static entriesList(obj) {
        return Object.keys(obj)
            .sort()
            .map((key) => [StringService.snakeCase(key), typeof obj[key] == 'object' ? JSON.stringify(obj[key]) : obj[key]])
    }
}

export class DBService {
    static async getData(tableName, tableData) {
        try {
            const queries = StringService.entriesList(tableData)
            const tableRows = await client.query(
                `SELECT * FROM ${tableName} ${queries.length > 0 ? 'WHERE ' + queries.map((query, i) => `${query[0]} =  $${i + 1}`).join(' AND ') : ''}
                ORDER BY ${PrimaryKeys[tableName]}`,
                queries.map((query) => query[1])
            )
            return tableRows.rows.map((row) => StringService.camelCaseObject(row))
        } catch (error) {
            throw Error(`Error fetching from ${tableName}.`)
        }
    }

    static async createData(tableName, tableData) {
        try {
            const createList = StringService.entriesList(tableData)
            const createdRow = await client.query(
                `INSERT INTO ${tableName} (${createList.map((createElement) => createElement[0]).join(', ')}) 
                VALUES (${createList.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *`,
                createList.map((createElement) => createElement[1])
            )
            return createdRow.rowCount > 0 ? StringService.camelCaseObject(createdRow.rows[0]) : null
        } catch (error) {
            throw Error(`Error creating new ${tableName}.`)
        }
    }

    static async updateData(tableName, tableData, primaryKey) {
        try {
            const updateList = StringService.entriesList(tableData)
            if (updateList.length === 0) throw Error()
            const updatedRow = await client.query(
                `UPDATE ${tableName} SET ${updateList.map((updateElement, i) => `${updateElement[0]} = $${i + 1}`).join(', ')} 
                WHERE ${PrimaryKeys[tableName]} = $${updateList.length + 1} RETURNING *`,
                [...updateList.map((updateElement) => updateElement[1]), primaryKey]
            )
            return updatedRow.rowCount > 0 ? StringService.camelCaseObject(updatedRow.rows[0]) : null
        } catch (error) {
            throw Error(`Error updating in ${tableName} with primaryKey ${primaryKey}.`)
        }
    }

    static async deleteData(tableName, primaryKey) {
        try {
            const deletedRow = await client.query(`DELETE FROM ${tableName} WHERE ${PrimaryKeys[tableName]} = $1 RETURNING *`, [primaryKey])
            return deletedRow.rowCount > 0 ? StringService.camelCaseObject(deletedRow.rows[0]) : null
        } catch (error) {
            throw Error(`Error deleting from ${tableName}.`)
        }
    }

    static async beginTransaction() {
        await client.query('BEGIN')
    }

    static async commitTransaction() {
        await client.query('COMMIT')
    }

    static async rollBackTransaction() {
        await client.query('ROLLBACK')
    }
}
