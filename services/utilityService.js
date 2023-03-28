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
            newObj[key.replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())] = val
        })
        return newObj
    }
}
