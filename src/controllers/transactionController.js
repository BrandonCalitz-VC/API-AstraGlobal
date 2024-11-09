const { Router } = require("express");
const z = require("zod");
const bruteforce  = require("../clients/BruteClient");
const authMiddleware = require("../middleware/authMiddleware");
const {User} = require("../db/models/user");
const {Transaction} = require("../db/models/transaction");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const transaction = require("../db/models/transaction");

const router = Router();

const paySchema = z.object({
  amount: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) : val),
    z.number().positive("Amount must be a positive number")
  ),
  currency: z.string(),
  account_to: z.string().min(1),
  provider: z.string(),
  value_1: z.string().optional(),
  value_2: z.string().optional(),
});

const txnSchema = z.object({
  transaction_id: z.string().min(1),
});
router.post('/', authMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email });
        const parsed = paySchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ message: 'Invalid Body', errors: parsed.error.errors });
            return
        }
        const request = parsed.data;
    
        const txn = await Transaction.create({
            user: user._id,
            amount: request.amount,
            currency: request.currency,
            account_to: request.account_to,
            provider: request.provider,
            value_1: request.value_1,
            value_2: request.value_2,
        });
        res.status(201).json({ message: "Transaction created successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/approve', authMiddleware, async (req, res) => {
    try {
        const parsed = txnSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ message: 'Invalid Body', errors: parsed.error.errors });
            return
        }
        const request = parsed.data;
        const transaction = await Transaction.findOne({ _id: request.transaction_id });
        if(!transaction){
            res.status(400).json({ message: 'Invalid transaction id' });
            return
        }
        transaction.status = 'approved';
        await transaction.save();
        res.status(201).json({ message: "Transaction approved successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
router.post('/decline', authMiddleware, async (req, res) => {
    try {
        const parsed = txnSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ message: 'Invalid Body', errors: parsed.error.errors });
            return
        }
        const request = parsed.data;
        const transaction = await Transaction.findOne({ _id: request.transaction_id });
        if(!transaction){
            res.status(400).json({ message: 'Invalid transaction id' });
            return
        }
        transaction.status = 'declined';
        await transaction.save();
        res.status(201).json({ message: "Transaction declined successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



router.get('/', authMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email });
        const transaction = []
        if(user.employee){
            transactions = await Transaction.find({});
        }else{
            transactions = await Transaction.find({ user: user._id });
        }

        res.status(200).json({ transactions:transactions.map(t => ({
            id: t._id,
            amount: t.amount,
            currency: t.currency,
            account_to: t.account_to,
            provider: t.provider,
            value_1: t.value_1,
            value_2: t.value_2,
            status: t.status,
            created_at: t.created_at,
        }))});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports  = router;