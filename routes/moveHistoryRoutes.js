import express from 'express';
import {
  getAllMoves,
  getMoveDetails,
  getMoveStatistics,
  updateMoveStatus
} from '../controllers/moveHistoryController.js';

const router = express.Router();

// Get all moves with filtering
router.get('/', getAllMoves);

// Get move statistics
router.get('/statistics', getMoveStatistics);

// Get specific move details
router.get('/:type/:id', getMoveDetails);

// Update move status
router.put('/:type/:id/status', updateMoveStatus);

export default router;
