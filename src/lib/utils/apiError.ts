/**
 * API 오류 처리 공통 유틸
 *
 * 사용 예:
 *   } catch (err) {
 *     handleError("getProject", err);
 *   }
 */

/**
 * catch 블록에서 사용하는 오류 로깅 + 재throw 함수
 * @param context  어느 함수/API에서 발생했는지 (예: "getProject")
 * @param error    catch 블록의 error 변수
 */
export function handleError(context: string, error: unknown): never {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[${context}] ${message}`);
  throw error instanceof Error ? error : new Error(message);
}
