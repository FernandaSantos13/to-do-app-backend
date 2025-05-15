import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const app = express();
const PORT = 3000;

app.use(cors({
    methods: '*',
    origin: '*',
}));

app.use(bodyParser.json());


app.post('/todos', async (req, res) => {
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
        },
    });
    res.status(201).json(newToDo);
});

app.get('/todos', async (req, res) => {
    try {
        const toDos = await prisma.toDo.findMany();
        res.json(toDos);
    } catch (error) {
        console.error('Error fetching ToDos:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});


app.delete('/todos/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const toDo = await prisma.toDo.findUnique({
            where: { id },
        });

        if (!toDo) {
            return res.status(404).json({ error: 'ToDo not found.' });
        }

        await prisma.toDo.delete({
            where: { id },
        });

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting ToDo:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});


app.put('/todos/:id', async (req, res) => {
    const { id } = req.params;
    const { text, done } = req.body;
    try {
        const toDo = await prisma.toDo.findUnique({
            where: { id },
        });

        if (!toDo) {
            return res.status(404).json({ error: 'ToDo not found.' });
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
        res.status(500).json({ error: 'Internal server error.' });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});