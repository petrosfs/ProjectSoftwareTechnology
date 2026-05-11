// NotificationController.ts
// Source: UC-BUY-02, UC-SWP-02, UC-SCH-02, UC-PAY-02

export class NotificationController {
  notifySeller(sellerId: string, referenceId: string): void {
    // TODO: send notification to seller about new offer/payment
    console.warn('NotificationController.notifySeller not implemented');
  }

  notifyBuyer(buyerId: string, message: string): void {
    // TODO: send notification to buyer about offer decision/payment result
    console.warn('NotificationController.notifyBuyer not implemented');
  }

  notifyRecipient(responderId: string, swapId: string): void {
    // TODO: send swap request notification to recipient
    console.warn('NotificationController.notifyRecipient not implemented');
  }

  sendApprovalRequest(sessionId: string, userId: string): void {
    // TODO: send session approval request to provider
    console.warn('NotificationController.sendApprovalRequest not implemented');
  }
}

export default new NotificationController();
