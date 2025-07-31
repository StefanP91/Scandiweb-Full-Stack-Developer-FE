
import Header from './components/Header'
import Main from './components/Main'
import { CartProvider } from './contexts/CartContext';
import { OverlayProvider } from './contexts/OverlayContext';
import './index.css'

function Root() {
  
  return (
    <>
        <CartProvider>
          <OverlayProvider>
            <Header />
            <Main />
          </OverlayProvider>
        </CartProvider>
    </>
  )
}

export default Root;
