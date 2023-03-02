import { GetServerSideProps } from "next";
import Image from 'next/image';
import Head from "next/head";
import Link from 'next/link';
import Stripe from "stripe";
import { stripe } from "../lib/stripe";
import { ImageContainer, SuccessContainer } from '../styles/pages/success';

interface SuccessProps {
  costumerName: string;
  product: {
    name: string;
    imageUrl: string;
  }
}


export default function Success({ costumerName, product }: SuccessProps) {
    return (
        <>
            <Head>
                <title>Compra efetuada | Ignite Shop</title>
                <meta name="robots" content="noindex" />  {/* Essa tag pede para os croller não indexar esta pagina */}
            </Head>
            <SuccessContainer>
            <h1>Compra efetuada</h1>

            <ImageContainer>
            <Image src={product.imageUrl} width={120} height={110} alt="" />
            </ImageContainer>

            <p>
            Uhuul <strong>{costumerName}</strong>, sua <strong>{product.name}</strong> já está a caminho da sua casa.
            </p>

            <Link href="/">
            Voltar ao catálogo
            </Link>
            </SuccessContainer>
        </>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  if (!query.session_id) { // Caso não tenha o session_id, mando para o home.
    return { // Redirecionamento pelo  getServerSideProps
      redirect: {
        destination: '/',
        permanent: false,
      }
    }
  }

  const sessionId = String(query.session_id);

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'line_items.data.price.product'] 
     /* Assim tras os dados que preciso, seria um extends para pegar os  dados, 
     dados do produto comprado ->  aula: DadProjeto: 4 seção: Integração com o 
     Stripe os da compra no sucesso  minuto 7:40 */
  });

  const costumerName = session.customer_details.name;
  const product = session.line_items.data[0].price.product as Stripe.Product; // CARINHO Projeto: 4 seção: Produto & Checkout  aula Dados da compra no sucesso 10:40
  /* Normalmente é uma string pq é o ID, mas quando expando para pegar os dados 
  do produto, então ele é um OBj tipo com Stripe.Product, dizendo que é um OBJ.*/

  return {
    props: {
      costumerName,
      product: {
        name: product.name,
        imageUrl: product.images[0]
      }
    }
  }
}