import WalletConnect from '@walletconnect/browser';
import WalletConnectQRCodeModal from '@walletconnect/qrcode-modal';

export default function(maker) {
  const WALLETCONNECT = 'walletconnect';
  console.log('WALLET CONNECT 3!');

  maker
    .service('accounts', true)
    .addAccountType(WALLETCONNECT, async settings => {
      const walletConnectProvider = new WalletConnect({
        bridge: 'https://bridge.walletconnect.org'
      });

      // setEngine and handleRequest are expected by the web3ProviderEngine
      function setEngine(engine) {
        const self = this;
        if (self.engine) return;
        self.engine = engine;
        engine.on('block', function(block) {
          self.currentBlock = block;
        });

        engine.on('start', function() {
          self.start();
        });

        engine.on('stop', function() {
          self.stop();
        });
      }

      function handleRequest(payload, next, end) {
        const self = this;

        self
          .sendTransaction(payload, (err, result) => {
            return result ? end(null, result.result) : end(err);
          })
          .then(result => result)
          .catch(err => err);
      }

      walletConnectProvider.setEngine = setEngine;
      walletConnectProvider.handleRequest = handleRequest;

      console.log('woah', 'connected?', walletConnectProvider.connected);
      // walletConnectProvider.killSession()
      // console.log('Session killed')

      // Check if connection is already established
      if (!walletConnectProvider.connected) {
        console.log('not connected');
        // create new session
        walletConnectProvider.createSession().then(() => {
          console.log('yoo');
          // get uri for QR Code modal
          const uri = walletConnectProvider.uri;
          console.log('walletConnect uri', uri);
          // display QR Code modal
          WalletConnectQRCodeModal.open(uri, () => {
            console.log('QR Code Modal closed');
          });
        });
      } else {
        return {
          subprovider: walletConnectProvider,
          address: walletConnectProvider.accounts[0]
        };

        console.log(walletConnectProvider, walletConnectProvider.accounts);
      }

      function initialise(address) {
        // if (settings.callback && typeof settings.callback === 'function') {
        //   settings.callback(address);
        // }
        console.log('Passing down address to DAI.js SDK', address);
        return { subprovider: walletConnectProvider, address: address };
      }

      return new Promise((resolve, reject) => {
        console.log('starting');
        //fail if nothing happens after 20 seconds
        const fail = setTimeout(() => reject(), 20000);

        walletConnectProvider.on('session_update', (error, payload) => {
          console.log('update? lalala');
          if (error) {
            throw error;
          }
          clearTimeout(fail);

          // Get updated accounts and chainId
          const { accounts, chainId } = payload.params[0];
          let address = accounts[0];
          resolve(initialise(address));
        });

        // Subscribe to connection events
        walletConnectProvider.on('connect', (error, payload) => {
          console.log('is good');
          if (error) {
            console.log('ERROR connecting to WALLET CONNECT:', error);
            throw error;
          }
          clearTimeout(fail);

          // Close QR Code Modal
          WalletConnectQRCodeModal.close();

          // Get provided accounts and chainId
          const { accounts, chainId } = payload.params[0];
          console.log('WALLET CONNECT ACCOUNTS: ', accounts);
          let address = accounts[0];
          resolve(initialise(address));
        });
      });
    });
}
