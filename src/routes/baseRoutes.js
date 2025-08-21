import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { listBases } from '../controllers/baseController.js';
const router = Router();
router.get('/', auth, listBases);
export default router;
