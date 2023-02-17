import { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "../../lib/stripe";

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  const { priceId } = req.body;

  if (req.method !== "POST") {// Se a rota for chamda sem ser post já retorno erro, por mais que ele
    // aceita POST, get, put e delete, para a chamada, vou padronizar para aceitar apenas POST, 
    //assim não se tentar fazer um GET não conseguirá. 
    return res.status(405).json({ error: "Method not allowed." });
  }

  if (!priceId) { // Se  a rota for chamada sem o  priceId, já reorno um com erro.
    return res.status(400).json({ error: 'Price not found.' });
  }

  // const successUrl = `${process.env.NEXT_URL}/success`;
  const successUrl = `${process.env.NEXT_URL}/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${process.env.NEXT_URL}/`;

  const checkoutSession = await stripe.checkout.sessions.create({
    success_url: successUrl,
    cancel_url: cancelUrl,
    mode: 'payment',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      }
    ]
  })

  return res.status(201).json({
    checkoutUrl: checkoutSession.url //URL que vai direcionar o usuário para finalziar compra
  })
}