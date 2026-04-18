import express from 'express';
import { getAllPayments, updatePayment } from '../controllers/paymentController.js';

const router = express.Router();

router.get('/', getAllPayments);
router.put('/:id', updatePayment);

export default router;
