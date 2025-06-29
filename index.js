const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'templates.json');

function loadTemplates() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return {};
  }
}

function saveTemplates(templates) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(templates, null, 2));
}

let templates = loadTemplates();

app.get('/templates', (req, res) => {
  res.json(templates);
});

app.get('/templates/:name', (req, res) => {
  const name = req.params.name;
  if (!templates[name]) {
    return res.status(404).json({ error: 'Template not found' });
  }
  res.json({ name, content: templates[name] });
});

app.post('/templates', (req, res) => {
  const { name, content } = req.body;
  if (!name || !content) {
    return res.status(400).json({ error: 'Name and content are required' });
  }
  if (templates[name]) {
    return res.status(400).json({ error: 'Template already exists' });
  }
  templates[name] = content;
  saveTemplates(templates);
  res.status(201).json({ name, content });
});

app.put('/templates/:name', (req, res) => {
  const name = req.params.name;
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }
  templates[name] = content;
  saveTemplates(templates);
  res.json({ name, content });
});

app.delete('/templates/:name', (req, res) => {
  const name = req.params.name;
  if (!templates[name]) {
    return res.status(404).json({ error: 'Template not found' });
  }
  delete templates[name];
  saveTemplates(templates);
  res.status(204).end();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
