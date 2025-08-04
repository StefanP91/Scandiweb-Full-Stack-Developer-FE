
import Header from './components/layout/Header/Header'
import Main from './components/layout/Main/Main'

import { CartProvider } from './features/cart/utils/CartContext';
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
