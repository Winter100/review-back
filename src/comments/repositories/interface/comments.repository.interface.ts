/** 댓글 관련 메서드
 *
 * 1. 댓글 생성
 * - 최대 1깊이의 대댓글 작성 가능
 * - 댓글: 리뷰ID, 작성자 아이디, 댓글 내용
 * - 대댓글: 리뷰ID, 댓글 ID, 작성자 아이디, 댓글내용
 *
 * 2. 댓글 삭제
 * - 댓글 ID로 삭제
 *
 * 3. 댓글 조회
 * - 리뷰 ID로 모든 댓글 조회
 *
 * 4. 댓글 수정
 * - 댓글 수정 기능은 없음
 */
export interface ICommentsRepository {
  create(
    reviewId: string,
    authorId: string,
    content: string,
    parentId?: number,
  );
  softDelete(commentId: number);
  hardDelete(commentId: number);
  countActiveReplies(commentId: number);
  findAll(reviewId: string);
  findByCommentId(commentId: number);
}
