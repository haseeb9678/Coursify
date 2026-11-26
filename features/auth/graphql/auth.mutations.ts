import { gql } from "graphql-request";

export const REGISTER_MUTATION = gql`
    mutation Register($input: RegisterInput!) {
        register(input: $input) {
            success
            message

            user {
                id
                name
                email
                role
                status
                isEmailVerified
                createdAt
            }
        }
    }
`;

export const LOGIN_MUTATION = gql`
    mutation Login($input: LoginInput!) {
        login(input: $input) {
            success
            message

            user {
                id
                name
                email
                role
                status
                isEmailVerified
                createdAt
            }
        }
    }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout {
      success
      message
    }
  }
`;