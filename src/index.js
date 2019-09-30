import WalletConnect from '@walletconnect/browser';
import WalletConnectQRCodeModal from "@walletconnect/qrcode-modal";

export default function (maker) {
  console.log('Hello WALLET CONNECT!')
  const WALLETCONNECT = 'walletconnect'

  maker.service('accounts', true).addAccountType(WALLETCONNECT, async settings => {

    const walletConnectProvider = new WalletConnect({
      bridge: 'https://bridge.walletconnect.org'
    })

    // Check if connection is already established
    if (!walletConnectProvider.connected) {
      // create new session
      walletConnectProvider.createSession().then(() => {
        // get uri for QR Code modal
        const uri = walletConnectProvider.uri;
        console.log('walletConnect uri', uri)
        // display QR Code modal
        WalletConnectQRCodeModal.open(uri, () => {
          console.log("QR Code Modal closed");
        });
      });
    }

    let address;

    // Subscribe to connection events
    walletConnectProvider.on("connect", (error, payload) => {
      if (error) {
        throw error;
      }
      // Close QR Code Modal
      WalletConnectQRCodeModal.close();

      // Get provided accounts and chainId
      const { accounts, chainId } = payload.params[0];
      address = accounts[0];
      initialise(address);// play around
    });

    walletConnectProvider.on("session_update", (error, payload) => {
      if (error) {
        throw error;
      }

      // Get updated accounts and chainId
      const { accounts, chainId } = payload.params[0];
      address = accounts[0];
      initialise(address);
    });


    function initialise() {
      // setEngine and handleRequest are expected by the web3ProviderEngine
      function setEngine(engine) {
        const self = this;
        if (self.engine) return;
        self.engine = engine;
        engine.on('block', function (block) {
          self.currentBlock = block;
        });

        engine.on('start', function () {
          self.start();
        });

        engine.on('stop', function () {
          self.stop();
        });
      }

      function handleRequest(payload, next, end) {
        const self = this;

        self.sendTransaction(payload, (err, result) => {
          return result ? end(null, result.result) : end(err);
        });
      }

      walletConnectProvider.setEngine = setEngine;
      walletLinkProvider.handleRequest = handleRequest;


      return { subprovider: walletConnectProvider, address }
    }

  })
}