// Archivo: netlify/functions/create-preference.js

const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Solo permitir POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método no permitido' })
    };
  }

  try {
    const { items, total } = JSON.parse(event.body);

    // Crear preferencia de pago en Mercado Pago
    const preference = {
      items: items.map(item => ({
        title: item.titulo,
        description: `Autor: ${item.autor}`,
        quantity: item.cantidad,
        unit_price: parseFloat(item.precio),
        currency_id: 'COP'
      })),
      back_urls: {
        success: 'https://cesdiweb.github.io/libreria-electronica-ia/confirmacion.html',
        failure: 'https://cesdiweb.github.io/libreria-electronica-ia/carrito.html',
        pending: 'https://cesdiweb.github.io/libreria-electronica-ia/confirmacion.html'
      },
      auto_return: 'approved',
      external_reference: `ORD-${Date.now()}`,
      notification_url: 'https://tu-sitio.netlify.app/.netlify/functions/webhook'
    };

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer APP_USR-900116768425481-102821-add23a77f7931d3b4d246946ca80f08b-2953519382`
      },
      body: JSON.stringify(preference)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Error de Mercado Pago:', data);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Error al crear la preferencia', details: data })
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: data.id,
        init_point: data.init_point
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error del servidor', details: error.message })
    };
  }
};
