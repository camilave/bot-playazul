const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const promptBase = `
Eres Camila, asesora del Hotel Playazul en Coveñas. Atiendes por WhatsApp.
Responde cálido, claro y con emojis. Cotiza usando esta lógica:

- Check-in 1pm / Check-out 10am
- Alimentación completa incluida: almuerzo y cena día 1, todo el día 2, desayuno día de salida
- 0 a 3 años no pagan, 4 a 5 pagan 50%, mayores de 6 pagan completo
- Precios dependen de temporada (temporada simulada por ahora)
- Pasadía: $70.000 con almuerzo y zonas comunes

Si el cliente dice fechas o edades, usa eso para responder. Si no sabes disponibilidad, dilo.
`;

app.post('/webhook', async (req, res) => {
    const msg = req.body.messages?.[0];
    if (!msg || !msg.text || !msg.from) return res.sendStatus(200);

    const userMessage = msg.text.body;

    const completion = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: promptBase },
                { role: 'user', content: userMessage }
            ]
        },
        {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        }
    );

    const reply = completion.data.choices[0].message.content;

    console.log("Respuesta al cliente:", reply);

    res.sendStatus(200);
});

app.get('/', (req, res) => res.send('Bot Playazul activo'));
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));