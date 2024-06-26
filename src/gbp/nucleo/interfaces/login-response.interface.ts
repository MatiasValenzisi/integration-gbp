export interface LoginResponse {  
  'soap12:Envelope': {
    'soap12:Body': {
      AuthenticateUserResponse: {
        AuthenticateUserResult: string;
      };
    };
  };  
}