import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import {clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import logo from './logo.svg';
import './App.css';
import { getProvider } from './utils'

import { Element, NoProvider } from './components';

//styled components
const StyledApp = styled.div`
  display: flex;
  flex-direction: row;
  height: 100vh;
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

//constants
const NETWORK = 'https://solana-api.projectserum.com';
const CUSTOM_RPC_URL = 'https://winter-evocative-silence.solana-mainnet.quiknode.pro/04a5e639b0bd9ceeec758a6140dc1aa1b08f62bd';
const provider = getProvider();
const connection = new Connection(CUSTOM_RPC_URL);
// const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');
// const connection = new Connection(NETWORK);
const message = 'To avoid digital dognappers, sign below to authenticate with CryptoCorgis.';

//hooks
const useProps = () => {

  const [logs, setLogs] = useState([]);

  const createLog = useCallback(
      (log) => {
        return setLogs((logs) => [...logs, log]);
      },
      [setLogs]
  );

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, [setLogs]);

  useEffect(() => {
    if (!provider) return;

    //attempt to eagerly connect
    provider.connect({ onlyIfTrusted: true }).catch(() => {
      //fail silently
    });

    provider.on('connect', (publicKey) => {
      console.log("connected: ", publicKey.toBase58());
      createLog({
        status: 'success',
        method: 'connect',
        message: `Connected to account ${publicKey.toBase58()}`,
      });
    });

    provider.on('disconnect', () => {
      createLog({
        status: 'warning',
        method: 'connect',
        message: '👋'
      })
    });

    provider.on('accountChanged', (publicKey) => {
      if (publicKey) {
        createLog({
          status: 'info',
          method: 'accountChanged',
          message: `Switched to account ${publicKey.toBase58()}`
        });
      } else {
        /**
         * In this case dApps could...
         *
         * 1. Not do anything
         * 2. Only re-connect to the new account if it is trusted
         *
         * ```
         * provider.connect({ onlyIfTrusted: true }).catch((err) => {
         *  // fail silently
         * });
         * ```
         *
         * 3. Always attempt to reconnect
         */
        createLog({
          status: 'info',
          method: 'accountChanged',
          message: 'Attempting to switch accounts'
        });

        provider.connect().catch((error) => {
          createLog({
            status: 'error',
            method: 'accountChanged',
            message: `Failed to re-connect: ${error.message}`
          });
        });

      }
    });

    return () => {
      provider.disconnect();
    }
  }, [createLog]);

  /*** Connect */
  const handleConnect = useCallback(async () => {
    if (!provider) return;

    try {
      await provider.connect();
    } catch (error) {
      createLog({
        status: 'error',
        method: 'connect',
        message: error.message
      })
    }
  }, [createLog]);

  /*** Disconnect */
  const handleDisconnect = useCallback(async () => {
    if (!provider) return;

    try {
      await provider.disconnect();
    } catch (error) {
      createLog({
        status: 'error',
        method: 'disconnect',
        message: error.message,
      })
    }
  }, [createLog]);

  const handleFetchStatus = useCallback(async () => {
    if (!provider || !provider.publicKey) {
      createLog({
        status: 'error',
        method: 'fetchStatus',
        message: 'Wallet not connected'
      });
      return;
    }

    try {
      //For example, fetching the account balance
      // const balance = await connection.getBalance(provider.publicKey);
      // createLog({
      //   status: 'info',
      //   method: 'fetchStatus',
      //   message: `Wallet balance: ${balance} lamports`
      // });
      // Alternatively, fetch full account info:
      console.log('provider.publicKey: ', provider.publicKey.toBase58());

      let version = await connection.getVersion();
      console.log("version: ", version);
      let anonymousPublicKey =  new PublicKey('AJ6MGExeK7FXmeKkKPmALjcdXVStXYokYNv9uVfDRtvo');
      let walletPublicKey = new PublicKey(new PublicKey(provider.publicKey.toBase58()));
      console.log('public key of anonymous user: ', anonymousPublicKey);
      console.log('public key of the connected wallet: ', walletPublicKey);
      const anonymousInfo = await connection.getAccountInfo(anonymousPublicKey);
      const walletInfo = await connection.getAccountInfo(walletPublicKey);
      // const accountInfo = await connection.getAccountInfo('AJ6MGExeK7FXmeKkKPmALjcdXVStXYokYNv9uVfDRtvo');
      console.log("anonymousInfo: ", JSON.stringify(anonymousInfo));
      console.log("walletInfo: ", JSON.stringify(walletInfo));
      createLog({
        status: 'info',
        method: 'fetchStatus',
        message: anonymousInfo
            ? `Account info: ${JSON.stringify(anonymousInfo)}`
            : 'No account info found',
      });
    } catch (error) {
        createLog({
          status: 'error',
          method: 'fetchStatus',
          message: error.message
        })
    }
  }, [createLog]);

  const handleFetchTokenStatus = useCallback(async () => {
    if (!provider || !provider.publicKey) {
      createLog({
        status: 'error',
        method: 'fetchStatus',
        message: 'Wallet not connected'
      });
      return;
    }

    try {
      const anonymousPublicKey = new PublicKey('AJ6MGExeK7FXmeKkKPmALjcdXVStXYokYNv9uVfDRtvo');
      const walletPublicKey = new PublicKey(provider.publicKey.toBase58());
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(anonymousPublicKey, {
        programId: TOKEN_PROGRAM_ID
      });

      // Map over token accounts to extract the necessary details
      const tokensData = tokenAccounts.value.map((accountInfo) => {
        const { mint, tokenAmount } = accountInfo.account.data.parsed.info;
        return {
          mint,
          amount: tokenAmount.uiAmount
        };
      });

      // Aggregate the data into a single JSON object
      const result = {
        wallet: walletPublicKey.toBase58(),
        tokens: tokensData
      };

      console.log("Token Data:", JSON.stringify(result, null, 2));
      createLog({
        status: 'info',
        method: 'fetchStatus',
        message: JSON.stringify(result)
      });
    } catch (error) {
      createLog({
        status: 'error',
        method: 'fetchStatus',
        message: error.message
      });
    }
  }, [createLog]);

  const connectedMethods = useMemo(() => {
    return [
      {
        name: 'Fetch Status',
        onClick: handleFetchStatus
      },
      {
        name: 'Fetch Token Status',
        onClick: handleFetchTokenStatus
      },
      {
        name: 'Disconnect',
        onClick: handleDisconnect
      }
    ]
  }, [
      handleFetchStatus,
      handleFetchTokenStatus,
      handleDisconnect
  ]);

  return {
    publicKey: provider?.publicKey || null,
    connectedMethods,
    handleConnect,
    logs,
    clearLogs
  }

}

//stateless component
const StatelessApp = React.memo((props) => {
    const { publicKey, connectedMethods, handleConnect, logs, clearLogs } = props;

    return (
        <StyledApp>
          <Element publicKey={publicKey} connectedMethods={connectedMethods} connect={handleConnect} />
          {/*<Element publicKey={publicKey} logs={logs} clearLogs={clearLogs} />*/}
        </StyledApp>
    )
});

//main component
const DesktopApp = () => {
  const props = useProps();

  if (!provider) {
    return <NoProvider />;
  }

  return <StatelessApp {...props} />;
}


export default DesktopApp;
