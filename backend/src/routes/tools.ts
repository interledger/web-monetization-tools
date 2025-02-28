import type { Router } from 'express'
import {
  getDefault,
  getUserConfig,
  createUserConfig,
  saveUserConfig
} from '../controllers/tools.js'

const userRoutes = (router: Router) => {
  router.get('/tools/default', getDefault)
  router.get('/tools/:id', getUserConfig)
  router.post('/tools', createUserConfig)
  router.put('/tools', saveUserConfig)

  return router
}

export default userRoutes
