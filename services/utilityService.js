export class UtilityService {
    static getValues(hardKeys, softKeys, obj) {
        var objCreated = {}
        hardKeys.forEach((key) => {
            if (!obj[key]) {
                throw Error(`${key} not provided.`)
            }
            objCreated[key] = obj[key]
        })
        softKeys.forEach(([key, value]) => {
            if (obj[key]) objCreated[key] = obj[key]
            else objCreated[key] = value
        })
        return objCreated
    }

    static camelCaseObject(obj) {
        var newObj = {}
        Object.entries(obj).forEach(([key, val]) => {
            newObj[UtilityService.camelCase(key)] = val
        })
        return newObj
    }

    static snakeCase(str) {
        return str.replace(/[A-Z]/g, (chr) => `_${chr.toLowerCase()}`)
    }

    static camelCase(str) {
        return str.replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
    }

    static whereClause(obj) {
        return obj
            ? 'WHERE ' +
                  Object.entries(obj)
                      .map(([key, value]) => `${UtilityService.snakeCase(key)} = '${value}'`)
                      .join(' AND ')
            : null
    }
}
