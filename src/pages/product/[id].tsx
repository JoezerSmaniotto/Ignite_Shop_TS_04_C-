import axios from "axios";
import { GetStaticPaths, GetStaticProps } from 'next';
import Image from 'next/image';
import Head from "next/head";
import { useState } from "react";
import Stripe from "stripe"
import { stripe } from '../../lib/stripe';
import { ImageContainer, ProductContainer, ProductDetails } from '../../styles/pages/product';


interface ProductProps {
  product: {
    id: string;
    name: string;
    imageUrl: string;
    price: string;
    description: string;
    defaultPriceId: string;
  }
}


export default function Product({product}:ProductProps){
  const [isCreatingCheckoutSession, setIsCreatingCheckoutSession] = useState(false);

  async function handleBuyButton() {
    try {
      setIsCreatingCheckoutSession(true);

      const response = await axios.post('/api/checkout', {
        priceId: product.defaultPriceId,
      })
      // Gera o retorno da rota /api/checkout, que é uma link e redireiciona para lá,para neste caso concluir a compra
      const { checkoutUrl } = response.data;
      // Rota externa
      window.location.href = checkoutUrl;
    } catch (err) {
      // Conectar com uma ferramenta de observabilidade (Datadog / Sentry)
      console.log("err:", err)
      setIsCreatingCheckoutSession(false);

      alert('Falha ao redirecionar ao checkout!')
    }
  }

    return (
      <>
        <Head>
          <title>{product.name}| Ignite Shop</title>
        </Head>
        <ProductContainer>
            <ImageContainer>
                <Image src={product.imageUrl} width={520} height={480} alt=""/>
            </ImageContainer>
            <ProductDetails>
                <h1>{product.name}</h1>
                <span>{product.price}</span>

                <p>{product.description}</p>

                <button disabled={isCreatingCheckoutSession} onClick={handleBuyButton}>
                  Comprar agora
                </button>
            </ProductDetails>
        </ProductContainer>
      </>
    )
}



/* 
Projeto: 4 seção: Produto & Checkout Aula: SSG com parâmetro dinâmico

Metodo que devolve os IDs que necessíta para páginas estáticas
o metodo retorno um OBJ, quem tem  paths: [], e dentro do array de paths tenho varios os 
paramemtros/IDS, necessários , 
*/
export const getStaticPaths: GetStaticPaths = async () => { //Async
  return {
    paths: [
        {params: {id: 'prod_NNIaQYqGC5Bg3w'}},
    ],
    fallback: 'blocking',
  }
}

/*

Projeto: 4 seção: Produto & Checkout Aula: Carregando dados do produto 5:00  Tipagem da função

o GetStaticProps Recebe como parametro 
1 º O tipo do retorno, neste caso passo any, não quer tipar, 
2 º O Formato do Obj de params que recebemos. neste caso recebo o id do produto
{id: string}. digo q seu formato é uma string, pois retrieve só aceita string
mas poderia ser um obj {} vazio.
*/
export const getStaticProps: GetStaticProps<any, { id: string }> = async ({ params }) => {
  const productId = params.id;

  const product = await stripe.products.retrieve(productId, {
    expand: ['default_price']
  });

  const price = product.default_price as Stripe.Price;

  return {
    props: {
      product: {
        id: product.id,
        name: product.name,
        imageUrl: product.images[0],
        price: new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(price.unit_amount / 100),
        description: product.description,
        defaultPriceId: price.id
      }
    },
    revalidate: 60 * 60 * 1 // 1 hours
  }
}