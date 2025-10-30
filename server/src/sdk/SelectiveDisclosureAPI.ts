import { 
  ArciumSDKConfig, 
  ClaimRequest,
  DisclosureRequest,
  APIResponse,
  ClaimResponse,
  DisclosureResponse
} from './types';

export class SelectiveDisclosureAPI {
  private config: ArciumSDKConfig;

  constructor(config: ArciumSDKConfig) {
    this.config = config;
  }

  /**
   * Updates the configuration for this API instance
   */
  updateConfig(newConfig: ArciumSDKConfig): void {
    this.config = newConfig;
  }

  /**
   * Issue a new verifiable claim
   */
  async issueClaim(request: ClaimRequest): Promise<APIResponse<ClaimResponse>> {
    const response = await fetch(`${this.config.baseUrl}/api/v1/selective-disclosure/issue-claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.config.apiKey,
      },
      body: JSON.stringify(request)
    });

    const result = await response.json();
    return result;
  }

  /**
   * Create a selective disclosure request
   */
  async createDisclosureRequest(request: DisclosureRequest): Promise<APIResponse<any>> {
    const response = await fetch(`${this.config.baseUrl}/api/v1/selective-disclosure/create-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.config.apiKey,
      },
      body: JSON.stringify(request)
    });

    const result = await response.json();
    return result;
  }

  /**
   * Respond to a selective disclosure request
   */
  async respondToRequest(request: any, holder: string, claims: any[]): Promise<APIResponse<DisclosureResponse>> {
    const response = await fetch(`${this.config.baseUrl}/api/v1/selective-disclosure/respond`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.config.apiKey,
      },
      body: JSON.stringify({
        request,
        holder,
        claims
      })
    });

    const result = await response.json();
    return result;
  }

  /**
   * Verify a selective disclosure response
   */
  async verifyDisclosure(response: any, originalRequest: any): Promise<APIResponse<boolean>> {
    const responseFetch = await fetch(`${this.config.baseUrl}/api/v1/selective-disclosure/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.config.apiKey,
      },
      body: JSON.stringify({
        response,
        request: originalRequest
      })
    });

    const result = await responseFetch.json();
    return result;
  }

  /**
   * Issue an age claim
   */
  async issueAgeClaim(subject: string, age: number): Promise<APIResponse<ClaimResponse>> {
    return this.issueClaim({
      type: 'age_range',
      issuer: 'arcium-issuer',
      subject,
      attributes: { age },
      disclosurePolicy: {
        public: [],
        conditional: [{
          attribute: 'age',
          condition: 'age >= 18',
          requiredBy: []
        }],
        private: ['age']
      }
    });
  }

  /**
   * Issue a credit score claim
   */
  async issueCreditScoreClaim(subject: string, score: number): Promise<APIResponse<ClaimResponse>> {
    return this.issueClaim({
      type: 'credit_score',
      issuer: 'arcium-issuer',
      subject,
      attributes: { score },
      disclosurePolicy: {
        public: [],
        conditional: [{
          attribute: 'score',
          condition: 'score >= 700',
          requiredBy: []
        }],
        private: ['score']
      }
    });
  }

  /**
   * Issue an account balance claim
   */
  async issueBalanceClaim(subject: string, balance: number): Promise<APIResponse<ClaimResponse>> {
    return this.issueClaim({
      type: 'account_balance',
      issuer: 'arcium-issuer',
      subject,
      attributes: { balance },
      disclosurePolicy: {
        public: [],
        conditional: [{
          attribute: 'balance',
          condition: 'balance > 0',
          requiredBy: []
        }],
        private: ['balance']
      }
    });
  }

  /**
   * Request age verification (age is over 18)
   */
  async requestAgeVerification(verifier: string, subject: string): Promise<APIResponse<any>> {
    return this.createDisclosureRequest({
      verifier,
      requestedClaims: [{
        type: 'age_range',
        requiredAttributes: ['age'],
        conditions: { 'age': 'age >= 18' }
      }],
      justification: 'Age verification required for service access'
    });
  }

  /**
   * Request credit score verification (score is above 700)
   */
  async requestCreditScoreVerification(verifier: string, subject: string): Promise<APIResponse<any>> {
    return this.createDisclosureRequest({
      verifier,
      requestedClaims: [{
        type: 'credit_score',
        requiredAttributes: ['score'],
        conditions: { 'score': 'score >= 700' }
      }],
      justification: 'Credit score verification required for loan application'
    });
  }
}