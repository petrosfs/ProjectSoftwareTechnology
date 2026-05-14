// ReviewController.ts
// Source: UC-REV-02

export class ReviewController {
  getReviews(userId: string): object[] {
    // TODO: fetch all reviews for userId from database
    console.warn('ReviewController.getReviews not implemented');
    return [];
  }

  addReview(userId: string, fields: object): object | null {
    // TODO: validate and persist review, update user average rating
    console.warn('ReviewController.addReview not implemented');
    return null;
  }

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
