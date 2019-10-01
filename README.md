# dai-plugin-walletlink

A [Dai.js][daijs] plugin for using Wallet Coonect in a browser environment.

### Example usage

```js
import WalletConnect from '@makerdao/dai-plugin-walletconnect';
import Maker from '@makerdao/dai';

const maker = await Maker.create('http', {
  plugins: [WalletConnect],
  accounts: {
    myWalletConnect1: { type: 'walletconnect' }
  }
});

// this will not resolve until the account is set up
await maker.authenticate();

// or you can defer setting the account up until later
await maker.addAccount('myWalletConnect2', { type: 'walletconnect' });
```

#### Using the optional address callback

```js
await maker.addAccount('myWalletConnect', {
  type: 'walletconnect',
  callback: address => {
    //e.g. for analytics
    console.log('My WalletConnect address', address);
  }
});
```

[daijs]: https://github.com/makerdao/dai.js
