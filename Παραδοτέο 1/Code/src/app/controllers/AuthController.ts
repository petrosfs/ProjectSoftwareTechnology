// AuthController.ts
// Source: UC-REQ-02, UC-PST-02

export class AuthController {
  checkLogin(userId: string): boolean {
    // TODO: verify session/token for userId
    console.warn('AuthController.checkLogin not implemented');
    return false;
  }

  redirectToLogin(): void {
    // TODO: redirect to login page
    console.warn('AuthController.redirectToLogin not implemented');
  }
}

export default new AuthController();
