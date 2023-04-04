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

    static entriesList(obj) {
        return Object.keys(obj)
            .sort()
            .map((key) => `${StringService.snakeCase(key)} = '${typeof obj[key] == 'object' ? JSON.stringify(obj[key]) : obj[key]}'`)
    }
}

export class DBService {
    static async getData(tableName, tableData) {
        try {
            const queries = StringService.entriesList(tableData)
            const tableRows = await client.query(`SELECT * FROM ${tableName} ${queries.length > 0 ? 'WHERE ' + queries.join(' AND ') : ''}`)
            return tableRows.rows.map((row) => StringService.camelCaseObject(row))
        } catch (error) {
            console.log(`SELECT * FROM ${tableName} WHERE ${StringService.entriesList(tableData, ' AND ')}`)
            throw Error(`Error fetching from ${tableName}.`)
        }
    }

    static async createData(tableName, tableData) {
        try {
            const createdRow = await client.query(
                `INSERT INTO ${tableName} (${StringService.keysList(tableData)}) VALUES (${StringService.valuesList(tableData)}) RETURNING *`
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
                `UPDATE ${tableName} SET ${updateList.join(', ')} WHERE ${PrimaryKeys[tableName]} = '${primaryKey}' RETURNING *`
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
