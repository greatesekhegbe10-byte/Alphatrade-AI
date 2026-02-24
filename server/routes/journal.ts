import { Router } from 'express';
import { getJournalEntries, addJournalEntry, deleteJournalEntry } from '../controllers/journalController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getJournalEntries);
router.post('/', authenticate, addJournalEntry);
router.delete('/:id', authenticate, deleteJournalEntry);

export default router;
