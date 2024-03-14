import { registerRootComponent } from 'expo';
import polyfill from 'react-native-polyfill-globals';
import { TailwindProvider } from 'tailwind-rn';

import App from './src/App';
import utilities from './tailwind.json';

polyfill();

function Main(props) {
  return (
    <TailwindProvider utilities={utilities}>
      <App {...props} />
    </TailwindProvider>
  );
}

registerRootComponent(Main);
