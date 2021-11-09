import 'bootstrap/dist/css/bootstrap.min.css'
import '../styles/global.css'
import { AppProps } from 'next/app'
import GlobalContext from '../context';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <GlobalContext>
      <Component {...pageProps} />
    </GlobalContext>
  );
}