import type { Router } from 'express'
import {
  getDefault,
  getUserConfig,
  createUserConfig,
  saveUserConfig,
  getUserConfigByTag,
  deleteUserConfigVersion
} from '../controllers/tools.js'

const userRoutes = (router: Router) => {
  router.get('/tools/default', getDefault)
  router.get('/tools/:id', getUserConfig)
  router.get('/tools/:id/:tag', getUserConfigByTag)
  router.post('/tools', createUserConfig)
  router.put('/tools', saveUserConfig)
  router.delete('/tools/:walletAddress/:version', deleteUserConfigVersion)

  return router
}

export default userRoutes
