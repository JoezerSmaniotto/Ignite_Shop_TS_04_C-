import {useRouter} from 'next/router'
export default function Products(){
    const {query} = useRouter() // Dentro de query tenho os params passado

    return <h1>{JSON.stringify(query)}</h1>
}