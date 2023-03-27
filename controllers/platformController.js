import expressAsyncHandler from 'express-async-handler'

import { PlatformStatus, StatusCode } from '../models/enumConstants.js'
import { PlatformService } from '../services/platformService.js'
import { UtilityService } from '../services/utilityService.js'

// @desc    Create a platform
// @route   POST /api/platform/
// @access  Provider
export const createNewPlatform = expressAsyncHandler(async (req, res) => {
    var platformData = UtilityService.getValues(
        ['name'],
        [
            ['description', ''],
            ['categories', []],
            ['platformStatus', PlatformStatus.DOWNTIME]
        ],
        req.body
    )
    platformData.userId = req.user.userId
    var platform = await PlatformService.getPlatformByName(platformData.name)
    console.log(platform)
    if (platform) {
        throw Error(`Platform with name ${platformData.name} already exists.`)
    }
    await PlatformService.createPlatform(platformData)
    platform = await PlatformService.getPlatformByName(platformData.name)

    res.status(StatusCode.SUCCESSFUL).json(platform)
})
