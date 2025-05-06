import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const PORT = 3000;

type ToDo = {
    id: number;
    text: string;
    done: boolean;
};

const toDoList: ToDo[] = [];
let nextId = 1;


app.use(cors({
    methods: '*',
    origin: '*',
}));

app.use(bodyParser.json());


app.post('/todos', (req, res) => {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
        res.status(400).json({ error: 'Invalid ToDo content.' });
        return;
    }
    const newToDo: ToDo = {
        id: nextId++,
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
    const id = parseInt(req.params.id); 
    const index = toDoList.findIndex(todo => todo.id === id);
    if (index === -1) {
        res.status(404).json({ error: 'ToDo not found.' });
        return;
    }
    toDoList.splice(index, 1);
    res.status(204).send(); 
});

app.put('/todos/:id', (req, res) => {
    const id = parseInt(req.params.id);
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