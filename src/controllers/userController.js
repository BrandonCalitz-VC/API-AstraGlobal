const { Router } = require("express");
const z = require("zod");
const bruteforce  = require("../clients/BruteClient");
const authMiddleware = require("../middleware/authMiddleware");
const {User} = require("../db/models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = Router();

const registerSchema = z.object({
    first_name: z.string().min(3),
    last_name: z.string().min(3),
    email: z.string().email(),
    password: z.string().regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
    ),
});
router.post('/register', async (req, res) => {
    try {
        const parsed = registerSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ message: 'Invalid Body', errors: parsed.error.errors });
            return
        }
        const request = parsed.data;
    
        const result = await User.find({ email: request.email });
    
        if (result.length > 0) {
            res.status(400).json({ message: "Email already exists" });
            return
        }

        const user = await User.create({
            first_name: request.first_name,
            last_name: request.last_name,
            email: request.email,
            password: await bcrypt.hash(request.password, 10)
        });
        const token = jwt.sign({ email: user.email, employee: user.employee  }, process.env.JWT_SECRET || "", { expiresIn: "1h" });
        res.status(201).json({ token: token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
    ),
});

router.post('/login', bruteforce.prevent, async (req, res) => {
    try {
        const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ message: 'Invalid Body', errors: parsed.error.errors });
            return
        }
        const request = parsed.data;

        const user = await User.findOne({ email: request.email });
        if (!user) {
            res.status(400).json({ message: "Invalid email or password" });
            return
        }
        const isMatch = await bcrypt.compare(request.password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: "Invalid email or password" });
            return
        }
        const token = jwt.sign({ email: user.email, employee: user.employee  }, process.env.JWT_SECRET || "", { expiresIn: "1h" });
        res.status(201).json({ token: token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email });
        if (!user) {
            res.status(401).json({ message: "Unauthorized" });
            return
        }
        user.password = undefined;
        res.status(200).json({ user: user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;