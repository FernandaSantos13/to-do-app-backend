import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const PORT = 3000;

type ToDo = {
    id: string;
    text: string;
    done: boolean;
};

const toDoList: ToDo[] = [];
//let nextId = 1;


app.use(cors({
    methods: '*',
    origin: '*',
}));

app.use(bodyParser.json());


app.post('/todos', (req, res) => {
    const {id, text, done } = req.body;
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
    const newToDo: ToDo = {
        id,
        text,
        done: false,
    };
    toDoList.push(newToDo);
    res.status(201).json(newToDo);
});

app.get('/todos', (req, res) => {
    res.json(toDoList);
    return;
});


app.delete('/todos/:id', (req, res) => {
    const { id } = req.params;
    const toDo = toDoList.find(todo => todo.id === id);
    if (!toDo) {
        res.status(404).json({ error: 'ToDo not found.' });
        return;
    }
    const updatedList = toDoList.filter(todo => todo.id !== id);
    toDoList.length = 0;
    toDoList.push(...updatedList);
    res.status(204).send(); 
});

app.put('/todos/:id', (req, res) => {
    const { id } = req.params;
    const { text, done } = req.body;
    const toDo = toDoList.find(todo => todo.id === id);

    if (!toDo) {
        res.status(404).json({ error: 'ToDo not found.' });
        return;
    }

    if (typeof text === 'string') {
        toDo.text = text;
    }

    if (typeof done === 'boolean') {
        toDo.done = done;   
    }

    res.json(toDo);
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});