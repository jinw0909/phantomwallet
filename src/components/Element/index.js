import React from 'react';
import { PublicKey } from '@solana/web3.js';
import styled from 'styled-components';
import Button from "../Button";

const Main = styled.main`
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 20px;
    align-items: center;
    background-color: #ddd;
    > * {
        margin-bottom: 10px;
    }
    @media (max-width: 768px) {
        width: 100%;
        height: auto;
    }
`;
const Body = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  button {
    margin-bottom: 15px;
  }
`;

const Element = React.memo((props) => {
    const { publicKey, connectedMethods, connect } = props;

    return (
        <Main>
            <Body>
                {publicKey ? (
                    //connected
                    <>
                        <div>
                            <pre>Connected as {publicKey.toBase58()}</pre>
                        </div>
                        {connectedMethods.map((method, i) => (
                            <Button key={`${method.name}-${i}`} onClick={method.onClick}>
                                {method.name}
                            </Button>
                        ))}
                    </>
                ) : (
                    //not connected
                    <Button onClick={connect}>Connect to Phantom</Button>
                )}
            </Body>
        </Main>
    )
});

export default Element;