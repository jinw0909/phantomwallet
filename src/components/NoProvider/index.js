import React from 'react';
import styled from 'styled-components';

//styled components

const StyledMain = styled.main`
    padding: 20px;
    height: 100vh;
    background-color: #999;
`;

//main component
const NoProvider = () => {
    return (
        <StyledMain>
            <h2>Could not find a provider</h2>
        </StyledMain>
    );
};

export default NoProvider;