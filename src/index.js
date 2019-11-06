import WalletConnect from '@walletconnect/browser';
import WalletConnectQRCodeModal from '@walletconnect/qrcode-modal';

export default function(maker) {
  const WALLETCONNECT = 'walletconnect';

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
        // restoring previous session
        return {
          subprovider: walletConnectProvider,
          address: walletConnectProvider.accounts[0]
        };
      }

      return new Promise((resolve, reject) => {
        //fail if nothing happens after 20 seconds
        const fail = setTimeout(() => reject(), 20000);

        walletConnectProvider.on('session_update', (error, payload) => {
          if (error) {
            throw error;
          }
          clearTimeout(fail);

          // Get updated accounts and chainId
          const { accounts } = payload.params[0];
          resolve({ subprovider: walletConnectProvider, address: accounts[0] });
        });

        // Subscribe to connection events
        walletConnectProvider.on('connect', (error, payload) => {
          if (error) {
            console.log('ERROR connecting to WALLET CONNECT:', error);
            throw error;
          }
          clearTimeout(fail);

          // Close QR Code Modal
          WalletConnectQRCodeModal.close();

          const { accounts } = payload.params[0];
          resolve({ subprovider: walletConnectProvider, address: accounts[0]});
        });
      });
    });
}
