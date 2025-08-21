import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { listAssets } from '../controllers/assetController.js';
const router = Router();
router.get('/', auth, listAssets);
export default router;
