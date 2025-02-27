import styled from 'styled-components';

const Button = styled.button`
    cursor: pointer;
    width: 100%;
    color: #fff;
    background-color: #444;
    padding: 15px 10px;
    font-weight: 600;
    outline: 0;
    border: 0;
    border-radius: 6px;
    user-select: none;
    &:hover {
        background-color: #777;
    }
    &:focus-visible&:not(:hover) {
        background-color: #777;
    }
    &:active {
        background-color: #777;
    }
`;

export default Button;
