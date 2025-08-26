
// server.js (small helper server)
// This is a minimal express server that mounts bkash/nagad routes and demonstrates gsheets usage.
// You must install dependencies: npm install express body-parser node-fetch
const express = require('express');
const bodyParser = require('body-parser');
const bkashRoutes = require('./bkash');
const nagadRoutes = require('./nagad');
const { sendToSheet } = require('./gsheets');

const app = express();
app.use(bodyParser.json());

app.post('/api/order', async (req, res) => {
  const order = req.body;
  // Basic validation
  if(!order || !order.items) return res.status(400).json({error:'invalid order'});
  // Send to gsheets (if configured)
  try{
    await sendToSheet(order);
  }catch(e){
    console.warn('gsheets warning', e);
  }
  res.json({ok:true, orderId: Date.now().toString()});
});

app.use('/api/bkash', bkashRoutes);
app.use('/api/nagad', nagadRoutes);

app.get('/', (req,res)=> res.send('Yoga E-commerce Backend Running - update config in bkash/nagad/gsheets'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log('Server running on port', PORT));
