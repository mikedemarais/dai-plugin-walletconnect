# dai-plugin-walletlink

A [Dai.js][daijs] plugin for using Coinbase WalletLink in a browser environment.

### Example usage

```js
import WalletLinkPlugin from '@makerdao/dai-plugin-walletlink';
import Maker from '@makerdao/dai';

const maker = await Maker.create('http', {
  plugins: [WalletLinkPlugin],
  accounts: {
    myWalletLink1: { type: 'walletlink' }
  }
});

// this will not resolve until the account is set up
await maker.authenticate();

// or you can defer setting the account up until later
await maker.addAccount('myWalletLink2', { type: 'walletlink' });
```

#### Using the optional address callback

```js
await maker.addAccount('myWalletLink', {
  type: 'walletlink',
  callback: address => {
    //e.g. for analytics
    console.log('My WalletLink address', address);
  }
});
```

[daijs]: https://github.com/makerdao/dai.js
