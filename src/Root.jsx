
import Header from './components/Header'
import Main from './components/Main'
import { CartProvider } from './contexts/CartContext';
import './index.css'

function Root() {
  
  return (
    <>
      <CartProvider>
        <Header />
        <Main />
      </CartProvider>
    </>
  )
}

export default Root;
