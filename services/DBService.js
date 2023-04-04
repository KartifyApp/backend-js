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

    static keysList(obj) {
        return Object.keys(obj)
            .sort()
            .map((key) => StringService.snakeCase(key))
            .join(', ')
    }

    static valuesList(obj) {
        return Object.keys(obj)
            .sort()
            .map((key) => `'${typeof obj[key] == 'object' ? JSON.stringify(obj[key]) : obj[key]}'`)
            .join(', ')
    }

    static entriesList(obj, joinStr) {
        return Object.keys(obj)
            .sort()
            .map((key) => `${StringService.snakeCase(key)} = '${typeof obj[key] == 'object' ? JSON.stringify(obj[key]) : obj[key]}'`)
            .join(joinStr)
    }
}

export class DBService {
    static async getData(tableName, tableData) {
        try {
            const tableRows = await client.query(`SELECT * FROM ${tableName} WHERE ${StringService.entriesList(tableData, ' AND ')}`)
            return tableRows.rows.map((row) => StringService.camelCaseObject(row))
        } catch (error) {
            throw Error(`Error fetching from ${tableName}.`)
        }
    }

    static async createData(tableName, tableData) {
        try {
            const createdRow = await client.query(`INSERT INTO ${tableName} (${StringService.keysList(tableData)}) VALUES (${StringService.valuesList(tableData)}) RETURNING *`)
            return createdRow.rowCount > 0 ? StringService.camelCaseObject(createdRow.rows[0]) : null
        } catch (error) {
            throw Error(`Error creating new ${tableName}.`)
        }
    }

    static async updateData(tableName, tableData, primaryKey) {
        try {
            const updatedRow = await client.query(
                `UPDATE ${tableName} SET ${StringService.entriesList(tableData, ', ')} WHERE ${PrimaryKeys[tableName]} = '${primaryKey}' RETURNING *`
            )
            return updatedRow.rowCount > 0 ? StringService.camelCaseObject(updatedRow.rows[0]) : null
        } catch (error) {
            throw Error(`Error updating in ${tableName} with primaryKey ${primaryKey}.`)
        }
    }

    static async deleteData(tableName, primaryKey) {
        try {
            const deletedRow = await client.query(`DELETE FROM ${tableName} WHERE ${PrimaryKeys[tableName]} = '${primaryKey}' RETURNING *`)
            return deletedRow.rowCount > 0 ? StringService.camelCaseObject(deletedRow.rows[0]) : null
        } catch (error) {
            throw Error(`Error deleting from ${tableName}.`)
        }
    }
}
