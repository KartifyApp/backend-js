export class UtilityService {
    static getObject(keys, obj) {
        var finalObj = {}
        keys.forEach((key) => {
            if (!obj[key]) return null
            finalObj[key] = obj[key]
        })
        return finalObj
    }
}
