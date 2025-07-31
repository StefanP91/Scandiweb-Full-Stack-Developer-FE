
import Header from './components/Header'
import Main from './components/Main'
import { CartProvider } from './contexts/CartContext';
import { OverlayProvider } from './contexts/OverlayContext';
import './index.css'

function Root() {
  
  return (
    <>
      <OverlayProvider>
        <CartProvider>
          <Header />
          <Main />
          </CartProvider>
      </OverlayProvider>
    </>
  )
}

export default Root;
