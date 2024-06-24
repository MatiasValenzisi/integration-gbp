// Soap 1.2
export interface LoginResponse {  
  'soap12:Envelope': {
    'soap12:Body': {
      AuthenticateUserResponse: {
        AuthenticateUserResult: string;
      };
    };
  };  
}