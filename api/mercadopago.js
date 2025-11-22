const mercadopago = require('mercadopago');

module.exports = async (req, res) => {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Configurar Mercado Pago con tu Access Token (SEGURO, solo en servidor)
    mercadopago.configure({
      access_token: 'APP_USR-900116768425481-102821-add23a77f7931d3b4d246946ca80f08b-2953519382'
    });

    const { items, total, currency } = req.body;

    // Crear preferencia de pago
    const preference = {
      items: items.map(item => ({
        title: item.titulo,
        unit_price: parseFloat(item.precio),
        quantity: parseInt(item.cantidad),
        currency_id: currency || 'USD'
      })),
      back_urls: {
        success: 'https://cesdiweb.github.io/libreria-electronica-ia/confirmacion.html',
        failure: 'https://cesdiweb.github.io/libreria-electronica-ia/carrito.html',
        pending: 'https://cesdiweb.github.io/libreria-electronica-ia/carrito.html'
      },
      auto_return: 'approved',
      statement_descriptor: 'Librería Electrónica IA',
      external_reference: `ORD-${Date.now()}`
    };

    const response = await mercadopago.preferences.create(preference);

    return res.status(200).json({
      id: response.body.id,
      init_point: response.body.init_point
    });

  } catch (error) {
    console.error('Error al crear preferencia:', error);
    return res.status(500).json({ 
      error: 'Error al procesar el pago',
      details: error.message 
    });
  }
};
