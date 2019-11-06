import WalletConnectSubprovider from '@walletconnect/web3-subprovider';

export default function(maker) {
  const WALLETCONNECT = 'walletconnect';
  maker
    .service('accounts', true)
    .addAccountType(WALLETCONNECT, async settings => {
      const subprovider = new WalletConnectSubprovider({
        bridge: 'https://bridge.walletconnect.org'
      });

      const { accounts } = await subprovider.getWalletConnector();
      const [address] = accounts;
      return { subprovider, address };
    });
}
