import WalletConnect from '@walletconnect/browser';
import WalletConnectQRCodeModal from '@walletconnect/qrcode-modal';
import WalletConnectSubprovider from "@walletconnect/web3-subprovider";

export default function(maker) {
  const WALLETCONNECT = 'walletconnect';
  maker
    .service('accounts', true)
    .addAccountType(WALLETCONNECT, async settings => {
      const walletConnectProvider = new WalletConnectSubprovider({
        bridge: 'https://bridge.walletconnect.org'
      });


      // Check if connection is already established
      if (!walletConnectProvider.connected) {
        // create new session
        walletConnectProvider.createSession().then(() => {
          // get uri for QR Code modal
          const uri = walletConnectProvider.uri;
          // display QR Code modal
          WalletConnectQRCodeModal.open(uri, () => {
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
