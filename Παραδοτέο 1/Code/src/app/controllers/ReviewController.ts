// ReviewController.ts
// Source: UC-REV-02

export class ReviewController {
  checkPermission(sessionId: string, reviewerId: string): boolean {
    // TODO: verify session is completed and reviewerId was a participant
    console.warn('ReviewController.checkPermission not implemented');
    return false;
  }

  checkContent(comment: string): boolean {
    // TODO: validate comment for inappropriate content
    console.warn('ReviewController.checkContent not implemented');
    return false;
  }
}

export default new ReviewController();
