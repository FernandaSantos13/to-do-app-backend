import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

const app = express();
const PORT = 3000;

app.use(cors({
    methods: '*',
    origin: '*',
}));

app.use(bodyParser.json());

declare global {
    namespace Express {
        interface Request {
            user: {
                id: string;
                email: string;
            };
        }
        interface Response {
            user: {
                id: string;
                email: string;
            };  
        }
    }
}

app.post('/login',async (req, res) => {
    const { email } = req.body;
    const user = await prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        res.status(404).json({ error: 'User not found.' });
        return;
    }   
    res.json({ userId: user.id});
});

const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.header('user-id');
    if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    try{
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            res.status(401).json({ error: 'User Invalid. Sign up to create an account!' });
            return;
        };
        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(400).json({ error: 'Error during authentication.' });
    }
};

app.post('/signup', async (req, res) => {
    const { email, name } = req.body;

    if (!email || !name) {
        res.status(400).json({ error: 'Email and name are mandotory.' });
        return;
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            res.status(400).json({ error: 'User already exists. Please sign in' });
            return;
        }
        const newUser = await prisma.user.create({
            data: {
                email,
                name,
            },
        });
        res.status(201).json({ userId: newUser.id });
    } catch (error) {
        console.error('Error signing up:', error);
        res.status(400).json({ error: 'Error singnig up.' });
    }
});

app.post('/todos', authenticateUser, async (req, res) => {
    const { id, text, done } = req.body;
    if (typeof id !== 'string') {
        res.status(400).json({ error: 'Invalid ToDo ID.' });
        return;
    }
    if (!text || typeof text !== 'string') {
        res.status(400).json({ error: 'Invalid ToDo content.' });
        return;
    }
    if (typeof done !== 'boolean') {
        res.status(400).json({ error: 'Invalid ToDo status.' });
        return;
    }
    const newToDo = await prisma.toDo.create({
        data: {
            id,
            text,
            done: false,
            userId: req.user.id,
        },
    });
    res.status(201).json(newToDo);
});

app.get('/todos', authenticateUser, async (req, res) => {
    try {
        const toDos = await prisma.toDo.findMany({
            where: { userId: req.user.id },
        });
        res.json(toDos);
    } catch (error) {
        console.error('Error fetching ToDos:', error);
        res.status(400).json({ error: 'Internal server error.' });
    }
});


app.delete('/todos/:id', authenticateUser, async (req, res) => {
    const { id } = req.params;

    try {
        const toDo = await prisma.toDo.findUnique({
            where: { id },
        });

        if (!toDo || toDo.userId !== req.user.id) {
            res.status(404).json({ error: 'ToDo not found or access denied.' });
        }

        await prisma.toDo.delete({
            where: { id },
        });

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting ToDo:', error);
        res.status(400).json({ error: 'Internal server error.' });
    }
});


app.put('/todos/:id', authenticateUser, async (req, res) => {
    const { id } = req.params;
    const { text, done } = req.body;
    try {
        const toDo = await prisma.toDo.findUnique({
            where: { id },
        });

        if (!toDo || toDo.userId !== req.user.id) {
            res.status(404).json({ error: 'ToDo not found or access denied.' });
            return
        }

        const updatedToDo = await prisma.toDo.update({
            where: { id },
            data: {
                text: text !== undefined ? text : toDo.text,
                done: done !== undefined ? done : toDo.done,
            },
        });

        res.status(200).json(updatedToDo);
    } catch (error) {
        console.error('Error updating ToDo:', error);
        res.status(400).json({ error: 'Internal server error.' });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});