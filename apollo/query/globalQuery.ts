import { gql } from "@apollo/client"

export class GlobalApolloQueries {
    static verifyIntegrity = () => {
        return gql`
            mutation VerifyIntegrity($token: String!) {
                verifyIntegrity(token: $token) {
                    valid
                    nonce
                }
            }
        `
    }
}