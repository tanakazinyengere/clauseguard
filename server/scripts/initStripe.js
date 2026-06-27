const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function init() {
  try {
    const basicProduct = await stripe.products.create({
      name: 'ClauseGuard Basic Scan',
      description: 'Single AI-powered contract audit for red flags.',
    });

    const basicPrice = await stripe.prices.create({
      product: basicProduct.id,
      unit_amount: 900,
      currency: 'usd',
    });

    const unlimitedProduct = await stripe.products.create({
      name: 'ClauseGuard Unlimited',
      description: 'Unlimited contract scans and IP protection checks.',
    });

    const unlimitedPrice = await stripe.prices.create({
      product: unlimitedProduct.id,
      unit_amount: 2900,
      currency: 'usd',
      recurring: { interval: 'month' },
    });

    console.log('STRIPE_BASIC_PRICE_ID=' + basicPrice.id);
    console.log('STRIPE_UNLIMITED_PRICE_ID=' + unlimitedPrice.id);
  } catch (error) {
    console.error('Error creating products:', error);
  }
}

init();
